const { getLinkPreview, getPreviewFromContent } = require("link-preview-js");
const { XMLParser } = require("fast-xml-parser");

const MAX_ARTICLES = 32
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
    index = 0
    for (const article of json.rss.channel.item) {
        if (article.link.includes("nitter")) {
            articlePreviews.push({
                "title" : article.description,
                "url": article.link
            })
        } else {
            try {
                articlePreviews.push(await getLinkPreview(article.link))
            } catch {
                console.error("[parseLinkPreviewAndSendResult ERROR] [Couldn't retrieve %s preview data]", article.link)
                continue
            }
        }

        index += 1
        if (index == MAX_ARTICLES) break
    }
    
    console.info("[parseLinkPreviewAndSendResult STOP]")
    return articlePreviews
}

module.exports = { parseLinkPreviewAndSendResult }