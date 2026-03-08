import { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPrueba, getPruebasPorCompetencia } from "../../api/pruebas.api";
import { 
  Timer, Waves, Ruler, Plus, X, ArrowLeft, 
  Loader2, Trophy, Activity, AlertCircle, Zap, Check
} from "lucide-react";

const ESTILOS = ["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"];
const DISTANCIAS = [25, 50, 100, 200, 400, 800, 1500];

// --- UTILIDADES DE TIEMPO (Se mantienen igual) ---
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

  const [form, setForm] = useState({
    estilo: "",
    distancia: 50,
    tiempo: "",
    parciales: [],
  });
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
    if (!form.estilo) return alert("Por favor selecciona un estilo");
    if (!validacion.coincide) {
      if (!window.confirm("La suma de parciales difiere del tiempo total. ¿Guardar igual?")) return;
    }
    mutation.mutate({ ...form, fecha: competenciaData?.competencia?.fecha || new Date().toISOString() });
  };

  if (loadingComp) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="px-2">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all">
          <div className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center group-hover:bg-slate-100 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="font-black text-[9px] uppercase tracking-[0.2em]">Cancelar</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-50 overflow-hidden">
        <div className="bg-slate-900 p-8 md:p-12 text-white text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Trophy size={28} /></div>
            <div>
               <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Nueva <span className="text-blue-500">Marca</span></h1>
               <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Ingreso de Competencia</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-16 space-y-12">
          
          {/* SELECCIÓN DE ESTILO (GRID DE BOTONES) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Waves size={12} className="text-blue-500" /> Estilo de Nado
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ESTILOS.map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setForm({ ...form, estilo: est })}
                  className={`relative py-4 px-2 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                    form.estilo === est 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]" 
                    : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {est}
                  {form.estilo === est && <Check size={10} className="absolute top-2 right-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* SELECCIÓN DE DISTANCIA (GRID DE BOTONES) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Ruler size={12} className="text-blue-500" /> Distancia (Metros)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DISTANCIAS.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setForm({ ...form, distancia: dist })}
                  className={`py-3 rounded-xl text-[11px] font-black transition-all border-2 ${
                    form.distancia === dist 
                    ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                    : "bg-slate-50 border-transparent text-slate-400"
                  }`}
                >
                  {dist}m
                </button>
              ))}
            </div>
          </div>

          {/* CRONÓMETRO CENTRAL */}
          <div className="relative py-8 border-y border-slate-50 flex flex-col items-center gap-6">
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="0:00.00"
                value={form.tiempo}
                onChange={(e) => setForm({ ...form, tiempo: e.target.value.replace(/[^0-9:.]/g, '') })}
                required
                className="w-full py-6 md:py-10 bg-slate-50 rounded-[2rem] text-5xl md:text-7xl font-black text-slate-900 text-center tracking-tighter outline-none focus:bg-blue-50 focus:ring-4 focus:ring-blue-100 transition-all tabular-nums"
              />
            </div>
            
            {sumaParcialesMs > 0 && (
              <button
                type="button"
                onClick={autoCompletarTiempo}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 animate-bounce-subtle"
              >
                <Zap size={16} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Usar Suma: {msATiempo(sumaParcialesMs)}</span>
              </button>
            )}
          </div>

          {/* PARCIALES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-800">
                <Activity size={16} className="text-blue-600" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Parciales / Vueltas</h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-4 md:p-8 space-y-6">
              {/* Contenedor de Input + Botón con Fix de Flexbox */}
              <div className="flex items-stretch gap-3 w-full h-16">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Nuevo Parcial (ej: 32.45)"
                  value={nuevoParcial}
                  onChange={(e) => setNuevoParcial(e.target.value.replace(/[^0-9:.]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nuevoParcial) {
                      e.preventDefault();
                      setForm(prev => ({ ...prev, parciales: [...prev.parciales, { nroParcial: prev.parciales.length + 1, tiempo: nuevoParcial }] }));
                      setNuevoParcial("");
                    }
                  }}
                  className="flex-1 min-w-0 px-6 bg-white rounded-2xl text-base font-black outline-none border-2 border-transparent focus:border-blue-500 transition-all shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={() => { 
                    if(nuevoParcial) { 
                      setForm(prev => ({ ...prev, parciales: [...prev.parciales, { nroParcial: prev.parciales.length + 1, tiempo: nuevoParcial }] })); 
                      setNuevoParcial(""); 
                    }
                  }}
                  className="flex-shrink-0 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center active:scale-90 shadow-md shadow-blue-200 transition-all"
                >
                  <Plus size={28} strokeWidth={3} />
                </button>
              </div>

              {/* Grid de Cards de Parciales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.parciales.map((p, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-bold text-blue-500 uppercase">LAP {p.nroParcial}</span>
                      <span className="text-sm font-black tabular-nums">{p.tiempo}</span>
                    </div>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, parciales: prev.parciales.filter((_, i) => i !== idx).map((p, i) => ({ ...p, nroParcial: i + 1 })) }))} className="text-red-300 p-1 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-6 md:py-8 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Marca Oficial"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearPrueba;