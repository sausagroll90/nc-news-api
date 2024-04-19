const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const { checkExists } = require("../model/utils.model");

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
      .get("/api/topics/")
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
  describe("GET", () => {
    test("200: responds with an array of all articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
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

    test("200: articles should be sorted by date in descending order by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });

    test("200: ignores invalid query parameter", () => {
      return request(app)
        .get("/api/articles?not_valid=test")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
        });
    });

    describe("?topic", () => {
      test("200: should only list articles with given topic", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(1);
            expect(articles[0].topic).toBe("cats");
          });
      });

      test("200: results should still be in descending date order", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(12);
            articles.forEach((article) => {
              expect(article.topic).toBe("mitch");
            });
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });

      test("404: when given topic that doesn't exist", () => {
        return request(app)
          .get("/api/articles?topic=nonexistant_topic")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("topic not found");
          });
      });

      test("200: when topic exists but doesn't have any articles", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(0);
          });
      });
    });

    describe("?sort_by, ?order", () => {
      test("200: sorts by given column, defaults to descending order", () => {
        const test1 = request(app)
          .get("/api/articles?sort_by=votes")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("votes", { descending: true });
          });
        const test2 = request(app)
          .get("/api/articles?sort_by=comment_count")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("comment_count", {
              descending: true,
            });
          });
        return Promise.all([test1, test2]);
      });

      test("200: orders results in given order", () => {
        const test1 = request(app)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("created_at");
          });
        const test2 = request(app)
          .get("/api/articles?sort_by=title&order=asc")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("title");
          });
        const test3 = request(app)
          .get("/api/articles?sort_by=comment_count&order_by=desc")
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            expect(articles).toBeSortedBy("comment_count", {
              descending: true,
            });
          });
        return Promise.all([test1, test2, test3]);
      });

      test("400: when column passed to sort_by doesn't exist", () => {
        return request(app)
          .get("/api/articles?sort_by=invalid_col")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });

      test("400: when given order isn't asc or desc", () => {
        return request(app)
          .get("/api/articles?order=fkdjfhj")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
    });

    describe("pagination", () => {
      test("200: responds with articles paginated with given page number p, limit defaults to 10", () => {
        const test1 = request(app)
          .get("/api/articles?p=1")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(10);
          });

        const test2 = request(app)
          .get("/api/articles?p=2")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(3);
          });

        return Promise.all([test1, test2]);
      });

      test("200: can use limit parameter to set article limit for each page", () => {
        const test1 = request(app)
          .get("/api/articles?p=1&limit=4")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(4);
          });

        const test2 = request(app)
          .get("/api/articles?p=2&limit=5")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(5);
          });

        return Promise.all([test1, test2]);
      });

      test("404: when no articles are returned", () => {
        return request(app)
          .get("/api/articles?p=6&limit=5")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("page not found");
          });
      });

      test("400: when given p is invalid", () => {
        return request(app)
          .get("/api/articles?p=not_a_page")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });

      test("400: when given limit is invalid", () => {
        return request(app)
          .get("/api/articles?p=1&limit=not_a_limit")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
    });

    describe("total_count", () => {
      test("200: response object should have total_count property set to total number of articles returned ignoring pagination", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { total_count } }) => {
            expect(total_count).toBe(13);
          });
      });

      test("200: total_count ignores pagination", () => {
        return request(app)
          .get("/api/articles?p=1&limit=5")
          .expect(200)
          .then(({ body: { total_count } }) => {
            expect(total_count).toBe(13);
          });
      });

      test("200: total_count should only count filtered articles when using topic query", () => {
        const test1 = request(app)
          .get("/api/articles?topic=cats")
          .expect(200)
          .then(({ body: { total_count } }) => {
            expect(total_count).toBe(1);
          });

        const test2 = request(app)
          .get("/api/articles?topic=mitch&p=2&limit=5")
          .expect(200)
          .then(({ body: { total_count } }) => {
            expect(total_count).toBe(12);
          });

        return Promise.all([test1, test2]);
      });
    });
  });

  describe("POST", () => {
    test("201: responds with newly created article with votes and comment_count initialised to 0", () => {
      const testBody = {
        title: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
        body: "Test test test...",
        article_img_url: "https://test.com/images/5252/test.png",
      };
      const expected = {
        article_id: 14,
        title: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
        body: "Test test test...",
        article_img_url: "https://test.com/images/5252/test.png",
        created_at: expect.any(String),
        votes: 0,
        comment_count: 0,
      };
      return request(app)
        .post("/api/articles")
        .send(testBody)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });

    test("201: article_img_url reverts to default if not given", () => {
      const testBody = {
        title: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
        body: "Test test test...",
      };
      return request(app)
        .post("/api/articles")
        .send(testBody)
        .then(({ body: { article } }) => {
          expect(article.article_img_url).toBe(
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
          );
        });
    });

    test("400: when request body is missing a parameter", () => {
      const testBody = {
        title: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
      };
      return request(app)
        .post("/api/articles")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("404: when given author doesn't exist", () => {
      const testBody = {
        title: "Test Article",
        topic: "mitch",
        author: "missing_username",
        body: "Test test test...",
      };
      return request(app)
        .post("/api/articles")
        .send(testBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("author not found");
        });
    });

    test("404: when given topic doesn't exist", () => {
      const testBody = {
        title: "Test Article",
        topic: "not_a_topic",
        author: "butter_bridge",
        body: "Test test test...",
      };
      return request(app)
        .post("/api/articles")
        .send(testBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("topic not found");
        });
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
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });

    test("400: when given id is not a number", () => {
      return request(app)
        .get("/api/articles/mitchgifs")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("404: when no article exists with given id", () => {
      return request(app)
        .get("/api/articles/100000")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("article not found");
        });
    });

    test("200: response object should have comment_count key", () => {
      return request(app)
        .get("/api/articles/9")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.comment_count).toBe(2);
        });
    });

    test("200: response object should have comment_count key when article has no comments", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.comment_count).toBe(0);
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

    describe("pagination", () => {
      test("200: responds with comments paginated with given page number p, limit defaults to 10", () => {
        return request(app)
          .get("/api/articles/1/comments?p=1")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(10);
          });
      });

      test("200: can use limit query parameter to limit comments shown per page", () => {
        return request(app)
          .get("/api/articles/1/comments?p=2&limit=3")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(3);
          });
      });

      test("200: last page may have fewer comments than the limit", () => {
        const test1 = request(app)
          .get("/api/articles/1/comments?p=2")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(1);
          });

        const test2 = request(app)
          .get("/api/articles/9/comments?p=1&limit=5")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(2);
          });

        return Promise.all([test1, test2]);
      });

      test("400: invalid p", () => {
        return request(app)
          .get("/api/articles/1/comments?p=test_invalid")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });

      test("400: invalid limit", () => {
        return request(app)
          .get("/api/articles/1/comments?p=1&limit=test_invalid")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });

      test("404: when no comments are returned", () => {
        return request(app)
          .get("/api/articles/1/comments?p=3&limit=10")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("page not found");
          });
      });

      test("200: if article has no comments, then p=1 returns empty array", () => {
        return request(app)
          .get("/api/articles/2/comments?p=1")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
          });
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

