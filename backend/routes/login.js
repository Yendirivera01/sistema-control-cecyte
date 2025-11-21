const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { correo, password } = req.body;

  // Validar formato institucional
  if (!correo.endsWith("@cecyteqroo.edu.mx")) {
    return res.json({
      success: false,
      message: "Solo se permite acceso con correo institucional."
    });
  }

  // Verificación especial para administrador
  if (correo === "admin@cecyteqroo.edu.mx") {
    if (password === "admin1234") {
      return res.json({
        success: true,
        rol: "administrador",
        nombre: "Administrador General"
      });
    } else {
      return res.json({
        success: false,
        message: "Contraseña incorrecta."
      });
    }
  }

  // Verificación para alumno
  const parteLocal = correo.split("@")[0];
  if (password === parteLocal) {
    return res.json({
      success: true,
      rol: "alumno",
      nombre: parteLocal
    });
  } else {
    return res.json({
      success: false,
      message: "Contraseña incorrecta."
    });
  }
});

module.exports = router;