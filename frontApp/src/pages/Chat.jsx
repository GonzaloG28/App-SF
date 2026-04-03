// Chat.jsx — componente universal de mensajería
// Funciona para nadador, profesor y admin.
// El backend controla quién puede hablar con quién.
import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient }    from "@tanstack/react-query"
import { useAuth }                                  from "../context/AuthContext"
import api from "../api/axios"
import {
  Send, MessageSquare, Search, ArrowLeft,
  Loader2, User, Shield, GraduationCap, Trophy
} from "lucide-react"

// Badge de rol
const RolBadge = ({ rol }) => {
  const config = {
    profesor: { label: "Profesor", color: "bg-blue-50 text-blue-700 border-blue-100" },
    admin:    { label: "Admin",    color: "bg-orange-50 text-orange-700 border-orange-100" },
    nadador:  { label: "Nadador",  color: "bg-green-50 text-green-700 border-green-100" },
  }
  const c = config[rol] || config.nadador
  return (
    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${c.color}`}>
      {c.label}
    </span>
  )
}

// Inicial de avatar
const Avatar = ({ nombre, apellido, rol, size = "md" }) => {
  const colors = {
    profesor: "from-blue-600 to-blue-800",
    admin:    "from-orange-500 to-orange-700",
    nadador:  "from-blue-600 to-green-500",
  }
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  }
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colors[rol] || colors.nadador} flex items-center justify-center text-white font-black italic shrink-0 ${sizes[size]}`}>
      {nombre?.charAt(0)?.toUpperCase() || "?"}
    </div>
  )
}

// Formatear hora
const formatHora = (fecha) => {
  const d = new Date(fecha)
  const hoy = new Date()
  if (d.toDateString() === hoy.toDateString()) {
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

// ── PANEL DE CONVERSACIÓN ──────────────────────────────────────────
const Conversacion = ({ contacto, onVolver, miId, miNombre }) => {
  const queryClient    = useQueryClient()
  const [texto, setTexto] = useState("")
  const bottomRef      = useRef(null)
  const inputRef       = useRef(null)

  const { data: mensajes = [], isLoading } = useQuery({
    queryKey: ["conversacion", contacto._id],
    queryFn:  () => api.get(`/mensajes/conversacion/${contacto._id}`).then(r => r.data),
    refetchInterval: 5000, // polling cada 5 segundos
  })

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  // Invalidar contactos al entrar (marca mensajes como leídos)
  useEffect(() => {
    queryClient.invalidateQueries(["contactos"])
    queryClient.invalidateQueries(["noLeidos"])
  }, [contacto._id, queryClient])

  const mutation = useMutation({
    mutationFn: () => api.post("/mensajes", {
      receptorId: contacto._id,
      contenido:  texto.trim()
    }),
    onSuccess: () => {
      setTexto("")
      queryClient.invalidateQueries(["conversacion", contacto._id])
      queryClient.invalidateQueries(["contactos"])
      inputRef.current?.focus()
    }
  })

  const handleEnviar = useCallback(() => {
    if (!texto.trim() || mutation.isPending) return
    mutation.mutate()
  }, [texto, mutation])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header conversación */}
      <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <button
          onClick={onVolver}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <Avatar nombre={contacto.nombre} rol={contacto.rol} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-slate-900 uppercase italic text-sm truncate">{contacto.nombre} {contacto.apellido}</p>
            <RolBadge rol={contacto.rol} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{contacto.correo}</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <MessageSquare size={32} className="text-slate-200 mb-3" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin mensajes aún</p>
            <p className="text-[10px] text-slate-300 font-medium mt-1">Envía el primer mensaje</p>
          </div>
        ) : (
          mensajes.map((m, i) => {
            const esMio = m.emisor._id === miId || m.emisor === miId
            return (
              <div key={m._id || i} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${esMio ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                    esMio
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-md shadow-sm"
                  }`}>
                    {m.contenido}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold px-1">
                    {formatHora(m.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleEnviar}
            disabled={!texto.trim() || mutation.isPending}
            className="shrink-0 w-12 h-12 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          >
            {mutation.isPending
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── LISTA DE CONTACTOS ─────────────────────────────────────────────
const ListaContactos = ({ contactoActivo, onSeleccionar }) => {
  const [buscar, setBuscar] = useState("")

  const { data: contactos = [], isLoading } = useQuery({
    queryKey: ["contactos"],
    queryFn:  () => api.get("/mensajes/contactos").then(r => r.data),
    refetchInterval: 10000,
  })

  const filtrados = contactos.filter(c => {
    const nombreCompleto = `${c.nombre} ${c.apellido || ""}`.toLowerCase()
    return !buscar || nombreCompleto.includes(buscar.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b border-slate-100">
        <h2 className="font-black text-slate-900 uppercase italic tracking-tight text-lg mb-3">Mensajes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar contacto..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-[11px] font-black text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center">
            <User size={28} className="mx-auto text-slate-200 mb-3" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin contactos</p>
          </div>
        ) : filtrados.map(c => (
          <button
            key={c._id}
            onClick={() => onSeleccionar(c)}
            className={`w-full flex items-center gap-3 p-4 border-b border-slate-50 hover:bg-blue-50 transition-all text-left ${
              contactoActivo?._id === c._id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
            }`}
          >
            <div className="relative shrink-0">
              <Avatar nombre={c.nombre} rol={c.rol} />
              {c.noLeidos > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">{c.noLeidos > 9 ? "9+" : c.noLeidos}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className={`text-[11px] font-black uppercase italic truncate ${c.noLeidos > 0 ? "text-slate-900" : "text-slate-700"}`}>
                    {c.nombre} {c.apellido}
                  </p>
                  <RolBadge rol={c.rol} />
                </div>
                {c.ultimoMensaje && (
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">
                    {formatHora(c.ultimoMensaje.createdAt)}
                  </span>
                )}
              </div>
              {c.ultimoMensaje && (
                <p className={`text-[10px] truncate mt-0.5 ${c.noLeidos > 0 ? "font-black text-slate-600" : "font-medium text-slate-400"}`}>
                  {c.ultimoMensaje.contenido}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────
const Chat = () => {
  const { user }  = useAuth()
  const [contactoActivo, setContactoActivo] = useState(null)

  // En mobile: si hay contacto activo, muestra la conversación
  // En desktop: siempre muestra ambos paneles

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex">

        {/* Lista de contactos */}
        <div className={`w-full lg:w-80 border-r border-slate-100 flex-shrink-0 ${
          contactoActivo ? "hidden lg:flex" : "flex"
        } flex-col`}>
          <ListaContactos
            contactoActivo={contactoActivo}
            onSeleccionar={setContactoActivo}
          />
        </div>

        {/* Conversación */}
        <div className={`flex-1 ${contactoActivo ? "flex" : "hidden lg:flex"} flex-col`}>
          {contactoActivo ? (
            <Conversacion
              contacto={contactoActivo}
              onVolver={() => setContactoActivo(null)}
              miId={user?._id || user?.id}
              miNombre={user?.nombre}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare size={48} className="text-slate-100 mb-4" />
              <h3 className="font-black text-slate-300 uppercase italic tracking-tight text-xl mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
                Elige un contacto de la lista para comenzar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
