const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("invalid endpoint", () => {
  test("404: responds with 'not found'", () => {
    return request(app)
      .get("/api/this-endpoint-doesnt-exist")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("not found");
      });
  });
});

describe("/api", () => {
  test("GET 200: responds with object documenting all available endpoints on API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const endpoints = require("../endpoints.json");
        expect(body).toEqual(endpoints);
      });
  });
});

describe("/api/topics", () => {
  test("GET 200: reponds with all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200: responds with article of given id", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        const expected = {
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        expect(article).toMatchObject(expected);
      });
  });
  test("GET 400: when given id is not a number", () => {
    return request(app)
      .get("/api/articles/mitchgifs")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("bad request");
      });
  });
  test("GET 404: when no article exists with given id", () => {
    return request(app)
      .get("/api/articles/100000")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("not found");
      });
  });
});

describe("/api/artices", () => {
  test("GET: 200 responds with an array of all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.title).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(article.body).toBe(undefined);
        });
      });
  });
  test("GET 200: articles should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});
