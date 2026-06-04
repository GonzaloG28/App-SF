import { useState, useMemo, useCallback, memo } from "react"
import { useParams, useNavigate }               from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api                                       from "../../api/axios"
import { calcularCategoria }                     from "../../utils/categoria"
import {
  CheckCircle2, XCircle, Loader2,
  Calendar, MapPin, Clock, ArrowLeft,
  UserPlus, Search, Users, X, Circle,
  ChevronRight, AlertCircle, Trash2 // <-- NUEVO: Importamos Trash2
} from "lucide-react"

// ── Modal para añadir nadadores a una convocatoria ya existente ──────
const ModalAnadirNadadores = ({ convocatoria, onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const [buscar,       setBuscar]       = useState("")
  const [filtroNivel,  setFiltroNivel]  = useState("todos")
  const [filtroCat,    setFiltroCat]    = useState("todos")
  const [nuevos,       setNuevos]       = useState([])

  const yaConvocados = useMemo(
    () => new Set((convocatoria.nadadores || []).map(n => n._id?.toString() || n.toString())),
    [convocatoria.nadadores]
  )

  const { data: todosNadadores = [], isLoading } = useQuery({
    queryKey: ["nadadores-convocatoria"],
    queryFn:  () => api.get("/nadadores").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  const disponibles = useMemo(() =>
    todosNadadores
      .filter(n => !yaConvocados.has(n._id?.toString()))
      .map(n => ({ ...n, _categoria: n.categoria || calcularCategoria(n.fechaNacimiento) })),
    [todosNadadores, yaConvocados]
  )

  const categoriasUnicas = useMemo(() => {
    const cats = disponibles.map(n => n._categoria).filter(Boolean)
    return ["todos", ...new Set(cats)]
  }, [disponibles])

  const filtrados = useMemo(() =>
    disponibles.filter(n => {
      const coincideBusqueda = !buscar ||
        `${n.user?.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
      const coincideNivel = filtroNivel === "todos" || n.rama === filtroNivel
      const coincideCat   = filtroCat   === "todos" || n._categoria === filtroCat
      return coincideBusqueda && coincideNivel && coincideCat
    }),
    [disponibles, buscar, filtroNivel, filtroCat]
  )

  const toggleNuevo = useCallback((id) => {
    setNuevos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const mutation = useMutation({
    mutationFn: () => {
      const actualesIds = (convocatoria.nadadores || []).map(n => n._id || n)
      return api.put(`/convocatorias/${convocatoria._id}`, {
        nadadores: [...actualesIds, ...nuevos]
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["convocatoriaDetalle", convocatoria._id])
      queryClient.invalidateQueries(["convocatorias"])
      onSuccess()
      onClose()
    }
  })

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header modal */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-base">Añadir Nadadores</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {nuevos.length > 0
                ? <span className="text-blue-600">{nuevos.length} seleccionado{nuevos.length > 1 ? "s" : ""}</span>
                : "Selecciona los que quieres añadir"
              }
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 space-y-2 shrink-0 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar nadador..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black text-slate-700 focus:bg-white focus:border-blue-600 outline-none transition-all uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] font-black uppercase outline-none"
            >
              <option value="todos">Todas las ramas</option>
              <option value="competitivo">Competitivo</option>
              <option value="formativo">Formativo</option>
            </select>
            <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] font-black uppercase outline-none"
            >
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat === "todos" ? "Todas las edades" : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-10 text-center">
              <Users size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {disponibles.length === 0 ? "Todos los nadadores ya están convocados" : "Sin resultados"}
              </p>
            </div>
          ) : filtrados.map(n => {
            const seleccionado = nuevos.includes(n._id)
            return (
              <div key={n._id} onClick={() => toggleNuevo(n._id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  seleccionado
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                <div className="shrink-0">
                  {seleccionado
                    ? <CheckCircle2 size={18} className="text-blue-600" />
                    : <Circle size={18} className="text-slate-300" />
                  }
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-black italic text-sm shrink-0">
                  {n.user?.nombre?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black uppercase italic text-sm truncate ${seleccionado ? "text-blue-900" : "text-slate-800"}`}>
                    {n.user?.nombre} {n.apellido}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {n._categoria} · {n.rama}
                  </p>
                </div>
                <ChevronRight size={14} className={seleccionado ? "text-blue-400" : "text-slate-200"} />
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={() => mutation.mutate()}
            disabled={nuevos.length === 0 || mutation.isPending}
            className="w-full py-4 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {mutation.isPending
              ? <Loader2 size={16} className="animate-spin" />
              : <UserPlus size={16} />
            }
            {mutation.isPending
              ? "Añadiendo..."
              : `Añadir ${nuevos.length} nadador${nuevos.length !== 1 ? "es" : ""}`
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Fila de nadador convocado (Modificada para eliminar) ─────────────
const FilaNadador = memo(({ n, onRemove, isRemoving }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-black italic text-base shrink-0">
      {n.user?.nombre?.charAt(0) || "?"}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-black text-slate-900 uppercase italic text-sm truncate">
        {n.user?.nombre} {n.apellido}
      </p>
    </div>
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border shrink-0 ${
      n.pagoAlDia
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-orange-50 text-orange-600 border-orange-100"
    }`}>
      {n.pagoAlDia ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {n.pagoAlDia ? "Al día" : "Pendiente"}
    </div>
    
    {/* NUEVO: Botón de eliminar */}
    <button
      onClick={() => onRemove(n._id)}
      disabled={isRemoving}
      className="p-2 ml-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
      title="Eliminar de convocatoria"
    >
      {isRemoving ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} />}
    </button>
  </div>
))

// ── Componente principal ─────────────────────────────────────────────
const ConvocatoriaDetalle = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient() // <-- NUEVO: Para invalidar la caché
  const [modalOpen, setModalOpen] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null) // <-- NUEVO: Para estado de carga visual

  const { data: convocatoria, isLoading, isError } = useQuery({
    queryKey: ["convocatoriaDetalle", id],
    queryFn:  () => api.get(`/convocatorias/${id}`).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    enabled:  !!id,
  })

  // ── NUEVO: Mutación para remover nadador ───────────────────────────
  const mutationRemover = useMutation({
    mutationFn: (nadadorId) => {
      // Tomamos los IDs actuales y filtramos el que queremos eliminar
      const actualesIds = (convocatoria.nadadores || []).map(n => n._id || n)
      const nuevosIds = actualesIds.filter(idObj => idObj.toString() !== nadadorId.toString())
      
      return api.put(`/convocatorias/${convocatoria._id}`, {
        nadadores: nuevosIds
      })
    },
    onMutate: (nadadorId) => {
      setEliminandoId(nadadorId) // Muestra el spinner en la fila correcta
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["convocatoriaDetalle", id])
      queryClient.invalidateQueries(["convocatorias"])
    },
    onSettled: () => {
      setEliminandoId(null)
    }
  })

  // Función manejadora para el botón
  const handleRemoveNadador = useCallback((nadadorId) => {
    // Podrías poner un window.confirm aquí si quieres que les pida confirmación antes de borrar
    if (window.confirm("¿Seguro que deseas eliminar a este nadador de la convocatoria?")) {
      mutationRemover.mutate(nadadorId)
    }
  }, [mutationRemover])

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  )

  if (isError || !convocatoria) return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-2xl text-center border border-red-100 shadow-xl">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase italic">Convocatoria no encontrada</h2>
      <button onClick={() => navigate(-1)}
        className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Volver
      </button>
    </div>
  )

  const inicio  = new Date(convocatoria.fechaInicio)
  const fin     = new Date(convocatoria.fechaFin)
  const dias    = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
  const hoy     = new Date()
  const enCurso = inicio <= hoy && fin >= hoy
  const pagados = convocatoria.nadadores?.filter(n => n.pagoAlDia).length || 0
  const impagos = (convocatoria.nadadores?.length || 0) - pagados

  return (
    <>
      {modalOpen && (
        <ModalAnadirNadadores
          convocatoria={convocatoria}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {}}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-5 pb-8 animate-fade-in p-4">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-black text-[11px] uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={14} /> Volver
        </button>

        {/* Header */}
        <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[50px] -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
                  {convocatoria.nombre}
                </h1>
                {enCurso && (
                  <span className="text-[10px] font-black bg-green-500 text-white px-3 py-1 rounded-full uppercase shrink-0">
                    En curso
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-400" />
                {inicio.toLocaleDateString("es-ES",{day:"2-digit",month:"long"})} — {fin.toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-blue-400" />
                {dias} {dias === 1 ? "día" : "días"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-blue-400" />
                {convocatoria.lugar}
              </span>
            </div>
            {convocatoria.descripcion && (
              <p className="text-slate-300 text-[13px] font-medium mt-3 leading-relaxed">
                Detalles: {convocatoria.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-900 italic">{convocatoria.nadadores?.length || 0}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Convocados</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center shadow-sm">
            <p className="text-2xl font-black text-emerald-700 italic">{pagados}</p>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Al día</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 text-center shadow-sm">
            <p className="text-2xl font-black text-orange-700 italic">{impagos}</p>
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Pendientes</p>
          </div>
        </div>

        {/* Lista convocados */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <h3 className="font-black text-slate-900 uppercase italic tracking-tight">
                Lista de Convocados
              </h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
               {convocatoria.nadadores?.length || 0} atletas
              </span>
            </div>
            {/* BOTÓN AÑADIR NADADORES */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0"
            >
              <UserPlus size={13} /> Añadir
            </button>
          </div>

          {!convocatoria.nadadores?.length ? (
            <div className="py-12 text-center">
              <Users size={28} className="mx-auto text-slate-200 mb-3" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Sin nadadores convocados
              </p>
              <button onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <UserPlus size={13} /> Añadir nadadores
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {/* NUEVO: Pasamos las props de eliminación */}
              {convocatoria.nadadores.map(n => (
                <FilaNadador 
                  key={n._id} 
                  n={n} 
                  onRemove={handleRemoveNadador}
                  isRemoving={eliminandoId === n._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ConvocatoriaDetalle
