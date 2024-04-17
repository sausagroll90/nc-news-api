# Northcoders News API

A REST API supporting a news web application. 

Hosted [here](https://nc-news-yjss.onrender.com/).

## To run project

### Dependencies

- Node.js (v21.6.2)
- Postgres (v15.6)

### Setup

1. Clone this repo.
2. Create files `.env.development` and `.env.test` in the project root directory.
3. Add the line `PGDATABASE=nc_news` to `.env.development` and `PGDATABASE=nc_news_test` to `.env.test`.
4. Run `npm install` to install dependencies.
5. Run `npm run setup-dbs` to create local test and development databases.
6. Run `npm run seed` to seed local development database.

### Running the code

1. Run `npm test` to run tests.
2. Run `npm start` to start server.
