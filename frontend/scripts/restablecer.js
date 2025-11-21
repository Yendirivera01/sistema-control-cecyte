document.getElementById("restablecerForm").addEventListener("submit", async function (e) {
document.getElementById("iconoMensaje").textContent = data.success ? "✅" : "⚠️";
document.getElementById("textoMensaje").textContent = data.message;
  e.preventDefault();

  const nueva = document.getElementById("nueva").value.trim();
  const mensaje = document.getElementById("mensajeRestablecer");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const response = await fetch("http://localhost:3000/api/restablecer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, nueva })
  });

  const data = await response.json();
  mensaje.textContent = data.message;
  mensaje.style.color = data.success ? "green" : "red";
});