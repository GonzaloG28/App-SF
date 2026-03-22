import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { getCompetenciasPorNadador } from "../../api/competencias.api";
import { getPruebasPorCompetencia } from "../../api/pruebas.api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Trophy, Search, Calendar, Waves, 
  ChevronDown, Loader2, XCircle, SortAsc, 
  SortDesc, Zap
} from "lucide-react";

const MisCompetencias = () => {
  const [expandedComp, setExpandedComp] = useState(null);
  const [searchNombre, setSearchNombre] = useState("");
  const [searchFecha, setSearchFecha] = useState(null);
  const [orden, setOrden] = useState("desc");

  const { data: perfil } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      const res = await api.get("/nadadores/perfil");
      return res.data;
    }
  });

  const { data: respCompetencias, isLoading: loadingComp } = useQuery({
    queryKey: ["misCompetencias", perfil?._id],
    queryFn: () => getCompetenciasPorNadador(perfil._id),
    enabled: !!perfil?._id,
  });

  const competencias = respCompetencias?.data || [];

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

  if (loadingComp) return <LoadingState />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700 px-4">
      
      {/* HEADER COMPACTO Y ELITE */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6 pt-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-blue-600 rounded-full" />
            <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.3em]">Performance Track</p>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            Mis <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">Marcas</span>
          </h2>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center self-start sm:self-auto min-w-[100px]">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Eventos</p>
          <p className="text-2xl font-black text-slate-900 italic leading-none">{competencias.length}</p>
        </div>
      </header>

      {/* TOOLBAR ADAPTABLE */}
      <div className="bg-white/80 rounded-2xl shadow-lg shadow-blue-900/5 border border-slate-100 p-1.5 flex flex-col md:flex-row items-center gap-2 sticky top-4 z-40 backdrop-blur-md">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="BUSCAR COMPETENCIA..."
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent border-none text-[11px] font-black text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-widest"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0 px-2 md:px-0">
          <div className="flex items-center bg-slate-50 rounded-xl px-3 py-0.5 border border-slate-100 shrink-0">
            <Calendar size={14} className="text-blue-500" />
            <DatePicker
              selected={searchFecha}
              onChange={(date) => setSearchFecha(date)}
              placeholderText="FECHA"
              showYearDropdown
              dropdownMode="select"
              className="bg-transparent border-none py-2 text-[11px] font-black text-slate-600 focus:ring-0 w-20 uppercase"
            />
          </div>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-slate-50 border-none rounded-xl py-2.5 px-3 text-[11px] font-black text-slate-600 focus:ring-0 uppercase cursor-pointer shrink-0"
          >
            <option value="desc">RECIENTES</option>
            <option value="asc">ANTIGUAS</option>
          </select>

          {(searchNombre || searchFecha) && (
            <button 
              onClick={() => { setSearchNombre(""); setSearchFecha(null) }} 
              className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shrink-0 shadow-sm"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      </div>

      {/* LISTADO DE COMPETENCIAS */}
      <div className="space-y-3">
        {competenciasProcesadas.length > 0 ? (
          competenciasProcesadas.map((c) => (
            <CompetenciaAcordeon 
              key={c._id} 
              competencia={c} 
              isExpanded={expandedComp === c._id}
              onToggle={() => setExpandedComp(expandedComp === c._id ? null : c._id)}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

const CompetenciaAcordeon = ({ competencia, isExpanded, onToggle }) => {
  const { data: respPruebas, isLoading: loadingPruebas } = useQuery({
    queryKey: ["pruebasDetalle", competencia._id],
    queryFn: () => getPruebasPorCompetencia(competencia._id),
    enabled: isExpanded,
  });

  const pruebas = respPruebas?.data?.pruebas || [];

  return (
    <div className={`bg-white rounded-[1.8rem] border transition-all duration-300 overflow-hidden ${
      isExpanded ? 'border-blue-200 shadow-xl' : 'border-slate-100 shadow-sm hover:border-blue-100'
    }`}>
      {/* CABECERA ACORDEÓN */}
      <div 
        onClick={onToggle}
        className="p-4 md:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
            isExpanded ? 'bg-blue-600 text-white shadow-lg rotate-3' : 'bg-slate-900 text-white'
          }`}>
            <Trophy size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-black text-slate-900 italic uppercase tracking-tighter leading-none truncate">
              {competencia.nombre}
            </h3>
            <div className="flex gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-[12px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                <Calendar size={10} /> {new Date(competencia.fecha).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-[12px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-md border border-green-100/50">
                <Waves size={10} /> {competencia.piscina}M
              </span>
            </div>
          </div>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
          isExpanded ? 'bg-blue-600 text-white rotate-180 shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'
        }`}>
          <ChevronDown size={16} />
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-slate-50 mx-4 md:mx-8" />
          
          {/* CONTENEDOR CON SCROLL INTERNO LIMITADO */}
          <div className="relative">
            <div className="px-4 md:px-8 pt-6 pb-12 max-h-[500px] overflow-y-auto custom-scrollbar scroll-smooth">
              {loadingPruebas ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Analizando Marcas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pruebas.map((p) => (
                    <div key={p._id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 bg-blue-600 rounded">
                            <Zap size={8} className="text-white fill-white" />
                          </div>
                          <span className="text-[12px] font-black uppercase text-slate-500">{p.estilo}</span>
                        </div>
                        <span className="text-[14px] font-black text-slate-900 italic tracking-tighter">{p.distancia}M</span>
                      </div>

                      <div className="mb-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Tiempo Final</p>
                        <p className="text-3xl font-black text-blue-600 tabular-nums italic leading-none drop-shadow-sm">{p.tiempo}</p>
                      </div>

                      {/* PARCIALES EN MINI-PILLS */}
                      {p.parciales?.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50">
                          <div className="flex flex-wrap gap-1">
                            {p.parciales.map((par, idx) => (
                              <div key={idx} className="bg-white px-2 py-0.5 rounded-lg border border-slate-100 text-[12px] font-bold text-slate-600 tabular-nums shadow-xs">
                                {par.tiempo || par}s
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FADE OUT INFERIOR */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-[1.8rem]" />
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
      <div className="absolute top-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400 animate-pulse">Sincronizando Base de Datos...</p>
  </div>
);

const EmptyState = () => (
  <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 mx-4">
    <Search size={40} className="mx-auto text-slate-200 mb-4 rotate-12" />
    <h3 className="text-lg font-black text-slate-900 uppercase italic mb-1">Sin registros</h3>
    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">No hay marcas disponibles para este filtro</p>
  </div>
);

export default MisCompetencias;