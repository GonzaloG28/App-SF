import api from "./axios";

// Crear competencia (solo profesor)
export const createCompetencia = (nadadorId, data) =>
  api.post(`/competencias/${nadadorId}`, data);

// Listar competencias de un nadador (profesor o el propio nadador)
export const getCompetenciasPorNadador = (nadadorId) =>
  api.get(`/competencias/${nadadorId}`);