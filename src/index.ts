console.log("app started");

import "dotenv/config";

import { Octokit } from "octokit";

import { connectDB, disconnectDB } from "./db/db";
import { Path } from "./db/model/Path";
import { Post } from "./db/model/Post";
import buildTree from "./helper/buildTree";
import fetchNewestCommit from "./helper/fetchNewestCommit";
import saveToPath from "./helper/saveToPath";
import RepoStructNode from "./type/RepoStructNode";
import TreeNode from "./type/TreeNode";

const octokit = new Octokit({});

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
  // console.log("root", repoStructRoot);

  await connectDB();

  await Path.collection.drop();
  await Post.collection.drop();
  await saveToPath(repoStructRoot, octokit);

  await disconnectDB();
};

load();
