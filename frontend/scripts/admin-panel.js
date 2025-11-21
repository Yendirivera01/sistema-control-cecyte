document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  document.getElementById("adminNombre").textContent = nombre;

  // Navegación dinámica
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-section");

      document.querySelectorAll(".panel-section").forEach(section => {
        section.classList.remove("active");
      });

      document.getElementById(target).classList.add("active");

      // Cargar datos específicos según la sección
      if (target === "historial") {
        cargarHistorial();
      } else if (target === "profesores") {
        cargarProfesores();
      } else if (target === "horarios") {
        cargarHorarios();
      }
    });
  });

  // Inicializar modales
  inicializarModales();
  
  // Cargar datos iniciales
  cargarProfesores();
  cargarHistorial();
});

// ========== FUNCIONALIDAD PARA PROFESORES ==========
async function cargarProfesores() {
  try {
    const res = await fetch("/api/admin/profesores");
    const data = await res.json();
    
    if (!data.success) {
      console.error("❌ Error del servidor:", data.message);
      return;
    }
    
    const grid = document.getElementById("profesoresGrid");
    grid.innerHTML = "";

    if (data.data && data.data.length > 0) {
      data.data.forEach(profesor => {
        const card = document.createElement("div");
        card.className = "profesor-card";
        card.innerHTML = `
          <h3>${profesor.nombre}</h3>
          <p class="materia">${profesor.materia}</p>
          <p class="correo">${profesor.correo}</p>
          <div class="acciones">
            <button class="btn-editar" data-id="${profesor.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-eliminar" data-id="${profesor.id}">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    // Agregar tarjeta para añadir nuevo profesor
    const addCard = document.createElement("div");
    addCard.className = "profesor-card add-card";
    addCard.id = "agregarProfesorBtn";
    addCard.innerHTML = `<span>+</span><p>Agregar Profesor</p>`;
    grid.appendChild(addCard);

    // Event listeners
    document.getElementById("agregarProfesorBtn").addEventListener("click", () => {
      abrirModalProfesor();
    });

    // Agregar event listeners a los botones
    setTimeout(() => {
      document.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          editarProfesor(btn.dataset.id);
        });
      });

      document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          eliminarProfesor(btn.dataset.id);
        });
      });
    }, 100);

  } catch (err) {
    console.error("❌ Error al cargar profesores:", err);
  }
}

// ========== HISTORIAL ==========
async function cargarHistorial() {
  try {
    const res = await fetch("/api/admin/historial");
    const data = await res.json();
    
    if (!data.success) {
      console.error("❌ Error del servidor:", data.message);
      return;
    }

    const tbody = document.getElementById("tablaHistorial");
    tbody.innerHTML = "";

    if (data.data && data.data.length > 0) {
      data.data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.correo}</td>
          <td>${row.laboratorio}</td>
          <td>${row.computadora}</td>
          <td>${row.profesor}</td>
          <td>${new Date(row.fecha).toLocaleString()}</td>
          <td>${row.salida ? new Date(row.salida).toLocaleString() : "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6">No hay registros disponibles</td>`;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("❌ Error al cargar historial:", err);
  }
}

// ========== GUARDAR PROFESOR ==========
async function guardarProfesor() {
  const id = document.getElementById("profesorId").value;
  const nombre = document.getElementById("nombreProfesor").value;
  const correo = document.getElementById("correoProfesor").value;
  const materia = document.getElementById("materiaProfesor").value;

  // Validación básica
  if (!nombre || !correo || !materia) {
    alert("Por favor, complete todos los campos");
    return;
  }

  const payload = { nombre, correo, materia };
  const url = id
    ? `/api/admin/profesores/${id}`
    : "/api/admin/profesores";

  const method = id ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById("modalProfesor").style.display = "none";
      cargarProfesores();
      alert(data.message || "Profesor guardado correctamente");
    } else {
      alert("Error al guardar el profesor: " + (data.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("❌ Error al guardar profesor:", err);
    alert("No se pudo guardar el profesor");
  }
}

function abrirModalProfesor(profesor = null) {
  const modal = document.getElementById("modalProfesor");
  const titulo = document.getElementById("modalTitulo");
  
  titulo.textContent = profesor ? "Editar Profesor" : "Agregar Profesor";
  document.getElementById("profesorId").value = profesor?.id || "";
  document.getElementById("nombreProfesor").value = profesor?.nombre || "";
  document.getElementById("correoProfesor").value = profesor?.correo || "";
  document.getElementById("materiaProfesor").value = profesor?.materia || "";
  
  modal.style.display = "flex";
}

async function editarProfesor(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/admin/profesores/${id}`);
    const data = await res.json();
    if (data.success) {
      abrirModalProfesor(data.data);
    }
  } catch (err) {
    console.error("❌ Error al cargar datos del profesor:", err);
  }
}

async function eliminarProfesor(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este profesor?")) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/admin/profesores/${id}`, { 
      method: "DELETE" 
    });
    const data = await response.json();
    
    if (data.success) {
      cargarProfesores();
    } else {
      alert("Error al eliminar el profesor");
    }
  } catch (err) {
    console.error("❌ Error al eliminar profesor:", err);
    alert("No se pudo eliminar el profesor");
  }
}

// ========== FUNCIONALIDAD PARA HORARIOS ==========

async function cargarHorarios() {
  try {
    // Aquí deberías hacer la llamada a tu API para obtener los horarios
    const grid = document.getElementById("horariosGrid");
    grid.innerHTML = "";

    // Ejemplo de horarios (deberías reemplazar esto con tu API)
    const horariosEjemplo = [
      { id: 1, laboratorio: "Lab 1", dia: "Lunes", horaInicio: "08:00", horaFin: "10:00", profesor: "Prof. Martínez", grupo: "6A" },
      { id: 2, laboratorio: "Lab 3", dia: "Miércoles", horaInicio: "10:00", horaFin: "12:00", profesor: "Prof. Madrigal", grupo: "5B" }
    ];

    horariosEjemplo.forEach(horario => {
      const card = document.createElement("div");
      card.className = "horario-card";
      card.innerHTML = `
        <h3>${horario.laboratorio}</h3>
        <div class="horario-info">
          <p><strong>${horario.dia}</strong></p>
          <p>${horario.horaInicio} - ${horario.horaFin}</p>
          <p>${horario.profesor}</p>
          <p>Grupo: ${horario.grupo}</p>
        </div>
        <div class="acciones">
          <button class="btn-editar" data-id="${horario.id}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-eliminar" data-id="${horario.id}">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Agregar tarjeta para añadir nuevo horario
    const addCard = document.createElement("div");
    addCard.className = "horario-card add-card";
    addCard.id = "agregarHorarioBtn";
    addCard.innerHTML = `<span>+</span><p>Agregar Horario</p>`;
    grid.appendChild(addCard);

    // Event listener para agregar horario
    document.getElementById("agregarHorarioBtn").addEventListener("click", () => {
      abrirModalHorario();
    });

    // Agregar event listeners a los botones de editar y eliminar
    setTimeout(() => {
      document.querySelectorAll(".horario-card .btn-editar").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          // Aquí iría la función para editar horario
          alert('Editar horario ' + btn.dataset.id);
        });
      });

      document.querySelectorAll(".horario-card .btn-eliminar").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          // Aquí iría la función para eliminar horario
          if (confirm("¿Estás seguro de que deseas eliminar este horario?")) {
            alert('Eliminar horario ' + btn.dataset.id);
          }
        });
      });
    }, 100);

  } catch (err) {
    console.error("❌ Error al cargar horarios:", err);
  }
}

function abrirModalHorario(horario = null) {
  const modal = document.getElementById("modalHorario");
  const titulo = document.getElementById("modalTituloHorario");
  
  titulo.textContent = horario ? "Editar Horario" : "Agregar Horario";
  document.getElementById("horarioId").value = horario?.id || "";
  document.getElementById("laboratorioHorario").value = horario?.laboratorio || "";
  document.getElementById("diaSemana").value = horario?.dia || "";
  document.getElementById("horaInicio").value = horario?.horaInicio || "";
  document.getElementById("horaFin").value = horario?.horaFin || "";
  document.getElementById("grupoHorario").value = horario?.grupo || "";
  
  // Cargar lista de profesores en el select
  cargarProfesoresEnSelect();
  
  modal.style.display = "flex";
}

async function cargarProfesoresEnSelect() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/profesores");
    const data = await res.json();
    const select = document.getElementById("profesorHorario");
    select.innerHTML = '<option value="">Seleccionar profesor</option>';
    
    if (data.success && data.data) {
      data.data.forEach(profesor => {
        const option = document.createElement("option");
        option.value = profesor.id;
        option.textContent = profesor.nombre;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error("❌ Error al cargar profesores para select:", err);
  }
}

// ========== INICIALIZACIÓN DE MODALES ==========

function inicializarModales() {
  // Modal de profesores
  const modalProfesor = document.getElementById("modalProfesor");
  const closeProfesor = modalProfesor.querySelector(".close");
  const cancelarProfesor = document.getElementById("cancelarProfesor");

  closeProfesor.onclick = () => modalProfesor.style.display = "none";
  if (cancelarProfesor) {
    cancelarProfesor.onclick = () => modalProfesor.style.display = "none";
  }

  // Modal de horarios
  const modalHorario = document.getElementById("modalHorario");
  const closeHorario = modalHorario.querySelector(".close");
  const cancelarHorario = document.getElementById("cancelarHorario");

  closeHorario.onclick = () => modalHorario.style.display = "none";
  if (cancelarHorario) {
    cancelarHorario.onclick = () => modalHorario.style.display = "none";
  }

  // Cerrar modal al hacer clic fuera
  window.onclick = (event) => {
    if (event.target === modalProfesor) {
      modalProfesor.style.display = "none";
    }
    if (event.target === modalHorario) {
      modalHorario.style.display = "none";
    }
  };

  // Formulario de profesores
  document.getElementById("formProfesor").addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarProfesor();
  });

  // Formulario de horarios
  document.getElementById("formHorario").addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarHorario();
  });

  // Event listener para el botón de agregar horario en el HTML original
  const agregarHorarioOriginal = document.getElementById("agregarHorario");
  if (agregarHorarioOriginal) {
    agregarHorarioOriginal.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalHorario();
    });
  }

  // Event listener para el botón de agregar profesor en el HTML original
  const agregarProfesorOriginal = document.getElementById("agregarProfesor");
  if (agregarProfesorOriginal) {
    agregarProfesorOriginal.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModalProfesor();
    });
  }
}

async function guardarProfesor() {
  const id = document.getElementById("profesorId").value;
  const nombre = document.getElementById("nombreProfesor").value;
  const correo = document.getElementById("correoProfesor").value;
  const materia = document.getElementById("materiaProfesor").value;

  // Validación básica
  if (!nombre || !correo || !materia) {
    alert("Por favor, complete todos los campos");
    return;
  }

  const payload = { nombre, correo, materia };
  const url = id
    ? `http://localhost:3000/api/admin/profesores/${id}`
    : "http://localhost:3000/api/admin/profesores";

  const method = id ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById("modalProfesor").style.display = "none";
      cargarProfesores();
      alert("Profesor guardado correctamente");
    } else {
      alert("Error al guardar el profesor: " + (data.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("❌ Error al guardar profesor:", err);
    alert("No se pudo guardar el profesor");
  }
}

async function guardarHorario() {
  const id = document.getElementById("horarioId").value;
  const laboratorio = document.getElementById("laboratorioHorario").value;
  const dia = document.getElementById("diaSemana").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFin = document.getElementById("horaFin").value;
  const profesorId = document.getElementById("profesorHorario").value;
  const grupo = document.getElementById("grupoHorario").value;

  // Validación básica
  if (!laboratorio || !dia || !horaInicio || !horaFin || !profesorId || !grupo) {
    alert("Por favor, complete todos los campos");
    return;
  }

  const payload = { 
    laboratorio, 
    dia, 
    horaInicio, 
    horaFin, 
    profesorId, 
    grupo 
  };

  // Aquí deberías implementar la llamada a tu API para guardar horarios
  console.log("Guardando horario:", payload);
  
  // Simulación de guardado
  try {
    // Reemplaza esto con tu llamada real a la API
    // const response = await fetch('http://localhost:3000/api/admin/horarios', {
    //   method: id ? 'PUT' : 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    
    // Simulamos un éxito
    document.getElementById("modalHorario").style.display = "none";
    cargarHorarios();
    alert("Horario guardado correctamente");
  } catch (err) {
    console.error("❌ Error al guardar horario:", err);
    alert("No se pudo guardar el horario");
  }
}

// ========== HISTORIAL ==========

async function cargarHistorial() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/historial");
    const data = await res.json();

    const tbody = document.getElementById("tablaHistorial");
    tbody.innerHTML = "";

    if (data.success && data.data.length > 0) {
      data.data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.correo}</td>
          <td>${row.laboratorio}</td>
          <td>${row.computadora}</td>
          <td>${row.profesor}</td>
          <td>${new Date(row.fecha).toLocaleString()}</td>
          <td>${row.salida ? new Date(row.salida).toLocaleString() : "-"}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6">No hay registros disponibles</td>`;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("❌ Error al cargar historial:", err);
  }
}

// Exportar a Excel
document.getElementById("exportExcel").addEventListener("click", () => {
  const rows = Array.from(document.querySelectorAll("#tablaHistorial tr"));
  const data = rows.map(row => {
    return Array.from(row.children).map(cell => cell.textContent);
  });

  const ws = XLSX.utils.aoa_to_sheet([["Alumno", "Laboratorio", "Computadora", "Profesor", "Hora inicio", "Hora salida"], ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historial");

  XLSX.writeFile(wb, "historial_cecyte.xlsx");
});

// Exportar a PDF
document.getElementById("exportPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const rows = Array.from(document.querySelectorAll("#tablaHistorial tr")).map(row =>
    Array.from(row.children).map(cell => cell.textContent)
  );

  doc.text("Historial de uso de computadoras - CECYTE", 14, 20);
  doc.autoTable({
    startY: 30,
    head: [["Alumno", "Laboratorio", "Computadora", "Profesor", "Hora inicio", "Hora salida"]],
    body: rows,
    theme: "grid"
  });

  doc.save("historial_cecyte.pdf");
});

// Cerrar sesión admin
document.getElementById("cerrarSesionAdmin").addEventListener("click", async function (e) {
  e.preventDefault();

  const correoAdmin = localStorage.getItem("correoAdmin");
  if (!correoAdmin) {
    alert("No se encontró la sesión del administrador.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/admin/cerrar-sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correoAdmin })
    });

    const data = await response.json();

    if (data.success) {
      alert("Sesión cerrada correctamente.");
      localStorage.removeItem("correoAdmin");
      localStorage.removeItem("nombre");
      window.location.href = "../pages/login-admin.html";
    } else {
      alert("Error al cerrar sesión.");
    }
  } catch (err) {
    console.error("❌ Error al cerrar sesión:", err);
    alert("No se pudo cerrar la sesión.");
  }
});

// Filtro de historial
document.getElementById("filtrar").addEventListener("click", () => {
  cargarHistorial();
});