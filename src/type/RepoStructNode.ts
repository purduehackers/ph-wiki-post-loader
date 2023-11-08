import FileMetaData from './FileMetaData.js'

interface RepoStructNode extends FileMetaData {
  slug: string
  children: RepoStructNode[]
}

export default RepoStructNode
