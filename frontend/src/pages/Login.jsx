import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

const textos = {
  es: {
    acceso: "Cotizador de flete de importación — acceso Cintac",
    correo: "Correo o usuario",
    nombre: "Nombre",
    usuario: "Usuario",
    correoRegistro: "Correo electrónico",
    password: "Contraseña",
    passwordPlaceholder: "Contraseña",
    crearCuenta: "Crear cuenta",
    ingresar: "Ingresar",
    volver: "Volver al inicio de sesión",
    alternar: "Crear una cuenta",
    idioma: "Idioma",
    tema: "Tema",
    claro: "Claro",
    oscuro: "Oscuro",
    recordar: "Mantener sesión activa",
    fallos1: "Credenciales incorrectas.",
    fallos2: "Te quedan",
    fallos3: "intentos antes de poder restablecer la contraseña.",
    errorBloqueo: "Has superado 5 intentos. Cambia tu contraseña para continuar.",
    cambiarPassword: "Cambiar contraseña",
    actual: "Contraseña actual",
    nueva: "Nueva contraseña",
    restablecer: "Guardar nueva contraseña",
    exitoReset: "Contraseña actualizada correctamente.",
  },
  en: {
    acceso: "Import freight quote — Cintac access",
    correo: "Email or username",
    nombre: "Name",
    usuario: "Username",
    correoRegistro: "Email",
    password: "Password",
    passwordPlaceholder: "Password",
    crearCuenta: "Create account",
    ingresar: "Log in",
    volver: "Back to login",
    alternar: "Create an account",
    idioma: "Language",
    tema: "Theme",
    claro: "Light",
    oscuro: "Dark",
    recordar: "Keep session active",
    fallos1: "Incorrect credentials.",
    fallos2: "You have",
    fallos3: "attempts left before you can reset the password.",
    errorBloqueo: "You exceeded 5 attempts. Change your password to continue.",
    cambiarPassword: "Change password",
    actual: "Current password",
    nueva: "New password",
    restablecer: "Save new password",
    exitoReset: "Password updated successfully.",
  },
  ru: {
    acceso: "Калькулятор фрахта — доступ Cintac",
    correo: "Эл. почта или логин",
    nombre: "Имя",
    usuario: "Логин",
    correoRegistro: "Эл. почта",
    password: "Пароль",
    passwordPlaceholder: "Пароль",
    crearCuenta: "Создать аккаунт",
    ingresar: "Войти",
    volver: "Назад к входу",
    alternar: "Создать аккаунт",
    idioma: "Язык",
    tema: "Тема",
    claro: "Светлая",
    oscuro: "Тёмная",
    recordar: "Сохранить сеанс",
    fallos1: "Неверные данные.",
    fallos2: "У вас осталось",
    fallos3: "попыток до сброса пароля.",
    errorBloqueo: "Вы превысили 5 попыток. Смените пароль, чтобы продолжить.",
    cambiarPassword: "Сменить пароль",
    actual: "Текущий пароль",
    nueva: "Новый пароль",
    restablecer: "Сохранить новый пароль",
    exitoReset: "Пароль успешно обновлён.",
  },
  zh: {
    acceso: "进口运费报价器 — Cintac 登录",
    correo: "电子邮件或用户名",
    nombre: "姓名",
    usuario: "用户名",
    correoRegistro: "电子邮件",
    password: "密码",
    passwordPlaceholder: "密码",
    crearCuenta: "创建账户",
    ingresar: "登录",
    volver: "返回登录",
    alternar: "创建账户",
    idioma: "语言",
    tema: "主题",
    claro: "浅色",
    oscuro: "深色",
    recordar: "保持会话激活",
    fallos1: "凭据不正确。",
    fallos2: "你还有",
    fallos3: "次机会可在重置密码前使用。",
    errorBloqueo: "你已超过 5 次尝试。修改密码后再继续。",
    cambiarPassword: "修改密码",
    actual: "当前密码",
    nueva: "新密码",
    restablecer: "保存新密码",
    exitoReset: "密码已成功更新。",
  },
};
const MAX_INTENTOS = 5;

