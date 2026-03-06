import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AutHContext'

import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import ProtectedRouter from './ProtectedRoute'

// Layouts
import ProfesorLayout from '../layouts/ProfesorLayout'
import NadadorLayout from '../layouts/NadadorLayout'

// Páginas Profesor
import DashboardProfesor from '../pages/profesor/DashboardProfesor'
import Nadadores from '../pages/profesor/Nadadores'
import NadadorForm from '../pages/profesor/NadadorForm'
import NadadorDetalle from '../pages/profesor/NadadorDetalle'
import CrearEntrenamiento from '../pages/profesor/CrearEntrenamiento'
import GestionEntrenamientos from '../pages/profesor/GestionEntrenamientos'
import CompetenciasList from '../pages/profesor/CompetenciasList'
import PruebasList from '../pages/profesor/PruebasList'
import CrearCompetencia from '../pages/profesor/CrearCompetencia'
import CrearPrueba from '../pages/profesor/CrearPrueba'
import RankingNadador from '../pages/rankingNadador'

// Páginas Nadador
import DashboardNadador from '../pages/nadador/DashboardNadador'
import MisTiempos from '../pages/nadador/MisTiempos'
import MisCompetencias from '../pages/nadador/MisCompetencias'
import MisEntrenamientos from '../pages/nadador/MisEntrenamientos'
import MiPerfil from '../pages/nadador/MiPerfil'

const AppRouter = () => {
    const { isAuthenticated, user, loading } = useAuth();

    // Mientras verifica el token, no renderizamos rutas para evitar saltos visuales
    if (loading) return null; 

    return (
        <Routes>
            {/* 1. RUTA PÚBLICA: Home siempre accesible */}
            <Route path='/' element={<Home />} />

            {/* 2. LOGIN: Si ya está logueado, lo mandamos a su panel */}
            <Route 
                path='/login' 
                element={
                    isAuthenticated 
                    ? <Navigate to={user?.rol === 'profesor' ? '/profesor' : '/nadador'} replace /> 
                    : <Login />
                } 
            />

            {/* --- SECCIÓN NADADOR --- */}
            <Route
                path='/nadador'
                element={
                    <ProtectedRouter allowedRoles={["nadador"]}>
                        <NadadorLayout />
                    </ProtectedRouter>
                }
            >
                {/* Redirigir /nadador a /nadador/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardNadador />} />
                <Route path="entrenamientos" element={<MisEntrenamientos />} />
                <Route path="mis-tiempos" element={<MisTiempos />} />
                <Route path="competencias" element={<MisCompetencias />} />
                <Route path="perfil" element={<MiPerfil />} />
            </Route>

            {/* --- SECCIÓN PROFESOR --- */}
            <Route
                path='/profesor'
                element={
                    <ProtectedRouter allowedRoles={["profesor"]}>
                        <ProfesorLayout />
                    </ProtectedRouter>
                }
            >
                {/* Redirigir /profesor a /profesor/dashboard */}
                <Route index element={<DashboardProfesor />} />
                <Route path="nadadores" element={<Nadadores />} />
                <Route path="nadadores/nuevo" element={<NadadorForm />} />
                <Route path="nadadores/editar/:id" element={<NadadorForm />} />
                <Route path="nadador/:id" element={<NadadorDetalle />} />
                <Route path="nadador/:id/ranking" element={<RankingNadador />} />
                <Route path="nadador/:id/competencias" element={<CompetenciasList />} />
                <Route path="nadador/:id/competencias/nuevo" element={<CrearCompetencia />} />
                <Route path="competencia/:id/pruebas" element={<PruebasList />} />
                <Route path="competencia/:id/pruebas/nuevo" element={<CrearPrueba />} />
                <Route path="crear-entrenamiento" element={<CrearEntrenamiento />} />
                <Route path="entrenamientos" element={<GestionEntrenamientos />} /> 
            </Route>

            {/* 3. COMODÍN: Cualquier otra ruta vuelve al Home o Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRouter