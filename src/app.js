const { PrismaClient } = require('@prisma/client');

const {
  ApolloServer,
  AuthenticationError,
  UserInputError,
  ForbiddenError
} = require('apollo-server-express');
const {
  ApolloServerPluginLandingPageGraphQLPlayground
} = require('apollo-server-core');

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const history = require('connect-history-api-fallback');

const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Task = require('./resolvers/Task');

const prisma = new PrismaClient({ errorFormat: 'minimal' });

const resolvers = {
  Query,
  Mutation,
  User,
  Task
};

const corsOptions = {
  credentials: true,
  origin: [
    `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    `http://localhost:8080`
  ]
};

async function startApolloServer() {
  const app = express();

  const SESSION_SECRET = process.env.SESSION_SECRET || 'r4Hxza9y3CrfYkH';

  /** use a session with a rondom string as a session
   *  secret for authentication with a cookie that
   * expires after 12 hours of being set (login),
   * then the user is required to login again
   */
  app.use(
    session({
      name: 'sessionId',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 4.32e7 // 12 hours
      }
    })
  );

  /** create an ApolloServer instance to handle the graphql server */
  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers,
    context: ({ req, res }) => {
      return {
        req,
        res,
        prisma
      };
    },
    // formatError: (error) => {
    //   if (error.originalError instanceof ApolloError) return error;
    //   return new GraphQLError(error);
    // },
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground()
    ]
  });

  await server.start();

  /** cors: crosOptions -- enables the apollo-server-express cors with the corsOptions */
  server.applyMiddleware({ app, cors: corsOptions });

  /** start server and listen for connections using the express application */
  await new Promise((resolve) => app.listen({ port: 3000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);

  return { server, app };
}

try {
  const ApolloServerExpress = startApolloServer();

  ApolloServerExpress.then((res) => {
    const { app } = res;

    /** handle all routing by the front-end
     * Single Page Application (SPA, vue.js in our case)
     */
    app.use(history());

    app.use(express.static('public'));
  }).catch((error) => {
    throw error;
  });
} catch (error) {
  console.error(error);
}
