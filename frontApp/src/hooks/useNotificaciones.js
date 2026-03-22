import { useState, useEffect, useCallback, useRef } from "react"
import api from "../api/axios"

const POLL_INTERVAL = 30 * 1000 // 30 segundos

export const useNotificaciones = (isAuthenticated) => {
  const [notificaciones, setNotificaciones]   = useState([])
  const [panelAbierto,   setPanelAbierto]     = useState(false)
  const intervalRef = useRef(null)

  const fetchNotificaciones = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.get("/notificaciones")
      setNotificaciones(res.data)
    } catch {
      // Si falla el poll (red caída, token expirado) no hacemos nada —
      // el interceptor de axios ya maneja el 401
    }
  }, [isAuthenticated])

  // Polling — arranca cuando el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setNotificaciones([])
      return
    }

    fetchNotificaciones() // fetch inmediato al montar

    intervalRef.current = setInterval(fetchNotificaciones, POLL_INTERVAL)

    return () => clearInterval(intervalRef.current)
  }, [isAuthenticated, fetchNotificaciones])

  // Al ABRIR el panel: marcar todas como leídas en el servidor
  // y limpiar el estado local inmediatamente para que el badge desaparezca
  const abrirPanel = useCallback(async () => {
    setPanelAbierto(true)

    if (notificaciones.length > 0) {
      // Limpiamos el estado local de inmediato — UX instantánea
      setNotificaciones([])

      // Luego le avisamos al servidor (sin await — no bloqueamos la UI)
      api.patch("/notificaciones/marcar-leidas").catch(() => {})
    }
  }, [notificaciones.length])

  const cerrarPanel = useCallback(() => {
    setPanelAbierto(false)
  }, [])

  return {
    notificaciones,
    cantidad: notificaciones.length,
    hayNuevas: notificaciones.length > 0,
    panelAbierto,
    abrirPanel,
    cerrarPanel,
  }
}
