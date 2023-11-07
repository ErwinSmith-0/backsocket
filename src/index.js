import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { AuthRouters } from "./Router/AuthRouters.js";
import { connectDB } from "./DB/index.js";
import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";
import roomModel from "./DB/Model/roomModel.js";
import messageModel from "./DB/Model/messageModel.js";
import fileUploadModel from "./DB/Model/fileUploadModel.js";

import path from "node:path";
import { fileURLToPath } from "node:url";
// import { handleMultipartData } from "./Utils/MultipartData.js";
import { writeFile } from "fs";
// import fileUploadModel from "./DB/Model/fileUploadModel.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_PreFix = "/api/v1";
app.use(API_PreFix, AuthRouters);

connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(`${__dirname}/../Uploads`));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
  maxHttpBufferSize: 1e8,
});

io.on("connection", (socket) => {
  let foundRoomData;
  socket.on("join_room", async (roomId) => {
    socket.join(roomId.toString());
    foundRoomData = await roomModel
      .findOne({
        _id: roomId,
      })
      .populate({ path: "messages", populate: { path: "attachment" } });

    io.in(roomId.toString()).emit("update_messages", foundRoomData.messages);
  });

  socket.on("send_message", async (message) => {
    let foundRoomData = await roomModel
      .findOne({
        _id: message.room,
      })
      .populate({
        path: "messages",
        select: "room sender receiver text attachment isSeen",
        populate: {
          path: "attachment",
          model: "fileUpload",
        },
      });

    if (foundRoomData) {
      if (message.attachment.fileName !== "") {
        const attachment = {
          fileName: message.attachment.fileName,
          fileType: message.attachment.fileType,
        };
        const attachmentData = await fileUploadModel.create(attachment);

        const file = message.attachment.fileData;
        writeFile(
          `${__dirname}../../Uploads/${attachment.fileName}`,
          file,
          (err) => {
            if (err) console.log(err, file);
          }
        );

        message = { ...message, attachment: attachmentData._id };
      } else {
        message = { ...message, attachment: undefined };
      }

      if (message.text !== "" || message.attachment !== undefined) {
        const messageData = await messageModel.create(message);
        await roomModel.updateOne(
          { _id: message.room },
          { messages: [...foundRoomData.messages, messageData._id] }
        );

        foundRoomData = await roomModel
          .findOne({
            _id: message.room,
          })
          .populate({
            path: "messages",
            select: "room sender receiver text attachment isSeen",
            populate: {
              path: "attachment",
              model: "fileUpload",
            },
          });

        io.in(message.room.toString()).emit(
          "update_messages",
          foundRoomData.messages
        );
      }
    }
  });

  socket.on("typing", async (roomId, typer) => {
    io.in(roomId.toString()).emit("user_typing", typer);
  });

  socket.on("nottyping", async (roomId) => {
    io.in(roomId.toString()).emit("stop_typing");
  });

  socket.on("update_seen_message", async (message) => {
    await messageModel.findOneAndUpdate({ _id: message._id }, { isSeen: true });
    foundRoomData = await roomModel
      .findOne({
        _id: message.room,
      })
      .populate({
        path: "messages",
        select: "room sender receiver text attachment isSeen",
        populate: {
          path: "attachment",
          model: "fileUpload",
        },
      });
    // console.log(message);
    io.in(message.room.toString()).emit(
      "update_messages",
      foundRoomData.messages
    );
  });
});

const port = process.env.PORT || 3050;

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

app.use(ResHandler);
