import { ApolloServer, UserInputError, gql } from 'apollo-server';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

const { data: persons } = await axios.get('http://localhost:3000/persons');

// Describing data
// gql is a template string.
const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    age: Int!
    phone: String
    gender: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(gender: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      gender: String
      street: String!
      city: String!
    ): Person
    editPhone(name: String!, phone: String!): Person
  }
`;

/* A resolver is a function that's responsible for populating the data for a single field in your schema. */
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async (root, args) => {
      if (!args.gender) return persons;

      const byGender = (person) => {
        return args.gender === 'YES' ? person.gender : !person.gender;
      };

      return persons.filter(byGender);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError('Name is already used', {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    editPhone: async (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;

      const person = persons[personIndex];
      const updatedPerson = { ...person, phone: args.phone };

      persons[personIndex] = updatedPerson;

      return updatedPerson;
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
