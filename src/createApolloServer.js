import { ApolloServer } from 'apollo-server-express'
import path from 'path'
import { importSchema } from 'graphql-import'
import { gql } from 'apollo-server'

import { prisma } from './generated/prisma-client'
import resolvers from './resolvers'

const mutationDefs = gql`
  extend type Mutation {
    uploadMedia (media: Upload!): Media!
  }
`

// create apollo express server
function createApolloServer () {
  return new ApolloServer({
    typeDefs: [ 
      importSchema(path.resolve('src/appSchema.graphql')),
      mutationDefs,
    ],
    resolvers,
    introspection: true,
    playground: true,
    context: req => ({ ...req, prisma })
  })
}

export default createApolloServer