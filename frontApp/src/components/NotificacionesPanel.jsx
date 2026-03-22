import { createPortal } from "react-dom"
import { Bell, X } from "lucide-react"
import NotificacionItem from "./NotificacionItem"

// Portal — renderiza el panel directamente en document.body,
// completamente fuera del árbol del header.
// Esto evita que sticky/z-index del header afecte al fixed del panel.
const NotificacionesPanel = ({
  notificaciones,
  hayNuevas,
  cantidad,
  panelAbierto,
  abrirPanel,
  cerrarPanel
}) => {
  return (
    <>
      {/* Botón campana — se queda dentro del header normalmente */}
      <button
        onClick={() => panelAbierto ? cerrarPanel() : abrirPanel()}
        className={`relative p-2.5 transition-all group rounded-xl ${
          panelAbierto
            ? "text-orange-600 bg-orange-50"
            : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"
        }`}
      >
        <Bell
          size={20}
          className={`${panelAbierto ? "" : "group-hover:rotate-12"} transition-transform`}
        />
        {hayNuevas && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
            {cantidad > 9 ? "9+" : cantidad}
          </span>
        )}
      </button>

      {/* Panel — renderizado en document.body via Portal */}
      {panelAbierto && createPortal(
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 z-[9998]"
            onClick={cerrarPanel}
          />

          {/* MOBILE: sube desde el fondo REAL de la pantalla */}
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-[2rem] shadow-2xl flex flex-col"
            style={{ height: "80vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Header del panel */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Notificaciones
                </h3>
                {notificaciones.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {notificaciones.length}{" "}
                    {notificaciones.length === 1 ? "nueva" : "nuevas"}
                  </span>
                )}
              </div>
              <button
                onClick={cerrarPanel}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Lista scrolleable */}
            <div className="flex-1 overflow-y-auto p-3">
              {notificaciones.length > 0 ? (
                notificaciones.map(n => (
                  <NotificacionItem key={n._id} notificacion={n} />
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell size={22} className="text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-400">Sin avisos nuevos</p>
                </div>
              )}
            </div>

            {/* Botón cerrar fijo abajo */}
            <div className="p-4 border-t border-slate-100 shrink-0">
              <button
                onClick={cerrarPanel}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
              >
                Cerrar
              </button>
              <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
            </div>
          </div>

          {/* DESKTOP: dropdown en esquina superior derecha */}
          <div
            className="hidden lg:flex flex-col fixed z-[9999] w-96 bg-white rounded-3xl border border-slate-100 shadow-2xl"
            style={{ top: "80px", right: "24px", maxHeight: "500px" }}
          >
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 shrink-0">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Notificaciones
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {notificaciones.length > 0 ? (
                notificaciones.map(n => (
                  <NotificacionItem key={n._id} notificacion={n} />
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-400">Sin avisos nuevos</p>
                </div>
              )}
            </div>
            <button
              onClick={cerrarPanel}
              className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-t border-slate-50 transition-colors shrink-0 rounded-b-3xl"
            >
              Cerrar
            </button>
          </div>
        </>,
        document.body  // ← renderiza directo en body, fuera de todo
      )}
    </>
  )
}

export default NotificacionesPanel