const { XMLParser } = require("fast-xml-parser");
const { readFileSync } = require('fs');
const { BrowserWindow } = require('electron')
const path = require('path')

async function parseOpmlAndSendFeeds() {
    options = {
        ignoreAttributes: false
    };

    xmlFile = readFileSync(path.join(__dirname, "../assets_rss/myfeeds.opml"), "utf8");
    parser = new XMLParser(options);
    json = parser.parse(xmlFile);

    feedsData = []

    options.ignoreAttributes = true


    for (const element of json.opml.body.outline) {
        
        feedsData.push(element)
    }

    BrowserWindow.getFocusedWindow().webContents.on("did-finish-load", () => {
        BrowserWindow.getFocusedWindow().webContents.send("feeds-loaded", feedsData)
    }) 


}

module.exports = { parseOpmlAndSendFeeds }