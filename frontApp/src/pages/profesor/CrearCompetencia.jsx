import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetencia } from "../../api/competencias.api";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, 
  Calendar, 
  Waves, 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle,
  Zap
} from "lucide-react";

registerLocale("es", es);

const CrearCompetencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    nombre: "",
    fecha: null,
    piscina: 25,
  });
  const [errors, setErrors] = useState({});

  // 1. MUTACIÓN CON FEEDBACK INSTANTÁNEO
  const mutation = useMutation({
    mutationFn: (data) => createCompetencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencias", id] });
      navigate(`/profesor/nadador/${id}/competencias`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpieza de error en tiempo real
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // 2. VALIDACIÓN DE NEGOCIO
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "Define el nombre del torneo";
    if (!form.fecha) newErrors.fecha = "Selecciona una fecha válida";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSend = { 
      ...form, 
      fecha: form.fecha.toISOString(),
      piscina: Number(form.piscina) 
    };
    mutation.mutate(dataToSend);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white w-full max-w-xl rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
        
        {/* HEADER DE ALTA PRESIÓN (Estética Dark Mode) */}
        <div className="bg-[#0f172a] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] -ml-16 -mb-16"></div>
          
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Volver al Historial
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform">
              <Trophy size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter italic leading-none">Nueva <span className="text-blue-500 text-4xl block not-italic">Competencia</span></h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                <Zap size={12} className="text-emerald-400" /> Registro Oficial AppÑSF
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          {/* CAMPO: NOMBRE */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Nombre del Evento
              </label>
              {errors.nombre && <span className="text-[9px] text-red-500 font-bold uppercase animate-bounce italic">{errors.nombre}</span>}
            </div>
            <div className="relative">
              <Trophy className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
              <input
                type="text"
                name="nombre"
                placeholder="Ej: Nacional de Verano 2026"
                value={form.nombre}
                onChange={handleChange}
                className={`w-full pl-14 pr-6 py-5 bg-slate-50 border rounded-3xl text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 ${
                  errors.nombre ? "border-red-200 bg-red-50/30" : "border-slate-100"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CAMPO: FECHA */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                Fecha
              </label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-600 z-10 transition-colors" size={18} />
                <DatePicker
                  selected={form.fecha}
                  onChange={(date) => setForm({ ...form, fecha: date })}
                  locale="es"
                  dateFormat="dd / MM / yyyy"
                  placeholderText="00 / 00 / 0000"
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  className={`w-full pl-14 pr-6 py-5 bg-slate-50 border rounded-3xl text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${
                    errors.fecha ? "border-red-200 bg-red-50/30" : "border-slate-100"
                  }`}
                />
              </div>
              {errors.fecha && <p className="text-[9px] text-red-500 font-bold uppercase italic ml-1">{errors.fecha}</p>}
            </div>

            {/* CAMPO: PISCINA */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                Longitud
              </label>
              <div className="relative">
                <Waves className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                <select
                  name="piscina"
                  value={form.piscina}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-700 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all cursor-pointer appearance-none shadow-inner"
                >
                  <option value={25}>25m (Corta)</option>
                  <option value={50}>50m (Larga)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ESTADO DE ERROR SERVIDOR */}
          {mutation.isError && (
            <div className="bg-red-50 p-5 rounded-3xl flex items-center gap-4 text-red-600 animate-shake border border-red-100">
              <div className="bg-white p-2 rounded-xl shadow-sm"><AlertCircle size={20} /></div>
              <p className="text-[10px] font-black uppercase tracking-tight leading-none">Error de enlace: El servidor no respondió a la solicitud.</p>
            </div>
          )}

          {/* BOTÓN DE ACCIÓN */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full flex items-center justify-center gap-4 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 disabled:opacity-50 group ${
              mutation.isPending ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            }`}
          >
            {mutation.isPending ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Confirmar Registro
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        {/* PIE DE PÁGINA INFORMATIVO */}
        <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex items-start gap-4">
          <div className="bg-white p-3 rounded-2xl text-blue-500 shadow-sm border border-slate-100">
             <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Próximo paso: <span className="text-slate-600 font-black">Asignación de Pruebas</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Una vez creado el torneo, podrás cargar las pruebas y parciales de cada especialidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearCompetencia;