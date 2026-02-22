import api from "./axios"

export const loginRequest = (data) =>
    api.post("/api/auth/login", data)