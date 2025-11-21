fetch("http://localhost:3000/api/selecciones")
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const lista = document.getElementById("lista");

      data.data.forEach(registro => {
        const inicio = new Date(registro.fecha);
        const salida = registro.salida ? new Date(registro.salida) : null;
        let duracion = "Sesión activa";

        if (salida) {
          const ms = salida - inicio;
          const horas = Math.floor(ms / 3600000);
          const minutos = Math.floor((ms % 3600000) / 60000);
          const segundos = Math.floor((ms % 60000) / 1000);
          duracion = `${horas}h ${minutos}m ${segundos}s`;
        }

        const div = document.createElement("div");
        div.className = "registro";
        div.innerHTML = `
          <strong>Correo:</strong> ${registro.correo}<br>
          <strong>Computadora:</strong> ${registro.computadora}<br>
          <strong>Laboratorio:</strong> ${registro.laboratorio}<br>
          <strong>Profesor:</strong> ${registro.profesor}<br>
          <strong>Inicio:</strong> ${inicio.toLocaleString()}<br>
          <strong>Salida:</strong> ${salida ? salida.toLocaleString() : "Sesión activa"}<br>
          <strong>Duración:</strong> ${duracion}
        `;
        lista.appendChild(div);
      });
    } else {
      alert("Error al cargar la lista.");
    }
  })
  .catch(err => {
    console.error("Error:", err);
    alert("No se pudo conectar al servidor.");
  });