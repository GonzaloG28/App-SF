import { useState }  from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api           from "../../api/axios"
import { calcularCategoria } from "../../utils/categoria"
import {
  Search, CheckCircle2, XCircle, Loader2,
  RefreshCcw, Filter, GraduationCap, Trophy
} from "lucide-react"

export const AdminNadadores = () => {
  const queryClient  = useQueryClient()
  const [buscar,     setBuscar]     = useState("")
  const [filtroPago, setFiltroPago] = useState("")
  const [tipo,       setTipo]       = useState("competitivo")

  const { data = [], isLoading, isFetching } = useQuery({
    queryKey: ["adminNadadores", tipo, filtroPago],
    queryFn:  () => api.get("/admin/nadadores", {
      params: { tipo, pago: filtroPago || undefined }
    }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/pago/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminNadadores"])
      queryClient.invalidateQueries(["adminStats"])
    }
  })

  const filtrados = data.filter(n => {
    if (!buscar) return true
    const nombre = tipo === "formativo"
      ? `${n.nombre} ${n.apellido}`.toLowerCase()
      : `${n.user?.nombre} ${n.apellido}`.toLowerCase()
    return nombre.includes(buscar.toLowerCase())
  })

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Gestión de Pagos</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Nadadores{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              {tipo === "formativo" ? "Formativos" : "Competitivos"}
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          {["competitivo", "formativo"].map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                tipo === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t === "competitivo" ? "Competitivos" : "Formativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border-none text-[11px] font-black text-slate-700 focus:ring-0 placeholder:text-slate-300 uppercase tracking-widest outline-none"
          />
        </div>
        <div className="flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0">
          <Filter size={14} className="text-blue-500 shrink-0" />
          <select
            value={filtroPago}
            onChange={e => setFiltroPago(e.target.value)}
            className="bg-transparent border-none text-[11px] font-black text-slate-600 focus:ring-0 cursor-pointer uppercase tracking-widest outline-none"
          >
            <option value="">Todos</option>
            <option value="si">Al día</option>
            <option value="no">Pendiente</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-50" : ""}`}>
          {filtrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest">Sin resultados</p>
            </div>
          ) : filtrados.map(n => (
            <NadadorPagoCard
              key={n._id}
              nadador={n}
              tipo={tipo}
              onToggle={() => toggleMutation.mutate(n._id)}
              isToggling={toggleMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const NadadorPagoCard = ({ nadador, tipo, onToggle, isToggling }) => {
  const nombre    = `${nadador.user?.nombre} ${nadador.apellido}`
  const inicial   = nombre.charAt(0).toUpperCase()
  const pagado    = nadador.pagoAlDia
  // FIX: distinguir tipo real — usar campo rama si existe, sino el tipo del filtro
  const ramaReal  = nadador.rama || tipo
  const esFormativo = ramaReal === "formativo"
  const categoria = (nadador.categoria || calcularCategoria(nadador.fechaNacimiento) || "S/C")

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base italic shrink-0 ${
          esFormativo
            ? "bg-gradient-to-br from-green-500 to-blue-500"
            : "bg-gradient-to-br from-blue-600 to-green-500"
        }`}>
          {inicial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-black text-slate-900 uppercase italic tracking-tight text-sm truncate">{nombre}</p>
            {/* Badge tipo — siempre visible */}
            <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shrink-0 border ${
              esFormativo
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-blue-50 text-blue-700 border-blue-100"
            }`}>
              {esFormativo ? <GraduationCap size={9} /> : <Trophy size={9} />}
              {categoria}
            </span>
          </div>

          {/* Badge pago — SIEMPRE visible en mobile y desktop */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border ${
              pagado
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-orange-50 text-orange-600 border-orange-100"
            }`}>
              {pagado ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {pagado ? "Al día" : "Pago pendiente"}
            </span>
            {nadador.fechaUltimoPago && (
              <span className="text-[10px] text-slate-400 font-bold">
                {new Date(nadador.fechaUltimoPago).toLocaleDateString("es-ES", {
                  day: "2-digit", month: "short", year: "numeric"
                })}
              </span>
            )}
          </div>
        </div>

        {/* Toggle pago */}
        <button
          onClick={onToggle}
          disabled={isToggling}
          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
            pagado
              ? "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
          }`}
          title={pagado ? "Marcar como pendiente" : "Confirmar pago"}
        >
          {isToggling
            ? <RefreshCcw size={16} className="animate-spin" />
            : pagado ? <XCircle size={18} /> : <CheckCircle2 size={18} />
          }
        </button>
      </div>
    </div>
  )
}

