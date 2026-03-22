import { useState, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createPrueba, getPruebasPorCompetencia } from "../../api/pruebas.api"
import {
  Timer, Waves, Ruler, Plus, X, ArrowLeft,
  Loader2, Trophy, Activity, AlertCircle, Zap, Check
} from "lucide-react"

const ESTILOS   = ["Libre", "Espalda", "Pecho", "Mariposa", "Comb."]
const DISTANCIAS = [25, 50, 100, 200, 400, 800, 1500]

const tiempoAMs = (tiempoStr) => {
  if (!tiempoStr) return 0
  const regex = /^(?:(\d+):)?(\d+)(?:\.(\d+))?$/
  const match = tiempoStr.match(regex)
  if (!match) return 0
  return parseInt(match[1] || 0) * 60000
       + parseInt(match[2] || 0) * 1000
       + parseInt(match[3] || 0) * 10
}

const msATiempo = (ms) => {
  const min = Math.floor(ms / 60000)
  const seg = Math.floor((ms % 60000) / 1000)
  const cen = Math.floor((ms % 1000) / 10)
  const minStr = min > 0 ? `${min}:` : ""
  const segStr = seg < 10 && min > 0 ? `0${seg}` : seg
  const cenStr = cen < 10 ? `0${cen}` : cen
  return `${minStr}${segStr}.${cenStr}`
}

const CrearPrueba = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({ estilo: "", distancia: 50, tiempo: "", parciales: [] })
  const [nuevoParcial, setNuevoParcial] = useState("")

  const sumaParcialesMs = useMemo(() =>
    form.parciales.reduce((acc, p) => acc + tiempoAMs(p.tiempo), 0),
    [form.parciales]
  )

  const validacion = useMemo(() => {
    if (form.parciales.length === 0 || !form.tiempo) return { coincide: true }
    return { coincide: Math.abs(tiempoAMs(form.tiempo) - sumaParcialesMs) < 20 }
  }, [sumaParcialesMs, form.tiempo])

  const { data: competenciaData, isLoading: loadingComp } = useQuery({
    queryKey: ["competencia", id],
    queryFn: () => getPruebasPorCompetencia(id).then(res => res.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => createPrueba(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id])
      navigate(`/profesor/competencia/${id}/pruebas`)
    },
  })

  const agregarParcial = useCallback(() => {
    if (!nuevoParcial) return
    setForm(prev => ({
      ...prev,
      parciales: [...prev.parciales, { nroParcial: prev.parciales.length + 1, tiempo: nuevoParcial }]
    }))
    setNuevoParcial("")
  }, [nuevoParcial])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.estilo) return alert("Selecciona un estilo")
    if (!validacion.coincide && !window.confirm("La suma de parciales no coincide. ¿Guardar?")) return
    mutation.mutate({
      ...form,
      fecha: competenciaData?.competencia?.fecha || new Date().toISOString()
    })
  }

  if (loadingComp) return (
    <div className="flex flex-col h-[50vh] items-center justify-center gap-3">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cargando competencia...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4 animate-fade-in pb-8">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all font-black text-[11px] uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Volver a Pruebas
      </button>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">

        {/* Banner */}
        <div className="bg-[#0f172a] p-5 md:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black italic uppercase tracking-tighter">Nueva Marca</h1>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">Registro Técnico</p>
            </div>
          </div>
          <Activity size={18} className="text-slate-700" />
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-8">

          {/* ESTILOS */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Waves size={13} className="text-blue-500" /> Estilo
            </label>
            {/* FIX MOBILE: grid-cols-5 siempre — botones más pequeños pero legibles */}
            <div className="grid grid-cols-5 gap-1.5">
              {ESTILOS.map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setForm({ ...form, estilo: est })}
                  className={`py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase transition-all border-2 ${
                    form.estilo === est
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          {/* DISTANCIAS */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Ruler size={13} className="text-emerald-500" /> Distancia
            </label>
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {DISTANCIAS.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setForm({ ...form, distancia: dist })}
                  className={`shrink-0 min-w-[58px] py-3 rounded-xl text-[11px] font-black transition-all border-2 ${
                    form.distancia === dist
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  {dist}m
                </button>
              ))}
            </div>
          </div>

          {/* CRONÓMETRO — FIX MOBILE: text más pequeño en mobile */}
          <div className="flex flex-col items-center gap-3 py-6 bg-slate-50 rounded-2xl border border-slate-100 relative">
            <div className="absolute top-3 left-4 flex items-center gap-1.5 opacity-30">
              <Timer size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">Tiempo Final</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0:00.00"
              value={form.tiempo}
              onChange={(e) => setForm({ ...form, tiempo: e.target.value.replace(/[^0-9:.]/g, "") })}
              required
              className={`w-full bg-transparent text-5xl md:text-7xl font-black text-center tracking-tighter outline-none tabular-nums ${
                !validacion.coincide ? "text-orange-500" : "text-slate-900"
              }`}
            />
            {sumaParcialesMs > 0 && (
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, tiempo: msATiempo(sumaParcialesMs) }))}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-full shadow-md shadow-emerald-200 active:scale-95 transition-transform"
              >
                <Zap size={12} fill="currentColor" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Usar Suma: {msATiempo(sumaParcialesMs)}
                </span>
              </button>
            )}
          </div>

          {/* PARCIALES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Parciales (Laps)</h3>
              {!validacion.coincide && <AlertCircle size={15} className="text-orange-500 animate-pulse" />}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="00.00"
                value={nuevoParcial}
                onChange={(e) => setNuevoParcial(e.target.value.replace(/[^0-9:.]/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarParcial() } }}
                className="flex-1 h-12 px-4 bg-slate-100 rounded-xl text-base font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white border-2 border-transparent focus:border-blue-200 transition-all"
              />
              <button
                type="button"
                onClick={agregarParcial}
                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>

            {form.parciales.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {form.parciales.map((p, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase italic">L{p.nroParcial}</span>
                      <span className="text-sm font-black tabular-nums">{p.tiempo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        parciales: prev.parciales
                          .filter((_, i) => i !== idx)
                          .map((p, i) => ({ ...p, nroParcial: i + 1 }))
                      }))}
                      className="text-slate-300 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-blue-600 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.25em] transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-[0.97]"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
            Guardar Marca
          </button>
        </form>
      </div>
    </div>
  )
}

export default CrearPrueba
