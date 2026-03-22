// ═══════════════════════════════════════════════════
// CalendarioProfesor.jsx — vista del profesor con
// convocatorias creadas y acceso a crear nuevas
// ═══════════════════════════════════════════════════
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import api from "../../api/axios"
import {
  Calendar, Plus, MapPin, Clock, Eye, Trash2,
  Loader2, ChevronLeft, ChevronRight, Waves,
  CheckCircle2, XCircle, Users
} from "lucide-react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

const CalendarioProfesor = () => {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const hoy         = new Date()

  const [mes,  setMes]  = useState(hoy.getMonth())
  const [año,  setAño]  = useState(hoy.getFullYear())

  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ["convocatorias"],
    queryFn:  () => api.get("/convocatorias").then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/convocatorias/${id}`),
    onSuccess:  () => queryClient.invalidateQueries(["convocatorias"])
  })

  const irMesAnterior = () => {
    const nueva   = new Date(año, mes - 1, 1)
    const inicio  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
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
      const inicio   = new Date(c.fechaInicio)
      const fin      = new Date(c.fechaFin)
      const inicioM  = new Date(año, mes, 1)
      const finM     = new Date(año, mes + 1, 0)
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

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8 animate-fade-in">

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

        {/* Calendario */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
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
              {DIAS.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">{d}</div>)}
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
                    ${!tieneEvento && !esHoy && dia && !esPasado ? "hover:bg-slate-50 text-slate-700 cursor-default" : ""}
                  `}>
                    {dia && (
                      <>
                        <span>{dia}</span>
                        {tieneEvento && <div className={`w-1 h-1 rounded-full mt-0.5 ${esHoy ? "bg-white" : "bg-green-500"}`} />}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leyenda */}
          <div className="px-4 pb-4 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-blue-600" /> Hoy</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-green-100 ring-2 ring-green-300" /> Evento</span>
          </div>
        </div>

        {/* Lista de convocatorias del mes */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
            Eventos en {MESES[mes]} — {convocatoriasMes.length} {convocatoriasMes.length === 1 ? "evento" : "eventos"}
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={28} /></div>
          ) : convocatoriasMes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <Waves size={28} className="mx-auto text-slate-200 mb-3" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin convocatorias este mes</p>
              <Link to="/profesor/convocatoria/nueva" className="mt-3 inline-flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline">
                <Plus size={12} /> Crear una
              </Link>
            </div>
          ) : convocatoriasMes.map(c => {
            const inicio  = new Date(c.fechaInicio)
            const fin     = new Date(c.fechaFin)
            const dias    = Math.ceil((fin - inicio) / (1000*60*60*24)) + 1
            const enCurso = inicio <= hoy && fin >= hoy

            return (
              <div key={c._id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  {/* Fecha inicio */}
                  <div className={`shrink-0 w-12 text-center p-1.5 rounded-xl ${enCurso ? "bg-green-500 text-white" : "bg-blue-50 text-blue-700"}`}>
                    <p className="text-[9px] font-black uppercase">{inicio.toLocaleString("es-ES",{month:"short"})}</p>
                    <p className="text-xl font-black leading-none">{inicio.getDate()}</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-black text-slate-900 uppercase italic text-sm tracking-tight truncate">{c.nombre}</h4>
                      {enCurso && <span className="text-[9px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase shrink-0">En curso</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {c.lugar}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {dias} días</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {c.nadadores?.length || 0} convocados</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <Link
                      to={`/profesor/convocatoria/${c._id}`}
                      className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all"
                      title="Ver detalle"
                    >
                      <Eye size={14} />
                    </Link>
                    <button
                      onClick={() => { if(confirm(`¿Eliminar "${c.nombre}"?`)) eliminarMutation.mutate(c._id) }}
                      className="w-8 h-8 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarioProfesor
