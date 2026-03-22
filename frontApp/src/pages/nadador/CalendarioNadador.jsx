// ═══════════════════════════════════════════════════
// CalendarioNadador.jsx — vista mes a mes del nadador
// ═══════════════════════════════════════════════════
import { useState, useMemo } from "react"
import { useQuery }          from "@tanstack/react-query"
import api                   from "../../api/axios"
import { useAuth }           from "../../context/AuthContext"
import { PERFIL_QUERY_KEY }  from "../../layouts/NadadorLayout"
import {
  Calendar, ChevronLeft, ChevronRight,
  MapPin, Clock, Loader2, Waves
} from "lucide-react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

export const CalendarioNadador = () => {
  const { user } = useAuth()
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(hoy.getMonth())
  const [añoActual, setAñoActual] = useState(hoy.getFullYear())

  const { data: perfil } = useQuery({
    queryKey: PERFIL_QUERY_KEY,
    queryFn:  () => api.get("/nadadores/perfil").then(r => r.data),
    enabled:  !!user
  })

  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ["misConvocatorias"],
    queryFn:  () => api.get("/convocatorias/mis-convocatorias").then(r => r.data),
    enabled:  !!user,
    staleTime: 1000 * 60 * 5,
  })

  // Navegar meses — no permitir ir al pasado
  const irMesAnterior = () => {
    const nuevaFecha = new Date(añoActual, mesActual - 1, 1)
    const hoyInicio  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    if (nuevaFecha < hoyInicio) return
    if (mesActual === 0) { setMesActual(11); setAñoActual(a => a - 1) }
    else setMesActual(m => m - 1)
  }

  const irMesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAñoActual(a => a + 1) }
    else setMesActual(m => m + 1)
  }

  const esMesActual = mesActual === hoy.getMonth() && añoActual === hoy.getFullYear()

  // Días del mes
  const diasDelMes = useMemo(() => {
    const primer   = new Date(añoActual, mesActual, 1)
    const ultimo   = new Date(añoActual, mesActual + 1, 0)
    const diasVac  = primer.getDay() // días en blanco al inicio
    const dias     = []

    for (let i = 0; i < diasVac; i++) dias.push(null)
    for (let d = 1; d <= ultimo.getDate(); d++) dias.push(d)
    return dias
  }, [mesActual, añoActual])

  // Convocatorias del mes actual mostrado
  const convocatoriasMes = useMemo(() =>
    convocatorias.filter(c => {
      const inicio = new Date(c.fechaInicio)
      const fin    = new Date(c.fechaFin)
      const mesMostrado = new Date(añoActual, mesActual, 1)
      const finMes      = new Date(añoActual, mesActual + 1, 0)
      return inicio <= finMes && fin >= mesMostrado
    }),
    [convocatorias, mesActual, añoActual]
  )

  // Qué días tienen convocatoria
  const diasConEvento = useMemo(() => {
    const set = new Set()
    convocatoriasMes.forEach(c => {
      const inicio = new Date(c.fechaInicio)
      const fin    = new Date(c.fechaFin)
      const cur    = new Date(inicio)
      while (cur <= fin) {
        if (cur.getMonth() === mesActual && cur.getFullYear() === añoActual) {
          set.add(cur.getDate())
        }
        cur.setDate(cur.getDate() + 1)
      }
    })
    return set
  }, [convocatoriasMes, mesActual, añoActual])

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8 animate-fade-in">

      <div>
        <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Mis Convocatorias</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
          Calendario <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">de Eventos</span>
        </h1>
      </div>

      {/* Navegación mes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header del calendario */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button
            onClick={irMesAnterior}
            disabled={esMesActual}
            className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-black text-slate-900 uppercase italic tracking-tight text-lg">
            {MESES[mesActual]} {añoActual}
          </h2>
          <button
            onClick={irMesSiguiente}
            className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Grilla de días */}
        <div className="p-4">
          {/* Encabezado días */}
          <div className="grid grid-cols-7 mb-2">
            {DIAS.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-2">{d}</div>
            ))}
          </div>
          {/* Días */}
          <div className="grid grid-cols-7 gap-1">
            {diasDelMes.map((dia, i) => {
              const esHoy    = dia === hoy.getDate() && esMesActual
              const tieneEvento = dia && diasConEvento.has(dia)
              const esPasado = dia && new Date(añoActual, mesActual, dia) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

              return (
                <div
                  key={i}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-black transition-all relative
                    ${!dia ? "" : esPasado && !esHoy ? "opacity-30" : ""}
                    ${esHoy ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : ""}
                    ${tieneEvento && !esHoy ? "bg-green-50 text-green-700 ring-2 ring-green-200" : ""}
                    ${!tieneEvento && !esHoy && dia ? "hover:bg-slate-50 text-slate-700" : ""}
                  `}
                >
                  {dia && (
                    <>
                      <span>{dia}</span>
                      {tieneEvento && (
                        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${esHoy ? "bg-white" : "bg-green-500"}`} />
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de convocatorias del mes */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Eventos en {MESES[mesActual]}
        </h3>

        {convocatoriasMes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <Waves size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin convocatorias este mes</p>
          </div>
        ) : (
          convocatoriasMes.map(c => <ConvocatoriaCard key={c._id} convocatoria={c} />)
        )}
      </div>
    </div>
  )
}

const ConvocatoriaCard = ({ convocatoria }) => {
  const inicio   = new Date(convocatoria.fechaInicio)
  const fin      = new Date(convocatoria.fechaFin)
  const dias     = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
  const hoy      = new Date()
  const enCurso  = inicio <= hoy && fin >= hoy
  const proxima  = inicio > hoy

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
      enCurso ? "border-green-200 bg-green-50/30" : "border-slate-100"
    }`}>
      <div className="flex items-start gap-4">
        {/* Fecha */}
        <div className={`shrink-0 w-14 text-center p-2 rounded-xl ${enCurso ? "bg-green-500 text-white" : "bg-blue-50 text-blue-700"}`}>
          <p className="text-[10px] font-black uppercase">{inicio.toLocaleString("es-ES",{month:"short"})}</p>
          <p className="text-2xl font-black leading-none">{inicio.getDate()}</p>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{convocatoria.nombre}</h4>
            {enCurso && (
              <span className="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded-full uppercase">En curso</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={11} /> {convocatoria.lugar}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {dias} {dias === 1 ? "día" : "días"}</span>
          </div>
          {convocatoria.descripcion && (
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{convocatoria.descripcion}</p>
          )}
          {/* Fecha fin */}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-2">
            Hasta el {fin.toLocaleDateString("es-ES",{day:"2-digit",month:"long"})}
          </p>
        </div>

        {/* Días restantes */}
        {proxima && (
          <div className="shrink-0 text-center">
            <p className="text-2xl font-black text-blue-600 italic">
              {Math.ceil((inicio - new Date()) / (1000*60*60*24))}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase">días</p>
          </div>
        )}
      </div>
    </div>
  )
}
