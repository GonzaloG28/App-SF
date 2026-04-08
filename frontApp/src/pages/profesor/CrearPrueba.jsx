import { useState, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createPrueba, getPruebasPorCompetencia } from "../../api/pruebas.api"
import {
  Timer, Waves, Ruler, Plus, X, ArrowLeft,
  Loader2, Trophy, Activity, AlertCircle, Zap, Check
} from "lucide-react"

const ESTILOS = ["Libre", "Espalda", "Pecho", "Mariposa", "Comb."]
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
    <div className="flex flex-col h-[60vh] items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Preparando Cronómetro</p>
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-2 sm:p-4 animate-fade-in pb-20 overflow-x-hidden">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all font-black text-[10px] sm:text-[11px] uppercase tracking-widest ml-2"
      >
        <ArrowLeft size={14} /> Regresar
      </button>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden mx-1">

        {/* Header Compacto */}
        <div className="bg-[#0f172a] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black italic uppercase tracking-tighter leading-none">Nueva Marca</h1>
              <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1">Registro de Campo</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-7">

          {/* ESTILOS - Gap reducido y texto que no rompe */}
          <div className="space-y-3">
            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Waves size={13} className="text-blue-500" /> Estilo
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {ESTILOS.map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setForm({ ...form, estilo: est })}
                  className={`py-3 px-0.5 rounded-xl text-[9px] sm:text-[11px] font-black uppercase transition-all border-2 text-center ${
                    form.estilo === est
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                      : "bg-slate-50 border-transparent text-slate-400"
                  }`}
                >
                  {est === "comb." ? "IM" : est}
                </button>
              ))}
            </div>
          </div>

          {/* DISTANCIAS - Scroll corregido */}
          <div className="space-y-3">
            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Ruler size={13} className="text-emerald-500" /> Distancia
            </label>
            <div className="flex overflow-x-auto pb-2 gap-2 snap-x no-scrollbar -mx-1 px-1">
              {DISTANCIAS.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setForm({ ...form, distancia: dist })}
                  className={`snap-start shrink-0 min-w-[60px] sm:min-w-[80px] py-3 rounded-xl text-[11px] font-black transition-all border-2 ${
                    form.distancia === dist
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  {dist}m
                </button>
              ))}
            </div>
          </div>

          {/* TIEMPO FINAL - Texto fluido para no salirse */}
          <div className="flex flex-col items-center gap-2 py-6 sm:py-8 bg-slate-50 rounded-3xl border border-slate-100 relative">
            <div className="absolute top-3 w-full flex justify-center items-center gap-1.5 opacity-40">
              <Timer size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest text-center">Tiempo Final</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0:00.00"
              value={form.tiempo}
              onChange={(e) => setForm({ ...form, tiempo: e.target.value.replace(/[^0-9:.]/g, "") })}
              required
              className={`w-full bg-transparent text-[15vw] sm:text-7xl font-black text-center tracking-tighter outline-none tabular-nums leading-none px-2 ${
                !validacion.coincide ? "text-orange-500" : "text-slate-900"
              }`}
            />
            {sumaParcialesMs > 0 && (
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, tiempo: msATiempo(sumaParcialesMs) }))}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-100 active:scale-95 transition-all mt-2 max-w-[90%]"
              >
                <Zap size={12} fill="currentColor" className="shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate">
                  Suma: {msATiempo(sumaParcialesMs)}
                </span>
              </button>
            )}
          </div>

          {/* PARCIALES - REESTRUCTURADO PARA NO SALIRSE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Desglose de Laps</h3>
              {!validacion.coincide && <AlertCircle size={14} className="text-orange-500" />}
            </div>

            {/* Input Group - El botón ya no empuja hacia afuera */}
            <div className="flex w-full items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Tiempo Lap"
                  value={nuevoParcial}
                  onChange={(e) => setNuevoParcial(e.target.value.replace(/[^0-9:.]/g, ""))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarParcial() } }}
                  className="w-full h-14 pl-5 pr-2 bg-slate-50 rounded-2xl text-base font-black outline-none border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={agregarParcial}
                className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-blue-100 shrink-0"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Grid de resultados corregido */}
            {form.parciales.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {form.parciales.map((p, idx) => (
                  <div key={idx} className="bg-white p-3 sm:p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm min-w-0">
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="text-[8px] sm:text-[9px] font-black text-blue-500 uppercase italic">L{p.nroParcial}</span>
                      <span className="text-sm sm:text-base font-black tabular-nums text-slate-800 truncate">{p.tiempo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        parciales: prev.parciales
                          .filter((_, i) => i !== idx)
                          .map((p, i) => ({ ...p, nroParcial: i + 1 }))
                      }))}
                      className="text-slate-300 hover:text-red-500 p-1 shrink-0"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-5 sm:py-6 rounded-[1.5rem] bg-slate-900 hover:bg-blue-600 text-white font-black text-[11px] sm:text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 active:scale-[0.96]"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} strokeWidth={3} />}
            Guardar Marca
          </button>
        </form>
      </div>
    </div>
  )
}

export default CrearPrueba
