import api from "./axios";

export const createPrueba = (competenciaId, data) =>
  api.post(`/pruebas/${competenciaId}`, data);

// Listar pruebas por competencia
export const getPruebasPorCompetencia = (competenciaId) =>
  api.get(`/pruebas/${competenciaId}`);

// Ranking individual de un nadador por prueba
export const getRankingIndividual = (nadadorId, { estilo, distancia, orden = "asc", piscina }) =>
  api.get(`/pruebas/ranking/${nadadorId}`, {
    params: { estilo, distancia, orden, piscina }
  });

// Obtener pruebas disponibles para un nadador
export const getPruebasDisponibles = (nadadorId) =>
  api.get(`/pruebas/disponibles/${nadadorId}`);

export const deletePrueba = (pruebaId) => 
  api.delete(`/pruebas/${pruebaId}`);