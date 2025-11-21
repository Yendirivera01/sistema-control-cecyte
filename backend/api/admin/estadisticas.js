router.get("/admin/estadisticas", (req, res) => {
  const estadisticas = {
    sesionesActivas: 0,
    horasTotales: 0,
    computadorasActivas: 0
  };

  db.query("SELECT COUNT(*) AS total FROM selecciones WHERE hora_salida IS NULL", (err, r1) => {
    if (err) return res.status(500).json({ success: false });

    estadisticas.sesionesActivas = r1[0].total;

    db.query("SELECT SUM(TIMESTAMPDIFF(MINUTE, hora_inicio, hora_salida)) AS minutos FROM selecciones WHERE hora_salida IS NOT NULL", (err, r2) => {
      if (err) return res.status(500).json({ success: false });

      estadisticas.horasTotales = Math.floor((r2[0].minutos || 0) / 60);

      db.query("SELECT COUNT(DISTINCT computadora) AS activas FROM selecciones WHERE hora_salida IS NULL", (err, r3) => {
        if (err) return res.status(500).json({ success: false });

        estadisticas.computadorasActivas = r3[0].activas;

        res.json({ success: true, data: estadisticas });
      });
    });
  });
});