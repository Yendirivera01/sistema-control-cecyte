const express = require("express");
const router = express.Router();
const db = require("../database/db");

// ========== PROFESORES ==========

// Obtener todos los profesores
router.get("/admin/profesores", (req, res) => {
  console.log("📡 GET /admin/profesores");
  db.query("SELECT * FROM profesores ORDER BY nombre ASC", (err, results) => {
    if (err) {
      console.error("❌ Error en profesores:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    console.log(`✅ ${results.length} profesores encontrados`);
    res.json({ success: true, data: results });
  });
});

// Obtener un profesor
router.get("/admin/profesores/:id", (req, res) => {
  console.log(`📡 GET /admin/profesores/${req.params.id}`);
  db.query("SELECT * FROM profesores WHERE id = ?", [req.params.id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Profesor no encontrado" });
    }
    res.json({ success: true, data: results[0] });
  });
});

// Crear profesor
router.post("/admin/profesores", (req, res) => {
  console.log("📡 POST /admin/profesores", req.body);
  const { nombre, correo, materia } = req.body;
  
  if (!nombre || !correo || !materia) {
    return res.status(400).json({ success: false, message: "Todos los campos son requeridos" });
  }
  
  db.query("INSERT INTO profesores (nombre, correo, materia) VALUES (?, ?, ?)", [nombre, correo, materia], (err, result) => {
    if (err) {
      console.error("❌ Error al crear profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    res.json({ 
      success: true, 
      data: { id: result.insertId },
      message: "Profesor creado exitosamente" 
    });
  });
});

// Editar profesor
router.put("/admin/profesores/:id", (req, res) => {
  console.log(`📡 PUT /admin/profesores/${req.params.id}`, req.body);
  const { nombre, correo, materia } = req.body;
  
  if (!nombre || !correo || !materia) {
    return res.status(400).json({ success: false, message: "Todos los campos son requeridos" });
  }
  
  db.query("UPDATE profesores SET nombre = ?, correo = ?, materia = ? WHERE id = ?", 
    [nombre, correo, materia, req.params.id], 
    (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar profesor:", err);
        return res.status(500).json({ success: false, message: "Error del servidor" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Profesor no encontrado" });
      }
      res.json({ success: true, message: "Profesor actualizado exitosamente" });
    }
  );
});

// Eliminar profesor
router.delete("/admin/profesores/:id", (req, res) => {
  console.log(`📡 DELETE /admin/profesores/${req.params.id}`);
  db.query("DELETE FROM profesores WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar profesor:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Profesor no encontrado" });
    }
    res.json({ success: true, message: "Profesor eliminado exitosamente" });
  });
});

// ========== HISTORIAL ==========

// Obtener historial
router.get("/admin/historial", (req, res) => {
  console.log("📡 GET /admin/historial");
  db.query("SELECT * FROM selecciones ORDER BY fecha DESC", (err, results) => {
    if (err) {
      console.error("❌ Error en historial:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }
    console.log(`✅ ${results.length} registros de historial`);
    res.json({ success: true, data: results });
  });
});

// ========== ESTADÍSTICAS ==========

// Obtener estadísticas
router.get("/admin/estadisticas", (req, res) => {
  console.log("📡 GET /admin/estadisticas");
  
  const estadisticas = {
    sesionesActivas: 0,
    horasTotales: 0,
    computadorasActivas: 0
  };

  // Sesiones activas
  db.query("SELECT COUNT(*) AS total FROM selecciones WHERE salida IS NULL", (err, r1) => {
    if (err) {
      console.error("❌ Error en estadísticas:", err);
      return res.status(500).json({ success: false, message: "Error del servidor" });
    }

    estadisticas.sesionesActivas = r1[0].total;

    // Horas totales
    db.query("SELECT SUM(TIMESTAMPDIFF(MINUTE, fecha, salida)) AS minutos FROM selecciones WHERE salida IS NOT NULL", (err, r2) => {
      if (err) {
        console.error("❌ Error en estadísticas:", err);
        return res.status(500).json({ success: false, message: "Error del servidor" });
      }

      estadisticas.horasTotales = Math.floor((r2[0].minutos || 0) / 60);

      // Computadoras activas
      db.query("SELECT COUNT(DISTINCT computadora) AS activas FROM selecciones WHERE salida IS NULL", (err, r3) => {
        if (err) {
          console.error("❌ Error en estadísticas:", err);
          return res.status(500).json({ success: false, message: "Error del servidor" });
        }

        estadisticas.computadorasActivas = r3[0].activas;

        console.log(`✅ Estadísticas:`, estadisticas);
        res.json({ success: true, data: estadisticas });
      });
    });
  });
});

// ========== CERRAR SESIÓN ==========

// Cerrar sesión admin
router.post("/admin/cerrar-sesion", (req, res) => {
  console.log("📡 POST /admin/cerrar-sesion", req.body);
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ success: false, message: "Correo es requerido" });
  }

  res.json({ success: true, message: "Sesión cerrada exitosamente" });
});

module.exports = router;