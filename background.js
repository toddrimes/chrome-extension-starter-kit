console.log("Hi from background Script file")

let jiraObject = {};
let jiraTabId = null;
let wikiTabId = null;
let wikiURL = null;

// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    }, fireItUp(tab.id));
});

function fireItUp(mTabId) {
    jiraTabId = mTabId;
    console.log("Saved JIRA tab: " + jiraTabId);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(mTabId, {greeting: "getMoving"}, function(response) {
            console.log(response);
        });
    });
}

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    console.log("background.js, got message: " + request);
    if(request.wikiURL){
        console.log("Got wikiURL from content Script: ", request);
        wikiURL = request.wikiURL;
        sendResponse('OK - with wikiURL');
    } else {
        console.log("Got message from content Script: ", request);
        jiraObject = request;
        const newURL = "https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=354365315&src=quick-create";
        chrome.tabs.create({ url: newURL });
        sendResponse('OK - with jiraObject');
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // make sure the status is 'complete' and it's the right tab
    console.log("UPDATED in the new tab!");
    if(changeInfo.status == 'complete') {
        switch (true) {
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=') != -1):
                wikiURL = null;
                let y = 1;
                console.log('case 2: ' + tabId);
                await chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    function: myFunction2,
                    args: [jiraObject]
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/viewpage.action?pageId=') != -1 || tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/') != -1):
                if(wikiURL == null){
                    console.log('case 3.1: ' + tabId);
                    wikiURL = changeInfo.url;
                    await chrome.scripting.executeScript({
                        target: {tabId: tabId},
                        function: myFunction3
                    });
                } else {
                    console.log('case 3.2: ' + jiraTabId);
                    await chrome.scripting.executeScript({
                        target: {tabId: jiraTabId},
                        function: myFunction4,
                        args: [wikiURL]
                    });
                    chrome.tabs.update(
                      jiraTabId,
                      { "active" : true }
                    );
                    // wikiURL = null;
                }
                break;
        }
    }
});

function myFunction2(mJiraObject) {
    console.log('in myfunction2');

    const wikiTitle = document.getElementById('content-title');
    wikiTitle.value = mJiraObject.jiraTitleText;

    console.log(mJiraObject.jiraDescriptionHtml);
    console.log(mJiraObject.jiraDescriptionHtml.toString());
    document.querySelector('#wysiwygTextarea_ifr').contentWindow.tinymce.innerHTML = mJiraObject.jiraDescriptionHtml;

    const publishButton = document.getElementById('rte-button-publish');
    publishButton.click();
}

function myFunction3() {
    console.log('in myfunction3');
    const publishButton = document.getElementById('shareContentLink');
    publishButton.click();
    document.addEventListener("DOMContentLoaded", function() {
        var shareField = document.querySelectorAll('div'); // all divs
        let shareURL = shareField.value;
        chrome.tabs.sendMessage(jiraTabId, {wikiURL: shareURL}, function(response) {
            console.log(response.status);
        });
    });

}

function myFunction4(wikiURL) {
    console.log('in myfunction4');
    document.getElementById('description-val').click();
    console.log('pasting in "`theURL`"' + wikiURL);
    let myWindow = document.querySelectorAll('.tox-edit-area__iframe')[0].contentWindow.document;
    let tinymce = myWindow.tinymce;
    tinymce.setContent(wikiURL);
    document.querySelectorAll(".aui-button.aui-button-primary.submit")[0].click();
}
