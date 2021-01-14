import { gql } from "apollo-server-express"

const typeDefs = gql`
    scalar Date
    type Transaction {
    }

    type User {
    }

    type Query {
        users: [User]
    }
`

export default typeDefs
