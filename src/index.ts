console.log("app started")

import { Octokit } from "octokit";
import fetchNewestCommit from "./helper/fetchNewestCommit";

const octokit = new Octokit({  });

interface treeNodeI {
    sha: string,
    url: string,
    type: string
}

interface fileMetaData {
    path: string,
    mode: string,
    type: string,
    size: number | undefined,
    sha: string,
    url: string,
}

interface repoStructNode extends fileMetaData {
    children: repoStructNode[]
}

const fetchTree = async (sha: string) => {
    const tree = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{sha}', {
        owner: 'purduehackers',
        repo: 'ph-wiki-posts',
        sha: sha,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    return tree
}

const buildTree = async (root: treeNodeI, repoStruct: repoStructNode) => {
    if (root.type != 'tree') {
        return;
    }
    const tree = await fetchTree(root.sha)
    const subtrees: fileMetaData[] = tree.data.tree
    for (let i = 0; i < subtrees.length; i += 1) {
        const subtree = subtrees[i]
        const repoStructChildren: repoStructNode = {
            path: subtree.path,
            mode: subtree.mode,
            type: subtree.type,
            size: subtree.size,
            sha: subtree.sha,
            url: subtree.url,
            children: []   
        }
        await buildTree(subtrees[i], repoStructChildren)
        repoStruct.children.push(repoStructChildren)
    }
}

const load = async () => {
    const newestCommit = await fetchNewestCommit(octokit)
    const root: treeNodeI = {
        sha: newestCommit.data.commit.tree.sha,
        url: newestCommit.data.commit.tree.url,
        type: 'tree'
    }
    const repoStructRoot: repoStructNode = {
        sha: newestCommit.data.commit.tree.sha,
        url: newestCommit.data.commit.tree.url,
        path: '',
        mode: '',
        type: 'tree',
        size: undefined,
        children: []
    }
    await buildTree(root, repoStructRoot)
    console.log("root", repoStructRoot)
}

load()

