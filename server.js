// WEBSOCKET CONNECTION
const WebSocketServer = require("ws").Server;
const express = require('express')
const PORT = process.env.PORT || 3001
const cors = require('cors')

const server = express()
  .use(cors())
  .use(express.static('build'))
  .use(express.json())
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
console.log('web socket')

const wss = new WebSocketServer({server});
// THIS VARIABLE STORES EVERY CONNECTION AS A DIFFERENTLY CLIENT
//SO THAT THE SAME ACTION WILL BE PERFORMED ON ALL OF THEM
let clients = [];

// FUNCTION TO PUSH EVERY NEW CONNECTION INTO THE ARRAY AS A CLIENT
wss.on("connection", (connection) => {
    clients.push(connection);
    wss.broadcast({ username: "admin", message: "A User Has Joined The Chat" });

    // EVERY MESSAGE RECIEVED BY THE SERVER IS PUBLISHED TO ALL CLIENTS
    connection.on("message", (message) => {
        const data = JSON.parse(message);
        wss.broadcast(data, connection);
    });
});

setInterval(cleanUp, 100);

wss.broadcast = function (data, sender) {
    clients.forEach(function (client) {
        if (client !== sender) {
            client.send(JSON.stringify(data))
        }
    })
}

function cleanUp() {
    const clientsLeaving = clients.filter(
        (client) => client.readyState === client.CLOSED
    );
    clients = clients.filter((client) => client.readyState !== client.CLOSED);
    clientsLeaving.forEach((client) =>
        wss.broadcast({ username: "admin", message: "A User Has Left The Chat" }, client)
    );
}
