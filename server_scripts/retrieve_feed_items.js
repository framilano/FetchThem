const { XMLParser } = require("fast-xml-parser");

//XML Parser
const options = {
    ignoreAttributes: false
};
const parser = new XMLParser(options);

async function parseLinkPreviewAndSendResult(link) {
    console.debug("[parseLinkPreviewAndSendResult START] [link = %s]", link)
    
    res = await fetch(link)
    xmlContent = await res.text()
    json = parser.parse(xmlContent)
    articlePreviews = []
    
    for (const article of json.rss.channel.item) { 
        articlePreviews.push({
            "description": article.description,
            "title": article.title,
            "link": article.link
        })
    }
    
    console.info("[parseLinkPreviewAndSendResult STOP]")
    return articlePreviews
}

module.exports = { parseLinkPreviewAndSendResult }