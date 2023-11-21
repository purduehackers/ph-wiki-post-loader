import { Document, Model } from 'mongoose'

import { PostDocument } from './Post.js'

export interface Path {
  name: string
  slug: string
  posts: PostDocument[]
}
export interface SinglePathDocument extends Path, Document {}

export interface PathDocument extends SinglePathDocument {
  children: PathDocument[]
}
export interface IPathModel extends Model<PathDocument> {}
