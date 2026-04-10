import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import ProtectedRouter from './ProtectedRoute'
import Chat from '../pages/Chat'

// Layouts
import ProfesorLayout from '../layouts/ProfesorLayout'
import NadadorLayout  from '../layouts/NadadorLayout'
import AdminLayout    from '../layouts/AdminLayout'

// Páginas Admin
import { AdminDashboard }   from '../pages/admin/AdminDashboard'
import { AdminNadadores }   from '../pages/admin/AdminNadadores'
import AdminFormativos      from '../pages/admin/AdminFormativos'
import AdminConvocatorias   from '../pages/admin/AdminConvocatorias'

// Páginas Profesor
import DashboardProfesor from '../pages/profesor/DashboardProfesor'
import Nadadores            from '../pages/profesor/Nadadores'
import NadadorForm          from '../pages/profesor/NadadorForm'
import NadadorDetalle       from '../pages/profesor/NadadorDetalle'
import CrearEntrenamiento   from '../pages/profesor/CrearEntrenamiento'
import GestionEntrenamientos from '../pages/profesor/GestionEntrenamientos'
import CompetenciasList     from '../pages/profesor/CompetenciasList'
import PruebasList          from '../pages/profesor/PruebasList'
import CrearCompetencia     from '../pages/profesor/CrearCompetencia'
import CrearPrueba          from '../pages/profesor/CrearPrueba'
import RankingNadador       from '../pages/rankingNadador'
import { CrearConvocatoria }  from '../pages/profesor/CrearConvocatoria'
import  ConvocatoriaDetalle  from "../pages/profesor/ConvocatoriaDetalle"
import CalendarioProfesor   from '../pages/profesor/CalendarioProfesor'

// Páginas Nadador
import DashboardNadador     from '../pages/nadador/DashboardNadador'
import MisTiempos           from '../pages/nadador/MisTiempos'
import MisCompetencias      from '../pages/nadador/MisCompetencias'
import MisEntrenamientos    from '../pages/nadador/MisEntrenamientos'
import MiPerfil             from '../pages/nadador/MiPerfil'
import { CalendarioNadador } from '../pages/nadador/CalendarioNadador'

const AppRouter = () => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  // Destino por rol después del login
  const destinoPorRol = {
    profesor: '/profesor',
    nadador:  '/nadador/dashboard',
    admin:    '/admin'
  }

  return (
    <Routes>

      {/* PÚBLICA */}
      <Route path='/' element={<Home />} />

      {/* LOGIN — si ya está autenticado redirige a su panel */}
      <Route
        path='/login'
        element={
          isAuthenticated
            ? <Navigate to={destinoPorRol[user?.rol] || '/'} replace />
            : <Login />
        }
      />

      {/* ── NADADOR ─────────────────────────────────── */}
      <Route
        path='/nadador'
        element={
          <ProtectedRouter allowedRoles={["nadador"]}>
            <NadadorLayout />
          </ProtectedRouter>
        }
      >
        <Route index          element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardNadador />} />
        <Route path="entrenamientos" element={<MisEntrenamientos />} />
        <Route path="mis-tiempos"   element={<MisTiempos />} />
        <Route path="competencias"  element={<MisCompetencias />} />
        <Route path="calendario"    element={<CalendarioNadador />} />  {/* ← path relativo, sin /nadador/ */}
        <Route path="perfil"        element={<MiPerfil />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* ── PROFESOR ────────────────────────────────── */}
      <Route
        path='/profesor'
        element={
          <ProtectedRouter allowedRoles={["profesor"]}>
            <ProfesorLayout />
          </ProtectedRouter>
        }
      >
        <Route index                              element={<DashboardProfesor />} />
        <Route path="nadadores"                   element={<Nadadores />} />
        <Route path="nadadores/nuevo"             element={<NadadorForm />} />
        <Route path="nadadores/editar/:id"        element={<NadadorForm />} />
        <Route path="nadador/:id"                 element={<NadadorDetalle />} />
        <Route path="nadador/:id/ranking"         element={<RankingNadador />} />
        <Route path="nadador/:id/competencias"    element={<CompetenciasList />} />
        <Route path="nadador/:id/competencias/nuevo" element={<CrearCompetencia />} />
        <Route path="competencia/:id/pruebas"     element={<PruebasList />} />
        <Route path="competencia/:id/pruebas/nuevo" element={<CrearPrueba />} />
        <Route path="crear-entrenamiento"         element={<CrearEntrenamiento />} />
        <Route path="entrenamientos"              element={<GestionEntrenamientos />} />
        <Route path="convocatoria/nueva"          element={<CrearConvocatoria />} />       {/* ← relativo */}
        <Route path="convocatoria/:id"            element={<ConvocatoriaDetalle />} />     {/* ← relativo */}
        <Route path="calendario"                  element={<CalendarioProfesor />} />      {/* ← relativo */}
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route
        path='/admin'
        element={
          <ProtectedRouter allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRouter>
        }
      >
        <Route index               element={<AdminDashboard />} />
        <Route path="nadadores"    element={<AdminNadadores />} />
        <Route path="formativos"   element={<AdminFormativos />} />
        <Route path="convocatorias"          element={<AdminConvocatorias />} />
        <Route path="convocatorias/:id"      element={<ConvocatoriaDetalle />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* COMODÍN */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRouter
