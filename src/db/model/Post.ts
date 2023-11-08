import mongoose, { Document, Model } from 'mongoose'

export interface Post {
  name: string
  slug: string
  url: string
  content: string
}
export interface PostDocument extends Post, Document {}

export interface IPostModel extends Model<PostDocument> {}

const PostSchema = new mongoose.Schema<PostDocument, IPostModel>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'posts',
  }
)

export { PostSchema }
export const PostModel = mongoose.model<PostDocument, IPostModel>(
  'Post',
  PostSchema
)
