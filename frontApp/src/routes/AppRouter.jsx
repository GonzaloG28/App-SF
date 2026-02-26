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
                <Route path="nadadores" element={<Nadadores />} />
                <Route path="nadadores/nuevo" element={<NadadorForm />} />
                <Route path="nadadores/editar/:id" element={<NadadorForm />} />
                <Route path="entrenamientos" element={<Entrenamientos />} />    
            </Route>
        </Routes>
    )
}

export default AppRouter