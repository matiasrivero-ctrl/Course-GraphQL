import { ApolloServer, gql } from 'apollo-server';

// persons' data
const persons = [
  {
    name: 'Smith Jones',
    gender: 'Male',
    age: 28,
    street: '724th Street',
    city: 'New York',
    id: 1,
  },
  {
    name: 'Joe Biden',
    gender: 'Male',
    age: 21,
    street: '120th Street',
    city: 'Arizona',
    id: 2,
  },
  {
    name: 'Bruce Lee',
    age: 19,
    street: 'Colombian Street',
    city: 'Ohio',
    id: 3,
  },
];

// Describing data
// gql is a template string.
const typeDefs = gql`
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    age: Int!
    gender: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }
`;

/* A resolver is a function that's responsible for populating the data for a single field in your schema. */
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
