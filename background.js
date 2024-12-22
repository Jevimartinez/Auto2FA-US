// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extensión 2FA instalada o actualizada.");
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_SECRET") {
      chrome.storage.local
        .get(["twoFASecret"])
        .then((result) => {
          sendResponse({ secret: result.twoFASecret || null });
        })
        .catch((error) => {
          console.error("Error al obtener la secret:", error);
          sendResponse({ secret: null, error: error.message });
        });
      return true;
    } else if (request.action === "SET_SECRET") {
      chrome.storage.local
        .set({ twoFASecret: request.secret })
        .then(() => {
          sendResponse({ status: "ok" });
        })
        .catch((error) => {
          console.error("Error al guardar la secret:", error);
          sendResponse({ status: "error", message: error.message });
        });
      return true;
    }
  
    // Unknown action
    sendResponse({ status: "unknown_action" });
    return true;
  });
  