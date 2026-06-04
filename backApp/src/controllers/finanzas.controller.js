import Finanzas   from "../models/Finanzas.model.js"
import Movimiento from "../models/Movimiento.model.js"
import Nadador    from "../models/Nadadores.js"

// ── Configuración del club ────────────────────────────────────────────────────

// GET /api/finanzas/config
export const getConfig = async (req, res) => {
  try {
    const config = await Finanzas.getConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ message: "Error al obtener configuración" })
  }
}

// PUT /api/finanzas/config
export const updateConfig = async (req, res) => {
  try {
    const campos = ["precioCompetitivo", "precioFormativo", "fondoBase", "categoriasEgreso"]
    const datos  = {}
    campos.forEach(c => { if (req.body[c] !== undefined) datos[c] = req.body[c] })

    const config = await Finanzas.findOneAndUpdate(
      { _singleton: true },
      { $set: datos },
      { new: true, upsert: true }
    )
    res.json(config)
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar configuración" })
  }
}

// ── Movimientos ───────────────────────────────────────────────────────────────

// GET /api/finanzas/movimientos
// Soporta filtros: ?tipo=ingreso&categoria=mensualidad&desde=2026-01-01&hasta=2026-12-31&nadadorId=xxx
export const getMovimientos = async (req, res) => {
  try {
    const { tipo, categoria, desde, hasta, nadadorId } = req.query
    const filtro = {}

    if (tipo)      filtro.tipo      = tipo
    if (categoria) filtro.categoria = categoria
    if (nadadorId) filtro.nadador   = nadadorId

    if (desde || hasta) {
      filtro.fecha = {}
      if (desde) filtro.fecha.$gte = new Date(desde)
      if (hasta) {
        const d = new Date(hasta)
        d.setHours(23, 59, 59, 999)
        filtro.fecha.$lte = d
      }
    }

    const movimientos = await Movimiento.find(filtro)
      .populate("nadador", "apellido user")
      .populate("nadador.user", "nombre")
      .populate("convocatoria", "nombre")
      .populate("registradoPor", "nombre")
      .sort({ fecha: -1 })
      .limit(500)
      .lean()

    res.json(movimientos)
  } catch (err) {
    res.status(500).json({ message: "Error al obtener movimientos" })
  }
}

// POST /api/finanzas/movimientos
export const crearMovimiento = async (req, res) => {
  try {
    const { tipo, categoria, descripcion, monto, fecha, nadadorId, convocatoriaId, mesPago } = req.body

    if (!tipo || !categoria || !descripcion || !monto) {
      return res.status(400).json({ message: "Faltan campos requeridos" })
    }

    const mov = await Movimiento.create({
      tipo, categoria, descripcion,
      monto: Number(monto),
      fecha: fecha ? new Date(fecha) : new Date(),
      nadador:      nadadorId      || null,
      convocatoria: convocatoriaId || null,
      mesPago:      mesPago        || null,
      registradoPor: req.user._id
    })

    const populated = await mov.populate([
      { path: "nadador", select: "apellido user", populate: { path: "user", select: "nombre" } },
      { path: "registradoPor", select: "nombre" }
    ])

    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: "Error al crear movimiento" })
  }
}

// PUT /api/finanzas/movimientos/:id
export const editarMovimiento = async (req, res) => {
  try {
    const { descripcion, monto, categoria, tipo, fecha } = req.body
    const datos = {}
    if (descripcion !== undefined) datos.descripcion = descripcion
    if (monto       !== undefined) datos.monto       = Number(monto)
    if (categoria   !== undefined) datos.categoria   = categoria
    if (tipo        !== undefined) datos.tipo        = tipo
    if (fecha       !== undefined) datos.fecha       = new Date(fecha)

    const mov = await Movimiento.findByIdAndUpdate(req.params.id, datos, { new: true })
      .populate("nadador", "apellido")
      .populate("registradoPor", "nombre")
    if (!mov) return res.status(404).json({ message: "Movimiento no encontrado" })
    res.json(mov)
  } catch (err) {
    res.status(500).json({ message: "Error al editar movimiento" })
  }
}

// DELETE /api/finanzas/movimientos/:id
export const eliminarMovimiento = async (req, res) => {
  try {
    await Movimiento.findByIdAndDelete(req.params.id)
    res.json({ message: "Movimiento eliminado" })
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar movimiento" })
  }
}

// ── Estado de cuenta por nadador ──────────────────────────────────────────────

// GET /api/finanzas/nadador/:nadadorId
export const getEstadoCuentaNadador = async (req, res) => {
  try {
    const { nadadorId } = req.params

    const [nadador, movimientos, config] = await Promise.all([
      Nadador.findById(nadadorId)
        .populate("user", "nombre correo")
        .lean(),
      Movimiento.find({ nadador: nadadorId })
        .sort({ fecha: -1 })
        .lean(),
      Finanzas.getConfig()
    ])

    if (!nadador) return res.status(404).json({ message: "Nadador no encontrado" })

    const precio = nadador.rama === "formativo" ? config.precioFormativo : config.precioCompetitivo

    const totalIngresado = movimientos.filter(m => m.tipo === "ingreso").reduce((a, m) => a + m.monto, 0)
    const totalEgresado  = movimientos.filter(m => m.tipo === "egreso").reduce((a, m) => a + m.monto, 0)
    const saldo          = totalIngresado - totalEgresado

    // Agrupar mensualidades pagadas por mes
    const mensualidades = movimientos
      .filter(m => m.categoria === "mensualidad" && m.tipo === "ingreso")
      .map(m => ({ mes: m.mesPago, monto: m.monto, fecha: m.fecha }))

    res.json({
      nadador: {
        _id:      nadador._id,
        nombre:   nadador.user?.nombre,
        apellido: nadador.apellido,
        rama:     nadador.rama,
        pagoAlDia: nadador.pagoAlDia,
        precio
      },
      movimientos,
      resumen: { totalIngresado, totalEgresado, saldo, mensualidades }
    })
  } catch (err) {
    res.status(500).json({ message: "Error al obtener estado de cuenta" })
  }
}

// ── Helper exportable: crear movimiento de mensualidad ────────────────────────
// Se llama desde admin.controller.js cuando el admin confirma pago
export const crearMovimientoMensualidad = async ({ nadadorId, nombreNadador, monto, adminId }) => {
  const ahora   = new Date()
  const mesPago = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`

  await Movimiento.create({
    tipo:          "ingreso",
    categoria:     "mensualidad",
    descripcion:   `Mensualidad ${mesPago}: ${nombreNadador}`,
    monto,
    fecha:         ahora,
    nadador:       nadadorId,
    mesPago,
    registradoPor: adminId
  })
}
