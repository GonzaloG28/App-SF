import api from "./axios";

export const enviarEntrenamiento = (formData) => 
    api.post("/entrenamiento/enviar", formData);

/**
 * PROFESOR: Obtener reporte de quién ha completado qué.
 */
export const getReporteProfesor = () => 
    api.get("/entrenamiento/reporte-profesor");

/**
 * NADADOR: Obtener la lista de entrenamientos asignados.
 */
export const getMisEntrenamientos = () => 
    api.get("/entrenamiento/mis-entrenamientos");

/**
 * NADADOR: Marcar un entrenamiento específico como completado.
 * Esta función activa la ruta router.patch('/:id/completar', ...)
 */
export const completarEntrenamiento = (id) => 
    api.patch(`/entrenamiento/${id}/completar`);

/**
 * PROFESOR: Eliminar un entrenamiento del sistema.
 */
export const eliminarEntrenamiento = (id) => 
    api.delete(`/entrenamiento/${id}`);