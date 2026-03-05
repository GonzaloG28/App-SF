import api from "./axios"; // Importas tu configuración base

/**
 * PROFESOR: Enviar un nuevo entrenamiento a uno o varios nadadores
 * @param {FormData} formData - Objeto FormData con titulo, tipo, contenido, notas, destinatarios y archivo
 */
export const enviarEntrenamiento = async (formData) => {
    try {
        const { data } = await api.post("/entrenamiento/enviar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * NADADOR: Obtener la lista de entrenamientos asignados al usuario logueado
 */
export const getMisEntrenamientos = async () => {
    try {
        const { data } = await api.get("/entrenamiento/mis-entrenamientos");
        return data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * OPCIONAL: Si necesitas obtener los nadadores para el selector del profesor
 */
export const getNadadoresParaEntrenamiento = async () => {
    try {
        const { data } = await api.get("/nadadores"); // Ajusta a tu ruta de nadadores
        return data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getReporteProfesor = () => api.get("/entrenamiento/reporte-profesor");

export const eliminarEntrenamiento = async (id) => {
    try {
        const { data } = await api.delete(`/entrenamiento/${id}`);
        return data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};