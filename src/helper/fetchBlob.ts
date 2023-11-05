import { Octokit } from "octokit";

const fetchBlob = async (sha: string, octokit: Octokit) => {
  const blobData = await octokit.request(
    "GET /repos/{owner}/{repo}/git/blobs/{sha}",
    {
      owner: "purduehackers",
      repo: "ph-wiki-posts",
      sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  const blobContent = Buffer.from(blobData.data.content, "base64").toString();
  return blobContent;
};

export default fetchBlob;
