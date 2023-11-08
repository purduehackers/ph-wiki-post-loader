console.log("app started");

import "dotenv/config";

import { createAppAuth } from "@octokit/auth-app";
import { OctokitOptions } from "@octokit/core/dist-types/types.d";
import { Octokit } from "octokit";

import { connectDB, disconnectDB } from "./db/db";
import { Path } from "./db/model/Path";
import { Post } from "./db/model/Post";
import buildTree from "./helper/buildTree";
import fetchNewestCommit from "./helper/fetchNewestCommit";
import saveToPath from "./helper/saveToPath";
import RepoStructNode from "./type/RepoStructNode";
import TreeNode from "./type/TreeNode";

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PH_WIKI_LOADER_PRIVATE_KEY.replace(/\\n/g, "\n"),
    installationId: process.env.INSTALLATION_ID,
  },
  throttle: {
    onRateLimit: (retryAfter, options: OctokitOptions, octokit, retryCount) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`,
      );
      if (retryCount < 1) {
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (retryAfter, options: OctokitOptions, octokit) => {
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`,
      );
    },
  },
});

const load = async () => {
  const newestCommit = await fetchNewestCommit(octokit);
  const root: TreeNode = {
    sha: newestCommit.data.commit.tree.sha,
    url: newestCommit.data.commit.tree.url,
    type: "tree",
  };
  const repoStructRoot: RepoStructNode = {
    sha: newestCommit.data.commit.tree.sha,
    url: newestCommit.data.commit.tree.url,
    path: "root",
    mode: "",
    type: "tree",
    size: undefined,
    children: [],
  };
  await buildTree(root, repoStructRoot, octokit);
  await connectDB();
  await Path.collection.drop();
  await Post.collection.drop();
  await saveToPath(repoStructRoot, octokit);
  await disconnectDB();
};

load();
