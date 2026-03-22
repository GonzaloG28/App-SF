import { useState, useEffect, useCallback, useRef } from "react"
import api from "../api/axios"

const POLL_INTERVAL = 30 * 1000 // 30 segundos

export const useNotificaciones = (isAuthenticated) => {
  // notificaciones — las que llegan del servidor (para el badge)
  const [notificaciones, setNotificaciones] = useState([])
  // snapshot — copia que se muestra en el panel mientras está abierto
  // se guarda al abrir y se borra al cerrar
  const [snapshot,       setSnapshot]       = useState([])
  const [panelAbierto,   setPanelAbierto]   = useState(false)
  const intervalRef = useRef(null)

  const fetchNotificaciones = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get("/notificaciones")
      setNotificaciones(res.data)
    } catch {
      // Si falla el poll no hacemos nada —
      // el interceptor de axios maneja el 401
    }
  }, [isAuthenticated])

  // Polling — arranca cuando el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setNotificaciones([])
      setSnapshot([])
      return
    }

    fetchNotificaciones() // fetch inmediato al montar

    intervalRef.current = setInterval(fetchNotificaciones, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [isAuthenticated, fetchNotificaciones])

  // ABRIR el panel:
  // 1. Guardamos snapshot de las notificaciones actuales para mostrarlas
  // 2. Limpiamos el badge inmediatamente (UX instantánea)
  // 3. Marcamos como leídas en el servidor
  const abrirPanel = useCallback(async () => {
    // Guardar copia antes de limpiar
    setSnapshot(notificaciones)
    setPanelAbierto(true)

    if (notificaciones.length > 0) {
      // Limpiar badge de inmediato
      setNotificaciones([])
      // Avisar al servidor sin bloquear la UI
      api.patch("/notificaciones/marcar-leidas").catch(() => {})
    }
  }, [notificaciones])

  // CERRAR el panel:
  // Limpiamos el snapshot — la próxima vez que se abra
  // mostrará solo las notificaciones nuevas
  const cerrarPanel = useCallback(() => {
    setPanelAbierto(false)
    setSnapshot([])
  }, [])

  return {
    // El panel usa snapshot (lo que había al abrir)
    // no notificaciones (que ya se limpió para el badge)
    notificaciones: panelAbierto ? snapshot : notificaciones,
    cantidad:   notificaciones.length,
    hayNuevas:  notificaciones.length > 0,
    panelAbierto,
    abrirPanel,
    cerrarPanel,
  }
}
