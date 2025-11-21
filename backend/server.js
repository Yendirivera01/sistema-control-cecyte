const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database/db");

db.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
  } else {
    console.log("✅ Conexión a MySQL verificada desde server.js");
  }
});

app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));
const loginRoute = require("./routes/login");
app.use("/api", loginRoute);
const recuperarRoute = require("./routes/recuperar");
app.use("/api", recuperarRoute);
const seleccionesRoute = require("./routes/selecciones"); // si tienes esta ruta
app.use("/api", seleccionesRoute);
const adminRoute = require("./routes/admin");
app.use("/api", adminRoute);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});