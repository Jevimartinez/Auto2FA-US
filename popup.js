// popup.js

const secretInput = document.getElementById("secretInput");
const saveBtn = document.getElementById("saveBtn");
const copyBtn = document.getElementById("copyBtn");
const linkAlertBox = document.getElementById("linkAlertBox");
const clipboardAlertBox = document.getElementById("clipboardAlertBox");
const toggleSecret = document.getElementById("toggleSecret");
const eyeIcon = toggleSecret.querySelector("i");
const themeToggle = document.getElementById("themeToggle");
const container = document.querySelector(".container");
const tutorialText = document.getElementById("tutorialText");
const TOTPfield = document.getElementById("TOTPfield")
const remainingTimeField = document.getElementById("remainingTimeField")

document.addEventListener("DOMContentLoaded", () => {
  // Load existing secret (If it exists)
  chrome.runtime.sendMessage({ action: "GET_SECRET" }, async (response) => {
    if (!response.secret) {
      tutorialText.classList.remove("d-none");
    }
    if (response && response.secret) {
      secretInput.value = response.secret;
      // Place TOTP code

      await updateTOTP(response.secret);

    }
  });

  // Load saved theme
  chrome.runtime.sendMessage({ action: "GET_THEME" }, (response) => {
    if (response && response.theme) {
      const savedTheme = response?.theme;
      updateTheme(savedTheme);
    }
  });

  // Toggle secret visibility
  toggleSecret.addEventListener("click", () => {
    secretInput.type = secretInput.type === "password" ? "text" : "password";
    eyeIcon.className = secretInput.type === "password" ? "bi bi-eye-slash" : "bi bi-eye";
  });

  // Make enter key save the secret
  secretInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("saveBtn").click();
    }
  });

  // Save the secret
  saveBtn.addEventListener("click", async () => {
    const newSecret = secretInput.value.trim();
    let oldSecret = await getSecret();

    if (!newSecret) {  // Empty secret input field
      if (!oldSecret) { // There is no secret stored
        showLinkAlert("Debes introducir tu secret.", "danger");
        return;
      }
      // There was a previous secret stored
      chrome.runtime.sendMessage({ action: "DELETE_SECRET" }, (res) => {
        if (res?.status === "ok") {
          tutorialText.classList.remove("d-none");
          TOTPfield.innerHTML = "••••••";
          remainingTimeField.innerHTML = "30s";
          clearInterval(updateInterval);
          showLinkAlert("Secret eliminada con éxito!", "success");
        } else {
          showLinkAlert("Error al eliminar el secret.", "danger");
        }
      });
      return;
    }
    // The secret field is not empty
    if (oldSecret === newSecret) {
      showLinkAlert("Has introducido el mismo secret que antes.", "warning");
      return;
    }

    // Validate Base32 format
    if (!/^[A-Z2-7]+=*$/i.test(newSecret)) {
      showLinkAlert("El secret parece no estar en formato Base32.");
      return;
    }

    // Save in storage
    chrome.runtime.sendMessage({ action: "SET_SECRET", secret: newSecret }, (res) => {
      if (res?.status === "ok") {
        showLinkAlert("Secret guardada con éxito!", "success");
        tutorialText.classList.add("d-none");
        updateTOTP(newSecret);
      } else {
        showLinkAlert("Error al guardar el secret.", "danger");
      }
    });
  });

  // Toggle theme
  themeToggle.addEventListener("click", () => {
    const newTheme = container.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    updateTheme(newTheme);
  });

  // Copy TOTP code to clipboard
  copyBtn.addEventListener("click", () => {
    const totpCode = TOTPfield.innerText;
    navigator.clipboard.writeText(totpCode).then(() => {
      showClipboardAlert("Código TOTP copiado al portapapeles!");
    }, () => {
      showClipboardAlert("Error al copiar el código TOTP.", "danger");
    });
  });

});

function getSecret() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "GET_SECRET" }, (response) => {
      resolve(response?.secret);
    });
  });
}

function getTOTPcode(secret) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "GET_TOTP", secret: secret }, (response) => {
      resolve(response?.totp);
    });
  });
}

function getRemainingTime(secret) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "GET_REMAINING_TIME", secret: secret }, (response) => {
      console.log(response);
      resolve(response?.remainingTime);
    });
  });
}


let updateInterval; // Variable global para el intervalo

async function updateTOTP(secret) {
  if (updateInterval) {
    clearInterval(updateInterval); // Asegura que no haya múltiples intervalos
  }

  async function refreshTOTP() {
    const totpCode = await getTOTPcode(secret);
    TOTPfield.innerHTML = totpCode;

    const remainingTime = await getRemainingTime(secret);
    remainingTimeField.innerHTML = remainingTime + "s";

    // Reinicia la función cuando el tiempo restante llegue a 0
    if (remainingTime <= 0) {
      clearInterval(updateInterval);
      updateTOTP(secret);
    }
  }

  // Llama una vez para actualizar de inmediato
  await refreshTOTP();

  // Configura el intervalo para actualizar cada segundo
  updateInterval = setInterval(refreshTOTP, 1000);
}


// Alert box
let linkAlertTimeout;
let clipboardAlertTimeout;

function showLinkAlert(message, type = "danger") {
  // Cancel any previous hiding
  clearTimeout(linkAlertTimeout);

  // Show alert with new message
  linkAlertBox.textContent = message;
  linkAlertBox.className = `alert alert-${type} mt-3`;
  linkAlertBox.classList.remove("d-none");

  // Configure timer to hide alert after 5s
  linkAlertTimeout = setTimeout(() => {
    hideLinkAlert();
  }, 5000);
}

function hideLinkAlert() {
  linkAlertBox.classList.add("d-none");
}

function showClipboardAlert(message, type = "primary") {
  // Cancel any previous hiding
  clearTimeout(clipboardAlertTimeout);

  // Show alert with new message
  clipboardAlertBox.textContent = message;
  clipboardAlertBox.className = `alert alert-${type} mt-3`;
  clipboardAlertBox.classList.remove("d-none");

  // Configure timer to hide alert after 3s
  clipboardAlertTimeout = setTimeout(() => {
    hideClipboardAlert();
  }, 3000);
}

function hideClipboardAlert() {
  clipboardAlertBox.classList.add("d-none");
}


function updateTheme(theme) {
  if (theme === "light") {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
    container.setAttribute("data-bs-theme", "light");
    themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
  } else {
    document.body.style.backgroundColor = "#212529";
    document.body.style.color = "white";
    container.setAttribute("data-bs-theme", "dark");
    themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
  }
  chrome.runtime.sendMessage({ action: "SET_THEME", theme });
}