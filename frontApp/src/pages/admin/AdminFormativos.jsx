import { useState }  from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api           from "../../api/axios"
import {
  UserCheck, Search, CheckCircle2, XCircle,
  Loader2, RefreshCcw
} from "lucide-react"

// Solo lectura y gestión de pagos — la creación de formativos
// es exclusiva del profesor desde su panel de nadadores.
const AdminFormativos = () => {
  const queryClient = useQueryClient()
  const [buscar, setBuscar] = useState("")

  const { data = [], isLoading, isFetching } = useQuery({
    queryKey: ["formativos"],
    queryFn:  () => api.get("/formativos").then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/pago-formativo/${id}`),
    onSuccess:  () => {
      queryClient.invalidateQueries(["formativos"])
      queryClient.invalidateQueries(["adminStats"])
    }
  })

  const filtrados = data.filter(n =>
    !buscar || `${n.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
  )

  return (
    <div className="space-y-5 pb-8">
      <div>
        <p className="text-green-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Gestión de Pagos</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
          Rama <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">Formativa</span>
        </h1>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          Los profesores gestionan el registro de nuevos nadadores formativos.
        </p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-2 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border-none text-[11px] font-black text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-widest outline-none"
          />
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-slate-900 italic">{data.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-emerald-700 italic">{data.filter(n => n.pagoAlDia).length}</p>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Al día</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-3 text-center">
          <p className="text-xl font-black text-orange-700 italic">{data.filter(n => !n.pagoAlDia).length}</p>
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pendientes</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-green-500" size={32} />
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {filtrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <UserCheck size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {buscar ? "Sin resultados" : "Sin nadadores formativos registrados"}
              </p>
            </div>
          ) : filtrados.map(n => (
            <div key={n._id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-black text-base italic shrink-0">
                  {n.nombre.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-slate-900 uppercase italic tracking-tight text-sm truncate">{n.nombre} {n.apellido}</p>
                    <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase tracking-widest border border-green-100 shrink-0">Formativo</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold">{n.edad} años</span>
                    {n.apoderado && <span className="text-[10px] text-slate-400 font-bold">Apod: {n.apoderado}</span>}
                    {n.telefono  && <span className="text-[10px] text-slate-400 font-bold">{n.telefono}</span>}
                  </div>

                  {/* Badge pago — SIEMPRE visible (mobile + desktop) */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border flex items-center gap-1 ${
                      n.pagoAlDia
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-orange-50 text-orange-600 border-orange-100"
                    }`}>
                      {n.pagoAlDia ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {n.pagoAlDia ? "Al día" : "Pago pendiente"}
                    </span>
                    {n.fechaUltimoPago && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        · {new Date(n.fechaUltimoPago).toLocaleDateString("es-ES",{day:"2-digit",month:"short"})}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle pago */}
                <button
                  onClick={() => toggleMutation.mutate(n._id)}
                  disabled={toggleMutation.isPending}
                  className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
                    n.pagoAlDia
                      ? "bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  }`}
                  title={n.pagoAlDia ? "Marcar pendiente" : "Confirmar pago"}
                >
                  {toggleMutation.isPending
                    ? <RefreshCcw size={16} className="animate-spin" />
                    : n.pagoAlDia ? <XCircle size={18} /> : <CheckCircle2 size={18} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminFormativos
