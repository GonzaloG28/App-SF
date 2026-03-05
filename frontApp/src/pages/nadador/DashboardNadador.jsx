import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../api/axios"
import { AuthContext } from "../../context/authContext";
import { 
  Lock, Activity, ChevronRight, Save, 
  Loader2, User as UserIcon, Star, Hash,
  Trophy // <-- IMPORTANTE: Ahora sí está incluido
} from "lucide-react";

const DashboardNadador = () => {
  const { user, passwordCambiadoExitosamente } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(
    localStorage.getItem("debeCambiarPassword") === "true"
  );
  
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  // 1. Obtener datos REALES usando tu instancia 'api'
  const { data: perfil, isLoading } = useQuery({
    queryKey: ["miPerfil"],
    queryFn: async () => {
      // Ya no necesitas configurar headers, el interceptor lo hace solo
      const res = await api.get("/nadadores/perfil"); 
      return res.data;
    },
    enabled: !!user,
    retry: 1
  });

  // 2. Mutación para cambiar contraseña usando tu instancia 'api'
  const mutation = useMutation({
    mutationFn: async (pass) => {
      return await api.put("/users/cambiar-password", { 
        passwordNueva: pass 
      });
    },
    onSuccess: () => {
      passwordCambiadoExitosamente();
      setShowModal(false);
      alert("Contraseña actualizada con éxito");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Error al actualizar");
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordNueva !== confirmarPassword) return alert("Las contraseñas no coinciden");
    if (passwordNueva.length < 6) return alert("Mínimo 6 caracteres");
    mutation.mutate(passwordNueva);
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* MODAL OBLIGATORIO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-blue-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Lock size={30} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Seguridad</h2>
            <p className="text-slate-500 text-sm mb-8 mt-2 leading-relaxed">
              Hola <span className="text-blue-600 font-bold">{perfil?.user?.nombre}</span>, debes cambiar tu contraseña inicial por una personal.
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input 
                type="password" 
                placeholder="Nueva Contraseña"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold"
                required
              />
              <input 
                type="password" 
                placeholder="Confirmar Contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-600 font-bold"
                required
              />
              <button 
                disabled={mutation.isPending}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Guardar y Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTENIDO DASHBOARD */}
      <div className={showModal ? "opacity-20 pointer-events-none blur-sm" : ""}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Panel Atleta</p>
              <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">
                  {perfil?.user?.nombre} <span className="text-blue-600">{perfil?.apellido}</span>
              </h1>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <Hash className="text-slate-300" size={18} />
              <p className="text-sm font-bold text-slate-600">{perfil?.rut}</p>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            
            {/* FICHA FÍSICA */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Activity size={24} />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Mediciones</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Estatura</p>
                        <p className="text-3xl font-black text-slate-800 tabular-nums">
                          {perfil?.altura} <span className="text-xs text-blue-500 italic">m</span>
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-white">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Peso</p>
                        <p className="text-3xl font-black text-slate-800 tabular-nums">
                          {perfil?.peso} <span className="text-xs text-blue-500 italic">kg</span>
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Star size={14} className="text-amber-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Especialidades</p>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {perfil?.pruebasEspecialidad?.map((prueba, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-tighter">
                          {prueba}
                        </span>
                      ))}
                   </div>
                </div>
            </div>

            {/* ACCESO RÁPIDO */}
            <div className="md:col-span-2 bg-[#0f172a] p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                      <Trophy size={28} />
                    </div>
                    <h2 className="text-4xl font-black italic mb-4 leading-tight tracking-tighter">
                      Tu historial está listo.
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                      Revisa tus progresos y mejores marcas personales.
                    </p>
                </div>

                <div className="relative z-10 mt-12 flex items-center gap-4">
                    <Link 
                      to="/nadador/mis-tiempos" 
                      className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3"
                    >
                        Ver Mis Tiempos <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNadador;