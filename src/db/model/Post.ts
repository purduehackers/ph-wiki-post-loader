import mongoose from 'mongoose'

import { IPostModel, PostDocument } from '../../type/Post.js'

export const PostSchema = new mongoose.Schema<PostDocument, IPostModel>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    content: { type: String, required: true },
    authors: [
      {
        login: { type: String, required: true },
        avatar_url: { type: String, required: true },
        html_url: { type: String, required: true },
      },
    ],
    lastUpdated: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: 'posts',
  }
)

export const PostModel = mongoose.model<PostDocument, IPostModel>(
  'Post',
  PostSchema
)
