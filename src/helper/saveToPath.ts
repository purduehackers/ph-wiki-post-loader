import { Octokit } from "octokit";

import { Path } from "../db/model/Path";
import { Post } from "../db/model/Post";
import RepoStructNode from "../type/RepoStructNode";
import fetchBlob from "./fetchBlob";

const saveToPath = async (repoStructRoot: RepoStructNode, octokit: Octokit) => {
  let path = null;
  let post = null;
  if (repoStructRoot.type == "tree") {
    path = new Path({
      name: repoStructRoot.path,
      children: [],
    });
    const children = repoStructRoot.children;
    for (let i = 0; i < children.length; i += 1) {
      const [childrenPath, childPost] = await saveToPath(children[i], octokit);
      if (childrenPath) {
        path.children.push(childrenPath);
      }
      if (childPost) {
        path.posts.push(childPost);
      }
    }
    await path.save();
  } else if (repoStructRoot.type == "blob") {
    post = new Post({
      name: repoStructRoot.path,
      url: repoStructRoot.url,
      content: await fetchBlob(repoStructRoot.sha, octokit),
    });
    await post.save();
  }
  return [path, post];
};

export default saveToPath;
