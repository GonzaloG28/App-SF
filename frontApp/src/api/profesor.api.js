import api from "./axios";

export const getNadadores = (params) => api.get("/nadadores", { params })

export const createNadador = (data) => api.post("/nadadores", data)

export const updateNadador = (id, data) => api.put(`/nadadores/${id}`, data)

export const getNadadorById = (id) => api.get(`/nadadores/${id}`)

export const deleteNadador = (id) => api.delete(`/nadadores/${id}`)