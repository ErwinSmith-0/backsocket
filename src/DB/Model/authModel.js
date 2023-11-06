import mongoose from "mongoose";
// import { hashPassword } from "../../Utils/SecuringPassword.js";

const AuthSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      // trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      // trim: true,
    },
    userRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "room",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const authModel = mongoose.model("auth", AuthSchema);
export default authModel;
