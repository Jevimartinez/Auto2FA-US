// options.js

const secretInput = document.getElementById("secretInput");
const saveBtn = document.getElementById("saveBtn");
const linkAlertBox = document.getElementById("linkAlertBox");
const configAlertBox = document.getElementById("configAlertBox");
const toggleSecret = document.getElementById("toggleSecret");
const eyeIcon = toggleSecret.querySelector("i");
const autofillToggle = document.getElementById("autofillToggle");
const themeToggle = document.getElementById("themeToggle");
const container = document.querySelector(".container");
const tutorialText = document.getElementById("tutorialText");

document.addEventListener("DOMContentLoaded", () => {
    // Load existing secret (If it exists)
    chrome.runtime.sendMessage({ action: "GET_SECRET" }, (response) => {
        if (!response.secret) {
            tutorialText.classList.remove("d-none");
        }
        if (response && response.secret) {
            secretInput.value = response.secret;
        }
    });

    // Load existing autofill config
    chrome.runtime.sendMessage({ action: "GET_AUTOFILL" }, (response) => {
        if (response && response.autofill !== null) {
            autofillToggle.checked = response.autofill;
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
            } else {
                showLinkAlert("Error al guardar el secret.", "danger");
            }
        });
    });

    // Toggle autofill
    autofillToggle.addEventListener("click", () => {
        const checked = autofillToggle.checked;
        chrome.runtime.sendMessage({ action: "SET_AUTOFILL", autofill: checked }, (res) => {
            if (res?.status === "ok") {
                showConfigAlert(`Autofill ${checked ? "activado" : "desactivado"} con éxito!`, "success");
            } else {
                console.error(res);
                showConfigAlert("Error al guardar la configuración.", "danger");
            }
        });
    });

    // Toggle theme
    themeToggle.addEventListener("click", () => {
        const newTheme = container.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
        updateTheme(newTheme);
    });

});

function getSecret() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "GET_SECRET" }, (response) => {
            resolve(response?.secret);
        });
    });
}

let linkAlertTimeout;
let configAlertTimeout;

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

function showConfigAlert(message, type = "danger") {
    // Cancel any previous hiding
    clearTimeout(configAlertTimeout);

    // Show alert with new message
    configAlertBox.textContent = message;
    configAlertBox.className = `alert alert-${type} mt-3`;
    configAlertBox.classList.remove("d-none");

    // Configure timer to hide alert after 5s
    configAlertTimeout = setTimeout(() => {
        hideConfigAlert();
    }, 5000);
}

function hideConfigAlert() {
    configAlertBox.classList.add("d-none");
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