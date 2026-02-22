import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import ProtectedRouter from './ProtectedRoute'

import DashboardNadador from '../pages/nadador/DashboardNadador'
import DashboardProfesor from '../pages/profesor/DashboardProfesor'

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
                        <DashboardProfesor />
                    </ProtectedRouter>
                }
            />
        </Routes>
    )
}

export default AppRouter