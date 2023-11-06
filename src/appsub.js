// Librarys
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import morganBody from "morgan-body";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./DB/index.js";
import { AuthRouters } from "./Router/AuthRouters.js";

import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export let app = express();

const API_PreFix = "/api/v1";

app.use("/", express.static("Uploads"));

var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

morganBody(app, {
  prettify: true,
  logReqUserAgent: true,
  logReqDateTime: true,
});
connectDB();
app.use(API_PreFix, AuthRouters);

app.use(ResHandler);
