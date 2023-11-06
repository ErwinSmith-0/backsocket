import { config } from "dotenv";

const dbConfig = {
  // MongoDB connection string
  db:config().parsed.dbURI,
};

export default dbConfig;
