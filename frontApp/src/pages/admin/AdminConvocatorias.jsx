import { useState }   from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link }       from "react-router-dom"
import api            from "../../api/axios"
import {
  Calendar, Plus, ChevronRight, MapPin, Clock,
  Loader2, Trash2, Eye, Waves, CheckCircle2, XCircle
} from "lucide-react"

const AdminConvocatorias = () => {
  const queryClient = useQueryClient()

  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ["convocatorias"],
    queryFn:  () => api.get("/convocatorias").then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/convocatorias/${id}`),
    onSuccess:  () => queryClient.invalidateQueries(["convocatorias"])
  })

  const limpiarMutation = useMutation({
    mutationFn: () => api.delete("/convocatorias/limpiar/pasadas"),
    onSuccess:  () => queryClient.invalidateQueries(["convocatorias"])
  })

  if (isLoading) return (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
  )

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Gestión</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Convoca<span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">torias</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if(confirm("¿Limpiar todas las convocatorias ya finalizadas?")) limpiarMutation.mutate() }}
            disabled={limpiarMutation.isPending}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            {limpiarMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Limpiar pasadas"}
          </button>
        </div>
      </div>

      {convocatorias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Calendar size={32} className="mx-auto text-slate-200 mb-3" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Sin convocatorias activas</p>
          <p className="text-[11px] text-slate-400 font-medium">Los profesores pueden crear convocatorias desde su panel</p>
        </div>
      ) : (
        <div className="space-y-4">
          {convocatorias.map(c => {
            const inicio  = new Date(c.fechaInicio)
            const fin     = new Date(c.fechaFin)
            const dias    = Math.ceil((fin - inicio) / (1000*60*60*24)) + 1
            const hoy     = new Date()
            const enCurso = inicio <= hoy && fin >= hoy
            const pagados = 0 // se obtiene en el detalle

            return (
              <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className={`h-1.5 w-full ${enCurso ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-blue-600 to-green-500"}`} />
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 italic uppercase tracking-tight">{c.nombre}</h3>
                        {enCurso && <span className="text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase">En curso</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-400 mb-2">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {c.lugar}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} />
                          {inicio.toLocaleDateString("es-ES",{day:"2-digit",month:"short"})} — {fin.toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}
                        </span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {dias} días</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase">
                        <span>{c.nadadores?.length || 0} convocados</span>
                        {c.creadoPor && <span>Por: {c.creadoPor.nombre}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/admin/convocatorias/${c._id}`}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        <Eye size={14} /> Ver
                      </Link>
                      <button
                        onClick={() => { if(confirm(`¿Eliminar "${c.nombre}"?`)) eliminarMutation.mutate(c._id) }}
                        className="w-9 h-9 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminConvocatorias