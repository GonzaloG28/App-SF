import { useState, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetencia } from "../../api/competencias.api";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, Calendar, Waves, ArrowLeft, 
  Plus, Loader2, AlertCircle, Zap, Activity
} from "lucide-react";

registerLocale("es", es);

// --- SUB-COMPONENTES MEMOIZADOS ---

const FormHeader = memo(({ onBack }) => (
  /* Se añadió isolate y z-0 para que los brillos no tapen elementos */
  <div className="bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden isolate z-0">
    <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
    <div className="absolute -z-10 bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none"></div>
    
    <button 
      onClick={onBack}
      className="mb-8 flex items-center gap-3 text-slate-400 hover:text-blue-400 font-black text-[11px] uppercase tracking-[0.3em] transition-all group"
    >
      <div className="p-2 bg-white/5 rounded-full group-hover:bg-blue-500/10 transition-colors">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
      </div>
      Regresar
    </button>

    <div className="flex items-center gap-6 relative z-10">
      <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
        <Trophy size={32} className="text-white" />
      </div>
      <div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none uppercase">
          NUEVA <br />
          <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent not-italic">COMPETENCIA</span>
        </h2>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
          <Activity size={12} className="text-emerald-500 animate-pulse" /> Registro de Alto Rendimiento
        </p>
      </div>
    </div>
  </div>
));

const InfoFooter = memo(() => (
  <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-start gap-5">
    <div className="bg-white p-3 rounded-2xl text-orange-500 shadow-sm border border-slate-100 shrink-0">
      <AlertCircle size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
        Próximo paso: <span className="text-blue-600">Configuración de Marcas</span>
      </p>
      <p className="text-[11px] text-slate-500 mt-1 leading-snug font-medium">
        Al finalizar, el sistema te habilitará la carga de tiempos, estilos y parciales biomecánicos para este evento.
      </p>
    </div>
  </div>
));

const CrearCompetencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({ nombre: "", fecha: null, piscina: 25 });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => createCompetencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencias", id] });
      navigate(`/profesor/nadador/${id}/competencias`);
    },
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: null } : prev));
  }, []);

  const handleDateChange = useCallback((date) => {
    setForm(prev => ({ ...prev, fecha: date }));
    setErrors(prev => (prev.fecha ? { ...prev, fecha: null } : prev));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "Nombre requerido";
    if (!form.fecha) newErrors.fecha = "Fecha requerida";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({ 
      ...form, 
      fecha: form.fecha.toISOString(),
      piscina: Number(form.piscina) 
    });
  };

  return (
    <div className="min-h-[95vh] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        
        <FormHeader onBack={() => navigate(-1)} />

        <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-8 md:space-y-10">
          
          {/* CAMPO: NOMBRE (Blanco y Azul) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Evento o Torneo</label>
              {errors.nombre && <span className="text-[11px] text-orange-500 font-black uppercase italic animate-bounce">{errors.nombre}</span>}
            </div>
            <div className="relative group">
              <Trophy className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                name="nombre"
                autoComplete="off"
                placeholder="Ej: Nacional de Verano 2026"
                value={form.nombre}
                onChange={handleChange}
                className={`w-full pl-16 pr-8 py-5 md:py-6 bg-slate-50 border-2 rounded-[2rem] text-sm font-bold text-slate-700 focus:bg-white focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${
                  errors.nombre ? "border-orange-100 bg-orange-50/20" : "border-slate-50"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
            {/* CAMPO: FECHA */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Cronología</label>
              <div className="relative group custom-datepicker-container">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 z-10 transition-colors pointer-events-none" size={20} />
                <DatePicker
                  selected={form.fecha}
                  onChange={handleDateChange}
                  locale="es"
                  dateFormat="dd / MM / yyyy"
                  placeholderText="Seleccionar fecha"
                  maxDate={new Date()}
                  showYearDropdown
                  dropdownMode="select"
                  className={`w-full pl-16 pr-8 py-5 md:py-6 bg-slate-50 border-2 rounded-[2rem] text-sm font-bold text-slate-700 focus:bg-white focus:ring-8 focus:ring-blue-500/5 outline-none transition-all ${
                    errors.fecha ? "border-orange-100" : "border-slate-50"
                  }`}
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            {/* CAMPO: PISCINA (Verde) */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Tipo de Piscina</label>
              <div className="relative group">
                <Waves className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <select
                  name="piscina"
                  value={form.piscina}
                  onChange={handleChange}
                  className="w-full pl-16 pr-12 py-5 md:py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] text-sm font-black text-slate-700 outline-none appearance-none cursor-pointer focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                >
                  <option value={25}>Piscina Corta (25m)</option>
                  <option value={50}>Piscina Olímpica (50m)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                   <Plus size={16} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* ESTADO ERROR SERVIDOR (Naranja) */}
          {mutation.isError && (
            <div className="bg-orange-50 p-5 rounded-2xl flex items-center gap-4 text-orange-600 border border-orange-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-[11px] font-black uppercase tracking-tight">Fallo en la conexión: El servidor no responde.</p>
            </div>
          )}

          {/* BOTÓN SUBMIT (Azul a Verde) */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`group w-full flex items-center justify-center gap-5 py-6 md:py-7 rounded-[2.5rem] font-black text-[11px] md:text-[12px] uppercase tracking-[0.3em] transition-all duration-500 active:scale-[0.98] disabled:opacity-50 ${
              mutation.isPending 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-slate-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-emerald-500 text-white shadow-2xl shadow-blue-900/10'
            }`}
          >
            {mutation.isPending ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Finalizar Registro
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </>
            )}
          </button>
        </form>

        <InfoFooter />
      </div>
    </div>
  );
};

export default CrearCompetencia;