import { Document, Model } from 'mongoose'

export interface Post {
  name: string
  slug: string
  url: string
  content: string
}

export interface PostDocument extends Post, Document {}

export interface IPostModel extends Model<PostDocument> {}
