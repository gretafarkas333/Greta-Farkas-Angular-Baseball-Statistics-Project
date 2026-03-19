const express = require('express');
const jsonGraphqlServer = require('json-graphql-server');
const playersData = require('./data/players.json');
const pitchesData = require('./data/pitches.json');

const data = {
  players: playersData.player,
  pitches: pitchesData.pitch
};

const PORT = process.env.PORT || 3000;

const app = express();

// CORS FIRST
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Mount GraphQL router
app.use('/graphql', jsonGraphqlServer.default(data));

app.listen(PORT, () => {
  console.log('\n🚀 GraphQL Server is running!');
  console.log(`📍 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`🎮 GraphQL Playground: http://localhost:${PORT}/graphql`);
  console.log(`\n💡 Keep this server running while you develop your application.\n`);
});
