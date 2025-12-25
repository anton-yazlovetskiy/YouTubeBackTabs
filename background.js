chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openVideo") {
    chrome.tabs.create({
      url: request.url,
      active: false // Открывает вкладку, не переключаясь на неё
    });
  }
});