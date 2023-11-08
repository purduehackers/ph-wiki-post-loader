console.log('app started')

import 'dotenv/config'

import { createAppAuth } from '@octokit/auth-app'
import { OctokitOptions } from '@octokit/core/dist-types/types.d.js'
import GithubSlugger from 'github-slugger'
import { Octokit } from 'octokit'

import { connectDB, disconnectDB } from './db/db.js'
import { PathModel } from './db/model/Path.js'
import { PostModel } from './db/model/Post.js'
import buildTree from './helper/buildTree.js'
import fetchNewestCommit from './helper/fetchNewestCommit.js'
import saveToPath from './helper/saveToPath.js'
import RepoStructNode from './type/RepoStructNode.js'
import TreeNode from './type/TreeNode.js'

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: (process.env.PH_WIKI_LOADER_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n'
    ),
    installationId: process.env.INSTALLATION_ID,
  },
  throttle: {
    onRateLimit: (
      retryAfter: number,
      options: OctokitOptions,
      octokit: Octokit,
      retryCount: number
    ) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      )
      if (retryCount < 1) {
        octokit.log.info(`Retrying after ${retryAfter} seconds!`)
        return true
      }
    },
    onSecondaryRateLimit: (
      retryAfter: number,
      options: OctokitOptions,
      octokit: Octokit
    ) => {
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      )
    },
  },
})

const load = async () => {
  const slugger = new GithubSlugger()
  const newestCommit = await fetchNewestCommit(octokit)
  const root: TreeNode = {
    sha: newestCommit.data.commit.tree.sha,
    url: newestCommit.data.commit.tree.url,
    type: 'tree',
  }
  const repoStructRoot: RepoStructNode = {
    slug: slugger.slug('root'),
    sha: newestCommit.data.commit.tree.sha,
    url: newestCommit.data.commit.tree.url,
    path: 'root',
    mode: '',
    type: 'tree',
    size: undefined,
    children: [],
  }
  await buildTree(root, repoStructRoot, octokit, slugger)
  await connectDB()
  await PathModel.collection.drop()
  await PostModel.collection.drop()
  await saveToPath(repoStructRoot, octokit, slugger)
  await disconnectDB()
}

load()
