import { useState, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNadadores, deleteNadador } from "../../api/profesor.api";
import { calcularCategoria, calcularEdad } from "../../utils/categoria.js";
import {
  UserPlus, Search, Filter, User, Edit3, Trash2,
  Loader2, Users, Target, Award, RefreshCcw,
  CheckCircle2, XCircle, GraduationCap, Trophy
} from "lucide-react";

const Nadadores = () => {
  const queryClient = useQueryClient();
  
  // Estados de control para el buscador
  const [nombre, setNombre] = useState("");
  const [rama, setRama] = useState("");
  const [categoria, setCategoria] = useState("");
  const [filters, setFilters] = useState({ categoria: "", nombre: "", rama: "" });
  const [deletingId, setDeletingId] = useState(null);

  // Query con filtros
  const { data: nadadores = [], isLoading, isFetching } = useQuery({
    queryKey: ["nadadores", filters],
    queryFn: async () => (await getNadadores(filters)).data,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  // Estadísticas calculadas dinámicamente usando tus utils
  const stats = useMemo(() => {
    return nadadores.reduce(
      (acc, n) => {
        acc.total++;
        if (n.rama === "formativo") acc.formativos++;
        else acc.competitivos++;

        const cat = calcularCategoria(n.fechaNacimiento);
        if (cat === "Infantil") acc.infantiles++;
        else if (cat === "JA" || cat === "JB") acc.juveniles++;
        else if (cat === "Mayores") acc.mayores++;
        
        return acc;
      },
      { total: 0, juveniles: 0, infantiles: 0, mayores: 0, formativos: 0, competitivos: 0 }
    );
  }, [nadadores]);

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteNadador,
    onSuccess: () => {
      queryClient.invalidateQueries(["nadadores"]);
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
      alert("Error al eliminar el atleta.");
    }
  });

  const handleBuscar = useCallback(() => setFilters({ categoria, nombre, rama }), [categoria, nombre, rama]);
  
  const handleReset = useCallback(() => {
    setNombre("");
    setCategoria("");
    setRama("");
    setFilters({ categoria: "", nombre: "", rama: "" });
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Eliminar este atleta permanentemente?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-1 w-10 bg-blue-600 rounded-full" />
            <p className="text-blue-600 text-[12px] font-black uppercase tracking-[0.4em]">Gestión de Plantel</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-[0.85]">
            Team <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">ÑSF</span>
          </h1>
        </div>
        <Link
          to="/profesor/nadadores/nuevo"
          className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl overflow-hidden"
        >
          <UserPlus size={18} /> Registrar Atleta
        </Link>
      </header>

      {/* STATS CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMiniCard label="Total Plantel" value={stats.total} icon={Users} color="blue" />
        <StatMiniCard label="Infantiles" value={stats.infantiles} icon={Award} color="orange" />
        <StatMiniCard label="Juveniles" value={stats.juveniles} icon={Target} color="green" />
        <StatMiniCard label="Mayores" value={stats.mayores} icon={User} color="slate" />
        <StatMiniCard label="Formativos" value={stats.formativos} icon={GraduationCap} color="red" />
        <StatMiniCard label="Competitivos" value={stats.competitivos} icon={Trophy} color="purple" />
      </section>

      {/* SEARCH BAR (STICKY) */}
      <nav className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-2.5 flex flex-col md:flex-row gap-2 sticky top-4 z-40">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="BUSCAR POR NOMBRE..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            className="w-full pl-14 pr-6 py-4 bg-transparent border-none text-[11px] font-black text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-widest"
          />
        </div>

        <div className="flex flex-wrap gap-2 px-2">
          <FilterSelect icon={Trophy} color="text-blue-500" value={rama} onChange={setRama} options={[
            { label: "Todas las Ramas", value: "" },
            { label: "Competitivo", value: "competitivo" },
            { label: "Formativo", value: "formativo" }
          ]} />
          
          <FilterSelect icon={Filter} color="text-green-500" value={categoria} onChange={setCategoria} options={[
            { label: "Todas las Edades", value: "" },
            { label: "Infantil", value: "Infantil" },
            { label: "Juvenil A", value: "JA" },
            { label: "Juvenil B", value: "JB" },
            { label: "Mayores", value: "Mayores" }
          ]} />
        </div>

        <button
          onClick={handleBuscar}
          disabled={isFetching}
          className="bg-blue-600 hover:bg-green-500 disabled:bg-slate-300 text-white px-10 py-5 md:py-0 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg min-w-[160px] flex items-center justify-center gap-2"
        >
          {isFetching ? <RefreshCcw size={16} className="animate-spin" /> : "Actualizar Filtros"}
        </button>
      </nav>

      {/* GRID RESULTS */}
      {isLoading ? (
        <LoadingUI />
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}>
          {nadadores.length > 0 ? (
            nadadores.map((n) => (
              <AthleteCard
                key={n._id}
                nadador={n}
                onDelete={handleDelete}
                isDeleting={deletingId === n._id}
              />
            ))
          ) : (
            <EmptyState onReset={handleReset} />
          )}
        </div>
      )}
    </div>
  );
};

