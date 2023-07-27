import { join } from 'path';
import { ApolloServer } from 'apollo-server';
import { makeSchema } from 'nexus';
import { gql2sqlTypes } from 'gql2sql';
import * as types from './app';
import { prisma } from './db';

export const schema = makeSchema({
  types: [gql2sqlTypes, types],
  outputs: {
    typegen: join(__dirname, '..', 'nexus-typegen.ts'), // 2
    schema: join(__dirname, '..', 'schema.graphql'), // 3
  },
});

export const server = new ApolloServer({ schema, context: { prisma }, cors: true })

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
