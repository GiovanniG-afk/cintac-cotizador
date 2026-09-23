import mongoose from "mongoose";

let isConnected = false;

export async function conectarDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log("Conectado a MongoDB Atlas");
}
