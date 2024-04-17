# Northcoders News API

## To run project

1. Clone this repo.
2. Create `.env.development` and `.env.test` in the project root directory.
3. Set `PGDATABASE=nc_news` in `.env.development` and `PGDATABASE=nc_news_test` in `.env.test`.
4. Run `npm install` to install dependencies.
5. Run `npm run setup-dbs` to create local test and development databases.
6. Run `npm run seed` to seed local development database.
7. Run `npm test` to run tests.

App hosted [here](https://nc-news-yjss.onrender.com/)

A REST API for a news app.

Requirements:
- Node.js v21.6.2
- Postgres v15.6