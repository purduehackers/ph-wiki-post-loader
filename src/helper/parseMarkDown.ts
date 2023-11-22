import matter from 'gray-matter'

const parseMarkDown = (fileContent: string) => {
  const { data, content } = matter(fileContent)
  return {
    metadata: data,
    content: content,
  }
}

export default parseMarkDown
