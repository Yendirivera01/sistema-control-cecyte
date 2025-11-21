const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const db = require("../database/db");

router.post("/recuperar", (req, res) => {
  const { correo } = req.body;

  // Validar correo institucional
  if (!correo || !correo.endsWith("@cecyteqroo.edu.mx")) {
    return res.json({ success: false, message: "Solo se permite recuperación con correo institucional." });
  }

  // Crear transportador
  const transporter = nodemailer.createTransport({
    service: "cecyteqroo.edu.mx", // 👈 Usa "gmail" si estás usando Gmail
    auth: {
      user: "tu-correo@cecyteqroo.edu.mx", // 👈 correo que envía
      pass: "tu-contraseña-o-app-password" // 👈 usa contraseña de aplicación si es Gmail
    }
  });

  // Contenido del correo
  const mailOptions = {
    from: "CECYTE Quintana Roo <tu-correo@cecyteqroo.edu.mx>",
    to: correo,
    subject: "Recuperación de contraseña - CECYTE",
    html: `
      <h3>Recuperación de contraseña</h3>
      <p>Hola, hemos recibido una solicitud para recuperar tu contraseña.</p>
      <p>Si no fuiste tú, ignora este mensaje. Si sí, haz clic en el siguiente enlace:</p>
      <a href="http://localhost:3000/restablecer?correo=${encodeURIComponent(correo)}">Restablecer contraseña</a>
    `
  };

  // Enviar correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar:", error);
      return res.status(500).json({ success: false, message: "Error al enviar el correo." });
    }
    res.json({ success: true, message: "Correo de recuperación enviado correctamente." });
  });
});

module.exports = router;