const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const { checkArticleExists } = require("../model/utils.model")

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
        expect(msg).toBe("resource not found");
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

describe("/api/articles", () => {
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

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("200: responds with article of given id", () => {
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
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
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
          expect(msg).toBe("article not found");
        });
    });
  });

  describe("PATCH", () => {
    test("200: responds with updated article with updated votes", () => {
      const testBody = { inc_votes: 1 };
      const expected = {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: "2020-11-03T09:12:00.000Z",
        votes: 1,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .patch("/api/articles/3")
        .send(testBody)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });

    test("200: can also decrease votes", () => {
      const testBody = { inc_votes: -5 };
      const expected = {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: "2020-11-03T09:12:00.000Z",
        votes: -5,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .patch("/api/articles/3")
        .send(testBody)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });

    test("400: when article_id is invalid", () => {
      const testBody = { inc_votes: 1 };
      return request(app)
        .patch("/api/articles/invalid_article")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("404: when article_id is valid but doesn't exist", () => {
      const testBody = { inc_votes: 1 };
      return request(app)
        .patch("/api/articles/99999")
        .send(testBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("article not found");
        });
    });

    test("400: when missing inc_votes on body", () => {
      const testBody = {};
      return request(app)
        .patch("/api/articles/3")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("400: when inc_votes is invalid data type (string)", () => {
      const testBody = { inc_votes: "one thousand" };
      return request(app)
        .patch("/api/articles/3")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("400: when inc_votes is invalid data type (decimal)", () => {
      const testBody = { inc_votes: 1.5 };
      return request(app)
        .patch("/api/articles/3")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("200: responds with an array of comments on the given article", () => {
      return request(app)
        .get("/api/articles/5/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(2);
          comments.forEach((comment) => {
            expect(comment.article_id).toBe(5);
            expect(comment.comment_id).toBeNumber();
            expect(comment.body).toBeString();
            expect(comment.author).toBeString();
            expect(comment.created_at).toBeString();
            expect(comment.votes).toBeNumber();
          });
        });
    });

    test("200: comments should be sorted by most recent first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(11);
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("400: when article_id is invalid", () => {
      return request(app)
        .get("/api/articles/test_invalid_article/comments")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("bad request");
        });
    });

    test("404: when article_id is valid but article doesn't exist", () => {
      return request(app)
        .get("/api/articles/4444/comments")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("article not found");
        });
    });

    test("200: responds with empty array when article id exists but there are no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toEqual([]);
        });
    });
  });

  describe("POST", () => {
    test("201: responds with newly created comment", () => {
      const testBody = {
        username: "butter_bridge",
        body: "this is a good article",
      };
      const expected = {
        comment_id: 19,
        body: "this is a good article",
        author: "butter_bridge",
        article_id: 1,
        created_at: expect.any(String),
        votes: 0,
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testBody)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject(expected);
        });
    });

    test("400: when article_id is invalid", () => {
      const testBody = {
        username: "butter_bridge",
        body: "this is a good article",
      };
      return request(app)
        .post("/api/articles/dogs/comments")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("404: when article_id is valid but article doesn't exist", () => {
      const testBody = {
        username: "butter_bridge",
        body: "this is a good article",
      };
      return request(app)
        .post("/api/articles/100000/comments")
        .send(testBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("article not found");
        });
    });

    test("404: when username doesn't exist", () => {
      const testBody = {
        username: "idontexist",
        body: "this is a bad article :(",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("username not found");
        });
    });

    test("400: when request body isn't json", () => {
      const testBody = "<p>hello</p>";
      return request(app)
        .post("/api/articles/1/comments")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("400: when request body is missing username", () => {
      const testBody = { body: "I hate this article" };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("400: when request body is missing body", () => {
      const testBody = { username: "uberhater10000" };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });
  });
});

describe("checkArticleExists", () => {
  test("resolves to true if article exists", async () => {
    const exists = await checkArticleExists(3)
    expect(exists).toBe(true)
  });

  test("resolves to false if article doesn't exist", async () => {
    const exists = await checkArticleExists(99999)
    expect(exists).toBe(false)
  })
});
