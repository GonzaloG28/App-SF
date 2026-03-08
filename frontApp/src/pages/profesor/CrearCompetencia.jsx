import { useState, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetencia } from "../../api/competencias.api";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, Calendar, Waves, ArrowLeft, 
  Plus, Loader2, AlertCircle, Zap, MapPin
} from "lucide-react";

registerLocale("es", es);

// --- SUB-COMPONENTES OPTIMIZADOS ---

const FormHeader = memo(({ onBack }) => (
  <div className="bg-[#0f172a] p-6 md:p-10 text-white relative overflow-hidden shrink-0">
    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] -mr-20 -mt-20"></div>
    
    <button 
      onClick={onBack}
      className="mb-4 md:mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group outline-none"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
      Volver
    </button>

    <div className="flex items-center gap-4 md:gap-6 relative">
      <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-3 transition-transform hover:rotate-0">
        <Trophy size={24} className="text-white md:scale-110" />
      </div>
      <div className="min-w-0">
        <h2 className="text-xl md:text-3xl font-black tracking-tighter italic leading-none uppercase truncate">
          Nueva <span className="text-blue-500 block not-italic">Competencia</span>
        </h2>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
          <Zap size={10} className="text-emerald-400 fill-emerald-400" /> Registro Oficial ÑSF
        </p>
      </div>
    </div>
  </div>
));

const InfoFooter = memo(() => (
  <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex items-start gap-4">
    <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm border border-slate-100 shrink-0">
      <AlertCircle size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
        Siguiente paso: <span className="text-slate-600">Configuración de Marcas</span>
      </p>
      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
        Podrás registrar tiempos y parciales una vez creado el evento.
      </p>
    </div>
  </div>
));

const CrearCompetencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({ nombre: "", fecha: null, piscina: 25, lugar: "" });
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
    <div className="min-h-screen md:min-h-[90vh] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
        
        <FormHeader onBack={() => navigate(-1)} />

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8 flex-1">
          
          {/* CAMPO: NOMBRE */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Torneo</label>
              {errors.nombre && <span className="text-[9px] text-red-500 font-bold uppercase italic">{errors.nombre}</span>}
            </div>
            <div className="relative group">
              <Trophy className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                name="nombre"
                placeholder="Ej. Nacional de Verano 2026"
                value={form.nombre}
                onChange={handleChange}
                className={`w-full pl-14 pr-6 py-4 md:py-5 bg-slate-50 border rounded-2xl md:rounded-3xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-600 outline-none transition-all ${
                  errors.nombre ? "border-red-200 bg-red-50/30" : "border-slate-100"
                }`}
              />
            </div>
          </div>

          {/* GRID RESPONSIVO: FECHA Y PISCINA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha Evento</label>
              <div className="relative group custom-datepicker-container">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 z-10 transition-colors pointer-events-none" size={18} />
                <DatePicker
                  selected={form.fecha}
                  onChange={handleDateChange}
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/AAAA"
                  maxDate={new Date()}
                  className={`w-full pl-14 pr-6 py-4 md:py-5 bg-slate-50 border rounded-2xl md:rounded-3xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all ${
                    errors.fecha ? "border-red-200" : "border-slate-100"
                  }`}
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo Piscina</label>
              <div className="relative group">
                <Waves className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={18} />
                <select
                  name="piscina"
                  value={form.piscina}
                  onChange={handleChange}
                  className="w-full pl-14 pr-10 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl text-sm font-black text-slate-700 outline-none appearance-none cursor-pointer focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                >
                  <option value={25}>Corta (25m)</option>
                  <option value={50}>Larga (50m)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                  <ChevronDownIcon size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* ERROR HANDLER */}
          {mutation.isError && (
            <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 text-red-600 border border-red-100">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-[10px] font-black uppercase leading-tight tracking-tighter">Fallo en la sincronización. Intente nuevamente.</p>
            </div>
          )}

          {/* BOTÓN SUBMIT RESPONSIVO */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full flex items-center justify-center gap-4 py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.25em] transition-all active:scale-[0.97] disabled:opacity-50 ${
              mutation.isPending 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-blue-600 hover:bg-[#0f172a] text-white shadow-xl shadow-blue-500/20'
            }`}
          >
            {mutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Confirmar Registro
                <Plus size={18} className="shrink-0" />
              </>
            )}
          </button>
        </form>

        <InfoFooter />
      </div>
    </div>
  );
};

const ChevronDownIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default CrearCompetencia;