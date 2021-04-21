import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './src/resolvers';
import graphqlSchema from './src/typedef.graphql';
import dotEnv from 'dotenv';

dotEnv.config();

const PORT = process.env.PORT || 3500;
const app = express();

const server = new ApolloServer({
    typeDefs: graphqlSchema,
    resolvers,
    playground: true,
})

server.applyMiddleware({ app });

app.get('/', function(req, res) {
  res.send({ hello: 'there!' })
});

app.listen(PORT, () => `Listening at http://localhost:${PORT}`);
