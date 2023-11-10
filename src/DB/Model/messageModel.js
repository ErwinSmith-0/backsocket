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

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    deletedByUser1: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },

    deletedByUser2: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
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
