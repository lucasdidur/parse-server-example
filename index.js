const express = require('express');
const { default: ParseServer, ParseGraphQLServer } = require('parse-server');

const app = express();

const port = process.env.PORT || 1337;
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const parseServer = new ParseServer({
  databaseURI: databaseUri            || 'mongodb://localhost:27017/test',
  appId: process.env.APP_ID           || 'myAppId',
  masterKey: process.env.MASTER_KEY   || '',
  cloud: process.env.CLOUD_CODE_MAIN  || __dirname + '/cloud/main.js',
  serverURL: 'http://localhost:1337/parse',
  publicServerURL: 'http://localhost:1337/parse',
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

const parseGraphQLServer = new ParseGraphQLServer(
    parseServer,
    {
      graphQLPath: '/graphql',
      playgroundPath: '/playground'
    }
);

const mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, parseServer.app);

parseGraphQLServer.applyGraphQL(app);
parseGraphQLServer.applyPlayground(app);

const httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
  console.log('REST API running on http://localhost:1337/parse');
  console.log('GraphQL API running on http://localhost:1337/graphql');
  console.log('GraphQL Playground running on http://localhost:1337/playground');
});

ParseServer.createLiveQueryServer(httpServer);
