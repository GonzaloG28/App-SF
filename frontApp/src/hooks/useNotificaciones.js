import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef, useState } from "react"
import api from "../api/axios"

const QUERY_KEY = ["notificaciones"]

export const useNotificaciones = (isAuthenticated) => {
  const queryClient = useQueryClient()
  const snapshotRef = useRef(null)
  
  // Estado local para la UI del panel
  const [panelAbierto, setPanelAbierto] = useState(false)

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get("/notificaciones").then(r => r.data),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!isAuthenticated, // Solo ejecutar si el usuario está logueado
  })

  const cantidad = notificaciones.filter(n => !n.leida).length
  const hayNuevas = cantidad > 0

  const marcarLeidasMutation = useMutation({
    mutationFn: () => api.patch("/notificaciones/marcar-leidas"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      snapshotRef.current = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old = []) =>
        old.map(n => ({ ...n, leida: true }))
      )
    },
    onError: () => {
      if (snapshotRef.current) {
        queryClient.setQueryData(QUERY_KEY, snapshotRef.current)
      }
    },
    onSettled: () => {
      snapshotRef.current = null
    }
  })

  const marcarLeidas = useCallback(() => {
    if (cantidad > 0) marcarLeidasMutation.mutate()
  }, [cantidad, marcarLeidasMutation])

  // Funciones para el Layout
  const abrirPanel = () => {
    setPanelAbierto(true)
    marcarLeidas() // Marcamos como leídas al abrir
  }
  
  const cerrarPanel = useCallback(() => setPanelAbierto(false), [])

  return {
    notificaciones,
    cantidad, // Antes era noLeidas
    hayNuevas,
    isLoading,
    panelAbierto,
    abrirPanel,
    cerrarPanel,
    isPending: marcarLeidasMutation.isPending
  }
}