describe("/api/comments/:comment_id", () => {
  describe("PATCH", () => {
    test("200: responds with updated comment", () => {
      const testBody1 = { inc_votes: 1 };
      const expected1 = {
        comment_id: 5,
        body: "I hate streaming noses",
        author: "icellusedkars",
        article_id: 1,
        created_at: expect.any(String),
        votes: 1,
      };
      const test1 = request(app)
        .patch("/api/comments/5")
        .send(testBody1)
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject(expected1);
        });

      const testBody2 = { inc_votes: 5 };
      const test2 = request(app)
        .patch("/api/comments/5")
        .send(testBody2)
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment.votes).toBe(6);
        });

      const testBody3 = { inc_votes: -1 };
      const test3 = request(app)
        .patch("/api/comments/5")
        .send(testBody3)
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment.votes).toBe(5);
        });
      return Promise.all([test1, test2, test3]);
    });

    test("400: when comment_id is invalid", () => {
      const testBody = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/invalid_id")
        .send(testBody)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("404: when comment_id is valid but doesn't exist", () => {
      const testBody = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/523452345")
        .send(testBody)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("comment not found");
        });
    });

    test("400: when request body is missing inc_votes key", () => {
      const testBody = {};
      return request(app)
        .patch("/api/comments/1")
        .send(testBody)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("400: when inc_votes key on request body is invalid", () => {
      const testBody1 = { inc_votes: "one" };
      const test1 = request(app)
        .patch("/api/comments/1")
        .send(testBody1)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });

      const testBody2 = { inc_votes: 0.5 };
      const test2 = request(app)
        .patch("/api/comments/1")
        .send(testBody2)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });

      return Promise.all([test1, test2]);
    });
  });

  describe("DELETE", () => {
    test("204: delete successful", () => {
      return request(app).delete("/api/comments/10").expect(204);
    });

    test("400: when comment_id is invalid", () => {
      return request(app)
        .delete("/api/comments/bad_comment")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("bad request");
        });
    });

    test("404: when comment_id is valid but comment doesn't exist", () => {
      return request(app)
        .delete("/api/comments/1000000")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("comment not found");
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("200: responds with array of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user.username).toBeString();
            expect(user.name).toBeString();
            expect(user.avatar_url).toBeString();
          });
        });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("200: responds with user object with given username", () => {
      const expected = {
        username: "rogersop",
        name: "paul",
        avatar_url:
          "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
      };
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user).toMatchObject(expected);
        });
    });

    test("404: when username doesn't exist", () => {
      return request(app)
        .get("/api/users/BigDog777")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("username not found");
        });
    });
  });
});

describe("checkExists", () => {
  test("resolves to true if given table contains row where given column = given value", async () => {
    const articleExists = await checkExists("articles", "article_id", 3);
    expect(articleExists).toBe(true);

    const topicExists = await checkExists("topics", "slug", "mitch");
    expect(topicExists).toBe(true);
  });

  test("resolves to false if given table doesn't contain row where given column = given value", async () => {
    const articleExists = await checkExists("articles", "article_id", 99999);
    expect(articleExists).toBe(false);

    const userExists = await checkExists("users", "username", "BigDog777");
    expect(userExists).toBe(false);
  });
});
