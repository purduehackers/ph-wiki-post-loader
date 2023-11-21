import FileMetaData from './FileMetaData.js'

/*
This interface stores the file meta data and defines the recursive node 
structure.
*/
interface RepoStructNode extends FileMetaData {
  slug: string
  children: RepoStructNode[]
}

export default RepoStructNode
