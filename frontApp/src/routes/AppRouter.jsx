import { Routes, Route, Navigate } from 'react-router-dom'
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
import GestionEntrenamientos from '../pages/profesor/GestionEntrenamientos' // <--- IMPORTAR
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
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            
            <Route path='/' element={<ProtectedRouter><Home /></ProtectedRouter>} />

            {/* --- SECCIÓN NADADOR --- */}
            <Route
                path='/nadador'
                element={
                    <ProtectedRouter allowedRoles={["nadador"]}>
                        <NadadorLayout />
                    </ProtectedRouter>
                }
            >
                <Route index element={<DashboardNadador />} />
                <Route path="dashboard" element={<DashboardNadador />} />
                
                {/* NUEVA RUTA: Mis Entrenamientos (Visualización y Marcado) */}
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
                <Route index element={<DashboardProfesor />} />
                
                <Route path="nadadores" element={<Nadadores />} />
                <Route path="nadadores/nuevo" element={<NadadorForm />} />
                <Route path="nadadores/editar/:id" element={<NadadorForm />} />
                <Route path="nadador/:id" element={<NadadorDetalle />} />
                <Route path="nadador/:id/ranking" element={<RankingNadador />} />

                {/* Competencias y Pruebas */}
                <Route path="nadador/:id/competencias" element={<CompetenciasList />} />
                <Route path="nadador/:id/competencias/nuevo" element={<CrearCompetencia />} />
                <Route path="competencia/:id/pruebas" element={<PruebasList />} />
                <Route path="competencia/:id/pruebas/nuevo" element={<CrearPrueba />} />
                
                {/* RUTAS DE ENTRENAMIENTO PARA EL PROFESOR */}
                <Route path="crear-entrenamiento" element={<CrearEntrenamiento />} />
                {/* NUEVA RUTA: Gestión y Estadísticas de Entrenamientos */}
                <Route path="entrenamientos" element={<GestionEntrenamientos />} /> 
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default AppRouter