console.log("Hi from background Script file")

let jiraObject = {};

// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    }, fireItUp());
});

function fireItUp() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "getMoving"}, function(response) {
            console.log(response);
        });
    });
}

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    console.log("Got message from content Script: ", request);
    jiraObject = request;
    const newURL = "https://wiki.inbcu.com/x/gy8fFQ";
    chrome.tabs.create({ url: newURL });
    sendResponse('OK');
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // make sure the status is 'complete' and it's the right tab
    console.log("UPDATED in the new tab!");
    if(changeInfo.status == 'complete') {
        switch (true) {
            case (tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/VAM+User+Stories') != -1):
                let x = 1;
                chrome.scripting.executeScript({
                    target: {tabId: tabId, allFrames: true},
                    func: myFunction
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=') != -1):
                let y = 1;
                chrome.scripting.executeScript({
                    target: {tabId: tabId, allFrames: true},
                    func: myFunction2
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/') != -1):
                let z = 1;
                let wikiURL = tab.url;
                chrome.scripting.executeScript({
                    target: {tabId: tabId, allFrames: true},
                    func: myFunction3
                });
                break;
        }
    }
});

async function myFunction() {
    const createPageButton = document.getElementById('quick-create-page-button');
    createPageButton.click();
}

async function myFunction2() {
    //paste jirtitle into #content-title
    const wikiTitle = document.getElementById('content-title');
    wikiTitle.innerText = jiraObject.jiraTitleText;
    // paste jiracontent into #tinymce
    const wikiBody = document.getElementById('tinymce');
    wikiBody.innerHTML = jiraObject.jiraDescriptionHtml;
    // click the button with id #rte-button-publish
    const publishButton = document.getElementById('rte-button-publish');
    publishButton.click();
    
    // then wait to get the URL
    driver.find_element(By.ID, "shareContentLink").click()
    
}

async function myFunction3(theURL,mTabId) {
    // send theURL into the original Jira description
    chrome.tabs.sendMessage(jiraObject.jiraTabId, {wikiURL: theURL}, function(response) {
        console.log(response.farewell);
    });
}