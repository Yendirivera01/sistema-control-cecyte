router.post("/recuperar", (req, res) => {
  const { correo } = req.body;

  res.json({ success: true, message: "Correo de recuperación enviado." });
  // Validación y envío de correo aquí...
});