/* --- SUB-COMPONENTES AUXILIARES --- */

const AthleteCard = memo(({ nadador, onDelete, isDeleting }) => {
  const esFormativo = nadador.rama === "formativo";
  const edad = calcularEdad(nadador.fechaNacimiento);
  const categoria = calcularCategoria(nadador.fechaNacimiento);

  return (
    <article className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-16 h-16 text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black italic transition-all duration-500 ${esFormativo ? "bg-gradient-to-br from-green-500 to-green-700" : "bg-slate-900 group-hover:bg-blue-600"}`}>
            {nadador.user?.nombre?.charAt(0) || "N"}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest">
              {categoria}
            </span>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${esFormativo ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
              {esFormativo ? <GraduationCap size={10} /> : <Trophy size={10} />}
              {esFormativo ? "Formativo" : "Competitivo"}
            </span>
          </div>
        </div>

        <div className="space-y-1 mb-5">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none group-hover:text-blue-600 transition-colors truncate">
            {nadador.user?.nombre} {nadador.apellido}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            RUT {nadador.rut || "N/A"} <span className="h-1 w-1 bg-slate-200 rounded-full" /> {edad ? `${edad} años` : "N/A"}
          </p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${nadador.pagoAlDia ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
          {nadador.pagoAlDia ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {nadador.pagoAlDia ? "Cuenta activa" : "Cuenta inactiva"}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 pt-6 border-t border-slate-50 mt-5">
        <Link to={`/profesor/nadador/${nadador._id}`} className="flex-1 bg-slate-50 hover:bg-slate-900 text-slate-500 hover:text-white h-12 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
          Ver Perfil
        </Link>
        <Link to={`/profesor/nadadores/editar/${nadador._id}`} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-blue-600 flex items-center justify-center rounded-2xl transition-all">
          <Edit3 size={18} />
        </Link>
        <button onClick={() => onDelete(nadador._id)} disabled={isDeleting} className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center rounded-2xl transition-all">
          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      </div>
    </article>
  );
});

const FilterSelect = ({ icon: Icon, color, value, onChange, options }) => (
  <div className="flex items-center bg-slate-50/50 rounded-2xl px-4 border border-transparent focus-within:border-blue-100 transition-all">
    <Icon size={14} className={color} />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border-none py-3 text-[10px] font-black text-slate-600 focus:ring-0 cursor-pointer uppercase tracking-widest"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const StatMiniCard = memo(({ label, value, icon: Icon, color }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    red: "text-red-600 bg-red-50 border-red-100"
  };
  return (
    <div className={`bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col items-start gap-3 hover:shadow-xl transition-all group ${themes[color]}`}>
      <div className={`p-3 rounded-2xl ${themes[color]} border shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none tabular-nums italic">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
      </div>
    </div>
  );
});

const LoadingUI = () => (
  <div className="py-32 flex flex-col items-center">
    <div className="relative w-20 h-20 mb-6">
      <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em] animate-pulse">Sincronizando Base de Datos...</p>
  </div>
);

const EmptyState = ({ onReset }) => (
  <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
    <Users size={32} className="mx-auto mb-6 text-slate-300" />
    <h3 className="text-lg font-black text-slate-900 uppercase italic">Sin coincidencias</h3>
    <button onClick={onReset} className="mt-4 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full transition-colors">
      Restablecer Búsqueda
    </button>
  </div>
);

export default Nadadores;

