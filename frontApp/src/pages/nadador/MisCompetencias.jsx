import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { getCompetenciasPorNadador } from "../../api/competencias.api";
import { getPruebasPorCompetencia } from "../../api/pruebas.api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, Search, Calendar, Waves, Timer, 
  ChevronDown, Loader2, XCircle, SortAsc, 
  SortDesc, TrendingUp, Award, Clock
} from "lucide-react";

const MisCompetencias = () => {
  const [expandedComp, setExpandedComp] = useState(null);
  const [searchNombre, setSearchNombre] = useState("");
  const [searchFecha, setSearchFecha] = useState(null);
  const [orden, setOrden] = useState("desc");

  // 1. Obtener Perfil del Nadador
  const { data: perfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    }
  });

  // 2. Obtener Competencias del Nadador
  const { data: respCompetencias, isLoading: loadingComp } = useQuery({
    queryKey: ["misCompetencias", perfil?._id],
    queryFn: () => getCompetenciasPorNadador(perfil._id),
    enabled: !!perfil?._id,
  });

  const competencias = respCompetencias?.data || [];

  // 3. Obtener Pruebas (solo cuando se expande una competencia)
  const { data: respPruebas, isLoading: loadingPruebas } = useQuery({
    queryKey: ["pruebasDetalle", expandedComp],
    queryFn: () => getPruebasPorCompetencia(expandedComp),
    enabled: !!expandedComp,
  });

  const pruebas = respPruebas?.data?.pruebas || [];

  // Lógica de filtrado y orden (igual a la del profesor)
  const competenciasProcesadas = useMemo(() => {
    let lista = [...competencias];
    if (searchNombre) {
      lista = lista.filter((c) => c.nombre.toLowerCase().includes(searchNombre.toLowerCase()));
    }
    if (searchFecha) {
      const fechaSel = searchFecha.toISOString().split("T")[0];
      lista = lista.filter((c) => new Date(c.fecha).toISOString().split("T")[0] === fechaSel);
    }
    lista.sort((a, b) => {
      const fechaA = new Date(a.fecha); const fechaB = new Date(b.fecha);
      return orden === "desc" ? fechaB - fechaA : fechaA - fechaB;
    });
    return lista;
  }, [competencias, searchNombre, searchFecha, orden]);

  if (loadingComp) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Sincronizando Historial...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Mi Trayectoria</p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">
            MIS <span className="text-blue-600">COMPETENCIAS</span>
          </h2>
        </div>
      </header>

      {/* TOOLBAR DE FILTROS (Estilo Profesor) */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-3 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Buscar competencia..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300"
          />
        </div>
        
        <div className="w-px h-8 bg-slate-100 hidden md:block"></div>

        <div className="flex items-center px-2 w-full md:w-auto">
          <Calendar size={18} className="text-slate-300 mr-2" />
          <DatePicker
            selected={searchFecha}
            onChange={(date) => setSearchFecha(date)}
            placeholderText="Filtrar fecha"
            dateFormat="dd/MM/yyyy"
            className="bg-transparent border-none py-3 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer w-full"
          />
        </div>

        <div className="w-px h-8 bg-slate-100 hidden md:block"></div>

        <div className="flex items-center px-2 w-full md:w-auto">
          {orden === "desc" ? <SortDesc size={18} className="text-blue-600 mr-2" /> : <SortAsc size={18} className="text-blue-600 mr-2" />}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent border-none py-3 text-sm font-black text-slate-500 focus:ring-0 cursor-pointer uppercase"
          >
            <option value="desc">Más Recientes</option>
            <option value="asc">Más Antiguas</option>
          </select>
        </div>

        {(searchNombre || searchFecha) && (
          <button onClick={() => { setSearchNombre(""); setSearchFecha(null) }} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
            <XCircle size={20} />
          </button>
        )}
      </div>

      {/* LISTADO TIPO ACORDEÓN */}
      <div className="grid grid-cols-1 gap-4">
        {competenciasProcesadas.map((c) => (
          <div key={c._id} className={`group bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${expandedComp === c._id ? 'border-blue-200 shadow-xl shadow-blue-900/5' : 'border-slate-100 shadow-sm'}`}>
            
            {/* CABECERA CLICKABLE */}
            <div 
              onClick={() => setExpandedComp(expandedComp === c._id ? null : c._id)}
              className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${expandedComp === c._id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:text-blue-600'}`}>
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight italic uppercase">{c.nombre}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(c.fecha).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Piscina {c.piscina}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase bg-slate-50 px-4 py-2 rounded-xl">
                  <Clock size={14} /> {c.lugar}
                </div>
                <div className={`p-2 rounded-full transition-all ${expandedComp === c._id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50'}`}>
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* CONTENIDO EXPANDIDO: PRUEBAS Y PARCIALES */}
            {expandedComp === c._id && (
              <div className="px-6 md:px-8 pb-8 animate-in slide-in-from-top-4 duration-500">
                <div className="h-px bg-slate-100 mb-8" />
                
                {loadingPruebas ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                    ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pruebas
                        .filter(p => {
                            // Obtenemos el ID del nadador de la prueba (ya sea objeto o string)
                            const pruebaNadadorId = p.nadador?._id || p.nadador;
                            // Obtenemos tu ID de perfil
                            const miId = perfil?._id;
        
                            // Si no hay ID en la prueba, la mostramos por si acaso (evita que se pierdan datos)
                            if (!pruebaNadadorId) return true;
        
                            return pruebaNadadorId === miId;
                        })
                        .map((p) => (
                            <div key={p._id} className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-100 hover:border-blue-200 transition-colors group/card">
                            {/* Contenido de la prueba (Distancia, Estilo, Tiempo, Parciales) que ya teníamos */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Prueba Realizada</p>
                                <h4 className="text-2xl font-black text-slate-800 italic uppercase">{p.distancia}m {p.estilo}</h4>
                                </div>
                                <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">Tiempo Oficial</p>
                                <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">{p.tiempo}</p>
                                </div>
                            </div>

                            {/* PARCIALES (Asegúrate de que el nombre de la propiedad coincida con tu API) */}
                            <div className="space-y-3">
                                {p.parciales && p.parciales.length > 0 ? (
                                    p.parciales.map((par, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-slate-300 w-10">
                                        {/* Si el profesor usa nroParcial lo usamos, si no, usamos el index */}
                                        {par.nroParcial ? par.nroParcial * 50 : (idx + 1) * 50}m
                                        </span>
                                        <div className="flex-1 h-8 bg-white rounded-lg flex items-center justify-between px-4 border border-slate-200/50">
                                        <span className="text-[10px] font-bold text-slate-400 italic">Lap {idx + 1}</span>
                                        <span className="text-[10px] font-black text-blue-600 tabular-nums">{par.tiempo || par}</span>
                                        </div>
                                    </div>
                                    ))
                                ) : (
                                    <div className="py-3 border border-dashed border-slate-200 rounded-xl text-center">
                                    <p className="text-[9px] text-slate-300 font-bold uppercase italic">Sin parciales registrados</p>
                                    </div>
                                )}
                            </div>
                            </div>
                        ))}
                    </div>
                    )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisCompetencias;