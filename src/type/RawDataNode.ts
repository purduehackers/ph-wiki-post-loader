/* 
This interface is used to handle raw data fetched from Github API.
*/
interface RawDataNode {
  sha: string
  url: string
  type: string
}

export default RawDataNode
