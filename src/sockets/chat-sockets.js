// node
import { writeFile } from "node:fs";

// libraries
import { Server } from "socket.io";
// import { handleMultipartData } from "../Utils/MultipartData.js";
// models
// import authModel from "../DB/Model/authModel.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import messageModel from "../DB/Model/messageModel.js";
import roomModel from "../DB/Model/roomModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";

// setting up chat socket
export function setupChatSocket(server, origin, fileUploadPath) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    maxHttpBufferSize: 1e8, // 100 MB
  });

  io.on("connection", (socket) => {
    socket.on("join_room", async (roomId) => {
      socket.join(roomId.toString());
      let foundRoomData = await roomModel
        .findOne({
          _id: roomId,
        })
        .populate({
          path: "messages",
          populate: {
            path: "attachment",
            model: "fileUpload",
          },
        });
      io.in(roomId.toString()).emit("update_messages", foundRoomData.messages);
    });

    socket.on("send_message", async (message) => {
      console.log("send_message");
      let foundRoomData = await roomModel
        .findOne({
          _id: message.room,
        })
        .populate({
          path: "messages",
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
          console.log(fileUploadPath);
          writeFile(`${fileUploadPath}/${attachment.fileName}`, file, (err) => {
            if (err) console.log(err, file);
          });
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
      await messageModel.findOneAndUpdate(
        { _id: message._id },
        { isSeen: true }
      );
      let foundRoomData = await roomModel
        .findOne({
          _id: message.room,
        })
        .populate({
          path: "messages",
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

    socket.on("delete_msg", async (messageId, room) => {
      let MegData = await messageModel.findOneAndUpdate(
        { _id: messageId },
        { isDeleted: true }
      );
      if (MegData) {
        let foundRoomData = await roomModel
          .findOne({
            _id: room,
          })
          .populate({
            path: "messages",
            populate: {
              path: "attachment",
              model: "fileUpload",
            },
          });

        io.in(room.toString()).emit("update_messages", foundRoomData.messages);
      }
    });

    socket.on("edit_msg", async (messageId, room, txt) => {
      let MegData = await messageModel.findOneAndUpdate(
        { _id: messageId },
        { text: txt, isEdited: true }
      );
      if (MegData) {
        let foundRoomData = await roomModel
          .findOne({
            _id: room,
          })
          .populate({
            path: "messages",
            populate: {
              path: "attachment",
              model: "fileUpload",
            },
          });

        io.in(room.toString()).emit("update_messages", foundRoomData.messages);
      }
    });

    socket.on("delete_room", async (roomId, userId) => {
      console.log("deleteroom");
      try {
        console.log(roomId);
        let foundRoomData = await roomModel
          .findOne({
            _id: roomId,
          })
          .populate({
            path: "messages",
          });
        // console.log("foundRoomData");
        // console.log(foundRoomData);
        let MegData;
        foundRoomData.messages.map(async (e) => {
          if (!e.deletedByUser1) {
            MegData = await messageModel.findByIdAndUpdate(
              { _id: e._id },
              { deletedByUser1: userId }
            );
          } else if (e.deletedByUser1 && !e.deletedByUser2) {
            MegData = await messageModel.findByIdAndUpdate(
              { _id: e._id },
              { deletedByUser2: userId }
            );
          }
          // let MegData=await messageModel.find({_id:e._id});
          // console.log("MegData");
          // console.log(MegData);
        });

        foundRoomData = await roomModel
          .findOne({
            _id: roomId,
          })
          .populate({
            path: "messages",
            populate: {
              path: "attachment",
              model: "fileUpload",
            },
          });
        console.log("foundRoomData");
        console.log(foundRoomData);
        io.in(roomId.toString()).emit(
          "update_messages",
          foundRoomData.messages
        );
      } catch (error) {
        console.log("error");
        console.log(error);
      }
    });
  });
}
