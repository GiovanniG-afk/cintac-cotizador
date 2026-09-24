import mongoose from "mongoose";

let isConnected = false;
let dbMode = "mongo";

export function getDbMode() {
  return dbMode;
}

export async function conectarDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    dbMode = "fallback";
    isConnected = true;
    console.log("Sin MONGODB_URI: usando almacenamiento local sin descargar MongoDB.");
    return;
  }

  try {
    await mongoose.connect(uri);
    dbMode = "mongo";
    isConnected = true;
    console.log(uri.includes("localhost") ? "Conectado a MongoDB local" : "Conectado a MongoDB Atlas");
  } catch (error) {
    dbMode = "fallback";
    isConnected = true;
    console.warn("No se pudo conectar a MongoDB real:", error.message);
    console.log("Se continúa en modo local de respaldo sin MongoDB externo.");
  }
}

export async function cerrarDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  isConnected = false;
  dbMode = "mongo";
}
