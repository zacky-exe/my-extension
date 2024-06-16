const SERVER_URL = "http://127.0.0.1:5000/predict";

function isFakeComment(comment) {
    return fetch(SERVER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: comment })
    })
    .then(response => response.json())
    .then(data => data.is_fake)
    .catch(error => {
        console.error("Error:", error);
        return false;
    });
}

function scanSelectedText(selectedText) {
    return isFakeComment(selectedText).then(isFake => {
        const percentage = isFake ? 100 : 0;
        const riskLevel = isFake ? "High risk" : "Low risk";
        return { percentage, riskLevel };
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanSelectedText") {
        scanSelectedText(request.selectedText).then(result => {
            sendResponse(result);
        });
        return true;  // Keep the message channel open for asynchronous response
    }
});
