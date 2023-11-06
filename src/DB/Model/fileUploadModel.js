import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileURL: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const fileUploadModel = mongoose.model("fileUpload", fileUploadSchema);

export default fileUploadModel;
