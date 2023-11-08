import { Octokit } from 'octokit'

const fetchNewestCommit = async (octokit: Octokit) => {
  const newestCommit = await octokit.request(
    'GET /repos/{owner}/{repo}/commits/{sha}',
    {
      owner: 'purduehackers',
      repo: 'ph-wiki-posts',
      sha: 'main',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )
  return newestCommit
}

export default fetchNewestCommit
