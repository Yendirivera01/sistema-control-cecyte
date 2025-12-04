const express = require("express");
const router = express.Router();
const db = require("../database/db");

// ========== MIDDLEWARE DE LOGS ==========
router.use((req, res, next) => {
  console.log(`📦 [ADMIN API] ${req.method} ${req.originalUrl}`);
  next();
});

// ========== RUTA DE PRUEBA ==========
router.get("/admin/test", (req, res) => {
  console.log("🧪 Probando ruta de administración...");
  res.json({
    success: true,
    message: "Rutas de administración funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

// ========== ESTADÍSTICAS ==========
router.get("/admin/estadisticas", (req, res) => {
  console.log("📊 Obteniendo estadísticas...");

  const estadisticas = {
    sesionesActivas: 0,
    horasTotales: 0,
    computadorasActivas: 0
  };

  db.query("SELECT COUNT(*) AS total FROM selecciones WHERE salida IS NULL", (err, r1) => {
    if (err) {
      console.error("❌ Error al obtener sesiones activas:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    estadisticas.sesionesActivas = r1[0].total;
    console.log(`✅ Sesiones activas: ${estadisticas.sesionesActivas}`);

    db.query("SELECT SUM(TIMESTAMPDIFF(MINUTE, fecha, salida)) AS minutos FROM selecciones WHERE salida IS NOT NULL", (err, r2) => {
      if (err) {
        console.error("❌ Error al calcular horas totales:", err);
        return res.status(500).json({ success: false, message: "Error del servidor" });
      }

      estadisticas.horasTotales = Math.floor((r2[0].minutos || 0) / 60);
      console.log(`✅ Horas totales: ${estadisticas.horasTotales}`);

      db.query("SELECT COUNT(DISTINCT computadora) AS activas FROM selecciones WHERE salida IS NULL", (err, r3) => {
        if (err) {
          console.error("❌ Error al obtener computadoras activas:", err);
          return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        estadisticas.computadorasActivas = r3[0].activas;
        console.log(`✅ Computadoras activas: ${estadisticas.computadorasActivas}`);

        res.json({ success: true, data: estadisticas });
      });
    });
  });
});

// ========== HISTORIAL ==========
router.get("/admin/historial", (req, res) => {
  console.log("📋 Obteniendo historial...");

  db.query("SELECT * FROM selecciones ORDER BY fecha DESC", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener historial:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    console.log(`✅ Historial obtenido: ${results.length} registros`);
    res.json({ success: true, data: results });
  });
});

// ========== PROFESORES ==========

// Obtener todos los profesores
router.get("/admin/profesores", (req, res) => {
  console.log("👨‍🏫 Obteniendo lista de profesores...");

  db.query("SELECT * FROM profesores ORDER BY nombre ASC", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener profesores:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    console.log(`✅ Profesores obtenidos: ${results.length} registros`);
    res.json({ success: true, data: results });
  });
});

// Obtener un profesor por ID
router.get("/admin/profesores/:id", (req, res) => {
  const { id } = req.params;
  console.log(`👨‍🏫 Obteniendo profesor ID: ${id}`);

  db.query("SELECT * FROM profesores WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length === 0) {
      console.log(`❌ Profesor no encontrado: ${id}`);
      return res.status(404).json({ success: false, message: "Profesor no encontrado" });
    }

    console.log(`✅ Profesor encontrado: ${results[0].nombre}`);
    res.json({ success: true, data: results[0] });
  });
});

// Crear profesor
router.post("/admin/profesores", (req, res) => {
  const { nombre, correo, materia } = req.body;
  console.log(`👨‍🏫 Creando profesor: ${nombre}, ${correo}, ${materia}`);

  // Validar campos requeridos
  if (!nombre || !correo || !materia) {
    console.log("❌ Campos requeridos faltantes");
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos: nombre, correo y materia"
    });
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    console.log("❌ Formato de correo inválido");
    return res.status(400).json({
      success: false,
      message: "El formato del correo electrónico no es válido"
    });
  }

  // Verificar si el correo ya existe
  db.query("SELECT id FROM profesores WHERE correo = ?", [correo], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar correo:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length > 0) {
      console.log(`❌ Correo duplicado: ${correo}`);
      return res.status(400).json({
        success: false,
        message: "Ya existe un profesor con este correo electrónico"
      });
    }

    // Crear el profesor
    db.query("INSERT INTO profesores (nombre, correo, materia) VALUES (?, ?, ?)",
      [nombre, correo, materia],
      (err, result) => {
        if (err) {
          console.error("❌ Error al crear profesor:", err);
          return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        console.log(`✅ Profesor creado exitosamente. ID: ${result.insertId}`);
        res.json({
          success: true,
          data: {
            id: result.insertId,
            nombre,
            correo,
            materia
          },
          message: "Profesor creado exitosamente"
        });
      }
    );
  });
});

