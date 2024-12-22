// contentScript.js

(async function() {
  // 1. Locate input textbox and accept button
  const codeInput = document.querySelector("#input2factor");
  const loginButton = document.querySelector("#notification_2factor_button_ok");

  if (!codeInput || !loginButton) {
    return;
  }

  try {
    // 2. Detect error message "Incorrect OTP code" and stop if visible to avoid infinite loops
    const errorBox = document.querySelector("#otp_authn_wrong_code");

    if (errorBox) {
      const errorParent = errorBox.closest(".ui-state-error");
      if (errorParent) {
        // If it's not "display: none", then it's visible
        const isHidden = errorParent.style.display === "none";
        if (!isHidden) {
          console.log("Se detecta un error visible. No se rellena el código TOTP de nuevo.");
          return;
        }
      }
    }

    // 3. Obtain the secret from background
    const secret = await getStoredSecret();
    if (!secret) {
      console.log("No hay ninguna secret guardada en la extensión.");
      return;
    }

    // 4. Check if the input is already filled
    if (codeInput.value.trim()) {
      console.log("El campo input2factor ya tiene contenido, no generamos un nuevo TOTP.");
      return;
    }

    // 5. Generate TOTP code
    const totpCode = window.otplib.authenticator.generate(secret);

    // 6. Fill the input and click the accept button
    codeInput.value = totpCode;
    loginButton.click();
    console.log("2FA autocompletado y botón pulsado automáticamente.");
  } catch (err) {
    console.error("Error al autocompletar 2FA:", err);
  }
})();

// ---------------------------------------
// Aux function to get the secret
// ---------------------------------------
function getStoredSecret() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "GET_SECRET" }, (response) => {
      resolve(response?.secret || null);
    });
  });
}
