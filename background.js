console.log("Hi from background Script file")

let jiraObject = {};

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
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: myFunction
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=') != -1):
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: myFunction2
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/') != -1):
                let wikiURL = tab.url;
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: myFunction3(wikiURL)
                });
                break;
        }
    }
});

function myFunction() {
    const createPageButton = document.getElementById('quick-create-page-button');
    createPageButton.click();
}

function myFunction2() {
    //paste jirtitle into #content-title
    const wikiTitle = document.getElementById('content-title');
    wikiTitle.innerText = jiraObject.jiraTitleText;
    // paste jiracontent into #tinymce
    const wikiBody = document.getElementById('tinymce');
    wikiBody.innerHTML = jiraObject.jiraDescriptionHtml;
    // click the button with id #rte-button-publish
    const publishButton = document.getElementById('rte-button-publish');
    publishButton.click();
}

function myFunction3(theURL) {
    // send theURL into the original Jira description
    chrome.tabs.sendMessage(jiraObject.jiraTabId, {wikiURL: theURL}, function(response) {
        console.log(response.farewell);
    });
}