import { Document, Model } from 'mongoose'

import GithubUser from './GithubUser.js'

export interface Post {
  name: string
  slug: string
  url: string
  authors: GithubUser
  content: string
  lastUpdated: Date
}

export interface PostDocument extends Post, Document {}

export interface IPostModel extends Model<PostDocument> {}
