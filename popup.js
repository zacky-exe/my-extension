document.addEventListener('DOMContentLoaded', function () {
    const scanButton = document.getElementById('scanSelectionButton');

    // Function to scan selected text
    function scanSelectedComment() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error('No active tab found.');
                return;
            }
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: function () {
                    return window.getSelection().toString();
                }
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error('Error getting selected text:', JSON.stringify(chrome.runtime.lastError));
                } else {
                    const selectedText = results[0].result;
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: function (selectedText) {
                            const suspiciousKeywords = [
                                "buy now",
                                "limited offer",
                                "discount",
                                "free",
                                "spam",
                                "good quality",
                            ];

                            function isFakeComment(comment) {
                                for (let keyword of suspiciousKeywords) {
                                    if (comment.toLowerCase().includes(keyword.toLowerCase())) {
                                        return true;
                                    }
                                }
                                return false;
                            }

                            let fakeCount = 0;
                            if (isFakeComment(selectedText)) {
                                fakeCount++;
                            }

                            const percentage = (fakeCount / 1) * 100;
                            const riskLevel = percentage > 50 ? "High risk" : "Low risk";

                            return {
                                message: isFakeComment(selectedText) ? "This comment seems suspicious." : "This comment seems okay.",
                                percentage: percentage.toFixed(2),
                                riskLevel: riskLevel
                            };
                        },
                        args: [selectedText]
                    }, (scanResults) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error executing scanSelectedText:', JSON.stringify(chrome.runtime.lastError));
                        } else {
                            const result = scanResults[0].result;
                            document.getElementById('selectionResult').innerText = `${result.message} Suspicious comments: ${result.percentage}%. Risk Level: ${result.riskLevel}.`;
                        }
                    });
                }
            });
        });
    }

    // Event listener for the button click
    scanButton.addEventListener('click', scanSelectedComment);

    // Event listener for the keyboard shortcut
    chrome.commands.onCommand.addListener((command) => {
        if (command === "scan_selected_comment") {
            scanSelectedComment();
        }
    });
});
