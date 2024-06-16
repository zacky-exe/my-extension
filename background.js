chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "scanSelectedText",
        title: "Scan Selected Comment",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "scanSelectedText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSelectedText
        }, (results) => {
            const selectedText = results[0].result;
            chrome.runtime.sendMessage({ action: "scanSelectedText", selectedText: selectedText }, response => {
                console.log(response); // Handle the response from the content script
            });
        });
    }
});

function getSelectedText() {
    return window.getSelection().toString();
}

