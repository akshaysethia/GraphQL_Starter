const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

let authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

let books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const AuthorType = new GraphQLObjectType({
  name: "author",
  description: "About The Author",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
      description: "Author Id",
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: "Name Of The Author",
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: "book",
  description: "Represents a Book written by a particular Author",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
      description: "Id of the Book",
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: "Name of the Book",
    },
    authorId: {
      type: GraphQLNonNull(GraphQLInt),
      description: "Id of the Author to which the Book Belongs to !",
    },
    author: {
      type: AuthorType,
      description: "The Author Details",
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "books",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "Get A Single Book",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of Books",
      resolve: () => books,
    },
    author: {
      type: AuthorType,
      description: "Get An Author From ID",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List Of Authors",
      resolve: () => authors,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add A Book",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        authorId: {
          type: GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: authors.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add a new Author",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
    removeBook: {
      type: new GraphQLList(BookType),
      description: "Removes a Book",
      args: {
        id: {
          type: GraphQLInt,
        },
        name: {
          type: GraphQLString,
        },
      },
      resolve: (parent, args) => {
        books = books.filter((book) => {
          if (args.id) {
            if (book.id !== args.id) {
              return book;
            }
          } else if (args.name) {
            if (book.name != args.name) {
              return book;
            }
          }
        });
        return books;
      },
    },
    removeAuthor: {
      type: new GraphQLList(AuthorType),
      description: "Used to remove an Author",
      args: {
        id: {
          type: GraphQLInt,
        },
        name: {
          type: GraphQLString,
        },
      },
      resolve: (parent, args) => {
        authors = authors.filter((author) => {
          if (args.id) {
            if (author.id !== args.id) {
              return author;
            }
          } else if (args.name) {
            if (author.name != args.name) {
              return author;
            }
          }
        });
        return authors;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server is running !");
});
