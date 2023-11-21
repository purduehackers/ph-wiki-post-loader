console.log('App started')

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
import saveToDB from './helper/saveToDB.js'
import RawDataNode from './type/RawDataNode.js'
import RepoStructNode from './type/RepoStructNode.js'

/* using octokit to handle Github API */
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
  /* this prevents from going over rate limit */
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

const main = async () => {
  const slugger = new GithubSlugger()

  process.stdout.write('Fetching newest commit: ')
  const newestCommit = await fetchNewestCommit(octokit)
  const rootRawData: RawDataNode = {
    sha: newestCommit.data.commit.tree.sha,
    url: newestCommit.data.commit.tree.url,
    type: 'tree',
  }
  const rootRepoStruct: RepoStructNode = {
    slug: slugger.slug('root'),
    sha: newestCommit.data.commit.tree.sha,
    url: newestCommit.data.commit.tree.url,
    authors: [],
    path: '',
    name: 'root',
    mode: '',
    type: 'tree',
    size: undefined,
    children: [],
  }
  process.stdout.write('Done\n')

  process.stdout.write('Building tree: ')
  await buildTree(rootRawData, rootRepoStruct, '', octokit, slugger)
  process.stdout.write('Done\n')

  await connectDB()

  process.stdout.write('Dropping previous version: ')
  /* Overwrite previous data by first dropping them.
     TODO: add snapshot of the previous version of the database */
  await PathModel.collection.drop()
  await PostModel.collection.drop()
  process.stdout.write('Done\n')

  process.stdout.write('Saving to DB: ')
  await saveToDB(rootRepoStruct, octokit, slugger)
  process.stdout.write('Done\n')

  process.stdout.write('Wrapping up: ')
  await disconnectDB()
  process.stdout.write('Done\n')
}

main()
