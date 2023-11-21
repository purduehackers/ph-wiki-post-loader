import FileCommit from '../type/FileCommit.js'

const getLastUpdated = (commits: FileCommit[]) => {
  return commits[0].commit.committer.date
}

export default getLastUpdated
