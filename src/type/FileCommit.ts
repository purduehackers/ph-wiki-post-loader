import GithubUser from './GithubUser.js'

interface FileCommit {
  sha: string
  commit: {
    committer: {
      date: Date
    }
  }
  author: GithubUser
}

export default FileCommit
