// options.js

document.addEventListener("DOMContentLoaded", () => {
  const secretInput = document.getElementById("secretInput");
  const saveBtn = document.getElementById("saveBtn");
  const alertBox = document.getElementById("alertBox");

  // Load existing secret (If it exists)
  chrome.runtime.sendMessage({ action: "GET_SECRET" }, (response) => {
    if (response && response.secret) {
      secretInput.value = response.secret;
    }
  });

  // Save the secret
  saveBtn.addEventListener("click", () => {
    const newSecret = secretInput.value.trim();
    if (!newSecret) {
      showAlert("Por favor, introduce una secret válida.");
      return;
    }

    // Validate Base32 format
    if (!/^[A-Z2-7]+=*$/i.test(newSecret)) {
      showAlert("La secret no parece estar en formato Base32.");
      return;
    }

    // Save in storage
    chrome.runtime.sendMessage({ action: "SET_SECRET", secret: newSecret }, (res) => {
      if (res?.status === "ok") {
        showAlert("¡Secret guardada con éxito!", "success");
      } else {
        showAlert("Error al guardar la secret.", "danger");
      }
    });
  });

  function showAlert(message, type = "danger") {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} mt-3`;
    alertBox.classList.remove("d-none");
  }
});
