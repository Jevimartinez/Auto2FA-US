// background.js

import './lib/otplib.buffer.min.js';
import './lib/otplib.index-browser.min.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extensión 2FA instalada o actualizada.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // SECRET
  if (request.action === "GET_SECRET") {
    chrome.storage.local
      .get(["twoFASecret"])
      .then((result) => {
        sendResponse({ secret: result.twoFASecret || null });
      })
      .catch((error) => {
        console.error("Error al obtener el secret:", error);
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
        console.error("Error al guardar el secret:", error);
        sendResponse({ status: "error", message: error.message });
      });
    return true;
  } else if (request.action === "DELETE_SECRET") {
    chrome.storage.local
      .remove(["twoFASecret"])
      .then(() => {
        sendResponse({ status: "ok" });
      })
      .catch((error) => {
        console.error("Error al eliminar el secret:", error);
        sendResponse({ status: "error", message: error.message });
      });
    return true;
  } else if (request.action === "GET_TOTP") {
    const secret = request.secret;
    if (!secret) {
      sendResponse({ totp: null });
      return true;
    }
    const totp = self.otplib.authenticator.generate(secret);
    sendResponse({ totp: totp });
    return true;
  } else if (request.action === "GET_REMAINING_TIME") {
    const secret = request.secret;
    if (!secret) {
      sendResponse({ remainingTime: null });
      return true;
    }
    const remainingTime = self.otplib.authenticator.timeRemaining();
    sendResponse({ remainingTime: remainingTime });
    return true;
  } // AUTOFILL
  else if (request.action === "GET_AUTOFILL") {
    chrome.storage.local
      .get(["autofill"])
      .then((result) => {
        sendResponse({ autofill: result.autofill === undefined || result.autofill });
      })
      .catch((error) => {
        console.error("Error al obtener la configuración de autofill:", error);
        sendResponse({ autofill: false, error: error.message });
      });
    return true;
  } else if (request.action === "SET_AUTOFILL") {
    chrome.storage.local
      .set({ autofill: request.autofill })
      .then(() => {
        sendResponse({ status: "ok" });
      })
      .catch((error) => {
        sendResponse({ status: "error", message: error.message });
      });
    return true;

    // THEME
  } else if (request.action === "GET_THEME") {
    chrome.storage.local
      .get(["theme"])
      .then((result) => {
        sendResponse({ theme: result.theme || "dark" });
      })
      .catch((error) => {
        console.error("Error al obtener la configuración de tema:", error);
        sendResponse({ theme: "light", error: error.message });
      });
    return true;
  } else if (request.action === "SET_THEME") {
    chrome.storage.local
      .set({ theme: request.theme })
      .then(() => {
        sendResponse({ status: "ok" });
      })
      .catch((error) => {
        sendResponse({ status: "error", message: error.message });
      });
    return true;
  }

  // Unknown action
  console.error("Unknown action:", request.action);
  sendResponse({ status: "unknown_action" });
  return true;
});
