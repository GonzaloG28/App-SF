import { useState, useMemo, useCallback }        from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../api/axios"
import {
  Wallet, TrendingUp, TrendingDown, Receipt, Trophy, Gift, Plus,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Trash2, AlertCircle,
  Edit3, Save, X, FileText, FileSpreadsheet, History, Users, Filter,
  ArrowLeft, Calendar, RefreshCcw, Loader2
} from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clp = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n || 0)

const CATEGORIAS_INGRESO = ["mensualidad", "campeonato", "rifa_evento", "donacion", "otro"]
const CATEGORIAS_EGRESO  = ["arriendo_pista", "material", "federacion", "entrenador", "arbitraje", "otro"]

const labelCategoria = (cat) => ({
  mensualidad:  "Mensualidad",
  campeonato:   "Campeonato",
  rifa_evento:  "Rifa / Evento",
  donacion:     "Donación",
  arriendo_pista: "Arriendo pista",
  material:     "Material",
  federacion:   "Federación",
  entrenador:   "Entrenador",
  arbitraje:    "Arbitraje",
  otro:         "Otro",
}[cat] || cat)

const mesActual = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "slate" }) => {
  const c = {
    slate:  "bg-slate-100 text-slate-700",
    blue:   "bg-blue-50 text-blue-800",
    green:  "bg-emerald-50 text-emerald-800",
    orange: "bg-orange-50 text-orange-800",
    red:    "bg-red-50 text-red-800",
    purple: "bg-purple-50 text-purple-800",
  }[color]
  return (
    <div className={`rounded-2xl p-4 ${c}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <p className="text-xl font-black italic leading-none">{value}</p>
      {sub && <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-wider">{sub}</p>}
    </div>
  )
}

// ─── Panel colapsable ─────────────────────────────────────────────────────────
const Panel = ({ titulo, sub, icon: Icon, iconColor, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconColor}`}><Icon size={18} /></div>
          <div className="text-left">
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-sm">{titulo}</h3>
            {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-50 pt-4">{children}</div>}
    </div>
  )
}

// ─── Configuración de precios ─────────────────────────────────────────────────
const SeccionConfig = ({ config, onSaved }) => {
  const [form, setForm] = useState({
    precioCompetitivo: config?.precioCompetitivo || 0,
    precioFormativo:   config?.precioFormativo   || 0,
    fondoBase:         config?.fondoBase         || 0,
  })

  const mutation = useMutation({
    mutationFn: (data) => api.put("/finanzas/config", data).then(r => r.data),
    onSuccess:  (data) => { onSaved(data) }
  })

  return (
    <Panel titulo="Configuración del Club" sub="Precios y fondo base — persisten en la base de datos"
      icon={Wallet} iconColor="bg-slate-100 text-slate-600"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[
          { key: "precioCompetitivo", label: "Mensualidad Competitivo" },
          { key: "precioFormativo",   label: "Mensualidad Formativo" },
          { key: "fondoBase",         label: "Fondo base del club (capital inicial)" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
            <input type="number" value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: Number(e.target.value) }))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
            />
          </div>
        ))}
      </div>
      <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}
        className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
      >
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Guardar configuración
      </button>
    </Panel>
  )
}

