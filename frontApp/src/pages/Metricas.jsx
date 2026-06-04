// Metricas.jsx
// Componente universal: si recibe prop `esProfesor`, muestra selector de nadador.
// El nadador solo ve sus propias métricas.
// Rutas sugeridas:
//   /nadador/metricas       → <Metricas />
//   /profesor/metricas      → <Metricas esProfesor />

import { useState, useMemo } from "react"
import { useQuery }           from "@tanstack/react-query"
import api                    from "../api/axios"
import { getNadadores }       from "../api/profesor.api"
import { useAuth }            from "../context/AuthContext"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts"
import {
  TrendingUp, TrendingDown, Minus,
  ChevronDown, Loader2, Waves,
  Trophy, Target, Activity, Filter
} from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────

/** Convierte segundos numéricos a string mm:ss.cc */
const formatTiempo = (seg) => {
  if (!seg && seg !== 0) return "--"
  const min = Math.floor(seg / 60)
  const resto = (seg % 60).toFixed(2).padStart(5, "0")
  return min > 0 ? `${min}:${resto}` : `${Number(resto).toFixed(2)}`
}

const parsearSegundos = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  
  // Si viene como objeto { tiempoNumerico: 30.5 } o { tiempo: "00:30.50" }
  if (typeof val === "object") {
    if (val.tiempoNumerico !== undefined) return Number(val.tiempoNumerico);
    if (val.tiempo) return parsearSegundos(val.tiempo); // recursividad para parsear el string
    return 0;
  }
  
  // Si es un string tipo "01:15.20"
  const str = String(val);
  if (str.includes(":")) {
    const partes = str.split(":");
    return (Number(partes[0]) * 60) + Number(partes[1]);
  }
  
  // Si es un string tipo "30.50"
  return Number(str) || 0;
}

/** Tooltip personalizado para el gráfico de evolución */
const TooltipEvolucion = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-2xl border border-slate-700 text-[11px]">
      <p className="font-black uppercase tracking-wider mb-1 text-slate-400">{label}</p>
      <p className="font-black text-blue-400">{formatTiempo(payload[0]?.value)}</p>
      {payload[0]?.payload?.esRecordPersonal && (
        <p className="text-emerald-400 font-black mt-1">🏆 Récord Personal</p>
      )}
    </div>
  )
}

/** Tooltip para gráfico de parciales */
const TooltipParciales = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-2xl border border-slate-700 text-[11px]">
      <p className="font-black uppercase tracking-wider mb-1 text-slate-400">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-black">
          {p.name}: {formatTiempo(p.value)}
        </p>
      ))}
    </div>
  )
}

