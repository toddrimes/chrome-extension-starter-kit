console.log("Hi from content script");

let wikiURL = null;

chrome.runtime.sendMessage({
    "jiraTitleText" : document.querySelector('#summary-val').innerText,
      "jiraDescriptionHtml": document.querySelector('#description-val').innerHTML}, function (response) {
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
        "jiraTitleText" : document.querySelector('#summary-val').innerText,
        "jiraDescriptionHtml": document.querySelectorAll('.user-content-block')[0].innerHTML}
    chrome.runtime.sendMessage(jiraMessage, function(response) {
        console.log(response);
    });
}

function sendWikiURL(mTheURL) {
    chrome.runtime.sendMessage({
        "wikiURL" : mTheURL}, function (response) {
        console.log(response);
    });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if(request.wikiURL == null || typeof request.wikiURL == 'undefined') {
          console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
          sendResponse({farewell: "goodbye"});
      }
  }
);