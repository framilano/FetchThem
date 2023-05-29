const { getLinkPreview, getPreviewFromContent } = require("link-preview-js");
const { XMLParser } = require("fast-xml-parser");


async function parseLinkPreviewAndSendResult(link) {
    console.debug("[parseLinkPreviewAndSendResult START] [link = %s]", link)
    
    //XML Parser
    options = {
        ignoreAttributes: false
    };
    parser = new XMLParser(options);

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
                continue
            }
        }

        index += 1
        if (index == 32) break
    }
    
    console.info("[parseLinkPreviewAndSendResult STOP]")
    return articlePreviews
}

module.exports = { parseLinkPreviewAndSendResult }