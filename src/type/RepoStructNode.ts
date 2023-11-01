import FileMetaData from "./FileMetaData"

interface RepoStructNode extends FileMetaData {
    children: RepoStructNode[]
}

export default RepoStructNode