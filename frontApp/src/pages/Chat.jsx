import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { io } from "socket.io-client"
import {
  Send, MessageSquare, Search, ArrowLeft,
  Loader2, User
} from "lucide-react"

// --- COMPONENTES AUXILIARES ---
const RolBadge = ({ rol }) => {
  const config = {
    profesor: { label: "Profesor", color: "bg-blue-50 text-blue-700 border-blue-100" },
    admin: { label: "Admin", color: "bg-orange-50 text-orange-700 border-orange-100" },
    nadador: { label: "Nadador", color: "bg-green-50 text-green-700 border-green-100" },
  }
  const c = config[rol] || config.nadador
  return <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${c.color}`}>{c.label}</span>
}

const Avatar = ({ nombre, rol }) => {
  const colors = {
    profesor: "from-blue-600 to-blue-800",
    admin: "from-orange-500 to-orange-700",
    nadador: "from-blue-600 to-green-500",
  }
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[rol] || colors.nadador} flex items-center justify-center text-white font-black italic shrink-0`}>
      {nombre?.charAt(0)?.toUpperCase() || "?"}
    </div>
  )
}

const formatHora = (fecha) => {
  const d = new Date(fecha)
  const hoy = new Date()
  return d.toDateString() === hoy.toDateString() 
    ? d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

// --- PANEL CONVERSACIÓN ---
const Conversacion = ({ contacto, onVolver, miId }) => {
  const queryClient = useQueryClient()
  const [texto, setTexto] = useState("")
  const bottomRef = useRef(null)
  
  const { data: mensajes = [], isLoading } = useQuery({
    queryKey: ["conversacion", contacto._id],
    queryFn: () => api.get(`/mensajes/conversacion/${contacto._id}`).then(r => r.data),
  })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [mensajes])

  const mutation = useMutation({
    mutationFn: () => api.post("/mensajes", { receptorId: contacto._id, contenido: texto.trim() }),
    onSuccess: (res) => {
      setTexto("")
      queryClient.setQueryData(["conversacion", contacto._id], (old) => [...(old || []), res.data])
      queryClient.invalidateQueries(["contactos"])
    }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <button onClick={onVolver} className="lg:hidden p-2 text-slate-400"><ArrowLeft size={18} /></button>
        <Avatar nombre={contacto.nombre} rol={contacto.rol} />
        <div>
          <p className="font-black text-slate-900 uppercase italic text-sm">{contacto.nombre} {contacto.apellido}</p>
          <RolBadge rol={contacto.rol} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={24} /></div> : 
         mensajes.map((m, i) => {
           const esMio = m.emisor._id === miId || m.emisor === miId
           return (
             <div key={m._id || i} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
               <div className={`px-4 py-3 rounded-2xl text-sm ${esMio ? "bg-blue-600 text-white" : "bg-white text-slate-800"}`}>
                 {m.contenido}
               </div>
             </div>
           )
         })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <textarea value={texto} onChange={e => setTexto(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none" rows={1} />
        <button onClick={() => mutation.mutate()} disabled={!texto.trim()} className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

// --- LISTA DE CONTACTOS (CARGA PROGRESIVA) ---
const ListaContactos = ({ contactoActivo, onSeleccionar }) => {
  const [buscar, setBuscar] = useState("")
  const [visibles, setVisibles] = useState(5) // Inicia mostrando 5

  const { data: contactos = [], isLoading } = useQuery({
    queryKey: ["contactos"],
    queryFn: () => api.get("/mensajes/contactos").then(r => r.data),
  })

  const filtrados = contactos.filter(c => `${c.nombre} ${c.apellido || ""}`.toLowerCase().includes(buscar.toLowerCase()))
  const listaMostrada = filtrados.slice(0, visibles)
  const hayMas = visibles < filtrados.length

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-black text-slate-900 uppercase italic mb-3">Mensajes</h2>
        <input 
          value={buscar} 
          onChange={e => { setBuscar(e.target.value); setVisibles(5); }} 
          placeholder="Buscar contacto..." 
          className="w-full pl-4 py-2.5 bg-slate-50 rounded-xl text-[11px] font-black uppercase tracking-widest outline-none" 
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
          <>
            {listaMostrada.map(c => (
              <button key={c._id} onClick={() => onSeleccionar(c)} className={`w-full p-4 border-b border-slate-50 text-left ${contactoActivo?._id === c._id ? "bg-blue-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <Avatar nombre={c.nombre} rol={c.rol} />
                  <div>
                    <p className="text-[11px] font-black uppercase italic">{c.nombre} {c.apellido}</p>
                    <p className="text-[10px] text-slate-400">{c.ultimoMensaje?.contenido || "Sin mensajes"}</p>
                  </div>
                </div>
              </button>
            ))}
            {hayMas && (
              <button onClick={() => setVisibles(prev => prev + 5)} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50">
                Cargar más contactos...
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// --- COMPONENTE CHAT PRINCIPAL ---
const Chat = () => {
  const { user } = useAuth()
  const [contactoActivo, setContactoActivo] = useState(null)

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex">
        <div className={`w-full lg:w-80 border-r border-slate-100 ${contactoActivo ? "hidden lg:flex" : "flex"} flex-col`}>
          <ListaContactos contactoActivo={contactoActivo} onSeleccionar={setContactoActivo} />
        </div>
        <div className={`flex-1 ${contactoActivo ? "flex" : "hidden lg:flex"} flex-col`}>
          {contactoActivo ? (
            <Conversacion contacto={contactoActivo} onVolver={() => setContactoActivo(null)} miId={user?._id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest">Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat