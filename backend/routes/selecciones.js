const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.post("/seleccion", (req, res) => {
  const { correo, computadora, laboratorio, profesor } = req.body;
  const fecha = new Date();

  const query = `
    INSERT INTO selecciones (correo, computadora, laboratorio, profesor, fecha)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [correo, computadora, laboratorio, profesor, fecha], (err, result) => {
    if (err) {
      console.error("Error al guardar:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});

router.post("/cerrar-sesion", (req, res) => {
  const { correo } = req.body;
  const salida = new Date();

  const query = `
    UPDATE selecciones
    SET salida = ?
    WHERE correo = ? AND salida IS NULL
    ORDER BY fecha DESC
    LIMIT 1
  `;

  db.query(query, [salida, correo], (err, result) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});

router.get("/selecciones", (req, res) => {
  db.query("SELECT * FROM selecciones", (err, results) => {
    if (err) {
      console.error("❌ Error al consultar selecciones:", err);
      return res.status(500).json({ success: false, message: "Error en la base de datos." });
    }
    res.json({ success: true, data: results });
  });
});

module.exports = router;
