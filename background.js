console.log("Hi from background Script file")

let jiraObject = {};
let jiraTabId = null;
let wikiTabId = null;

// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    }, fireItUp(tab.id));
});

function fireItUp(mTabId) {
    jiraTabId = mTabId;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(mTabId, {greeting: "getMoving"}, function(response) {
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // make sure the status is 'complete' and it's the right tab
    console.log("UPDATED in the new tab!");
    if(changeInfo.status == 'complete') {
        switch (true) {
            case (tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/VAM+User+Stories') != -1):
                let x = 1;
                console.log('case 1: ' + tabId);
                await chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    function: myFunction
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/pages/createpage.action?spaceKey=ADSYS&fromPageId=') != -1):
                let y = 1;
                console.log('case 2: ' + tabId);
                await chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    function: myFunction2,
                    args: [jiraObject]
                });
                break;
            case (tab.url.indexOf('https://wiki.inbcu.com/display/ADSYS/') != -1):
                let z = 1;
                let wikiURL = changeInfo.url;
                console.log('case 3: ' + tabId);
                await chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    function: myFunction3(),
                    args: [wikiURL]
                });
                break;
        }
    }
});


function myFunction() {
    console.log('in myfunction');
    const createPageButton = document.getElementById('quick-create-page-button');
    createPageButton.click();
}

function myFunction2(mJiraObject) {
    console.log('in myfunction2');
    //paste jirtitle into #content-title
    const wikiTitle = document.getElementById('content-title');
    wikiTitle.value = mJiraObject.jiraTitleText;
    // wikiTitle.value = "hello";
    // paste jiracontent into #tinymce
    const wikiBody = document.getElementById('tinymce');
    wikiBody.value = mJiraObject.jiraDescriptionHtml;
    // wikiBody.value = 'there';
    // click the button with id #rte-button-publish
    const publishButton = document.getElementById('rte-button-publish');
    publishButton.click();
    
    // then wait to get the URL
    // driver.find_element(By.ID, "shareContentLink").click()
    // return("http://www.google.com"); // s/b real wiki share URL but this is a test
    
}

function myFunction3(theURL) {
    console.log('in myfunction3');
    // send theURL into the original Jira description
    chrome.tabs.sendMessage(jiraTabId, {wikiURL: theURL}, function(response) {
        console.log(response.wikiLinkPasted);
    });
}
