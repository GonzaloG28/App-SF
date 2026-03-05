import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPrueba, getPruebasPorCompetencia } from "../../api/pruebas.api";
import { 
  Timer, 
  Waves, 
  Ruler, 
  Plus, 
  X, 
  ArrowLeft, 
  Save, 
  Info,
  Loader2,
  Zap
} from "lucide-react";

const CrearPrueba = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: competenciaData, isLoading: loadingComp } = useQuery({
    queryKey: ["competencia", id],
    queryFn: () => getPruebasPorCompetencia(id).then(res => res.data),
  });

  const [form, setForm] = useState({
    estilo: "",
    distancia: 50,
    tiempo: "",
    parciales: [],
  });

  const [nuevoParcial, setNuevoParcial] = useState("");

  const mutation = useMutation({
    mutationFn: (data) => createPrueba(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["pruebas", id]);
      navigate(`/profesor/competencia/${id}/pruebas`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "distancia" ? Number(value) : value });
  };

  const agregarParcial = () => {
    if (!nuevoParcial) return;
    const nro = form.parciales.length + 1;
    setForm({
      ...form,
      parciales: [...form.parciales, { nroParcial: nro, tiempo: nuevoParcial }],
    });
    setNuevoParcial("");
  };

  const eliminarParcial = (idx) => {
    const nuevosParciales = form.parciales
      .filter((_, i) => i !== idx)
      .map((p, i) => ({ ...p, nroParcial: i + 1 })); // Re-numerar
    setForm({ ...form, parciales: nuevosParciales });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tiempo.match(/^(\d+:)?\d+(\.\d+)?$/)) {
      alert("Formato de tiempo inválido. Use 1:02.50 o 30.12");
      return;
    }
    const dataToSend = {
      ...form,
      fecha: competenciaData?.competencia?.fecha || new Date().toISOString(),
    };
    mutation.mutate(dataToSend);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* BOTÓN VOLVER E INFO */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          <ArrowLeft size={14} /> Cancelar Registro
        </button>
        <div className="flex items-center gap-2 text-blue-500 bg-blue-50 px-4 py-2 rounded-2xl">
          <Info size={14} />
          <span className="text-[10px] font-black uppercase tracking-tight">
            Fecha vinculada: {competenciaData?.competencia?.fecha ? new Date(competenciaData.competencia.fecha).toLocaleDateString() : "..."}
          </span>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* HEADER INTERNO */}
        <div className="bg-[#0f172a] p-10 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex items-center gap-5 relative">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter italic">Nueva Marca</h1>
              <p className="text-blue-100/50 text-[10px] font-black uppercase tracking-[0.2em]">Cronometraje Técnico</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          
          {/* GRID: ESTILO Y DISTANCIA */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Waves size={14} className="text-blue-600" /> Estilo de Nado
              </label>
              <select
                name="estilo"
                value={form.estilo}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                {["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Ruler size={14} className="text-blue-600" /> Distancia (Metros)
              </label>
              <select
                name="distancia"
                value={form.distancia}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-blue-600 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
              >
                {[25, 50, 100, 200, 400, 800, 1500].map(d => (
                  <option key={d} value={d}>{d} Metros</option>
                ))}
              </select>
            </div>
          </div>

          {/* TIEMPO TOTAL - ENFOQUE PRINCIPAL */}
          <div className="space-y-4 text-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">
              Tiempo Final Oficial
            </label>
            <div className="relative max-w-xs mx-auto">
              <Timer className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600" size={24} />
              <input
                type="text"
                name="tiempo"
                placeholder="00:00.00"
                value={form.tiempo}
                onChange={(e) => setForm({ ...form, tiempo: e.target.value.replace(/[^0-9:.]/g, '') })}
                required
                className="w-full pl-16 pr-8 py-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2rem] text-3xl font-black text-slate-800 placeholder:text-slate-200 text-center tracking-tighter tabular-nums focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* SECCIÓN PARCIALES REDISEÑADA */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Desglose por Parciales</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-300 uppercase">Opcional</span>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Tiempo Lap (ej: 28.5)"
                value={nuevoParcial}
                onChange={(e) => setNuevoParcial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarParcial())}
                className="flex-1 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5"
              />
              <button
                type="button"
                onClick={agregarParcial}
                className="bg-[#0f172a] text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {form.parciales.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium italic ml-2">No se han registrado parciales técnicos.</p>
              ) : (
                form.parciales.map((p, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 pl-4 pr-2 py-2 rounded-2xl flex items-center gap-4 shadow-sm animate-in zoom-in duration-300">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-blue-500 uppercase leading-none mb-1">Lap {p.nroParcial}</span>
                      <span className="text-sm font-black text-slate-700 tabular-nums">{p.tiempo}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => eliminarParcial(idx)}
                      className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ACCIONES FINALES */}
          <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-[2] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {mutation.isPending ? "Sincronizando..." : "Finalizar Registro"}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-8 py-4 rounded-[1.8rem] border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
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