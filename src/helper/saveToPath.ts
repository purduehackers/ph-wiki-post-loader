import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import { PathDocument, PathModel } from '../db/model/Path.js'
import { PostDocument, PostModel } from '../db/model/Post.js'
import RepoStructNode from '../type/RepoStructNode.js'
import fetchBlob from './fetchBlob.js'

const saveToPath = async (
  repoStructRoot: RepoStructNode,
  octokit: Octokit,
  slugger: GithubSlugger
) => {
  let path = null
  let post = null
  if (repoStructRoot.type == 'tree') {
    path = new PathModel({
      name: repoStructRoot.path,
      slug: repoStructRoot.slug,
      children: [],
    })
    const children = repoStructRoot.children
    for (let i = 0; i < children.length; i += 1) {
      const [childrenPath, childPost] = await saveToPath(
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
  } else if (repoStructRoot.type == 'blob') {
    post = new PostModel({
      name: repoStructRoot.path,
      slug: slugger.slug(repoStructRoot.path),
      url: repoStructRoot.url,
      content: await fetchBlob(repoStructRoot.sha, octokit),
    })
    await post.save()
  }
  return [path, post]
}

export default saveToPath
