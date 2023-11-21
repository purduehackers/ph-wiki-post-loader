import { Octokit } from 'octokit'

const fetchCommits = async (path: string, octokit: Octokit) => {
  const commits = await octokit.request(
    'GET /repos/{owner}/{repo}/commits?path={path}',
    {
      owner: 'purduehackers',
      repo: 'ph-wiki-posts',
      path: path,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )
  return commits
}

export default fetchCommits
