interface FileMetaData {
    path: string,
    mode: string,
    type: string,
    size: number | undefined,
    sha: string,
    url: string,
}

export default FileMetaData