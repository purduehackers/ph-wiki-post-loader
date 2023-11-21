import FileCommit from '../type/FileCommit.js'
import GithubUser from '../type/GithubUser.js'

const fetchFileContributors = (commits: FileCommit[]) => {
  const authorNames = new Set<string>()
  const authors: GithubUser[] = []

  for (const commit of commits) {
    if (!authorNames.has(commit.author.login)) {
      authorNames.add(commit.author.login)
      authors.push(commit.author)
    }
  }

  return authors
}

export default fetchFileContributors
