import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const REMEMBER_KEY = "cintac-remember";

function getAuthStorage(persistirSesion) {
  return persistirSesion ? localStorage : sessionStorage;
}

function parseSafeJSON(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getPersistedUser() {
  const persistirSesion = localStorage.getItem(REMEMBER_KEY) === "true";
  const storage = persistirSesion ? localStorage : sessionStorage;
  const guardado = storage.getItem("usuario");
  return parseSafeJSON(guardado);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => getPersistedUser());

  function iniciarSesion(token, datosUsuario, persistirSesion = false) {
    const storage = getAuthStorage(persistirSesion);
    storage.setItem("token", token);
    storage.setItem("usuario", JSON.stringify(datosUsuario));
    localStorage.setItem(REMEMBER_KEY, String(Boolean(persistirSesion)));
    setUsuario(datosUsuario);
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    localStorage.removeItem(REMEMBER_KEY);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
