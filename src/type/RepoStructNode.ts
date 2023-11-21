import FileMetaData from './FileMetaData.js'
import GithubUser from './GithubUser.js'

/*
This interface stores the file meta data and defines the recursive node 
structure.
*/
interface RepoStructNode extends FileMetaData {
  slug: string
  name: string
  authors: GithubUser[]
  children: RepoStructNode[]
}

export default RepoStructNode
