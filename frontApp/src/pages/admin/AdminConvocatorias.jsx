import { useState }  from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api           from "../../api/axios"
import {
  Calendar, MapPin, Clock, Loader2, Trash2,
  Waves, CheckCircle2, XCircle, Users,
  ChevronDown, ChevronUp, RefreshCcw
} from "lucide-react"

// Panel de convocados expandible — igual que CalendarioProfesor
const PanelConvocados = ({ convocatoriaId }) => {
  const { data: conv, isLoading } = useQuery({
    queryKey: ["convocatoriaDetalle", convocatoriaId],
    queryFn:  () => api.get(`/convocatorias/${convocatoriaId}`).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    enabled:  !!convocatoriaId,
  })

  if (isLoading) return (
    <div className="flex justify-center py-4">
      <Loader2 className="animate-spin text-blue-600" size={20} />
    </div>
  )

  if (!conv?.nadadores?.length) return (
    <div className="py-4 text-center">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin nadadores convocados</p>
    </div>
  )

  const pagados = conv.nadadores.filter(n => n.pagoAlDia).length
  const total   = conv.nadadores.length

  return (
    <div className="border-t border-slate-100 mt-3 pt-3 space-y-3">
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-base font-black text-slate-700 italic leading-none">{total}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-2 text-center">
          <p className="text-base font-black text-emerald-700 italic leading-none">{pagados}</p>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Al día</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center">
          <p className="text-base font-black text-orange-700 italic leading-none">{total - pagados}</p>
          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Pendientes</p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {conv.nadadores.map(n => (
          <div key={n._id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-black italic text-sm shrink-0">
              {n.user?.nombre?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 uppercase italic text-[11px] truncate leading-none">
                {n.user?.nombre} {n.apellido}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{n.categoria}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase shrink-0 ${
              n.pagoAlDia
                ? "bg-emerald-100 text-emerald-700"
                : "bg-orange-100 text-orange-600"
            }`}>
              {n.pagoAlDia ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {n.pagoAlDia ? "Activa" : "Inactiva"}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const AdminConvocatorias = () => {
  const queryClient  = useQueryClient()
  const [expandidoId, setExpandidoId] = useState(null)

  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ["convocatorias"],
    queryFn:  () => api.get("/convocatorias").then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/convocatorias/${id}`),
    onSuccess:  () => {
      queryClient.invalidateQueries(["convocatorias"])
      setExpandidoId(null)
    }
  })

  const limpiarMutation = useMutation({
    mutationFn: () => api.delete("/convocatorias/limpiar/pasadas"),
    onSuccess:  () => queryClient.invalidateQueries(["convocatorias"])
  })

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  )

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Vista General</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Convoca<span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">torias</span>
          </h1>
        </div>
        <button
          onClick={() => { if (confirm("¿Limpiar todas las convocatorias ya finalizadas?")) limpiarMutation.mutate() }}
          disabled={limpiarMutation.isPending}
          className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all self-start sm:self-auto"
        >
          {limpiarMutation.isPending ? <RefreshCcw size={13} className="animate-spin" /> : null}
          Limpiar pasadas
        </button>
      </div>

      {convocatorias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Calendar size={32} className="mx-auto text-slate-200 mb-3" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Sin convocatorias activas</p>
          <p className="text-[11px] text-slate-400 font-medium">Los profesores crean convocatorias desde su panel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {convocatorias.map(c => {
            const inicio    = new Date(c.fechaInicio)
            const fin       = new Date(c.fechaFin)
            const dias      = Math.ceil((fin - inicio) / (1000*60*60*24)) + 1
            const hoy       = new Date()
            const enCurso   = inicio <= hoy && fin >= hoy
            const expandido = expandidoId === c._id

            return (
              <div
                key={c._id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  expandido ? "border-blue-200 shadow-blue-100" : "border-slate-100 hover:shadow-md"
                }`}
              >
                {/* Barra de color superior */}
                <div className={`h-1 rounded-t-2xl ${enCurso ? "bg-green-500" : "bg-gradient-to-r from-blue-600 to-green-500"}`} />

                {/* Contenido principal — clickeable para expandir */}
                <button
                  onClick={() => setExpandidoId(prev => prev === c._id ? null : c._id)}
                  className="w-full text-left p-4"
                >
                  {/* Fila superior: nombre + badge en curso + expandir */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 italic uppercase tracking-tight text-sm truncate">
                          {c.nombre}
                        </h3>
                        {enCurso && (
                          <span className="text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase shrink-0">En curso</span>
                        )}
                      </div>
                    </div>
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      expandido ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                    }`}>
                      {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Datos del evento — todos visibles en mobile */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-blue-400 shrink-0" />
                      <span className="truncate">{c.lugar}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={11} className="text-blue-400 shrink-0" />
                      {c.nadadores?.length || 0} convocados
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={11} className="text-blue-400 shrink-0" />
                      {inicio.toLocaleDateString("es-ES",{day:"2-digit",month:"short"})} — {fin.toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="text-blue-400 shrink-0" />
                      {dias} {dias === 1 ? "día" : "días"}
                    </span>
                  </div>

                  {c.creadoPor && (
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider mt-2">
                      Por: {c.creadoPor.nombre}
                    </p>
                  )}
                </button>

                {/* Panel expandible */}
                {expandido && (
                  <div className="px-4 pb-4">
                    <PanelConvocados convocatoriaId={c._id} />

                    {/* Botón eliminar al final del panel */}
                    <button
                      onClick={() => { if (confirm(`¿Eliminar "${c.nombre}"?`)) eliminarMutation.mutate(c._id) }}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Trash2 size={14} /> Eliminar convocatoria
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminConvocatorias
