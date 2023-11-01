console.log("app started");

import { Octokit } from "octokit";
import fetchNewestCommit from "./helper/fetchNewestCommit";
import RepoStructNode from "./type/RepoStructNode";
import TreeNode from "./type/TreeNode";
import buildTree from "./helper/buildTree";

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
    path: "",
    mode: "",
    type: "tree",
    size: undefined,
    children: [],
  };
  await buildTree(root, repoStructRoot, octokit);
  console.log("root", repoStructRoot);
};

load();
