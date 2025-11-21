router.get("/admin/historial", (req, res) => {
  const { fecha, laboratorio, profesor } = req.query;

  let query = "SELECT * FROM selecciones WHERE 1=1";
  const params = [];

  if (fecha) {
    query += " AND DATE(fecha) = ?";
    params.push(fecha);
  }

  if (laboratorio) {
    query += " AND laboratorio = ?";
    params.push(laboratorio);
  }

  if (profesor) {
    query += " AND profesor LIKE ?";
    params.push(`%${profesor}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});