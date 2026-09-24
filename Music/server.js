import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import initSocketServer from "./src/sockets/socket.server.js";
import http from "http";

connectDB();

const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(3002, () => {
  console.log("Music Server is running on port 3002");
});
