import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createCompetencia } from "../../api/competencias.api";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, 
  Calendar, 
  Waves, 
  ArrowLeft, 
  Plus, 
  Loader2,
  AlertCircle 
} from "lucide-react";

registerLocale("es", es);

const CrearCompetencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    fecha: null,
    piscina: 25,
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => createCompetencia(id, data),
    onSuccess: () => {
      navigate(`/profesor/nadador/${id}/competencias`);
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.fecha) newErrors.fecha = "La fecha es obligatoria";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSend = { ...form, fecha: form.fecha.toISOString() };
    mutation.mutate(dataToSend);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        
        {/* HEADER DECORATIVO */}
        <div className="bg-[#0f172a] p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-xs uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight italic">Nuevo Torneo</h2>
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.2em]">Registro de Competencia</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* NOMBRE DEL EVENTO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Trophy size={12} className="text-blue-600" /> Nombre del Evento
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej: Copa Estadio Italiano 2024"
              value={form.nombre}
              onChange={handleChange}
              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 ${
                errors.nombre ? "border-red-500 bg-red-50/50" : "border-slate-100"
              }`}
            />
            {errors.nombre && (
              <p className="text-[10px] text-red-500 font-bold italic ml-1">{errors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FECHA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} className="text-blue-600" /> Fecha del Evento
              </label>
              <div className="relative group">
                <DatePicker
                  selected={form.fecha}
                  onChange={(date) => setForm({ ...form, fecha: date })}
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar fecha"
                      
                  // CONFIGURACIÓN DE AÑO FÁCIL
                  showYearDropdown           // Activa el menú desplegable de años
                  scrollableYearDropdown     // Permite hacer scroll en la lista de años
                  yearDropdownItemNumber={50} // Muestra 50 años hacia atrás y adelante
                  showMonthDropdown          // También activamos meses para mayor rapidez
                  dropdownMode="select"      // Cambia el estilo a un "select" nativo más cómodo
                      
                  maxDate={new Date()}       // Evita seleccionar fechas futuras si es necesario
                      
                  className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all ${
                    errors.fecha ? "border-red-500 bg-red-50/50" : "border-slate-100"
                  }`}
                  popperClassName="shadow-2xl rounded-3xl border-none" // Estilo al calendario flotante
                />
              </div>
              {errors.fecha && (
                <p className="text-[10px] text-red-500 font-bold italic ml-1">{errors.fecha}</p>
              )}
            </div>

            {/* TAMAÑO PISCINA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Waves size={12} className="text-blue-600" /> Piscina
              </label>
              <select
                name="piscina"
                value={form.piscina}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value={25}>25 Metros (Corta)</option>
                <option value={50}>50 Metros (Larga)</option>
              </select>
            </div>
          </div>

          {/* MENSAJE DE ERROR DE API */}
          {mutation.isError && (
            <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">Error al sincronizar con el servidor</p>
            </div>
          )}

          {/* BOTÓN SUBMIT */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none group"
          >
            {mutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Registrar Competencia
              </>
            )}
          </button>
        </form>

        <div className="p-6 bg-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
            * Al crear el evento, podrás añadir marcas y tiempos <br /> específicos para cada prueba.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrearCompetencia;