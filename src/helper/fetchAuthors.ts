import { Octokit } from 'octokit'

import GithubUser from '../type/GithubUser.js'

const fetchAuthor = async (username: string, octokit: Octokit) => {
  const commits = await octokit.request('GET /users/{username}', {
    username: username,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  return commits
}

const fetchAuthors = async (usernames: string[], octokit: Octokit) => {
  const authors: GithubUser[] = []
  for (const username of usernames) {
    const author = await fetchAuthor(username, octokit)
    authors.push(author.data)
  }
  return authors
}

export default fetchAuthors
