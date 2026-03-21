import { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPrueba, getPruebasPorCompetencia } from "../../api/pruebas.api";
import { 
  Timer, Waves, Ruler, Plus, X, ArrowLeft, 
  Loader2, Trophy, Activity, AlertCircle, Zap, Check, ChevronRight
} from "lucide-react";

const ESTILOS = ["Libre", "Espalda", "Pecho", "Mariposa", "Comb."];
const DISTANCIAS = [25, 50, 100, 200, 400, 800, 1500];

// --- UTILIDADES DE TIEMPO ---
const tiempoAMs = (tiempoStr) => {
  if (!tiempoStr) return 0;
  const regex = /^(?:(\d+):)?(\d+)(?:\.(\d+))?$/;
  const match = tiempoStr.match(regex);
  if (!match) return 0;
  const min = parseInt(match[1] || 0) * 60000;
  const seg = parseInt(match[2] || 0) * 1000;
  const cen = parseInt(match[3] || 0) * 10;
  return min + seg + cen;
};

const msATiempo = (ms) => {
  const min = Math.floor(ms / 60000);
  const seg = Math.floor((ms % 60000) / 1000);
  const cen = Math.floor((ms % 1000) / 10);
  const minStr = min > 0 ? `${min}:` : "";
  const segStr = seg < 10 && min > 0 ? `0${seg}` : seg;
  const cenStr = cen < 10 ? `0${cen}` : cen;
  return `${minStr}${segStr}.${cenStr}`;
};

const CrearPrueba = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ estilo: "", distancia: 50, tiempo: "", parciales: [] });
  const [nuevoParcial, setNuevoParcial] = useState("");

  const sumaParcialesMs = useMemo(() => {
    return form.parciales.reduce((acc, p) => acc + tiempoAMs(p.tiempo), 0);
  }, [form.parciales]);

  const validacion = useMemo(() => {
    if (form.parciales.length === 0 || !form.tiempo) return { coincide: true };
    const tiempoTotalMs = tiempoAMs(form.tiempo);
    return { coincide: Math.abs(tiempoTotalMs - sumaParcialesMs) < 20 };
  }, [sumaParcialesMs, form.tiempo]);

  const autoCompletarTiempo = () => {
    if (sumaParcialesMs > 0) {
      setForm(prev => ({ ...prev, tiempo: msATiempo(sumaParcialesMs) }));
    }
  };

  const { data: competenciaData, isLoading: loadingComp } = useQuery({
    queryKey: ["competencia", id],
    queryFn: () => getPruebasPorCompetencia(id).then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => createPrueba(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id]);
      navigate(`/profesor/competencia/${id}/pruebas`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.estilo) return alert("Selecciona un estilo");
    if (!validacion.coincide && !window.confirm("La suma de parciales no coincide. ¿Guardar?")) return;
    mutation.mutate({ ...form, fecha: competenciaData?.competencia?.fecha || new Date().toISOString() });
  };

  if (loadingComp) return (
    <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Accediendo a la Competencia...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* BOTÓN VOLVER SUTIL */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-all font-black text-[9px] uppercase tracking-widest px-2"
      >
        <ArrowLeft size={14} /> Volver a Pruebas
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        
        {/* BANNER COMPACTO */}
        <div className="bg-[#0f172a] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">Nueva Marca</h1>
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em]">Registro Técnico</p>
            </div>
          </div>
          <Activity size={20} className="text-slate-700" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-10">
          
          {/* GRID DE ESTILOS - BOTONES OPTIMIZADOS */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Waves size={14} className="text-blue-500" /> Estilo
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {ESTILOS.map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setForm({ ...form, estilo: est })}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                    form.estilo === est 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[0.98]" 
                    : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          {/* DISTANCIA - SCROLL HORIZONTAL MOBILE */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Ruler size={14} className="text-emerald-500" /> Distancia
            </label>
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {DISTANCIAS.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setForm({ ...form, distancia: dist })}
                  className={`min-w-[65px] py-3 rounded-xl text-[11px] font-black transition-all border-2 ${
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

          {/* CRONÓMETRO CENTRAL - FOCO TOTAL */}
          <div className="flex flex-col items-center gap-4 py-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
            <div className="absolute top-4 left-6 flex items-center gap-2 opacity-30">
               <Timer size={14} />
               <span className="text-[8px] font-black uppercase tracking-widest">Final</span>
            </div>
            
            <input
              type="text"
              inputMode="decimal"
              placeholder="0:00.00"
              value={form.tiempo}
              onChange={(e) => setForm({ ...form, tiempo: e.target.value.replace(/[^0-9:.]/g, '') })}
              required
              className={`w-full bg-transparent text-6xl md:text-8xl font-black text-slate-900 text-center tracking-tighter outline-none tabular-nums ${!validacion.coincide ? 'text-orange-500' : ''}`}
            />

            {sumaParcialesMs > 0 && (
              <button
                type="button"
                onClick={autoCompletarTiempo}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
              >
                <Zap size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Usar Suma: {msATiempo(sumaParcialesMs)}</span>
              </button>
            )}
          </div>

          {/* PARCIALES COMPACTOS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Telemetría (Laps)</h3>
               {!validacion.coincide && <AlertCircle size={16} className="text-orange-500 animate-pulse" />}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="00.00"
                value={nuevoParcial}
                onChange={(e) => setNuevoParcial(e.target.value.replace(/[^0-9:.]/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nuevoParcial) {
                    e.preventDefault();
                    setForm(prev => ({ ...prev, parciales: [...prev.parciales, { nroParcial: prev.parciales.length + 1, tiempo: nuevoParcial }] }));
                    setNuevoParcial("");
                  }
                }}
                className="flex-1 h-14 px-6 bg-slate-100 rounded-2xl text-lg font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white border-transparent focus:border-blue-200 border-2 transition-all"
              />
              <button 
                type="button" 
                onClick={() => { if(nuevoParcial) { setForm(prev => ({ ...prev, parciales: [...prev.parciales, { nroParcial: prev.parciales.length + 1, tiempo: nuevoParcial }] })); setNuevoParcial(""); }}}
                className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {form.parciales.map((p, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl flex items-center justify-between border border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-slate-400 uppercase italic">L{p.nroParcial}</span>
                    <span className="text-[13px] font-black tabular-nums">{p.tiempo}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setForm(prev => ({ ...prev, parciales: prev.parciales.filter((_, i) => i !== idx).map((p, i) => ({ ...p, nroParcial: i + 1 })) }))} 
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ACCIÓN PRINCIPAL */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-6 rounded-3xl bg-blue-600 hover:bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-[0.97]"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} strokeWidth={3} />}
            Guardar Marca
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearPrueba;