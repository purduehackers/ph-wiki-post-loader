import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import { PathModel } from '../db/model/Path.js'
import { PostModel } from '../db/model/Post.js'
import { PathDocument } from '../type/Path.js'
import { PostDocument } from '../type/Post.js'
import RepoStructNode from '../type/RepoStructNode.js'
import fetchAuthors from './fetchAuthors.js'
import fetchBlob from './fetchBlob.js'
import parseMarkDown from './parseMarkDown.js'

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
    const blob = await fetchBlob(currentRepoStruct.sha, octokit)
    const markdown = parseMarkDown(blob)

    const usernames = markdown.metadata.authors ?? []
    let authors = await fetchAuthors(usernames, octokit)
    /* if no authors were declared, authors will be the contributors */
    if (authors.length == 0) {
      authors = currentRepoStruct.contributors
    }
    const archived = markdown.metadata.archived ?? false
    const tags = markdown.metadata.tags ?? []

    post = new PostModel({
      name: currentRepoStruct.name,
      slug: currentRepoStruct.slug,
      url: currentRepoStruct.url,
      content: markdown.content,
      authors: authors,
      contributors: currentRepoStruct.contributors,
      archived: archived,
      tags: tags,
      lastUpdated: currentRepoStruct.lastUpdated,
    })
    await post.save()
  }
  return [path, post]
}

export default saveToDB
