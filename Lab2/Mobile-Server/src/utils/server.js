import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { jwtConfig } from "./constants";

let webSocketServer;

export const initWss = value => {
  webSocketServer = value;
  webSocketServer.on('connection', ws => {
    ws.on('message', message => {
      const { type, payload: { token } } = JSON.parse(message);
      if (type !== 'authorization') {
        ws.close();
        return;
      }
      try {
        ws.user = jwt.verify(token, jwtConfig.secret);
      } catch (err) {
        ws.close();
      }
    })
  });
};

export const broadcast = (userId, data) => {
  if (!webSocketServer) {
    return;
  }
  webSocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && userId === client.user._id) {
      client.send(JSON.stringify(data));
      console.log(`broadcast sent to ${client.user.username}`);
    }
  });
};
