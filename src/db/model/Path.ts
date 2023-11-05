import mongoose from "mongoose";

import { PostSchema } from "./Post";
const Schema = mongoose.Schema;

const PathSchema = new Schema(
  {
    name: { type: String, required: true },
    posts: { type: [PostSchema], require: false },
  },
  {
    timestamps: true,
    collection: "paths",
  },
);

PathSchema.add({
  children: { type: [PathSchema], required: true },
});

export { PathSchema };
export const Path = mongoose.model("Path", PathSchema);