// Editar profesor
router.put("/admin/profesores/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, correo, materia } = req.body;
  console.log(`👨‍🏫 Actualizando profesor ID: ${id}`);

  // Validar campos requeridos
  if (!nombre || !correo || !materia) {
    console.log("❌ Campos requeridos faltantes");
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos: nombre, correo y materia"
    });
  }

  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    console.log("❌ Formato de correo inválido");
    return res.status(400).json({
      success: false,
      message: "El formato del correo electrónico no es válido"
    });
  }

  // Verificar si el correo ya existe en otro profesor
  db.query("SELECT id FROM profesores WHERE correo = ? AND id != ?", [correo, id], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar correo:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length > 0) {
      console.log(`❌ Correo duplicado: ${correo}`);
      return res.status(400).json({
        success: false,
        message: "Ya existe otro profesor con este correo electrónico"
      });
    }

    // Actualizar el profesor
    db.query("UPDATE profesores SET nombre = ?, correo = ?, materia = ? WHERE id = ?",
      [nombre, correo, materia, id],
      (err, result) => {
        if (err) {
          console.error("❌ Error al actualizar profesor:", err);
          return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        if (result.affectedRows === 0) {
          console.log(`❌ Profesor no encontrado para actualizar: ${id}`);
          return res.status(404).json({
            success: false,
            message: "Profesor no encontrado"
          });
        }

        console.log(`✅ Profesor actualizado exitosamente: ${id}`);
        res.json({
          success: true,
          message: "Profesor actualizado exitosamente"
        });
      }
    );
  });
});

// Eliminar profesor
router.delete("/admin/profesores/:id", (req, res) => {
  const { id } = req.params;
  console.log(`👨‍🏫 Eliminando profesor ID: ${id}`);

  db.query("DELETE FROM profesores WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (result.affectedRows === 0) {
      console.log(`❌ Profesor no encontrado para eliminar: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Profesor no encontrado"
      });
    }

    console.log(`✅ Profesor eliminado exitosamente: ${id}`);
    res.json({
      success: true,
      message: "Profesor eliminado exitosamente"
    });
  });
});

// ========== HORARIOS ==========

// Obtener todos los horarios
router.get("/admin/horarios", (req, res) => {
  console.log("🕐 Obteniendo lista de horarios...");

  db.query("SELECT * FROM horarios ORDER BY dia, horaInicio ASC", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener horarios:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    console.log(`✅ Horarios obtenidos: ${results.length} registros`);
    res.json({ success: true, data: results });
  });
});

// Obtener un horario por ID
router.get("/admin/horarios/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🕐 Obteniendo horario ID: ${id}`);

  db.query("SELECT * FROM horarios WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener horario:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length === 0) {
      console.log(`❌ Horario no encontrado: ${id}`);
      return res.status(404).json({ success: false, message: "Horario no encontrado" });
    }

    console.log(`✅ Horario encontrado: ${results[0].laboratorio}`);
    res.json({ success: true, data: results[0] });
  });
});

