// import { setupChatSocket } from "./sockets/chat-sockets.js";
import { AuthRouters } from "./Router/AuthRouters.js";
import { connectDB } from "./DB/index.js";
import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";
import express from "express";
import cors from "cors";
import morganBody from "morgan-body";
import morgan from "morgan";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();
connectDB();
export let app = express();
app.use(cors());
app.use(express.json());
app.use("/", express.static("Uploads"));

app.use(bodyParser.json());
// Configure body-parser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

morganBody(app, {
  prettify: true,
  logReqUserAgent: true,
  logReqDateTime: true,
});

const API_PreFix = "/api/v1";
app.use(API_PreFix, AuthRouters);

app.use(ResHandler);
