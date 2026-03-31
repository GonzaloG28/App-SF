import { useState, useMemo }                      from "react"
import { useQuery, useMutation, useQueryClient }  from "@tanstack/react-query"
import { Link }                                   from "react-router-dom"
import api                                        from "../../api/axios"
import {
  Calendar, Plus, MapPin, Clock, Trash2,
  Loader2, ChevronLeft, ChevronRight, Waves,
  CheckCircle2, XCircle, Users, ChevronDown,
  ChevronUp, Eye
} from "lucide-react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

// Panel de convocados que se expande inline
const PanelConvocados = ({ convocatoriaId }) => {
  const { data: conv, isLoading } = useQuery({
    queryKey: ["convocatoriaDetalle", convocatoriaId],
    queryFn:  () => api.get(`/convocatorias/${convocatoriaId}`).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    enabled:  !!convocatoriaId,
  })

  if (isLoading) return (
    <div className="flex justify-center py-6">
      <Loader2 className="animate-spin text-blue-600" size={22} />
    </div>
  )

  if (!conv?.nadadores?.length) return (
    <div className="py-6 text-center">
      <Users size={24} className="mx-auto text-slate-200 mb-2" />
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin nadadores convocados</p>
    </div>
  )

  const pagados = conv.nadadores.filter(n => n.pagoAlDia).length
  const total   = conv.nadadores.length

  return (
    <div className="border-t border-slate-100 mt-3 pt-3">
      {/* Mini stats */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-emerald-50 rounded-xl p-2 text-center">
          <p className="text-lg font-black text-emerald-700 italic leading-none">{pagados}</p>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Al día</p>
        </div>
        <div className="flex-1 bg-orange-50 rounded-xl p-2 text-center">
          <p className="text-lg font-black text-orange-700 italic leading-none">{total - pagados}</p>
          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Pendientes</p>
        </div>
        <div className="flex-1 bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-lg font-black text-slate-700 italic leading-none">{total}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Total</p>
        </div>
      </div>

      {/* Lista de convocados */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {conv.nadadores.map(n => (
          <div key={n._id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-black italic text-sm shrink-0">
              {n.user?.nombre?.charAt(0) || "?"}
            </div>

            {/* Nombre */}
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 uppercase italic text-[11px] truncate leading-none">
                {n.user?.nombre} {n.apellido}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{n.categoria}</p>
            </div>

            {/* Badge pago */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase shrink-0 ${
              n.pagoAlDia
                ? "bg-emerald-100 text-emerald-700"
                : "bg-orange-100 text-orange-600"
            }`}>
              {n.pagoAlDia
                ? <CheckCircle2 size={10} />
                : <XCircle size={10} />
              }
              <span className="hidden sm:inline">{n.pagoAlDia ? "Activa" : "Inactiva"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CalendarioProfesor = () => {
  const queryClient  = useQueryClient()
  const hoy          = new Date()

  const [mes,          setMes]          = useState(hoy.getMonth())
  const [año,          setAño]          = useState(hoy.getFullYear())
  const [expandidoId,  setExpandidoId]  = useState(null)  // id de la convocatoria expandida

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

  const irMesAnterior = () => {
    const nueva  = new Date(año, mes - 1, 1)
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    if (nueva < inicio) return
    if (mes === 0) { setMes(11); setAño(a => a - 1) } else setMes(m => m - 1)
  }

  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAño(a => a + 1) } else setMes(m => m + 1)
  }

  const esMesActual = mes === hoy.getMonth() && año === hoy.getFullYear()

  const diasDelMes = useMemo(() => {
    const primer  = new Date(año, mes, 1)
    const ultimo  = new Date(año, mes + 1, 0)
    const blancos = primer.getDay()
    const dias    = []
    for (let i = 0; i < blancos; i++) dias.push(null)
    for (let d = 1; d <= ultimo.getDate(); d++) dias.push(d)
    return dias
  }, [mes, año])

  const convocatoriasMes = useMemo(() =>
    convocatorias.filter(c => {
      const inicio  = new Date(c.fechaInicio)
      const fin     = new Date(c.fechaFin)
      const inicioM = new Date(año, mes, 1)
      const finM    = new Date(año, mes + 1, 0)
      return inicio <= finM && fin >= inicioM
    }),
    [convocatorias, mes, año]
  )

  const diasConEvento = useMemo(() => {
    const set = new Set()
    convocatoriasMes.forEach(c => {
      const inicio = new Date(c.fechaInicio)
      const fin    = new Date(c.fechaFin)
      const cur    = new Date(inicio)
      while (cur <= fin) {
        if (cur.getMonth() === mes && cur.getFullYear() === año) set.add(cur.getDate())
        cur.setDate(cur.getDate() + 1)
      }
    })
    return set
  }, [convocatoriasMes, mes, año])

  const toggleExpandido = (id) => {
    setExpandidoId(prev => prev === id ? null : id)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Gestión</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Calendario <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">de Eventos</span>
          </h1>
        </div>
        <Link
          to="/profesor/convocatoria/nueva"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} /> Nueva Convocatoria
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── CALENDARIO ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <button
              onClick={irMesAnterior}
              disabled={esMesActual}
              className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="font-black text-slate-900 uppercase italic text-sm">
              {MESES[mes]} {año}
            </h3>
            <button
              onClick={irMesSiguiente}
              className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {DIAS.map(d => (
                <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {diasDelMes.map((dia, i) => {
                const esHoy       = dia === hoy.getDate() && esMesActual
                const tieneEvento = dia && diasConEvento.has(dia)
                const esPasado    = dia && !esHoy && new Date(año, mes, dia) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

                return (
                  <div key={i} className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-black transition-all
                    ${!dia ? "" : esPasado ? "opacity-25 text-slate-500" : ""}
                    ${esHoy ? "bg-blue-600 text-white shadow-md" : ""}
                    ${tieneEvento && !esHoy ? "bg-green-50 text-green-700 ring-2 ring-green-300" : ""}
                    ${!tieneEvento && !esHoy && dia && !esPasado ? "hover:bg-slate-50 text-slate-700" : ""}
                  `}>
                    {dia && (
                      <>
                        <span>{dia}</span>
                        {tieneEvento && (
                          <div className={`w-1 h-1 rounded-full mt-0.5 ${esHoy ? "bg-white" : "bg-green-500"}`} />
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="px-4 pb-4 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-blue-600" /> Hoy
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-green-100 ring-2 ring-green-300" /> Evento
            </span>
          </div>
        </div>

        {/* ── LISTA DE CONVOCATORIAS ── */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
            Eventos en {MESES[mes]} — {convocatoriasMes.length} {convocatoriasMes.length === 1 ? "evento" : "eventos"}
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
          ) : convocatoriasMes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <Waves size={28} className="mx-auto text-slate-200 mb-3" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin convocatorias este mes</p>
              <Link
                to="/profesor/convocatoria/nueva"
                className="mt-3 inline-flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline"
              >
                <Plus size={12} /> Crear una
              </Link>
            </div>
          ) : (
            convocatoriasMes.map(c => {
              const inicio    = new Date(c.fechaInicio)
              const fin       = new Date(c.fechaFin)
              const dias      = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
              const enCurso   = inicio <= hoy && fin >= hoy
              const expandido = expandidoId === c._id

              return (
                <div
                  key={c._id}
                  className={`bg-white rounded-2xl border shadow-sm transition-all ${
                    expandido ? "border-blue-200 shadow-blue-100" : "border-slate-100 hover:shadow-md"
                  }`}
                >
                  {/* Cabecera de la convocatoria — clickeable */}
                  <button
                    onClick={() => toggleExpandido(c._id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Fecha */}
                      <div className={`shrink-0 w-12 text-center p-1.5 rounded-xl ${enCurso ? "bg-green-500 text-white" : "bg-blue-50 text-blue-700"}`}>
                        <p className="text-[9px] font-black uppercase">{inicio.toLocaleString("es-ES",{month:"short"})}</p>
                        <p className="text-xl font-black leading-none">{inicio.getDate()}</p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 uppercase italic text-sm tracking-tight truncate">
                            {c.nombre}
                          </h4>
                          {enCurso && (
                            <span className="text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase shrink-0">
                              En curso
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {c.lugar}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {dias} {dias === 1 ? "día" : "días"}</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {c.nadadores?.length || 0} convocados</span>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Eliminar */}
                        <div
                          onClick={e => {
                            e.stopPropagation()
                            if (confirm(`¿Eliminar "${c.nombre}"?`)) eliminarMutation.mutate(c._id)
                          }}
                          className="w-8 h-8 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </div>
                        {/* Expandir */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          expandido ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                        }`}>
                          {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Panel expandible con convocados */}
                  {expandido && (
                    <div className="px-4 pb-4">
                      <PanelConvocados convocatoriaId={c._id} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarioProfesor
