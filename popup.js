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
        function: reddenPage
    });
}

function reddenPage() {
    document.body.innerHTML = 'red';
}

function constructButton() {
    const buttonDiv = document.getElementById("buttonDiv");
    const myButton = document.createElement("button");
    myButton.innerHTML =  "Copy to Wiki";
    myButton.addEventListener("click", handleButtonClick);
    buttonDiv.appendChild(myButton);
    console.log('Init popup.js');
}

constructButton();