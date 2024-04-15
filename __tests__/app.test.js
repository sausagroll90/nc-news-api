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
      .then(({body}) => {
        const { msg } = body
        expect(msg).toBe("not found")
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
