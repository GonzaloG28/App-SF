import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, Calendar as CalIcon, MapPin as MapPinIcon, Clock as ClockIcon } from "lucide-react"

const ConvocatoriaDetalle = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const { data: convocatoria, isLoading } = useQuery({
    queryKey: ["convocatoriaDetalle", id],
    queryFn:  () => api.get(`/convocatoria/${id}`).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  if (isLoading) return (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
  )
  if (!convocatoria) return null

  const inicio     = new Date(convocatoria.fechaInicio)
  const fin        = new Date(convocatoria.fechaFin)
  const dias       = Math.ceil((fin - inicio) / (1000*60*60*24)) + 1
  const pagados    = convocatoria.nadadores?.filter(n => n.pagoAlDia).length || 0
  const impagos    = (convocatoria.nadadores?.length || 0) - pagados

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8 animate-fade-in p-4">

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-[11px] uppercase tracking-widest">
        <ArrowLeft size={14} /> Volver
      </button>

      {/* Header */}
      <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-3">{convocatoria.nombre}</h1>
          <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CalIcon size={13} className="text-blue-400" />
              {inicio.toLocaleDateString("es-ES",{day:"2-digit",month:"long"})} — {fin.toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})}
            </span>
            <span className="flex items-center gap-1.5"><ClockIcon size={13} className="text-blue-400" /> {dias} {dias===1?"día":"días"}</span>
            <span className="flex items-center gap-1.5"><MapPinIcon size={13} className="text-blue-400" /> {convocatoria.lugar}</span>
          </div>
          {convocatoria.descripcion && (
            <p className="text-slate-500 text-[11px] font-medium mt-3 leading-relaxed">{convocatoria.descripcion}</p>
          )}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-2xl font-black text-slate-900 italic">{convocatoria.nadadores?.length || 0}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Convocados</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
          <p className="text-2xl font-black text-emerald-700 italic">{pagados}</p>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Al día</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 text-center">
          <p className="text-2xl font-black text-orange-700 italic">{impagos}</p>
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pendientes</p>
        </div>
      </div>

      {/* Lista convocados */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Lista de Convocados</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{convocatoria.nadadores?.length} atletas</span>
        </div>
        <div className="divide-y divide-slate-50">
          {convocatoria.nadadores?.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin nadadores convocados</p>
            </div>
          ) : (
            convocatoria.nadadores?.map(n => (
              <div key={n._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-black italic shrink-0">
                  {n.user?.nombre?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 uppercase italic text-sm truncate">
                    {n.user?.nombre} {n.apellido}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.categoria}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border shrink-0 ${
                  n.pagoAlDia
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-orange-50 text-orange-600 border-orange-100"
                }`}>
                  {n.pagoAlDia ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {n.pagoAlDia ? "Al día" : "Pendiente"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ConvocatoriaDetalle