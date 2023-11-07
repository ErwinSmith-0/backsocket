// import { boolean } from "joi";
import mongoose, { Schema, Types, model } from "mongoose";

const MessageSchema = new Schema(
  {
    room: {
      type: Types.ObjectId,
      required: true,
      ref: "room",
    },

    sender: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },

    receiver: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },

    isSeen: {
      type: Boolean,
      default: false,
    },

    attachment: {
      type: Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },

    text: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// export default model("message", messageSchema);

const messageModel = mongoose.model("message", MessageSchema);
export default messageModel;
