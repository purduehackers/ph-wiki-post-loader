import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import { PathModel } from '../db/model/Path.js'
import { PostModel } from '../db/model/Post.js'
import { PathDocument } from '../type/Path.js'
import { PostDocument } from '../type/Post.js'
import RepoStructNode from '../type/RepoStructNode.js'
import fetchBlob from './fetchBlob.js'

const saveToDB = async (
  currentRepoStruct: RepoStructNode,
  octokit: Octokit,
  slugger: GithubSlugger
) => {
  let path = null
  let post = null
  if (currentRepoStruct.type == 'tree') {
    path = new PathModel({
      name: currentRepoStruct.name,
      slug: currentRepoStruct.slug,
      children: [],
    })
    const children = currentRepoStruct.children
    for (let i = 0; i < children.length; i += 1) {
      const [childrenPath, childPost] = await saveToDB(
        children[i],
        octokit,
        slugger
      )
      if (childrenPath) {
        path.children.push(childrenPath as PathDocument)
      }
      if (childPost) {
        path.posts.push(childPost as PostDocument)
      }
    }
    await path.save()
  } else if (currentRepoStruct.type == 'blob') {
    post = new PostModel({
      name: currentRepoStruct.name,
      slug: slugger.slug(currentRepoStruct.name),
      url: currentRepoStruct.url,
      content: await fetchBlob(currentRepoStruct.sha, octokit),
      authors: currentRepoStruct.authors,
    })
    await post.save()
  }
  return [path, post]
}

export default saveToDB
