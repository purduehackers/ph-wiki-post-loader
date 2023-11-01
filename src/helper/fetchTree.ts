import { Octokit } from "octokit";

const fetchTree = async (sha: string, octokit: Octokit) => {
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

export default fetchTree;