
const socket = io()

function startLoadingScreen(mainWindowContainer) {
    let loader = document.createElement("div")
    loader.setAttribute("class", "loader")

    let duo1 = document.createElement("div")
    duo1.setAttribute("class", "duo duo1")

    let dota = document.createElement("div")
    dota.setAttribute("class", "dot dot-a")

    let dotb = document.createElement("div")
    dotb.setAttribute("class", "dot dot-b")

    let duo2 = document.createElement("div")
    duo2.setAttribute("class", "duo duo2")

    let dota2 = document.createElement("div")
    dota2.setAttribute("class", "dot dot-a")

    let dotb2 = document.createElement("div")
    dotb2.setAttribute("class", "dot dot-b")

    duo2.appendChild(dota2)
    duo2.appendChild(dotb2)

    duo1.appendChild(dota)
    duo1.appendChild(dotb)

    loader.appendChild(duo1)
    loader.appendChild(duo2)

    mainWindowContainer.append(loader)
}

function triggerChangeFeedSource(feedSourceUrl) {
    console.debug("[triggerChangeFeedSource START] [feedSourceUrl = %s]", feedSourceUrl)

    document.getElementById("nav-close-button").click()

    let mainWindowContainer = document.getElementById("main-window-container")

    //Cleaning main window
    mainWindowContainer.replaceChildren()
    startLoadingScreen(mainWindowContainer)

    //Asking server to retrieve list of items
    socket.emit("get-feed-items", feedSourceUrl)

    socket.on("response-get-feed-items", (feedSourcePreviewData) => {

        mainWindowContainer.replaceChildren()

        let index = 0
        let rowDiv = null
        for (const feedSourceItem of feedSourcePreviewData) {
            console.log(feedSourceItem)
            //Checking if there are empty articles
            if (feedSourceItem.title.trim().length == 0) {
                continue
            }

            //Setting title
            let div = document.createElement("div")
            div.setAttribute("class", "col-md-3")
            div.innerHTML = "<div>" + feedSourceItem.title + "</div>"

            //Extracting image from articleData
            let img = extractImgFromArticleData(feedSourceItem)

            //Stripping img from its attribute (except src)
            if (img) {
                img.removeAttribute("width")
                img.removeAttribute("height")
                img.removeAttribute("class")
                div.appendChild(img)
            }

            //Adding click event to open the article
            div.addEventListener("click", () => open(feedSourceItem.link))


            //Creating a new row every 4 articles
            if (index % 4 == 0) {
                rowDiv = document.createElement("div")
                rowDiv.setAttribute("class", "row")
                mainWindowContainer.appendChild(rowDiv)
            }

            rowDiv.appendChild(div)
            index += 1
        }
    })
}

function triggerDeleteFeedSource(feedSourceTitle) {
    console.log(feedSourceTitle)
    let titlebtns = document.getElementsByClassName("title-button")

    for (const titlebtn of titlebtns) {
        if (titlebtn.innerText == feedSourceTitle) {
            //Removing the parent <li> element, deleting both title and del buttons
            titlebtn.parentElement.remove()
            deleteFeedFromLocalStorage(feedSourceTitle)
            return
        }
    }
}

function setNavbarTitles() {

    let feedsString = localStorage.getItem("feeds")

    let feedsArray = JSON.parse(feedsString);

    if (!feedsArray) return

    let sourcesList = document.getElementById("sources-list")

    //Clean previous navbar
    sourcesList.replaceChildren()

    for (const feedSource of feedsArray) {
        let li = document.createElement("li")

        //Title button
        let titlebtn = document.createElement("button")
        titlebtn.innerText = feedSource["title"]
        titlebtn.addEventListener("click", triggerChangeFeedSource.bind(null, feedSource['url']))
        li.appendChild(titlebtn)

        //Delete button setup
        let deletebtn = document.createElement("button")
        deletebtn.innerText = "X"
        deletebtn.addEventListener("click", triggerDeleteFeedSource.bind(null, feedSource["title"]))
        li.appendChild(deletebtn)

        sourcesList.appendChild(li)

        //Classes
        li.setAttribute("class", "nav-item")
        titlebtn.setAttribute("class", "nav-link title-button")
        deletebtn.setAttribute("class", "nav-link delete-button")
    }
}

