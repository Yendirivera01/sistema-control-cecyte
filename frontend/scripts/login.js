document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const mensaje = document.getElementById("mensajeError");

    mensaje.style.display = "none";
    mensaje.textContent = "";

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });

      const data = await response.json();

      if (!data.success) {
        mensaje.textContent = data.message || "⚠️ Credenciales incorrectas.";
        mensaje.style.display = "block";
        return;
      }

      localStorage.setItem("correo", correo);
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("rol", data.rol);

      if (data.rol === "administrador") {
        window.location.href = "../pages/admin-panel.html";
      } else if (data.rol === "alumno") {
        window.location.href = "../pages/dashboard.html";
      }

    } catch (err) {
      console.error("❌ Error de conexión:", err);
      mensaje.textContent = "⚠️ No se pudo conectar al servidor.";
      mensaje.style.display = "block";
    }
  });
});