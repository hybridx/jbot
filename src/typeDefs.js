import { gql } from 'apollo-server-express'

export const typeDefs = gql`
type JIRAResponse {
    summary: String
    assignee: String
    reporter: String
    status: String
    url: String
    priority: String
}
type Query {
    getJIRA(issue: String!): JIRAResponse
}
`
