import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPrueba, getPruebasPorCompetencia } from "../../api/pruebas.api";
import { 
  Timer, Waves, Ruler, Plus, X, ArrowLeft, 
  Save, Info, Loader2, Zap, Trophy, ChevronRight,
  Activity
} from "lucide-react";

// Constantes para mantener el JSX limpio
const ESTILOS = ["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"];
const DISTANCIAS = [25, 50, 100, 200, 400, 800, 1500];

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

  // 1. OBTENER CONTEXTO DE LA COMPETENCIA
  const { data: competenciaData, isLoading: loadingComp } = useQuery({
    queryKey: ["competencia", id],
    queryFn: () => getPruebasPorCompetencia(id).then(res => res.data),
  });

  // 2. MUTACIÓN DE CARGA
  const mutation = useMutation({
    mutationFn: (data) => createPrueba(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id]);
      navigate(`/profesor/competencia/${id}/pruebas`);
    },
  });

  // 3. HANDLERS OPTIMIZADOS
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "distancia" ? Number(value) : value 
    }));
  }, []);

  const agregarParcial = () => {
    if (!nuevoParcial.trim()) return;
    
    setForm(prev => ({
      ...prev,
      parciales: [
        ...prev.parciales, 
        { nroParcial: prev.parciales.length + 1, tiempo: nuevoParcial }
      ],
    }));
    setNuevoParcial("");
  };

  const eliminarParcial = (idx) => {
    setForm(prev => ({
      ...prev,
      parciales: prev.parciales
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, nroParcial: i + 1 })) // Re-indexado automático
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica de formato de tiempo (mm:ss.cc o ss.cc)
    const timeRegex = /^(\d+:)?\d+(\.\d+)?$/;
    if (!timeRegex.test(form.tiempo)) {
      alert("Formato de tiempo inválido. Use 1:02.50 o 30.12");
      return;
    }

    const dataToSend = {
      ...form,
      fecha: competenciaData?.competencia?.fecha || new Date().toISOString(),
    };
    mutation.mutate(dataToSend);
  };

  if (loadingComp) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 opacity-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando competencia...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 p-4">
      
      {/* NAVEGACIÓN Y CONTEXTO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <ArrowLeft size={14} />
          </div>
          Cancelar Registro
        </button>

        <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {competenciaData?.competencia?.nombre || "Competencia"} — {new Date(competenciaData?.competencia?.fecha).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        
        {/* HERO HEADER */}
        <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-[60px] -ml-20 -mb-20" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-3">
              <Trophy size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Nueva <span className="text-blue-500">Marca</span></h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Data Technical Record</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">
          
          {/* CONFIGURACIÓN TÉCNICA */}
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Waves size={16} className="text-blue-500" /> Estilo
              </label>
              <div className="relative group">
                <select
                  name="estilo"
                  value={form.estilo}
                  onChange={handleChange}
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent group-focus-within:border-blue-500/20 group-focus-within:bg-white rounded-3xl text-sm font-black text-slate-800 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar estilo...</option>
                  {ESTILOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Ruler size={16} className="text-blue-500" /> Distancia
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {DISTANCIAS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, distancia: d }))}
                    className={`px-6 py-4 rounded-2xl text-xs font-black transition-all whitespace-nowrap border-2 ${
                      form.distancia === d 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INPUT DE TIEMPO PRINCIPAL */}
          <div className="relative py-10 border-y border-slate-50 group">
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Tiempo Oficial</span>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Timer className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:scale-110 transition-transform" size={28} />
                <input
                  type="text"
                  name="tiempo"
                  placeholder="00:00.00"
                  value={form.tiempo}
                  onChange={(e) => setForm({ ...form, tiempo: e.target.value.replace(/[^0-9:.]/g, '') })}
                  required
                  className="w-full pl-20 pr-10 py-8 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[2.5rem] text-5xl font-black text-slate-900 placeholder:text-slate-200 text-center tracking-tighter tabular-nums outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Formato aceptado: Minutos:Segundos.Centesimas</p>
            </div>
          </div>

          {/* DESGLOSE TÉCNICO DE PARCIALES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Activity size={16} className="text-amber-500" />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Análisis por Vueltas (Splits)</h3>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-full">Telemetry</span>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8">
              <div className="flex gap-4">
                <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Ej: 28.45"
                      value={nuevoParcial}
                      onChange={(e) => setNuevoParcial(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarParcial())}
                      className="w-full px-8 py-5 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400">LAP {form.parciales.length + 1}</div>
                </div>
                <button
                  type="button"
                  onClick={agregarParcial}
                  className="bg-slate-900 text-white px-8 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl active:scale-95 group"
                >
                  <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {form.parciales.length === 0 ? (
                  <div className="col-span-full py-6 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                     <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Sin registros técnicos</p>
                  </div>
                ) : (
                  form.parciales.map((p, idx) => (
                    <div key={idx} className="group bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all animate-in zoom-in-95 duration-300">
                      <div>
                        <span className="text-[8px] font-black text-blue-500 uppercase block mb-0.5 tracking-tighter">Lap {p.nroParcial}</span>
                        <span className="text-sm font-black text-slate-800 tabular-nums">{p.tiempo}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => eliminarParcial(idx)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-400 rounded-xl transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* FOOTER DE ACCIONES */}
          <div className="pt-10 flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-[2] relative overflow-hidden group flex items-center justify-center gap-4 bg-blue-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-blue-500/30 hover:bg-slate-900 disabled:opacity-50 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {mutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {mutation.isPending ? "Procesando..." : "Guardar Registro Oficial"}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-8 py-6 rounded-3xl border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              Descartar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CrearPrueba;