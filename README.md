# ph-wiki-post-loader

This is a node service that copies all the posts from [ph-wiki-posts](https://github.com/purduehackers/ph-wiki-posts) to our MongoDB Atlas Database. It allows [ph-wiki-posts](https://github.com/purduehackers/ph-wiki-posts) to have complicated file structure because it recursively fetches the content using Github API.

## Environment Variables

To run this project locally, you will need to create a `.env` file in the project root directory and add the following enviornment variables in it. If you can't find any variables, email Chi-Wei Lien ([lien2@purdue.edu](mailto:lien2@purdue.edu)).

`MONGODB_URI`

`DB_NAME`

`PH_WIKI_LOADER_PRIVATE_KEY`

`APP_ID`

`INSTALLATION_ID`

## Run Locally

Clone the project

```bash
  git clone git@github.com:purduehackers/ph-wiki-post-loader.git
```

Go to the project directory

```bash
  cd ph-wiki-post-loader
```

Install dependencies

```bash
  yarn install
```

Run the service

```bash
  yarn run start
```

## Tech Stack

Node, Express, Github API, MongoDB