// ── Selector de nadador (solo profesor) ──────────────────────────────
const SelectorNadador = ({ value, onChange }) => {
  const { data: res } = useQuery({
    queryKey: ["nadadores-metricas"],
    queryFn:  () => getNadadores({}),
    staleTime: 1000 * 60 * 5,
  })
  const nadadores = res?.data || []

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 pr-10 font-black text-[11px] text-slate-700 uppercase tracking-wider focus:border-blue-600 outline-none transition-all"
      >
        <option value="">Seleccionar atleta...</option>
        {nadadores.map(n => (
          <option key={n._id} value={n._id}>
            {n.user?.nombre} {n.apellido} — {n.categoria}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ── Tarjeta de stat resumida ─────────────────────────────────────────
const StatResumen = ({ label, value, sub, trend }) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-slate-400"
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-xl font-black text-slate-900 italic">{value}</p>
        {trend && <TrendIcon size={14} className={`${trendColor} mb-0.5 shrink-0`} />}
      </div>
      {sub && <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────
const Metricas = ({ esProfesor = false }) => {
  const { user }   = useAuth()

  // Selectors
  const [nadadorId,   setNadadorId]   = useState("")
  const [estilo,      setEstilo]      = useState("")
  const [distancia,   setDistancia]   = useState("")
  const [piscina,     setPiscina]     = useState("")      // "" = ambas, "25", "50"
  const [periodo,     setPeriodo]     = useState("año")   // "mes", "3meses", "año", "todo"
  const [granParcial, setGranParcial] = useState(50)      // 50 o 100 metros
  const [compA,       setCompA]       = useState("")      // para comparar parciales
  const [compB,       setCompB]       = useState("")

  // Para nadador: obtener su nadadorId automáticamente
  const { data: miPerfil } = useQuery({
    queryKey: ["miPerfilNadador"],
    queryFn:  () => api.get("/nadadores/perfil").then(r => r.data),
    enabled:  !esProfesor,
    staleTime: 1000 * 60 * 10,
  })
  const idEfectivo = esProfesor ? nadadorId : (miPerfil?._id || "")

  // Pruebas disponibles del nadador seleccionado
  const { data: pruebasDisponibles = [], isLoading: loadingDisp } = useQuery({
    queryKey: ["pruebasDisponibles", idEfectivo],
    queryFn:  () => api.get(`/pruebas/disponibles/${idEfectivo}`).then(r => r.data),
    enabled:  !!idEfectivo,
    staleTime: 1000 * 60 * 5,
  })

  // El aggregate devuelve [{ _id: { estilo, distancia } }] — normalizar
  const pruebasNorm = useMemo(() =>
    pruebasDisponibles.map(p => ({
      estilo:    p._id?.estilo    || p.estilo,
      distancia: p._id?.distancia || p.distancia
    })),
    [pruebasDisponibles]
  )

  // Estilos únicos disponibles
  const estilosUnicos = useMemo(() =>
    [...new Set(pruebasNorm.map(p => p.estilo))].filter(Boolean).sort(),
    [pruebasNorm]
  )

  // Distancias disponibles para el estilo seleccionado
  const distanciasUnicas = useMemo(() =>
    [...new Set(
      pruebasNorm
        .filter(p => !estilo || p.estilo === estilo)
        .map(p => p.distancia)
    )].filter(Boolean).sort((a, b) => a - b),
    [pruebasNorm, estilo]
  )

  // Query principal: ranking individual con todos los filtros
  const { data: pruebas = [], isLoading: loadingPruebas } = useQuery({
    queryKey: ["metricas", idEfectivo, estilo, distancia, piscina],
    queryFn:  () => api.get(`/pruebas/ranking/${idEfectivo}`, {
      params: {
        estilo,
        distancia,
        orden: "asc",
        ...(piscina && { piscina })
      }
    }).then(r => r.data),
    enabled: !!idEfectivo && !!estilo && !!distancia,
    staleTime: 1000 * 60 * 2,
  })

  // Filtrar por período
  const pruebasFiltradas = useMemo(() => {
    if (!pruebas.length) return []
    const ahora = new Date()
    const corte = {
      mes:     new Date(ahora.getFullYear(), ahora.getMonth() - 1,   ahora.getDate()),
      "3meses":new Date(ahora.getFullYear(), ahora.getMonth() - 3,   ahora.getDate()),
      año:     new Date(ahora.getFullYear() - 1, ahora.getMonth(),   ahora.getDate()),
      todo:    new Date(2000, 0, 1)
    }[periodo]

    return pruebas.filter(p => new Date(p.competencia?.fecha) >= corte)
  }, [pruebas, periodo])

  // Datos para gráfico de evolución (ordenados por fecha)
  const datosEvolucion = useMemo(() =>
    [...pruebasFiltradas]
      .sort((a, b) => new Date(a.competencia?.fecha) - new Date(b.competencia?.fecha))
      .map(p => ({
        nombre: p.competencia?.nombre
          ? p.competencia.nombre.slice(0, 20) + (p.competencia.nombre.length > 20 ? "…" : "")
          : "—",
        fecha: p.competencia?.fecha
          ? new Date(p.competencia.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })
          : "—",
        tiempo:     p.tiempoNumerico,
        esRecordPersonal: p.esRecordPersonal,
        _id:        p._id,
        piscina:    p.competencia?.piscina || "—"
      })),
    [pruebasFiltradas]
  )

  // Competencias únicas disponibles para el selector de comparación
  const competenciasUnicas = useMemo(() =>
    pruebasFiltradas.map(p => ({
      id:     p._id,
      label:  `${p.competencia?.nombre?.slice(0, 25) || "—"} (${
        p.competencia?.fecha
          ? new Date(p.competencia.fecha).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"2-digit"})
          : "—"
      }) — ${formatTiempo(p.tiempoNumerico)}`
    })),
    [pruebasFiltradas]
  )

  // Función para agrupar parciales según granularidad (50m ó 100m)
  const agruparParciales = (parciales = [], distTotal, granMetros) => {
    if (!parciales?.length) return []
    const resultado = []

    const distItem = Number(distTotal) / parciales.length

    let acum = 0
    let tiempoAcum = 0
    let porcion = 0

    for (const p of parciales) {
      // Usamos el nuevo helper para obtener siempre un número válido
      const valorTiempo = parsearSegundos(p);

      tiempoAcum += valorTiempo
      porcion += distItem
      acum += distItem

      // Usamos Math.round(porcion) para evitar errores de precisión flotante (ej: 49.9999 >= 50)
      if (Math.round(porcion) >= granMetros) {
        resultado.push({
          metros: `${Math.round(acum)}m`, 
          tiempo: tiempoAcum
        })
        tiempoAcum = 0
        porcion = 0
      }
    }
    return resultado
  }

  // Datos para gráfico de parciales (una o dos series)
  const obtenerDatosParciales = (pruebaId) =>
    pruebasFiltradas.find(p => p._id === pruebaId)

  const pruebaA = compA 
  ? obtenerDatosParciales(compA) 
  : [...pruebasFiltradas].sort((a, b) => new Date(b.competencia?.fecha) - new Date(a.competencia?.fecha))[0]
  const pruebaB = compB ? obtenerDatosParciales(compB) : null

  const datosParciales = useMemo(() => {
    if (!pruebaA?.parciales?.length) return []

    const parsecsA = agruparParciales(pruebaA?.parciales, Number(distancia), granParcial)
    const parsecsB = pruebaB?.parciales?.length
      ? agruparParciales(pruebaB.parciales, Number(distancia), granParcial)
      : []

    return parsecsA.map((item, i) => ({
      metros: item.metros,
      A:      item.tiempo,
      B:      parsecsB[i]?.tiempo ?? null,
    }))
  }, [pruebaA, pruebaB, granParcial, distancia])

  // Stats resumen
  const stats = useMemo(() => {
    if (!pruebasFiltradas.length) return null
    const tiempos = pruebasFiltradas.map(p => p.tiempoNumerico).filter(Boolean)
    console.log(tiempos)
    const mejor   = Math.min(...tiempos)
    const peor    = Math.max(...tiempos)
    const prom    = tiempos.reduce((a, b) => a + b, 0) / tiempos.length
    const primero = tiempos[0]
    const ultimo  = tiempos[tiempos.length - 1]
    const mejora  = ultimo - primero  // positivo = mejoró
    return {
      mejor:  formatTiempo(mejor),
      peor:   formatTiempo(peor),
      prom:   formatTiempo(prom),
      mejora: mejora > 0 ? `+${formatTiempo(Math.abs(mejora))}` : mejora < 0 ? `-${formatTiempo(mejora)}` : "=",
      trend:  mejora > 0 ? "up" : mejora < 0 ? "down" : null,
      total:  tiempos.length,
    }
  }, [pruebasFiltradas])

  const listo = !!idEfectivo && !!estilo && !!distancia

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 p-4 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">
            Análisis de Rendimiento
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Métricas <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              {esProfesor ? "del Plantel" : "Personales"}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Activity size={14} className="text-blue-600" />
          {listo && stats ? `${stats.total} marcas analizadas` : "Configura los filtros"}
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Filter size={13} className="text-blue-600" /> Configuración
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Selector nadador — solo profesor */}
          {esProfesor && (
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
                Atleta
              </label>
              <SelectorNadador value={nadadorId} onChange={(id) => {
                setNadadorId(id)
                setEstilo("")
                setDistancia("")
                setCompA("")
                setCompB("")
              }} />
            </div>
          )}

          {/* Estilo */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
              Estilo
            </label>
            <div className="relative">
              <select
                value={estilo}
                onChange={e => { setEstilo(e.target.value); setDistancia(""); setCompA(""); setCompB("") }}
                disabled={!idEfectivo || loadingDisp}
                className="w-full appearance-none bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 pr-10 font-black text-[11px] text-slate-700 uppercase tracking-wider focus:border-blue-600 outline-none transition-all disabled:opacity-40"
              >
                <option value="">
                  {loadingDisp ? "Cargando..." : !idEfectivo ? "Primero elige atleta" : "Seleccionar estilo..."}
                </option>
                {estilosUnicos.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Distancia */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
              Distancia
            </label>
            <div className="relative">
              <select
                value={distancia}
                onChange={e => { setDistancia(e.target.value); setCompA(""); setCompB("") }}
                disabled={!estilo}
                className="w-full appearance-none bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 pr-10 font-black text-[11px] text-slate-700 uppercase tracking-wider focus:border-blue-600 outline-none transition-all disabled:opacity-40"
              >
                <option value="">Seleccionar distancia...</option>
                {distanciasUnicas.map(d => (
                  <option key={d} value={d}>{d}m</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Piscina */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
              Piscina
            </label>
            <div className="flex gap-2">
              {[["", "Ambas"], ["25", "25m"], ["50", "50m"]].map(([val, label]) => (
                <button key={val} onClick={() => setPiscina(val)}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${
                    piscina === val
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Período */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
            Período
          </label>
          <div className="flex flex-wrap gap-2">
            {[["mes","Último mes"],["3meses","3 meses"],["año","1 año"],["todo","Todo"]].map(([val, label]) => (
              <button key={val} onClick={() => setPeriodo(val)}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${
                  periodo === val
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ESTADO: sin configurar */}
      {!listo && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Waves size={36} className="mx-auto text-slate-200 mb-4" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-[11px]">
            {!idEfectivo
              ? esProfesor ? "Selecciona un atleta para comenzar" : "Cargando perfil..."
              : !estilo ? "Selecciona un estilo" : "Selecciona una distancia"
            }
          </p>
        </div>
      )}

      {/* ESTADO: cargando */}
      {listo && loadingPruebas && (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Calculando métricas...</p>
          </div>
        </div>
      )}

      {/* ESTADO: sin datos */}
      {listo && !loadingPruebas && pruebasFiltradas.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Trophy size={36} className="mx-auto text-slate-200 mb-4" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-[11px] mb-2">
            Sin marcas para esta configuración
          </p>
          <p className="text-[10px] font-bold text-slate-300 uppercase">
            Prueba con otro período o piscina
          </p>
        </div>
      )}

      {/* DATOS DISPONIBLES */}
      {listo && !loadingPruebas && pruebasFiltradas.length > 0 && (
        <>
          {/* STATS RESUMEN */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatResumen
              label="Mejor Marca"
              value={stats?.mejor}
              sub={`${distancia}m ${estilo}`}
              trend="up"
            />
            <StatResumen
              label="Tiempo Promedio"
              value={stats?.prom}
              sub={`${stats?.total} competencias`}
            />
            <StatResumen
              label="Evolución"
              value={stats?.mejora}
              sub={stats?.trend === "up" ? "Ha mejorado" : stats?.trend === "down" ? "Ha empeorado" : "Sin cambio"}
              trend={stats?.trend}
            />
            <StatResumen
              label="Peor Marca"
              value={stats?.peor}
              sub="en el período"
            />
          </div>

          {/* GRÁFICO 1: EVOLUCIÓN TEMPORAL */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-base flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  Evolución de Tiempos
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {estilo} {distancia}m · {piscina ? `Piscina ${piscina}m` : "Ambas piscinas"}
                </p>
              </div>
              {/* leyenda récord */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Récord personal
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={datosEvolucion} margin={{ top: 8, right: 16, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8", textTransform: "uppercase" }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  height={52}
                />
                <YAxis
                  tickFormatter={formatTiempo}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                  width={52}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<TooltipEvolucion />} />
                {/* Punto verde para récord personal */}
                <Line
                  type="monotone"
                  dataKey="tiempo"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        key={payload._id}
                        cx={cx} cy={cy} r={payload.esRecordPersonal ? 7 : 4}
                        fill={payload.esRecordPersonal ? "#10b981" : "#2563eb"}
                        stroke="white"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 8, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* GRÁFICO 2: ANÁLISIS DE PARCIALES */}
          {pruebaA?.parciales?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-base flex items-center gap-2">
                      <Activity size={16} className="text-green-600" />
                      Análisis de Parciales
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Tiempo por tramo · granularidad cada {granParcial}m
                    </p>
                  </div>
                  {/* Granularidad */}
                  <div className="flex gap-2">
                    {[50, 100].map(g => (
                      <button key={g} onClick={() => setGranParcial(g)}
                        className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${
                          granParcial === g
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-slate-100 text-slate-500 hover:border-green-200"
                        }`}
                      >
                        Cada {g}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selectores de competencias a comparar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 mr-1.5" />
                      Competencia A (base)
                    </label>
                    <div className="relative">
                      <select
                        value={compA}
                        onChange={e => setCompA(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border-2 border-blue-100 rounded-xl px-3 py-2.5 pr-8 font-bold text-[10px] text-slate-700 uppercase focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="">Última marca</option>
                        {competenciasUnicas.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 mr-1.5" />
                      Competencia B (comparar)
                    </label>
                    <div className="relative">
                      <select
                        value={compB}
                        onChange={e => setCompB(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border-2 border-orange-100 rounded-xl px-3 py-2.5 pr-8 font-bold text-[10px] text-slate-700 uppercase focus:border-orange-400 outline-none transition-all"
                      >
                        <option value="">Sin comparar</option>
                        {competenciasUnicas
                          .filter(c => c.id !== compA)
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))
                        }
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {datosParciales.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={datosParciales} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="metros"
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tickFormatter={formatTiempo}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                      width={52}
                      domain={[(dataMin) => Math.max(0, dataMin - 2), "auto"]}
                    />
                    <Tooltip content={<TooltipParciales />} />
                    {pruebaB && <Legend
                      formatter={(val) => val === "A"
                        ? (compA ? "Comp. A" : "Última marca")
                        : "Comp. B"
                      }
                      wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}
                    />}
                    <Bar dataKey="A" name="A" fill="#2563eb" radius={[4,4,0,0]} maxBarSize={40} />
                    {pruebaB && (
                      <Bar dataKey="B" name="B" fill="#fb923c" radius={[4,4,0,0]} maxBarSize={40} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <Target size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Sin parciales registrados para esta marca
                  </p>
                </div>
              )}

              {/* Tabla de parciales debajo del gráfico */}
              {datosParciales.length > 0 && (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-[10px] font-black uppercase">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-slate-400 tracking-widest">Tramo</th>
                        <th className="text-center py-2 px-3 text-blue-600 tracking-widest">
                          {compA ? "Comp. A" : "Última"}
                        </th>
                        {pruebaB && (
                          <th className="text-center py-2 px-3 text-orange-500 tracking-widest">Comp. B</th>
                        )}
                        {pruebaB && (
                          <th className="text-center py-2 px-3 text-slate-400 tracking-widest">Diferencia</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {datosParciales.map((row, i) => {
                        const diff = row.B != null ? row.A - row.B : null
                        return (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 text-slate-500">{row.metros}</td>
                            <td className="py-2 px-3 text-center font-black text-slate-900">
                              {formatTiempo(row.A)}
                            </td>
                            {pruebaB && (
                              <td className="py-2 px-3 text-center font-black text-slate-900">
                                {row.B != null ? formatTiempo(row.B) : "—"}
                              </td>
                            )}
                            {pruebaB && (
                              <td className={`py-2 px-3 text-center font-black ${
                                diff === null ? "text-slate-400"
                                : diff < 0 ? "text-emerald-600"
                                : diff > 0 ? "text-red-500"
                                : "text-slate-400"
                              }`}>
                                {diff === null ? "—"
                                  : diff === 0 ? "="
                                  : `${diff < 0 ? "-" : "+"}${formatTiempo(Math.abs(diff))}`
                                }
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Metricas
