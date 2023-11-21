import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import filesToAvoid from '../filesToAvoid.js'
import FileMetaData from '../type/FileMetaData.js'
import RawDataNode from '../type/RawDataNode.js'
import RepoStructNode from '../type/RepoStructNode.js'
import fetchTree from './fetchTree.js'

const mdStr = '.md'

/*
This function builds the nested stucture of the repository. 
*/
const buildTree = async (
  currentRawData: RawDataNode,
  parentRepoStruct: RepoStructNode,
  octokit: Octokit,
  slugger: GithubSlugger
) => {
  if (currentRawData.type != 'tree') {
    return
  }
  const tree = await fetchTree(currentRawData.sha, octokit)
  const subtrees: FileMetaData[] = tree.data.tree
  for (let i = 0; i < subtrees.length; i += 1) {
    const subtree = subtrees[i]
    const path = subtree.path

    // hidden files and files in filesToAvoid are ignored
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
    parentRepoStruct.children.push(repoStructChildren)
  }
}

export default buildTree
