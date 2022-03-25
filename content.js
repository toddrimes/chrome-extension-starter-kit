console.log("Hi from content script");

chrome.runtime.sendMessage({ data: document.title }, function (response) {
    console.log(response);
});