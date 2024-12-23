# Auto2FA-US

**Auto2FA-US** es una extensión para Google Chrome que autocompleta el segundo factor de autenticación (TOTP) en la página de login multifactor de la Universidad de Sevilla, evitando tener que teclear el código manualmente cada vez.

## Características

- **Genera automáticamente** el código TOTP (sha1, 6 dígitos, 30s).
- **Detecta** y **Rellena** automáticamente el campo de 2FA en la página de login de la US.
- **Hace clic** en el botón de `Aceptar`, enviando el formulario.
- **Almacena** el secret en `chrome.storage.local` para que no tengas que introducirlo de nuevo en el futuro.

## Instalación de la Extensión

### Opción 1: (Fácil) Instalación desde la Chrome Web Store

1. Visita [la página de Auto2FA-US en la Chrome Web Store](https://chromewebstore.google.com/detail/auto2fa-us/idjolbpjljhggpdpaabghlneamejpfff).
2. Haz clic en **"Añadir a Chrome"**.
3. Confirma la instalación cuando te lo solicite Chrome.
4. La extensión aparecerá instalada automáticamente en tu navegador.

### Opción 2: (Complicada) Instalación manual en modo desarrollador

1. **Clonar** este repositorio o descargar los archivos en tu equipo.
2. Ve a `chrome://extensions` en Google Chrome.
3. Activa el **"Developer mode"** (modo desarrollador).
4. Haz clic en **"Load unpacked"** y selecciona la carpeta del proyecto.
5. La extensión aparecerá listada con el nombre **Auto2FA-US**.

## Configuración del Secret

Para que la extensión pueda generar tu TOTP, necesita el **secret (en Base32)** asociado a tu usuario de la Universidad de Sevilla.

1. **Obtener el secret desde [2FA.US.ES](https://2fa.us.es/)**
   - Inicia sesión y ve a la sección **"Gestionar"**.
   - Pulsa en **"Añadir nuevo dispositivo"**.
   - Localiza y pulsa la opción para **"Mostrar"**, y luego, **"Mostrar parámetros de configuración"**.  
   - Verás tu **secret en Base32** (junto con un QR).  
   - **Copia** el secret.

2. **Introducir el secret en la extensión**
   - En Chrome, haz **clic derecho** sobre el icono de la extensión **Auto2FA-US**.
   - Selecciona **"Options"** (Opciones).
   - En la página que se abre, pega tu **secret** en el campo de texto y pulsa **"Guardar"**.

## Funcionamiento

1. Cuando accedas a la **página de login** multifactor de la US, la extensión:
   - **Detectará** si existe el campo `#input2factor`.
   - **Generará** el código TOTP con la librería [otplib](https://github.com/yeojz/otplib).
   - **Rellenará** el campo y **hará clic** automáticamente en el botón de `Aceptar`.

2. Si el código es correcto, continuarás con el login normalmente.  
3. Si el código es rechazado, la extensión **no** reintentará indefinidamente (evitando bucles).

## Riesgos y Advertencias

1. **Auto2FA y la seguridad**  
   - Con **Auto2FA-US**, tu **doble factor** se vuelve más automático.  
   - Esto **reduce** la seguridad inherente al 2FA (pues no necesitas tu móvil o app externa para generar el código).  
   - Si alguien obtiene acceso a tu sesión de Chrome o a tu ordenador, podrá autenticarse sin necesitar tu móvil.

2. **Almacenamiento del secret**  
   - El secret se guarda en **`chrome.storage.local`**.  
   - Cualquiera con acceso a tu perfil de Chrome (en el mismo equipo) podría extraer el secret.  
   - Se recomienda **no** usar esta extensión en equipos públicos o no confiables.

**Auto2FA-US** es una herramienta práctica para agilizar el login multifactor en la US, pero conlleva la responsabilidad de mantener tu navegador y tu equipo **bien protegidos**, pues el segundo factor ya no requerirá intervención manual.

---
**Licencia**: [MIT](./LICENSE)
