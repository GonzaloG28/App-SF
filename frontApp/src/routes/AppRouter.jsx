import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import ProtectedRouter from './ProtectedRoute'

import ProfesorLayout from '../layouts/ProfesorLayout'
import Nadadores from '../pages/profesor/Nadadores'
import DashboardNadador from '../pages/nadador/DashboardNadador'
import DashboardProfesor from '../pages/profesor/DashboardProfesor'
import Entrenamientos from '../pages/profesor/Entrenamientos'
import NadadorForm from '../pages/profesor/NadadorForm'
import NadadorDetalle from '../pages/profesor/NadadorDetalle'
import CompetenciasList from '../pages/profesor/CompetenciasList'
import PruebasList from '../pages/profesor/PruebasList'
import CrearCompetencia from '../pages/profesor/CrearCompetencia'
import CrearPrueba from '../pages/profesor/CrearPrueba'

const AppRouter = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route
                path='/'
                element={
                    <ProtectedRouter>
                        <Home />
                    </ProtectedRouter>
                }
            />

            <Route
                path='/nadador'
                element={
                    <ProtectedRouter allowedRoles={["nadador"]}>
                        <DashboardNadador />
                    </ProtectedRouter>
                }
            />

            <Route
                path='/profesor'
                element={
                    <ProtectedRouter allowedRoles={["profesor"]}>
                        <ProfesorLayout />
                    </ProtectedRouter>
                }
            >
                <Route index element={<DashboardProfesor />} />
                {/* Nadador */}
                <Route path="nadadores" element={<Nadadores />} />
                <Route path="nadadores/nuevo" element={<NadadorForm />} />
                <Route path="/profesor/nadador/:id" element={<NadadorDetalle />} />
                <Route path="nadadores/editar/:id" element={<NadadorForm />} />
                {/* Competencias */}
                <Route path="/profesor/nadador/:id/competencias" element={<CompetenciasList />} />
                <Route path="/profesor/nadador/:id/competencias/nuevo" element={<CrearCompetencia />} />

                {/* Pruebas */}
                <Route path="/profesor/competencias/:id/pruebas" element={<PruebasList />} />
                <Route path="/profesor/competencias/:id/pruebas/nuevo" element={<CrearPrueba />} />
                
                <Route path="entrenamientos" element={<Entrenamientos />} />    
            </Route>
        </Routes>
    )
}

export default AppRouter