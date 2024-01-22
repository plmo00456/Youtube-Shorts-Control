chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  if (request.action == "openPopup") {
    chrome.windows.create({
      url:"popup.html",
      type:"panel",
      width:300,
      height:190
    });
  }else if (request.relay === true){
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      console.log(tabs);
      await chrome.tabs.sendMessage(tabs[0].id, request, () => {
        return true;
      });
    });
  }
});