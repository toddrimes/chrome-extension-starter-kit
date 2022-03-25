async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function getTabId() {
    let thisTab = await getCurrentTab();
    alert("Tab Id is " + thisTab.id);
    return thisTab.id;
}

const tabId = getTabId();

async function handleButtonClick(e) {
    // const current = e.target.parentElement;
    console.log("copy-to-wiki button pressed");
    alert("hello!");
    chrome.scripting.executeScript({
        target: { tabId: await tabId },
        function: copyJiraToWiki(tabId)
    });
}

function copyJiraToWiki(mTabId) {
    // document.body.innerHTML = jiraDescriptionHtml;
    let jiraMessage = {
        ":jiraTitleText" : document.querySelector('#summary-val').innerText,
        "jiraDescriptionHtml": document.querySelector('#description-val').innerHTML,
        "jiraTabId": mTabId
    }
    chrome.runtime.sendMessage(jiraMessage, function(response) {
        console.log(response);
    });
}

function constructButton() {
    const buttonDiv = document.getElementById("buttonDiv");
    const myButton = document.createElement("button");
    myButton.innerHTML =  "Copy to Wiki";
    myButton.addEventListener("click", handleButtonClick);
    buttonDiv.appendChild(myButton);
    console.log('Init popup.js');
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      let wikiURL = request;
      document.querySelector('#description-val').innerHTML = wikiURL;
      console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
      sendResponse({farewell: "goodbye"});
  }
);

constructButton();