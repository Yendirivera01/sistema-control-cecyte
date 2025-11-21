document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recuperarForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("correoRecuperar").value.trim();
    const mensaje = document.getElementById("mensajeRecuperar");

    if (!correo.endsWith("@cecyteqroo.edu.mx")) {
      mensaje.textContent = "⚠️ Solo se permite correo institucional.";
      mensaje.className = "mensaje-recuperar error";
      mensaje.style.display = "block";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      });

      const data = await response.json();

      mensaje.textContent = (data.success ? "✅ " : "⚠️ ") + data.message;
      mensaje.className = "mensaje-recuperar " + (data.success ? "exito" : "error");
      mensaje.style.display = "block";
    } catch (error) {
      mensaje.textContent = "❌ Error al conectar con el servidor.";
      mensaje.className = "mensaje-recuperar error";
      mensaje.style.display = "block";
    }
  });
});