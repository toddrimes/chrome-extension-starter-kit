console.log("Hi from content script");

chrome.runtime.sendMessage({ data: document.title }, function (response) {
    console.log(response);
});

async function handleIconClick(tab) {
    // const current = e.target.parentElement;
    console.log("copy-to-wiki button pressed");
    alert("hello!");
    chrome.scripting.executeScript({
        target: { tabId:tab.id },
        function: copyJiraToWiki(tab.id)
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