// import { createServer} from "https";
import { createServer } from "http";
import { app } from "./index.js";

import dotenv from "dotenv";
import { setupChatSocket } from "./sockets/chat-sockets.js";
import path from "path";
import { fileURLToPath } from "url";
// import { setupChatSocket } from "./Config/../";

dotenv.config();
const httpServer = createServer(app);
const port = process.env.PORT || 3050;

httpServer.listen(port, async () => {
  console.log(`Server listening on ${port}`);
});

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);
// console.log(dirname);

setupChatSocket(httpServer, "*", `${dirname}/../Uploads`);
