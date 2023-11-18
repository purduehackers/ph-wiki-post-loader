import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import filesToAvoid from '../filesToAvoid.js'
import FileMetaData from '../type/FileMetaData.js'
import RepoStructNode from '../type/RepoStructNode.js'
import TreeNode from '../type/TreeNode.js'
import fetchTree from './fetchTree.js'

const mdStr = '.md'

const buildTree = async (
  root: TreeNode,
  repoStruct: RepoStructNode,
  octokit: Octokit,
  slugger: GithubSlugger
) => {
  if (root.type != 'tree') {
    return
  }
  const tree = await fetchTree(root.sha, octokit)
  const subtrees: FileMetaData[] = tree.data.tree
  for (let i = 0; i < subtrees.length; i += 1) {
    const subtree = subtrees[i]
    const path = subtree.path
    if (path.charAt(0) == '.' || filesToAvoid.has(path)) continue
    // check last three characters are ".md"
    const isMd = path.substring(path.length - mdStr.length) === mdStr
    // if not a markdown file, it is a folder, thus, filename is path
    const fileName = isMd ? path.substring(0, path.length - mdStr.length) : path

    const repoStructChildren: RepoStructNode = {
      slug: slugger.slug(fileName),
      path: fileName,
      mode: subtree.mode,
      type: subtree.type,
      size: subtree.size,
      sha: subtree.sha,
      url: subtree.url,
      children: [],
    }
    await buildTree(subtrees[i], repoStructChildren, octokit, slugger)
    repoStruct.children.push(repoStructChildren)
  }
}

export default buildTree
