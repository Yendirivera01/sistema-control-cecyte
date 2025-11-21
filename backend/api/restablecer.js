router.post("/restablecer", (req, res) => {
  const { token, nueva } = req.body;

  db.query("SELECT correo FROM tokens WHERE token = ?", [token], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: "Token inválido o expirado." });
    }

    const correo = results[0].correo;

    db.query("UPDATE usuarios SET password = ? WHERE correo = ?", [nueva, correo], (err2) => {
      if (err2) return res.json({ success: false, message: "Error al actualizar contraseña." });

      db.query("DELETE FROM tokens WHERE token = ?", [token]); // eliminar token usado
      res.json({ success: true, message: "Contraseña actualizada correctamente." });
    });
  });
});