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
  const fetchStartTime = Date.now()
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
    contributors: [],
    path: '',
    name: 'root',
    mode: '',
    type: 'tree',
    size: undefined,
    lastUpdated: new Date(),
    children: [],
  }
  const fetchEndTime = Date.now()
  process.stdout.write(`Done (${fetchEndTime - fetchStartTime}ms)\n`)

  process.stdout.write('Building tree: ')
  const buildTreeStartTime = Date.now()
  await buildTree(rootRawData, rootRepoStruct, '', octokit, slugger)
  const buildTreeEndTime = Date.now()
  process.stdout.write(`Done (${buildTreeEndTime - buildTreeStartTime}ms)\n`)

  await connectDB()

  process.stdout.write('Dropping previous version: ')
  const dropStartTime = Date.now()
  /* Overwrite previous data by first dropping them.
     TODO: add snapshot of the previous version of the database */
  await PathModel.collection.drop()
  await PostModel.collection.drop()
  const dropEndTime = Date.now()
  process.stdout.write(`Done (${dropEndTime - dropStartTime}ms)\n`)

  process.stdout.write('Saving to DB: ')
  const saveStartTime = Date.now()
  await saveToDB(rootRepoStruct, octokit, slugger)
  const saveEndTime = Date.now()
  process.stdout.write(`Done (${saveEndTime - saveStartTime}ms)\n`)

  process.stdout.write('Wrapping up: ')
  const wrapUpStartTime = Date.now()
  await disconnectDB()
  const wrapUpEndTime = Date.now()
  process.stdout.write(`Done (${wrapUpEndTime - wrapUpStartTime}ms)\n`)
}

main()
