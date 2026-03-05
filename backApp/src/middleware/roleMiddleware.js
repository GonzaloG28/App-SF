export const verificarRol = (...rolesPermitidos) =>{
    return(req, res, next) =>{
        console.log("DEBUG ROL -> Usuario:", req.user?.rol, "| Permitidos:", rolesPermitidos);
        if(!req.user){
            return res.status(403).json({ message: "No autorizado"})
        }

        if(!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ message: "No tienes permisos para esta accion"})
        }

        next()
    }
}