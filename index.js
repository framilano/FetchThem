const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//const { parseOpmlAndSendFeeds } = require("./main_scripts/parse_opml")
const { parseLinkPreviewAndSendResult } = require("./server_scripts/parse_link_preview")

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/main_window.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.on("get-preview-data", async (link) => {
        result = await parseLinkPreviewAndSendResult(link)
        socket.emit("send-preview-data", result)
    })
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});