export default function Login() {
  const [modo, setModo] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [idioma, setIdioma] = useState(localStorage.getItem("cintac-language") || "es");
  const [tema, setTema] = useState(localStorage.getItem("cintac-theme") || "claro");
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("cintac-remember") === "true");
  const [intentosFallidos, setIntentosFallidos] = useState(Number(localStorage.getItem("cintac-login-fails") || 0));
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetNuevaPassword, setResetNuevaPassword] = useState("");
  const [resetOk, setResetOk] = useState("");
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("cintac-language", idioma);
    document.documentElement.lang = idioma;
  }, [idioma]);

  useEffect(() => {
    localStorage.setItem("cintac-theme", tema);
    document.body.dataset.theme = tema === "oscuro" ? "dark" : "light";
  }, [tema]);

  useEffect(() => {
    localStorage.setItem("cintac-remember", String(Boolean(rememberMe)));
  }, [rememberMe]);

  const t = textos[idioma] || textos.es;

  function limpiarIntentos() {
    localStorage.setItem("cintac-login-fails", "0");
    setIntentosFallidos(0);
    setMostrarCambioPassword(false);
    setResetOk("");
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setResetOk("");
    setCargando(true);
    try {
      if (modo === "registro") {
        const { token, usuario } = await api.registrar({ nombre, username, email, password });
        iniciarSesion(token, usuario, rememberMe);
        limpiarIntentos();
        navigate("/");
        return;
      }

      const { token, usuario } = await api.login(identifier, password);
      iniciarSesion(token, usuario, rememberMe);
      limpiarIntentos();
      navigate("/");
    } catch (err) {
      const proximoNumero = intentosFallidos + 1;
      localStorage.setItem("cintac-login-fails", String(proximoNumero));
      setIntentosFallidos(proximoNumero);

      if (proximoNumero >= MAX_INTENTOS) {
        setError(t.errorBloqueo);
        setMostrarCambioPassword(true);
        return;
      }

      const restantes = MAX_INTENTOS - proximoNumero;
      setError(`${t.fallos1} ${t.fallos2} ${restantes} ${t.fallos3}`);
    } finally {
      setCargando(false);
    }
  }

  async function manejarCambioPasswordBloqueado(e) {
    e.preventDefault();
    setError("");
    setResetOk("");
    try {
      const usuarioIdentificador = resetIdentifier || identifier;
      const { token, usuario } = await api.reestablecerPassword({
        identifier: usuarioIdentificador,
        password: resetPassword,
        nuevaPassword: resetNuevaPassword,
      });
      iniciarSesion(token, usuario, rememberMe);
      limpiarIntentos();
      setResetOk(t.exitoReset);
      setMostrarCambioPassword(false);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[340px] flex-col items-center justify-center px-4 text-center">
      <div className="w-full">
        <div className="text-[28px] font-bold tracking-[1px] text-[#e55303]">CINTAC</div>
        <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>{t.acceso}</p>
      </div>

      <form onSubmit={manejarEnvio} className="tarjeta mt-5 w-full">
        {modo === "registro" ? (
          <>
            <div>
              <label htmlFor="nombre">{t.nombre}</label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1"
                placeholder={t.nombre}
              />
            </div>

            <div>
              <label htmlFor="username">{t.usuario}</label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="usuario_cintac"
              />
            </div>

            <div>
              <label htmlFor="emailRegistro">{t.correoRegistro}</label>
              <input
                id="emailRegistro"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="nombre@cintac.cl"
              />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="identifier">{t.correo}</label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1"
              placeholder="usuario o nombre@cintac.cl"
            />
          </div>
        )}

        <div>
          <label htmlFor="password">{t.password}</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            placeholder={t.passwordPlaceholder}
          />
        </div>

        <label className="mt-3 flex items-center justify-between gap-3 text-left">
          <span>{t.recordar}</span>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        {intentosFallidos >= MAX_INTENTOS && (
          <button
            type="button"
            className="btn-secundario mt-3"
            onClick={() => setMostrarCambioPassword((prev) => !prev)}
          >
            {t.cambiarPassword}
          </button>
        )}

        <button type="submit" disabled={cargando} className="btn-primario">
          {cargando ? "Procesando..." : modo === "registro" ? t.crearCuenta : t.ingresar}
        </button>
      </form>

      {mostrarCambioPassword && (
        <form onSubmit={manejarCambioPasswordBloqueado} className="tarjeta mt-4 w-full">
          <h3 className="mb-2 text-left text-base">{t.cambiarPassword}</h3>
          <div>
            <label htmlFor="resetIdentifier">{t.correo}</label>
            <input
              id="resetIdentifier"
              type="text"
              required
              value={resetIdentifier || identifier}
              onChange={(e) => setResetIdentifier(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="resetPassword">{t.actual}</label>
            <input
              id="resetPassword"
              type="password"
              required
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="resetNuevaPassword">{t.nueva}</label>
            <input
              id="resetNuevaPassword"
              type="password"
              required
              value={resetNuevaPassword}
              onChange={(e) => setResetNuevaPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          {resetOk && <p className="mt-3 text-sm text-green-700">{resetOk}</p>}
          <button type="submit" className="btn-primario">{t.restablecer}</button>
        </form>
      )}

      <div className="mt-4 flex w-full gap-2">
        <div className="flex-1">
          <label htmlFor="loginIdioma">{t.idioma}</label>
          <select id="loginIdioma" value={idioma} onChange={(e) => setIdioma(e.target.value)}>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="loginTema">{t.tema}</label>
          <select id="loginTema" value={tema} onChange={(e) => setTema(e.target.value)}>
            <option value="claro">{t.claro}</option>
            <option value="oscuro">{t.oscuro}</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 text-[13px] text-[#555] underline underline-offset-2"
        onClick={() => {
          setError("");
          setModo((prev) => (prev === "login" ? "registro" : "login"));
        }}
      >
        {modo === "login" ? t.alternar : t.volver}
      </button>
    </div>
  );
}
