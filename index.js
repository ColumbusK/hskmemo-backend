import app from "./server.js";
import dotenv from "dotenv";
import mongodb from "mongodb";
import http from "http";
import debug from "debug";

import WordsDAO from "./db/wordsDAO.js";
import UsersDAO from "./db/usersDAO.js";
import LearningDAO from "./db/learningDAO.js";
import DictsDAO from "./db/dictsDAO.js";
import CollectionsDAO from "./db/collectionsDAO.js";
import CalendarDAO from "./db/calendarDAO.js";
import RecordsDAO from "./db/recordsDAO.js";


async function main() {
  dotenv.config();
  const PORT = normalizePort(process.env.PORT || '3000');
  app.set('port', PORT);
  // 实例化一个MongoDB客户端
  const client = new mongodb.MongoClient(
    process.env.WEAPP_DB_URI
  )

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    // 连接到 hsk5 collection
    await WordsDAO.injectDB(client);
    // 连接到 users collection
    await UsersDAO.injectDB(client);
    // 连接到 learning_list collection
    await LearningDAO.injectDB(client);
    // 连接到 dictionaries collection
    await DictsDAO.injectDB(client);
    // 连接到 collections collection
    await CollectionsDAO.injectDB(client);
    // 连接到 calendars collection
    await CalendarDAO.injectDB(client);
    // 连接到 records collection
    await RecordsDAO.injectDB(client);

    console.log("MongoDB connected");

    // 启动服务
    const server = http.createServer(app);
    server.listen(PORT);
    server.on('error', onError);
    server.on('listening', onListening);

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      debug('Listening on ' + bind);
      console.log(`Listening on ${bind}`);
    }


  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main().catch(console.error);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

