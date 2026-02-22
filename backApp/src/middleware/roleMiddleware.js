export const verificarRol = (...rolesPermitidos) =>{
    return(req, res, next) =>{
        if(!req.user){
            return res.status(403).json({ message: "No autorizado"})
        }

        if(!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ message: "No tienes permisos para esta accion"})
        }

        next()
    }
}