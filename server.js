// WEBSOCKET CONNECTION
const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer("ws://zuri-chat.herokuapp.com/chat", {
    perMessageDeflate: false
  });
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001
const cors = require('cors')

console.log('web socket')
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
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
