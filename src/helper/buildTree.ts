import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import filesToAvoid from '../filesToAvoid.js'
import FileCommit from '../type/FileCommit.js'
import FileMetaData from '../type/FileMetaData.js'
import RawDataNode from '../type/RawDataNode.js'
import RepoStructNode from '../type/RepoStructNode.js'
import fetchCommits from './fetchCommit.js'
import fetchContributors from './fetchContributors.js'
import fetchTree from './fetchTree.js'
import getLastUpdated from './getLastUpdated.js'

const mdStr = '.md'

/*
This function builds the nested stucture of the repository. 
*/
const buildTree = async (
  currentRawData: RawDataNode,
  parentRepoStruct: RepoStructNode,
  parentPath: string,
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
    const name = subtree.path
    const path = `${parentPath}/${name}`
    const url = `https://github.com/purduehackers/ph-wiki-posts/blob/main${path}`

    /* hidden files and files in filesToAvoid are ignored */
    if (name.charAt(0) == '.' || filesToAvoid.has(name)) continue
    /* check last three characters are ".md" */
    const isMd = name.substring(name.length - mdStr.length) === mdStr
    /* if not a markdown file, it is a folder, thus, filename is path */
    const fileName = isMd ? name.substring(0, name.length - mdStr.length) : name

    const commits = (await fetchCommits(path, octokit)).data as FileCommit[]
    const contributors = fetchContributors(commits)
    const lastUpdated = getLastUpdated(commits)
    const slug = slugger.slug(fileName)

    const repoStructChildren: RepoStructNode = {
      slug: slug,
      path: path,
      lastUpdated: lastUpdated,
      name: fileName,
      contributors: contributors,
      mode: subtree.mode,
      type: subtree.type,
      size: subtree.size,
      sha: subtree.sha,
      url: url,
      children: [],
    }
    await buildTree(subtrees[i], repoStructChildren, path, octokit, slugger)
    parentRepoStruct.children.push(repoStructChildren)
  }
}

export default buildTree
