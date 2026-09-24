import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../api/AuthContext.jsx";

const enlaces = [
  { to: "/", texto: "Inicio", fin: true },
  { to: "/nueva", texto: "Nueva cotización" },
  { to: "/historial", texto: "Historial" },
  { to: "/comparar", texto: "Comparar" },
];

const textos = {
  es: {
    config: "Configuración",
    usuario: "Nombre de usuario",
    email: "Correo electrónico",
    idioma: "Idioma",
    tema: "Tema",
    claro: "Claro",
    oscuro: "Oscuro",
    cambiarPassword: "Cambiar contraseña",
    contraseñaActual: "Contraseña actual",
    nuevaContrasena: "Nueva contraseña",
    guardar: "Guardar",
    cerrarSesion: "Cerrar sesión",
    confirmarCorreo: "Confirmar por correo",
    codigo: "Código de confirmación",
    enviarCodigo: "Enviar código",
    codigoEnviado: "Se envió un código de confirmación a tu correo.",
    confirmar: "Confirmar cambio",
    nota: "Para cambiar idioma, tema, contraseña o nombre de usuario, debes confirmar por correo.",
  },
  en: {
    config: "Settings",
    usuario: "Username",
    email: "Email",
    idioma: "Language",
    tema: "Theme",
    claro: "Light",
    oscuro: "Dark",
    cambiarPassword: "Change password",
    contraseñaActual: "Current password",
    nuevaContrasena: "New password",
    guardar: "Save",
    cerrarSesion: "Log out",
    confirmarCorreo: "Confirm by email",
    codigo: "Confirmation code",
    enviarCodigo: "Send code",
    codigoEnviado: "A confirmation code was sent to your email.",
    confirmar: "Confirm change",
    nota: "To change language, theme, password or username, email confirmation is required.",
  },
  ru: {
    config: "Настройки",
    usuario: "Имя пользователя",
    email: "Эл. почта",
    idioma: "Язык",
    tema: "Тема",
    claro: "Светлая",
    oscuro: "Тёмная",
    cambiarPassword: "Изменить пароль",
    contraseñaActual: "Текущий пароль",
    nuevaContrasena: "Новый пароль",
    guardar: "Сохранить",
    cerrarSesion: "Выйти",
    confirmarCorreo: "Подтвердить по email",
    codigo: "Код подтверждения",
    enviarCodigo: "Отправить код",
    codigoEnviado: "Код подтверждения отправлен на вашу почту.",
    confirmar: "Подтвердить изменение",
    nota: "Чтобы изменить язык, тему, пароль или имя пользователя, требуется подтверждение по email.",
  },
  zh: {
    config: "设置",
    usuario: "用户名",
    email: "电子邮件",
    idioma: "语言",
    tema: "主题",
    claro: "浅色",
    oscuro: "深色",
    cambiarPassword: "修改密码",
    contraseñaActual: "当前密码",
    nuevaContrasena: "新密码",
    guardar: "保存",
    cerrarSesion: "退出",
    confirmarCorreo: "通过邮箱确认",
    codigo: "确认码",
    enviarCodigo: "发送验证码",
    codigoEnviado: "确认码已发送到您的邮箱。",
    confirmar: "确认修改",
    nota: "要更改语言、主题、密码或用户名，必须通过邮箱确认。",
  },
};

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [idioma, setIdioma] = useState(localStorage.getItem("cintac-language") || "es");
  const [tema, setTema] = useState(localStorage.getItem("cintac-theme") || "claro");
  const [username, setUsername] = useState(usuario?.username || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [codigoConfirmacion, setCodigoConfirmacion] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState("");
  const [errorConfig, setErrorConfig] = useState("");
  const [okConfig, setOkConfig] = useState("");

  useEffect(() => {
    localStorage.setItem("cintac-language", idioma);
    document.documentElement.lang = idioma;
  }, [idioma]);

  useEffect(() => {
    localStorage.setItem("cintac-theme", tema);
    document.body.dataset.theme = tema === "oscuro" ? "dark" : "light";
  }, [tema]);

  useEffect(() => {
    if (usuario) {
      setUsername(usuario.username || "");
      setEmail(usuario.email || "");
    }
  }, [usuario]);

  async function generarCodigoConfirmacion() {
    setErrorConfig("");
    setOkConfig("");

    try {
      await api.solicitarConfirmacionPerfil({ userId: usuario.id, email: email || usuario.email || "" });
      setCodigoEnviado("sent");
      setOkConfig("Se envió un código de confirmación a tu correo.");
    } catch (err) {
      setErrorConfig(err.message);
    }
  }

  async function manejarConfiguracion(e) {
    e.preventDefault();
    setErrorConfig("");
    setOkConfig("");

    const quiereCambiarPassword = Boolean(passwordActual || passwordNueva);
    if (quiereCambiarPassword && (!passwordNueva || passwordNueva.length < 6)) {
      setErrorConfig("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (quiereCambiarPassword && !passwordActual && !codigoConfirmacion.trim()) {
      setErrorConfig("Para cambiar la contraseña sin la actual, confirma por correo primero.");
      return;
    }

    if (quiereCambiarPassword && passwordActual && !codigoConfirmacion.trim()) {
      setErrorConfig("Debes ingresar el código de confirmación que recibiste por correo.");
      return;
    }

    if (!codigoConfirmacion.trim() && (username !== usuario.username || email !== usuario.email)) {
      setErrorConfig("Debes ingresar el código de confirmación que recibió por correo.");
      return;
    }

    try {
      if (quiereCambiarPassword && passwordActual && passwordNueva) {
        await api.cambiarMiPassword({ password: passwordActual, nuevaPassword: passwordNueva });
      }

      if (quiereCambiarPassword && !passwordActual && passwordNueva) {
        await api.reestablecerPassword({
          identifier: usuario.username,
          email: email.trim() || usuario.email,
          codigo: codigoConfirmacion.trim(),
          nuevaPassword: passwordNueva,
        });
      }

      if (username && username !== usuario.username) {
        const payload = { username: username.trim(), email: email.trim() || usuario.email, codigo: codigoConfirmacion.trim() };
        await api.confirmarPerfil(payload);
      }

      if (email && email !== usuario.email) {
        const payload = { username: username.trim() || usuario.username, email: email.trim(), codigo: codigoConfirmacion.trim() };
        await api.confirmarPerfil(payload);
      }

      if (passwordActual || passwordNueva || username !== usuario.username || email !== usuario.email) {
        setOkConfig("Configuración actualizada correctamente.");
      } else {
        setOkConfig("Configuración guardada correctamente.");
      }

      setCodigoConfirmacion("");
      setCodigoEnviado("");
      setPasswordActual("");
      setPasswordNueva("");
    } catch (err) {
      setErrorConfig(err.message);
    }
  }

  if (!usuario) return null;

  const t = textos[idioma] || textos.es;

  return (
    <header className="navbar-shell border-b-[4px] border-[#ff4f01]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="text-[26px] font-bold uppercase tracking-[1px] text-[#e55303]">CINTAC</div>
          <div className="hidden text-sm font-medium text-[#fa8b0f] sm:block">Cotizador de flete de importación</div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-base font-medium">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.fin}
              className={({ isActive }) => `${isActive ? "text-[#e55303]" : "nav-link"}`}
            >
              {enlace.texto}
            </NavLink>
          ))}
          {usuario.rol === "administrador" && (
            <NavLink to="/usuarios" className={({ isActive }) => `${isActive ? "text-[#e55303]" : "nav-link"}`}>
              Usuarios
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span>
            {usuario.nombre} · <span className="italic">{usuario.rol.replace("_", " ")}</span>
          </span>
          <button
            type="button"
            className="btn-secondary btn-config px-4 py-2 text-sm"
            onClick={() => setMostrarConfig((prev) => !prev)}
          >
            {t.config}
          </button>
          <button
            className="btn-secondary btn-config px-4 py-2 text-sm"
            onClick={() => {
              cerrarSesion();
              navigate("/login");
            }}
          >
            {t.cerrarSesion}
          </button>
        </div>
      </div>

      {mostrarConfig && (
        <div className="config-panel border-t">
          <div className="mx-auto max-w-5xl px-6 py-5">
            <form onSubmit={manejarConfiguracion} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-sm font-semibold" style={{ color: "var(--text)" }}>{t.nota}</p>
                <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={generarCodigoConfirmacion}>
                  {t.enviarCodigo}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="perfilUsername">{t.usuario}</label>
                  <input id="perfilUsername" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="perfilEmail">{t.email}</label>
                  <input id="perfilEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="perfilPasswordActual">{t.contraseñaActual}</label>
                  <input id="perfilPasswordActual" type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="perfilPasswordNueva">{t.nuevaContrasena}</label>
                  <input id="perfilPasswordNueva" type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="selectIdioma">{t.idioma}</label>
                  <select id="selectIdioma" value={idioma} onChange={(e) => setIdioma(e.target.value)} className="mt-1">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="selectTema">{t.tema}</label>
                  <select id="selectTema" value={tema} onChange={(e) => setTema(e.target.value)} className="mt-1">
                    <option value="claro">{t.claro}</option>
                    <option value="oscuro">{t.oscuro}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="codigoConfirmacion">{t.codigo}</label>
                  <input id="codigoConfirmacion" value={codigoConfirmacion} onChange={(e) => setCodigoConfirmacion(e.target.value)} className="mt-1" placeholder="123456" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primario w-full">{t.confirmar}</button>
                </div>
              </div>

              {codigoEnviado && (
                <p className="m-0 text-sm text-amber-500">{t.codigoEnviado}</p>
              )}
              {errorConfig && <p className="m-0 text-sm text-red-500">{errorConfig}</p>}
              {okConfig && <p className="m-0 text-sm text-green-500">{okConfig}</p>}
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