function setMainPage() {
    let mainWindowContainer = document.getElementById("main-window-container")
    //Cleaning main window
    mainWindowContainer.replaceChildren()

    mainWindowContainer.innerHTML = `
    <div class="col-auto">
    <label for="inputRSSTitle" class="visually-hidden">RSS Title</label>
    <input type="text" class="form-control" id="input-rss-title" placeholder="RSS Title">
    </div>
    <div class="col-auto">
    <label for="inputRSSURL" class="visually-hidden">RSS URL</label>
    <input type="text" class="form-control" id="input-rss-url" placeholder="RSS URL">
    </div>
    <div class="col-auto">
    <button id="save-feed-btn" type="submit" class="btn btn-primary mb-3">Save RSS source</button>
    </div>
    
    <div class="col-auto">
    <button id="export-feed-btn" type="submit" class="btn btn-primary mb-3">Export saved feeds</button>
    </div>
    
    <div class="mb-3">
    <label for="formFile" class="form-label">Import feeds.json</label>
    <input class="form-control" type="file" id="formFile">
    </div>
    `

    document.getElementById("save-feed-btn").addEventListener("click", () => {
        let url = document.getElementById("input-rss-url").value
        let title = document.getElementById("input-rss-title").value

        if (!url.match("https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)")) {
            alert("Invalid URL")
            return
        }

        if (title.length > 15) {
            alert("Title is too long")
            return
        }

        if (!url || !title) {
            alert("Invalid URL or Title")
            return
        }

        let feedsString = localStorage.getItem("feeds")

        let feeds_json = []

        if (feedsString) {
            feeds_json = JSON.parse(feedsString)
        }

        feeds_json.push({ "url": url, "title": title })

        localStorage.setItem("feeds", JSON.stringify(feeds_json))

        //Updates current NavBar
        setNavbarTitles()

    })

    document.getElementById("export-feed-btn").addEventListener("click", () => {

        let feedsString = localStorage.getItem("feeds")

        let element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(feedsString));
        element.setAttribute('download', "feeds.json");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

    })

    document.getElementById('formFile').addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            let jsonString = await e.target.files[0].text();
            localStorage.setItem("feeds", jsonString)

            //Updates current NavBar
            setNavbarTitles()
        }
    });
}

function deleteFeedFromLocalStorage(feedSourceTitle) {
    console.debug("[deleteFeedFromLocalStorage START] [feedSourceTitle = %s]", feedSourceTitle)
    let feeds = localStorage.getItem("feeds")
    let feedsArray = JSON.parse(feeds)

    for (const feed of feedsArray) {
        if (feed.title == feedSourceTitle) {
            feedsArray.splice(feedsArray.indexOf(feed), 1)
            break
        }
    }

    localStorage.setItem("feeds", JSON.stringify(feedsArray))
}

function extractImgFromArticleData(feedSourceItem) {
    //Checking if there's content_encoded in articleData/feedSourceItem
    let mediaContentImg = null
    let enclosureImg = null
    let contentEncodedImg = null
    let descriptionImg = null
    let redditImg = null

    if (feedSourceItem['html_content']) {
        redditImg = new DOMParser().parseFromString(feedSourceItem['html_content'], "text/html").querySelector("img")
    }

    if (feedSourceItem['media_content']) {
        mediaContentImg = document.createElement("img")
        mediaContentImg.setAttribute("src", feedSourceItem['media_content']["@_url"])
    }

    if (feedSourceItem['enclosure']) {
        enclosureImg = document.createElement("img")
        enclosureImg.setAttribute("src", feedSourceItem['enclosure']["@_url"])
    }

    if (feedSourceItem['content_encoded']) {
        contentEncodedImg = new DOMParser().parseFromString(feedSourceItem['content_encoded'], "text/html").querySelector("img")
    }
    if (feedSourceItem.description) {
        descriptionImg = new DOMParser().parseFromString(feedSourceItem.description, "text/html").querySelector("img")
    }

    if (mediaContentImg) return mediaContentImg
    if (enclosureImg) return enclosureImg
    if (contentEncodedImg) return contentEncodedImg
    if (descriptionImg) return descriptionImg
    if (redditImg) return redditImg
    return null
}

document.getElementById("main-page").addEventListener("click", setMainPage)


setMainPage()
setNavbarTitles()