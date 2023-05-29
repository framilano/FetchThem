const socket = io()

function startLoadingScreen(mainWindowContainer) {
    loader = document.createElement("div")
    loader.setAttribute("class", "loader")

    duo1 = document.createElement("div")
    duo1.setAttribute("class", "duo duo1")

    dota = document.createElement("div")
    dota.setAttribute("class", "dot dot-a")

    dotb = document.createElement("div")
    dotb.setAttribute("class", "dot dot-b")

    duo2 = document.createElement("div")
    duo2.setAttribute("class", "duo duo2")

    dota2 = document.createElement("div")
    dota2.setAttribute("class", "dot dot-a")

    dotb2 = document.createElement("div")
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

    document.getElementById("nav-close-button").click()

    mainWindowContainer = document.getElementById("main-window-container")

    //Cleaning main window
    mainWindowContainer.replaceChildren()
    startLoadingScreen(mainWindowContainer)

    socket.emit("get-preview-data", feedSourceUrl)

}

function completeChangeFeedSource(feedSourcePreviewData) {
    console.log("[completeChangeFeedSource START] ")

    mainWindowContainer = document.getElementById("main-window-container")
    mainWindowContainer.replaceChildren()

    index = 0
    rowDiv = null
    for (const feedSourceItem of feedSourcePreviewData) {

        div = document.createElement("div")
        div.setAttribute("class", "col-sm-3")
        div.innerHTML = feedSourceItem.title

        if (!feedSourceItem.url.includes("nitter")) {
            img = document.createElement("img")
            img.setAttribute("src", feedSourceItem.images[0])
            img.setAttribute("class", "rounded")
            div.appendChild(img)
        } else {
            img = div.getElementsByTagName("img")
            if (img[0]) img[0].setAttribute("class", "rounded")
        }


        div.addEventListener("click", () => open(feedSourceItem.url))


        if (index % 4 == 0) {
            rowDiv = document.createElement("div")
            rowDiv.setAttribute("class", "row")
            mainWindowContainer.appendChild(rowDiv)
        }

        rowDiv.appendChild(div)
        index += 1
    }
}

function setNavbarTitles() {

    feedsString = localStorage.getItem("feeds")

    feedsArray = JSON.parse(feedsString);

    if (!feedsArray) return

    sourcesList = document.getElementById("sources-list")
    
    //Clean previous navbar
    sourcesList.replaceChildren()
    
    for (const feedSource of feedsArray) {
        li = document.createElement("li")
        a = document.createElement("a")
        a.innerText = feedSource["title"]
        a.addEventListener("click", triggerChangeFeedSource.bind(null, feedSource['url']))
        li.appendChild(a)
        sourcesList.appendChild(li)

        //Classes
        li.setAttribute("class", "nav-item")
        a.setAttribute("class", "nav-link")
    }
}

socket.on("send-preview-data", (feedSourcePreviewData) => completeChangeFeedSource(feedSourcePreviewData))

document.getElementById("main-page").addEventListener("click", setMainPage)

function setMainPage() {
    mainWindowContainer = document.getElementById("main-window-container")
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
        url = document.getElementById("input-rss-url").value
        title = document.getElementById("input-rss-title").value

        if (!url || !title) return

        feedsString = localStorage.getItem("feeds")

        feeds_json = []

        if (feedsString) {
            feeds_json = JSON.parse(feedsString)
        }

        feeds_json.push({ "url": url, "title": title })

        localStorage.setItem("feeds", JSON.stringify(feeds_json))

    })

    document.getElementById("export-feed-btn").addEventListener("click", () => {

        feedsString = localStorage.getItem("feeds")

        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(feedsString));
        element.setAttribute('download', "feeds.json");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

    })

    document.getElementById('formFile').addEventListener('change', async (e) => {
        if (e.target.files[0]) {
          jsonString = await e.target.files[0].text();
          localStorage.setItem("feeds", jsonString)
          setNavbarTitles()
        }
      });
}

setMainPage()
setNavbarTitles()