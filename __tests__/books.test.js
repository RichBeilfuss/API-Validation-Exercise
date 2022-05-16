/**books tests */

process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO books(isbn, amazon_url, language, pages, publisher, title, year) VALUES ('123456789', 'https://amazon.com/book', 'Moosh', 'English', 1000, 'Publisher', 'The Book of the Year', 2020) RETURNING isbn`
    );
    book_isbn = result.rows[0].isbn
});

describe("POST /books", function(){
    test("Creates a book", async function(){
        const resp = await request(app)
            .post('/books')
            .send({
                isbn: "12398773",
                amazon_url: "https://book.com",
                author: "tests",
                language: "english",
                pages: 1000,
                publisher: "the publisher",
                title: "test book",
                year: 2019
            });
        expect(resp.statusCode).toBe(201);
        expect(resp.body.book).toHaveProperty("isbn");
    });
    test("Test missing requirements", async function(){
        const resp = await request(app)
            .post("/books")
            .send({author: "Moosh"});
        expect(resp.statusCode).toBe(400);
    });
});

describe("GET /books", function(){
    test("Gets list of a book", async function(){
        const resp = await request(app).get('/books');
        const books = resp.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("language");
    });
});

afterEach(async function(){
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function(){
    await db.end()
});