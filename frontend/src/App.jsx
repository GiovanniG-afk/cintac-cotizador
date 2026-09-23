import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./api/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NuevaCotizacion from "./pages/NuevaCotizacion.jsx";
import Historial from "./pages/Historial.jsx";
import Comparar from "./pages/Comparar.jsx";
import Usuarios from "./pages/Usuarios.jsx";

function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && usuario.rol !== "administrador") return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/nueva"
          element={
            <RutaProtegida>
              <NuevaCotizacion />
            </RutaProtegida>
          }
        />
        <Route
          path="/historial"
          element={
            <RutaProtegida>
              <Historial />
            </RutaProtegida>
          }
        />
        <Route
          path="/comparar"
          element={
            <RutaProtegida>
              <Comparar />
            </RutaProtegida>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RutaProtegida soloAdmin>
              <Usuarios />
            </RutaProtegida>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
