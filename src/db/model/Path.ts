import mongoose from 'mongoose'

import { PathDocument } from '../../type/Path.js'
import { IPathModel } from '../../type/Path.js'
import { PostSchema } from './Post.js'

const PathSchema = new mongoose.Schema<PathDocument, IPathModel>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    posts: { type: [PostSchema], require: false },
  },
  {
    timestamps: true,
    collection: 'paths',
  }
)

/* Creating nested schema */
PathSchema.add({
  children: { type: [PathSchema], required: true },
})

export { PathSchema }
export const PathModel = mongoose.model<PathDocument, IPathModel>(
  'Path',
  PathSchema
)
