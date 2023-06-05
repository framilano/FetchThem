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

    if (link.includes("reddit")) {
        for (const post of json.feed.entry) {
            articleData = {
                "title": post.title,
                "html_content": post.content['#text'],
                "link": post.link['@_href']
            }

            articlePreviews.push(articleData)
        }
    } else {
        for (const article of json.rss.channel.item) {
            articleData = {
                "description": article.description,
                "title": article.title,
                "link": article.link
            }

            if (article['content:encoded']) articleData['content_encoded'] = article['content:encoded']
            if (article['enclosure']) articleData['enclosure'] = article['enclosure']
            if (article['media:content']) articleData['media_content'] = article['media:content']
            articlePreviews.push(articleData)
        }
    }



    console.info("[parseLinkPreviewAndSendResult STOP]")
    return articlePreviews
}

module.exports = { parseLinkPreviewAndSendResult }