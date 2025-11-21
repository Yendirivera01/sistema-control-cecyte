const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo.endsWith("@cecyteqroo.edu.mx")) {
    return res.json({ success: false, message: "Correo no institucional." });
  }

  const usuario = correo.split("@")[0];
  if (usuario !== contraseña) {
    return res.json({ success: false, message: "Contraseña incorrecta." });
  }

  const esAdmin = correo === "admin@cecyteqroo.edu.mx";
  const redirect = esAdmin ? "../pages/admin.html" : "../pages/dashboard.html";

  res.json({ success: true, redirect });
});

module.exports = router;