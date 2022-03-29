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
    console.log("Got message from content Script: ", request);
    jiraObject = request;
    const newURL = "https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=354365315&src=quick-create";
    chrome.tabs.create({ url: newURL });
    sendResponse('OK');
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // make sure the status is 'complete' and it's the right tab
    console.log("UPDATED in the new tab!");
    if(changeInfo.status == 'complete') {
        switch (true) {
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=') != -1):
                let y = 1;
                console.log('case 2: ' + tabId);
                await chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    function: myFunction2,
                    args: [jiraObject]
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/viewpage.action?pageId=') != -1):
            case (tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/') != -1):
                if(wikiURL == null){
                    console.log('case 3.1: ' + tabId);
                    wikiURL = await chrome.scripting.executeScript({
                        target: {tabId: jiraTabId},
                        function: myFunction3
                    });
                } else {
                    console.log('case 3.2: ' + tabId);
                    console.log("Switching to JIRA tab: " + jiraTabId);
                    console.log("The wikiURL is: " + wikiURL);
                    chrome.tabs.update(
                      jiraTabId,
                      { "active" : true }
                    );
                    await chrome.scripting.executeScript({
                        target: {tabId: jiraTabId},
                        function: myFunction4,
                        args: [wikiURL]
                    });
                    wikiURL = null;
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
    let shareURL = document.getElementById('share-link-input').value;
    return shareURL;
}

function myFunction4() {
    console.log('in myfunction4');
    document.getElementById('description-val').click();
    console.log('pasting in "`theURL`"' + theURL);
    let myWindow = document.querySelectorAll('.tox-edit-area__iframe')[0].contentWindow.document;
    let tinymce = myWindow.tinymce;
    tinymce.setContent('theURL');
    // document.querySelectorAll(".aui-button.aui-button-primary.submit")[0].click();
}
