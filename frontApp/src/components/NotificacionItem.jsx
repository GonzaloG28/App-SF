import { Activity, Trophy, Dumbbell, CheckCircle2, Calendar, UserPlus, MessageSquare } from "lucide-react"

// Mapa de tipo → icono y color
const TIPO_CONFIG = {
  entrenamiento_asignado: {
    Icon:  Dumbbell,
    color: "text-blue-600",
    bg:    "bg-blue-50"
  },
  mensaje_recibido: {
   Icon:  MessageSquare,  // import desde lucide-react
   color: "text-purple-600",
   bg:    "bg-purple-50"
 },
  entrenamiento_completado: {
    Icon:  CheckCircle2,
    color: "text-green-600",
    bg:    "bg-green-50"
  },
  competencia_creada: {
    Icon:  Trophy,
    color: "text-orange-500",
    bg:    "bg-orange-50"
  },
  marca_subida: {
    Icon:  Activity,
    color: "text-blue-600",
    bg:    "bg-blue-50"
  },
  convocatoria_publicada: {
   Icon:  Calendar,
   color: "text-blue-600",
   bg:    "bg-blue-50"
 },
 convocatoria_admin: {
   Icon:  Calendar,
   color: "text-orange-500",
   bg:    "bg-orange-50"
 },
 nadador_creado: {
   Icon:  UserPlus,  
   color: "text-green-600",
   bg:    "bg-green-50"
 }
}

const NotificacionItem = ({ notificacion }) => {
  const config = TIPO_CONFIG[notificacion.tipo] || {
    Icon: Activity, color: "text-slate-500", bg: "bg-slate-50"
  }
  const { Icon, color, bg } = config

  const fechaRelativa = (fecha) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const min  = Math.floor(diff / 60000)
    const hs   = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (min < 1)   return "Ahora"
    if (min < 60)  return `Hace ${min}m`
    if (hs  < 24)  return `Hace ${hs}h`
    return `Hace ${dias}d`
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className={`shrink-0 w-9 h-9 ${bg} ${color} rounded-xl flex items-center justify-center mt-0.5`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight">
          {notificacion.titulo}
        </p>
        <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5 line-clamp-2">
          {notificacion.mensaje}
        </p>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
          {fechaRelativa(notificacion.createdAt)}
        </p>
      </div>
    </div>
  )
}

export default NotificacionItem
