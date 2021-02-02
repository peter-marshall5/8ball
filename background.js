var appOpen = false;
function launch() {
    if(appOpen) {
        if(chrome.app.window.get("")) {
            chrome.app.window.get("").focus();
        }
        return;
    }
    chrome.app.window.create("window.html", {
        "innerBounds": {
            "width": 300,
            "height": 300
        },
        "resizable": true,
    }, function() {
        var window = chrome.app.window.get("");
        window.onClosed.addListener(function() {
            appOpen = false;
        });
    });
    appOpen = true;
}
chrome.app.runtime.onLaunched.addListener(launch);