// Crear horario
router.post("/admin/horarios", (req, res) => {
  const { laboratorio, dia, horaInicio, horaFin, profesorId, grupo } = req.body;
  console.log(`🕐 Creando horario: ${laboratorio}, ${dia}, ${horaInicio}-${horaFin}`);

  // Validar campos requeridos
  if (!laboratorio || !dia || !horaInicio || !horaFin || !profesorId) {
    console.log("❌ Campos requeridos faltantes");
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos: laboratorio, dia, horaInicio, horaFin y profesorId"
    });
  }

  // Validar que horaInicio sea antes de horaFin
  if (horaInicio >= horaFin) {
    console.log("❌ Hora de inicio debe ser antes de hora de fin");
    return res.status(400).json({
      success: false,
      message: "La hora de inicio debe ser anterior a la hora de fin"
    });
  }

  // Verificar que el profesor existe
  db.query("SELECT id FROM profesores WHERE id = ?", [profesorId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length === 0) {
      console.log(`❌ Profesor no encontrado: ${profesorId}`);
      return res.status(400).json({
        success: false,
        message: "El profesor especificado no existe"
      });
    }

    // Crear el horario
    db.query(
      "INSERT INTO horarios (laboratorio, dia, horaInicio, horaFin, profesorId, grupo) VALUES (?, ?, ?, ?, ?, ?)",
      [laboratorio, dia, horaInicio, horaFin, profesorId, grupo || null],
      (err, result) => {
        if (err) {
          console.error("❌ Error al crear horario:", err);
          return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        console.log(`✅ Horario creado exitosamente. ID: ${result.insertId}`);
        res.json({
          success: true,
          data: {
            id: result.insertId,
            laboratorio,
            dia,
            horaInicio,
            horaFin,
            profesorId,
            grupo: grupo || null
          },
          message: "Horario creado exitosamente"
        });
      }
    );
  });
});

// Editar horario
router.put("/admin/horarios/:id", (req, res) => {
  const { id } = req.params;
  const { laboratorio, dia, horaInicio, horaFin, profesorId, grupo } = req.body;
  console.log(`🕐 Actualizando horario ID: ${id}`);

  // Validar campos requeridos
  if (!laboratorio || !dia || !horaInicio || !horaFin || !profesorId) {
    console.log("❌ Campos requeridos faltantes");
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos: laboratorio, dia, horaInicio, horaFin y profesorId"
    });
  }

  // Validar que horaInicio sea antes de horaFin
  if (horaInicio >= horaFin) {
    console.log("❌ Hora de inicio debe ser antes de hora de fin");
    return res.status(400).json({
      success: false,
      message: "La hora de inicio debe ser anterior a la hora de fin"
    });
  }

  // Verificar que el profesor existe
  db.query("SELECT id FROM profesores WHERE id = ?", [profesorId], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (results.length === 0) {
      console.log(`❌ Profesor no encontrado: ${profesorId}`);
      return res.status(400).json({
        success: false,
        message: "El profesor especificado no existe"
      });
    }

    // Actualizar el horario
    db.query(
      "UPDATE horarios SET laboratorio = ?, dia = ?, horaInicio = ?, horaFin = ?, profesorId = ?, grupo = ? WHERE id = ?",
      [laboratorio, dia, horaInicio, horaFin, profesorId, grupo || null, id],
      (err, result) => {
        if (err) {
          console.error("❌ Error al actualizar horario:", err);
          return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        if (result.affectedRows === 0) {
          console.log(`❌ Horario no encontrado para actualizar: ${id}`);
          return res.status(404).json({
            success: false,
            message: "Horario no encontrado"
          });
        }

        console.log(`✅ Horario actualizado exitosamente: ${id}`);
        res.json({
          success: true,
          message: "Horario actualizado exitosamente"
        });
      }
    );
  });
});

// Eliminar horario
router.delete("/admin/horarios/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🕐 Eliminando horario ID: ${id}`);

  db.query("DELETE FROM horarios WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar horario:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    if (result.affectedRows === 0) {
      console.log(`❌ Horario no encontrado para eliminar: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Horario no encontrado"
      });
    }

    console.log(`✅ Horario eliminado exitosamente: ${id}`);
    res.json({
      success: true,
      message: "Horario eliminado exitosamente"
    });
  });
});

// ========== CERRAR SESIÓN ==========
router.post("/admin/cerrar-sesion", (req, res) => {
  const { correo } = req.body;
  console.log(`🔒 Cerrando sesión de administrador: ${correo}`);

  if (!correo) {
    console.log("❌ Correo requerido para cerrar sesión");
    return res.status(400).json({
      success: false,
      message: "Correo es requerido"
    });
  }

  console.log(`✅ Sesión cerrada para: ${correo}`);
  res.json({
    success: true,
    message: "Sesión cerrada exitosamente"
  });
});

module.exports = router;