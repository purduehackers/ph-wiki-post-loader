import mongoose from "mongoose";
const Schema = mongoose.Schema;

export const PostSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "posts",
  },
);

export const Post = mongoose.model("Post", PostSchema);