// ─── Mensualidades ────────────────────────────────────────────────────────────
const SeccionMensualidades = ({ nadadores, config, queryClient }) => {
  const [expanded, setExpanded] = useState(null)
  const [buscar,   setBuscar]   = useState("")

  // Estado de cuenta de un nadador (carga lazy al expandir)
  const { data: estadoCuenta, isLoading: loadingEC } = useQuery({
    queryKey: ["estadoCuenta", expanded],
    queryFn:  () => api.get(`/finanzas/nadador/${expanded}`).then(r => r.data),
    enabled:  !!expanded,
    staleTime: 1000 * 60,
  })

  const filtrados = nadadores.filter(n => {
    if (!buscar) return true
    return `${n.user?.nombre} ${n.apellido}`.toLowerCase().includes(buscar.toLowerCase())
  })

  const comp  = nadadores.filter(n => n.rama !== "formativo")
  const form  = nadadores.filter(n => n.rama === "formativo")
  const pComp = config?.precioCompetitivo || 0
  const pForm = config?.precioFormativo   || 0

  const pagadosComp  = comp.filter(n => n.pagoAlDia).length
  const pagadosForm  = form.filter(n => n.pagoAlDia).length
  const recaudadoEst = (pagadosComp * pComp) + (pagadosForm * pForm)
  const proyectado   = (comp.length * pComp) + (form.length * pForm)
  const pct          = proyectado > 0 ? Math.round((recaudadoEst / proyectado) * 100) : 0

  return (
    <Panel titulo="Mensualidades" sub={`${clp(recaudadoEst)} estimado este mes`} icon={Receipt} iconColor="bg-blue-50 text-blue-600">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <StatCard label="Comp. pagados" value={`${pagadosComp}/${comp.length}`} color="blue" />
        <StatCard label="Form. pagados" value={`${pagadosForm}/${form.length}`} color="green" />
        <StatCard label="Proyectado"    value={clp(proyectado)} color="slate" />
        <StatCard label="Pendiente"     value={clp(proyectado - recaudadoEst)} color={proyectado - recaudadoEst > 0 ? "orange" : "green"} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1.5">
          <span>{pct}% cobrado</span><span>{clp(recaudadoEst)}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-orange-400" : "bg-red-500"}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-3">
        <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar nadador..."
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-4 pr-4 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
        />
      </div>

      {/* Lista nadadores */}
      <div className="space-y-2">
        {filtrados.map(n => {
          const nombre  = `${n.user?.nombre || ""} ${n.apellido || ""}`.trim()
          const exp     = expanded === n._id
          return (
            <div key={n._id} className="border border-slate-100 rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(exp ? null : n._id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                    {nombre.charAt(0)}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-black text-slate-800 uppercase italic text-[11px] truncate">{nombre}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      {n.rama || "comp."} · {clp(n.rama === "formativo" ? pForm : pComp)}/mes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${n.pagoAlDia ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600"}`}>
                    {n.pagoAlDia ? "Al día" : "Pendiente"}
                  </span>
                  {exp ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                </div>
              </button>

              {exp && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">
                  {loadingEC ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                    </div>
                  ) : estadoCuenta ? (
                    <>
                      {/* Resumen saldo */}
                      <div className="grid grid-cols-3 gap-2">
                        <StatCard label="Total pagado"  value={clp(estadoCuenta.resumen.totalIngresado)} color="green" />
                        <StatCard label="Total cargos"  value={clp(estadoCuenta.resumen.totalEgresado)}  color="orange" />
                        <StatCard label="Saldo"
                          value={clp(estadoCuenta.resumen.saldo)}
                          color={estadoCuenta.resumen.saldo >= 0 ? "blue" : "red"}
                        />
                      </div>

                      {/* Meses pagados */}
                      {estadoCuenta.resumen.mensualidades.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meses pagados</p>
                          <div className="flex flex-wrap gap-1.5">
                            {estadoCuenta.resumen.mensualidades.map((m, i) => (
                              <span key={i} className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg uppercase">
                                {m.mes} · {clp(m.monto)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Historial movimientos */}
                      {estadoCuenta.movimientos.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Historial</p>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {estadoCuenta.movimientos.map(m => (
                              <div key={m._id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                                <div>
                                  <p className="text-[10px] font-black text-slate-700 uppercase italic">{m.descripcion}</p>
                                  <p className="text-[9px] font-bold text-slate-400">
                                    {new Date(m.fecha).toLocaleDateString("es-CL")} · {labelCategoria(m.categoria)}
                                  </p>
                                </div>
                                <p className={`text-[11px] font-black italic ${m.tipo === "ingreso" ? "text-emerald-700" : "text-orange-600"}`}>
                                  {m.tipo === "ingreso" ? "+" : "-"}{clp(m.monto)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {estadoCuenta.movimientos.length === 0 && (
                        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest text-center py-3">
                          Sin movimientos registrados
                        </p>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

// ─── Movimiento manual ────────────────────────────────────────────────────────
const SeccionNuevoMovimiento = ({ nadadores, convocatorias, queryClient }) => {
  const [form, setForm] = useState({
    tipo:         "egreso",
    categoria:    "arriendo_pista",
    descripcion:  "",
    monto:        "",
    fecha:        new Date().toISOString().split("T")[0],
    nadadorId:    "",
    convocatoriaId: "",
  })

  const cats = form.tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO

  const mutation = useMutation({
    mutationFn: (data) => api.post("/finanzas/movimientos", data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["movimientos"])
      queryClient.invalidateQueries(["balanceFinanzas"])
      setForm(p => ({ ...p, descripcion: "", monto: "", nadadorId: "", convocatoriaId: "" }))
    }
  })

  const enviar = () => {
    if (!form.descripcion.trim() || !form.monto) return
    mutation.mutate({
      ...form,
      monto: Number(form.monto),
      nadadorId:      form.nadadorId      || undefined,
      convocatoriaId: form.convocatoriaId || undefined,
    })
  }

  return (
    <Panel titulo="Registrar Movimiento" sub="Ingreso o egreso manual"
      icon={form.tipo === "egreso" ? TrendingDown : TrendingUp}
      iconColor={form.tipo === "egreso" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}
      defaultOpen={false}
    >
      <div className="space-y-3">
        {/* Tipo */}
        <div className="flex gap-2">
          {["ingreso", "egreso"].map(t => (
            <button key={t} onClick={() => setForm(p => ({ ...p, tipo: t, categoria: t === "ingreso" ? "mensualidad" : "arriendo_pista" }))}
              className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                form.tipo === t
                  ? t === "ingreso" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
              }`}
            >{t === "ingreso" ? "Ingreso" : "Egreso"}</button>
          ))}
        </div>

        {/* Categoría */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Categoría</label>
            <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
            >
              {cats.map(c => <option key={c} value={c}>{labelCategoria(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
          placeholder="Descripción..."
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
        />

        {/* Vinculación opcional */}
        {(form.tipo === "ingreso") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Nadador (opc.)</label>
              <select value={form.nadadorId} onChange={e => setForm(p => ({ ...p, nadadorId: e.target.value }))}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
              >
                <option value="">Sin vincular</option>
                {nadadores.map(n => (
                  <option key={n._id} value={n._id}>
                    {n.user?.nombre} {n.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Evento (opc.)</label>
              <select value={form.convocatoriaId} onChange={e => setForm(p => ({ ...p, convocatoriaId: e.target.value }))}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
              >
                <option value="">Sin vincular</option>
                {convocatorias.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input type="number" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))}
            placeholder="Monto (CLP)..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-600 transition-all"
          />
          <button onClick={enviar} disabled={mutation.isPending || !form.descripcion || !form.monto}
            className={`px-5 py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 ${
              form.tipo === "ingreso" ? "bg-emerald-600 hover:bg-slate-900" : "bg-orange-500 hover:bg-slate-900"
            }`}
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </Panel>
  )
}

// ─── Registro de movimientos ──────────────────────────────────────────────────
const TablaMovimientos = ({ queryClient }) => {
  const [filtroTipo, setFiltroTipo]   = useState("")
  const [filtroCat,  setFiltroCat]    = useState("")
  const [desde,      setDesde]        = useState("")
  const [hasta,      setHasta]        = useState("")
  const [editando,   setEditando]     = useState(null)

  const params = {}
  if (filtroTipo) params.tipo      = filtroTipo
  if (filtroCat)  params.categoria = filtroCat
  if (desde)      params.desde     = desde
  if (hasta)      params.hasta     = hasta

  const { data: movimientos = [], isLoading, isFetching } = useQuery({
    queryKey: ["movimientos", params],
    queryFn:  () => api.get("/finanzas/movimientos", { params }).then(r => r.data),
    staleTime: 1000 * 30,
  })

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/finanzas/movimientos/${id}`),
    onSuccess:  () => {
      queryClient.invalidateQueries(["movimientos"])
      queryClient.invalidateQueries(["balanceFinanzas"])
    }
  })

  const editarMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/finanzas/movimientos/${id}`, data).then(r => r.data),
    onSuccess:  () => {
      queryClient.invalidateQueries(["movimientos"])
      queryClient.invalidateQueries(["balanceFinanzas"])
      setEditando(null)
    }
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History size={15} className="text-blue-600" />
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-sm">Registro de Movimientos</h3>
            {isFetching && <RefreshCcw size={12} className="animate-spin text-blue-400" />}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{movimientos.length} registros</span>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-600 outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="ingreso">Solo ingresos</option>
            <option value="egreso">Solo egresos</option>
          </select>
          <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-600 outline-none"
          >
            <option value="">Todas las categorías</option>
            {[...CATEGORIAS_INGRESO, ...CATEGORIAS_EGRESO].filter((v, i, a) => a.indexOf(v) === i).map(c => (
              <option key={c} value={c}>{labelCategoria(c)}</option>
            ))}
          </select>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            placeholder="Desde"
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black text-slate-600 outline-none"
          />
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            placeholder="Hasta"
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black text-slate-600 outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : movimientos.length === 0 ? (
        <div className="py-12 text-center">
          <Receipt size={28} className="mx-auto text-slate-200 mb-3" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sin movimientos</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
          {movimientos.map(mov => (
            <div key={mov._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
              {editando?._id === mov._id ? (
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <select value={editando.tipo} onChange={e => setEditando(p => ({ ...p, tipo: e.target.value }))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none">
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                  <input value={editando.descripcion} onChange={e => setEditando(p => ({ ...p, descripcion: e.target.value }))}
                    className="flex-1 min-w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-700 outline-none"
                  />
                  <input type="number" value={editando.monto} onChange={e => setEditando(p => ({ ...p, monto: e.target.value }))}
                    className="w-28 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-700 outline-none"
                  />
                  <button onClick={() => editarMutation.mutate({ id: mov._id, data: { tipo: editando.tipo, descripcion: editando.descripcion, monto: Number(editando.monto) } })}
                    className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    {editarMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  </button>
                  <button onClick={() => setEditando(null)} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg"><X size={12} /></button>
                </div>
              ) : (
                <>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    mov.tipo === "ingreso" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  }`}>
                    {mov.tipo === "ingreso" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 uppercase italic text-sm truncate">{mov.descripcion}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(mov.fecha).toLocaleDateString("es-CL")} · {labelCategoria(mov.categoria)}
                      {mov.nadador && ` · ${mov.nadador.apellido || ""}`}
                    </p>
                  </div>
                  <p className={`font-black italic shrink-0 ${mov.tipo === "ingreso" ? "text-emerald-600" : "text-orange-500"}`}>
                    {mov.tipo === "ingreso" ? "+" : "-"}{clp(mov.monto)}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditando({ _id: mov._id, tipo: mov.tipo, descripcion: mov.descripcion, monto: mov.monto })}
                      className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => { if (confirm("¿Eliminar este movimiento?")) eliminarMutation.mutate(mov._id) }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Export helpers ───────────────────────────────────────────────────────────
const exportarExcel = async (movimientos, nadadores, balance, ingresos, egresos) => {
  const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs")
  const wb   = XLSX.utils.book_new()

  // Hoja 1 - Resumen
  const resumen = [
    ["CLUB ÑSF — ESTADO FINANCIERO", ""],
    ["Generado:", new Date().toLocaleDateString("es-CL")],
    [""],
    ["Balance Total",     balance],
    ["Total Ingresos",    ingresos],
    ["Total Egresos",     egresos],
    [""],
    ["Estado Mensualidades"],
    ["Nombre", "Apellido", "Rama", "Pago al día", "Último pago"],
    ...nadadores.map(n => [
      n.user?.nombre || "",
      n.apellido || "",
      n.rama || "competitivo",
      n.pagoAlDia ? "Sí" : "No",
      n.fechaUltimoPago ? new Date(n.fechaUltimoPago).toLocaleDateString("es-CL") : "—"
    ])
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen")

  // Hoja 2 - Movimientos
  const movData = [
    ["Fecha", "Tipo", "Categoría", "Descripción", "Monto (CLP)"],
    ...movimientos.map(m => [
      new Date(m.fecha).toLocaleDateString("es-CL"),
      m.tipo === "ingreso" ? "Ingreso" : "Egreso",
      labelCategoria(m.categoria),
      m.descripcion,
      m.tipo === "ingreso" ? m.monto : -m.monto
    ])
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(movData), "Movimientos")

  XLSX.writeFile(wb, `FinanzasNSF_${new Date().toISOString().split("T")[0]}.xlsx`)
}

const exportarPDF = async (movimientos, nadadores, balance, ingresos, egresos) => {
  const { jsPDF } = await import("https://esm.sh/jspdf@2.5.1")
  const doc = new jsPDF(); let y = 15

  const ln = (txt, x = 15, sz = 10, bold = false) => {
    doc.setFontSize(sz); doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.text(txt, x, y); y += sz * 0.45 + 3
  }
  const sep = () => { doc.setDrawColor(220,220,220); doc.line(15, y, 195, y); y += 4 }

  // Header
  doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 30, "F")
  doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont("helvetica","bold")
  doc.text("CLUB ÑSF — ESTADO FINANCIERO", 15, 18)
  doc.setFontSize(9); doc.setFont("helvetica","normal")
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 15, 26)
  y = 40; doc.setTextColor(0,0,0)

  ln("RESUMEN FINANCIERO", 15, 13, true); sep()
  ln(`Balance:   ${clp(balance)}`, 15, 11, true)
  ln(`Ingresos:  ${clp(ingresos)}`); ln(`Egresos:   ${clp(egresos)}`); y += 4

  if (movimientos.length > 0) {
    if (y > 240) { doc.addPage(); y = 15 }
    ln("MOVIMIENTOS", 15, 13, true); sep()
    movimientos.slice(0, 50).forEach(m => {
      if (y > 270) { doc.addPage(); y = 15 }
      doc.setTextColor(...(m.tipo === "ingreso" ? [5,150,105] : [234,88,12]))
      doc.setFontSize(9)
      doc.text(`${m.tipo === "ingreso" ? "+" : "-"}${clp(m.monto)}`, 185, y, { align: "right" })
      doc.setTextColor(0,0,0)
      doc.text(`${new Date(m.fecha).toLocaleDateString("es-CL")}  ${m.descripcion.slice(0, 65)}`, 15, y)
      y += 6
    })
    y += 4
  }

  if (y > 240) { doc.addPage(); y = 15 }
  ln("ESTADO DE PAGOS", 15, 13, true); sep()
  nadadores.slice(0, 40).forEach(n => {
    if (y > 270) { doc.addPage(); y = 15 }
    const nombre = `${n.user?.nombre || ""} ${n.apellido || ""}`.trim()
    doc.setFontSize(9)
    doc.setTextColor(...(n.pagoAlDia ? [5,150,105] : [234,88,12]))
    doc.text(n.pagoAlDia ? "Al día" : "Pendiente", 185, y, { align: "right" })
    doc.setTextColor(0,0,0); doc.text(nombre, 15, y); y += 6
  })

  doc.save(`FinanzasNSF_${new Date().toISOString().split("T")[0]}.pdf`)
}

// ─── Componente principal ─────────────────────────────────────────────────────
const FinanzasDashboard = () => {
  const queryClient = useQueryClient()

  // Config del club (precios, fondo base)
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ["finanzasConfig"],
    queryFn:  () => api.get("/finanzas/config").then(r => r.data),
    staleTime: 1000 * 60 * 10,
  })

  // Todos los movimientos (para balance y export)
  const { data: todosMovimientos = [] } = useQuery({
    queryKey: ["movimientos", {}],
    queryFn:  () => api.get("/finanzas/movimientos").then(r => r.data),
    staleTime: 1000 * 30,
  })

  // Nadadores
  const { data: nadadoresComp = [] } = useQuery({
    queryKey: ["adminNadadores", "competitivo"],
    queryFn:  () => api.get("/admin/nadadores", { params: { tipo: "competitivo" } }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
  const { data: nadadoresForm = [] } = useQuery({
    queryKey: ["adminNadadores", "formativo"],
    queryFn:  () => api.get("/admin/nadadores", { params: { tipo: "formativo" } }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
  const todosNadadores = useMemo(() => [...nadadoresComp, ...nadadoresForm], [nadadoresComp, nadadoresForm])

  // Convocatorias (para vincular movimientos)
  const { data: convocatorias = [] } = useQuery({
    queryKey: ["convocatorias"],
    queryFn:  () => api.get("/convocatorias").then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })

  // Balance calculado
  const fondoBase   = config?.fondoBase || 0
  const ingresos    = todosMovimientos.filter(m => m.tipo === "ingreso").reduce((a, m) => a + m.monto, 0)
  const egresos     = todosMovimientos.filter(m => m.tipo === "egreso").reduce((a, m) => a + m.monto, 0)
  const balance     = fondoBase + ingresos - egresos

  const [configLocal, setConfigLocal] = useState(null)
  const configEfectiva = configLocal || config

  if (loadingConfig) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  )

  return (
    <div className="space-y-6 pb-12 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-emerald-600 text-[11px] font-black uppercase tracking-[0.4em] mb-1">Club ÑSF · Admin</p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Estado <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Financiero</span>
          </h1>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button onClick={() => exportarExcel(todosMovimientos, todosNadadores, balance, ingresos, egresos)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={() => exportarPDF(todosMovimientos, todosNadadores, balance, ingresos, egresos)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      {/* BALANCE */}
      <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-7 md:p-10 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none"><Wallet size={180} /></div>
        <div className="relative z-10">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Fondo total del club</p>
          <p className={`text-4xl sm:text-6xl font-black italic leading-none mb-6 ${balance >= 0 ? "text-white" : "text-red-400"}`}>
            {clp(balance)}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fondo base</p>
              <p className="text-base font-black text-slate-300 italic">{clp(fondoBase)}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ingresos</p>
              <p className="text-base font-black text-emerald-400 italic">{clp(ingresos)}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Egresos</p>
              <p className="text-base font-black text-orange-400 italic">{clp(egresos)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN NADADORES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total miembros"   value={todosNadadores.length}                            color="slate" />
        <StatCard label="Pagos al día"     value={todosNadadores.filter(n => n.pagoAlDia).length}   color="green" />
        <StatCard label="Pagos pendientes" value={todosNadadores.filter(n => !n.pagoAlDia).length}  color="orange" />
        <StatCard label="Deuda estimada"
          value={clp(
            todosNadadores.filter(n => !n.pagoAlDia).reduce((a, n) =>
              a + (n.rama === "formativo" ? (configEfectiva?.precioFormativo || 0) : (configEfectiva?.precioCompetitivo || 0)), 0)
          )}
          color="red"
        />
      </div>

      {/* SECCIONES */}
      <SeccionConfig config={configEfectiva} onSaved={setConfigLocal} />
      <SeccionMensualidades nadadores={todosNadadores} config={configEfectiva} queryClient={queryClient} />
      <SeccionNuevoMovimiento nadadores={todosNadadores} convocatorias={convocatorias} queryClient={queryClient} />
      <TablaMovimientos queryClient={queryClient} />
    </div>
  )
}

export default FinanzasDashboard
