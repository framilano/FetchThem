const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//const { parseOpmlAndSendFeeds } = require("./main_scripts/parse_opml")
const { parseLinkPreviewAndSendResult } = require("./server_scripts/retrieve_feed_items")

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/main_window.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.on("get-feed-items", async (link) => {
        result = await parseLinkPreviewAndSendResult(link)
        socket.emit("response-get-feed-items", result)
    })
});


server.listen(8080, () => {
    console.log('listening on *:8080');
});