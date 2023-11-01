import { Octokit } from "octokit";
import RepoStructNode from "../type/RepoStructNode";
import FileMetaData from "../type/FileMetaData";
import TreeNode from "../type/TreeNode";
import fetchTree from "./fetchTree";

const buildTree = async (root: TreeNode, repoStruct: RepoStructNode, octokit: Octokit) => {
    if (root.type != 'tree') {
        return;
    }
    const tree = await fetchTree(root.sha, octokit)
    const subtrees: FileMetaData[] = tree.data.tree
    for (let i = 0; i < subtrees.length; i += 1) {
        const subtree = subtrees[i]
        const repoStructChildren: RepoStructNode = {
            path: subtree.path,
            mode: subtree.mode,
            type: subtree.type,
            size: subtree.size,
            sha: subtree.sha,
            url: subtree.url,
            children: []   
        }
        await buildTree(subtrees[i], repoStructChildren, octokit)
        repoStruct.children.push(repoStructChildren)
    }
}

export default buildTree;