let temporizadorActivo = false;
let segundos = 0;
let temporizador;

window.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  const nombreElemento = document.getElementById("nombreAlumno");

  if (nombre) {
    nombreElemento.textContent = `Alumno: ${nombre}`;
  } else {
    nombreElemento.textContent = "Nombre no disponible";
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const correo = localStorage.getItem("correo");
  const recordar = localStorage.getItem("recordarSesion");

  if (!correo && !recordar) {
    window.location.href = "../pages/login.html";
  }

  // Mostrar nombre si lo tienes guardado
  const nombreElemento = document.getElementById("nombreAlumno");
  if (correo) {
    const nombre = correo.split("@")[0];
    nombreElemento.textContent = `Alumno: ${nombre}`;
  }
});

// 🛑 Validar input de computadora
  document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("Computadora");
  const error = document.getElementById("errorComputadora");

  input.addEventListener("input", () => {
    const valor = input.value.trim();

    if (!/^\d+$/.test(valor)) {
      input.classList.add("error");
      error.textContent = "Solo se permiten números";
      error.style.display = "block";
    } else {
      input.classList.remove("error");
      error.textContent = "";
      error.style.display = "none";
    }
  });
});



// ⏱️ Iniciar temporizador
function iniciarTemporizador() {
  temporizadorActivo = true;
  temporizador = setInterval(() => {
    segundos++;
    const h = String(Math.floor(segundos / 3600)).padStart(2, "0");
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
    const s = String(segundos % 60).padStart(2, "0");
    document.getElementById("temporizador").textContent = `Tiempo activo: ${h}:${m}:${s}`;
  }, 1000);
}

// 🧠 Guardar selección
document.getElementById("registroForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const correo = localStorage.getItem("correo"); // asumimos que se guardó en login
  const computadora = document.getElementById("Computadora").value.trim();
  const laboratorio = document.getElementById("laboratorio").value;
  const profesor = document.getElementById("profesor").value;
  const error = document.getElementById("errorComputadora");

  if (!/^\d+$/.test(computadora)) {
    document.getElementById("Computadora").classList.add("error");
    error.textContent = "Solo se permiten números";
    error.style.display = "block";
    return; // ⛔ Detener envío
  }

  if (!correo || !computadora || !laboratorio || !profesor) {
    alert("Completa todos los campos.");
    return;
  }

  const response = await fetch("http://localhost:3000/api/seleccion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, computadora, laboratorio, profesor })
  });

  const data = await response.json();

  if (data.success) {
    alert("✅ Selección guardada correctamente.");
    if (!temporizadorActivo) {
      iniciarTemporizador();
    }
  } else {
    alert("Error al guardar selección.");
  }
});

// 📋 Ver lista
document.querySelector(".ver-lista").addEventListener("click", function () {
  window.location.href = "../pages/lista.html";
});

// 🔒 Cerrar sesión
document.querySelector(".cerrar-sesion").addEventListener("click", async function () {
  const correo = localStorage.getItem("correo");
  if (!correo) {
    alert("No se encontró el correo del alumno.");
    return;
  }

  clearInterval(temporizador);
  temporizadorActivo = false;

  const response = await fetch("http://localhost:3000/api/cerrar-sesion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo })
  });

  const data = await response.json();

  if (data.success) {
    alert("Sesión cerrada. Tiempo registrado.");
    localStorage.removeItem("correo");
    window.location.href = "../pages/login.html";
  } else {
    alert("Error al cerrar sesión.");
  }
});


