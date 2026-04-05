// src/utils/categoria.js
// Helper compartido — el virtual del backend no llega con lean()
// Lo calculamos en el frontend para consistencia.

export const calcularCategoria = (fechaNacimiento) => {
  if (!fechaNacimiento) return "S/C"
  const hoy  = new Date()
  const nac  = new Date(fechaNacimiento)
  let edad   = hoy.getFullYear() - nac.getFullYear()
  const mes  = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  if (edad < 13) return "Infantil"
  if (edad <= 14) return "JA"
  if (edad <= 17) return "JB"
  return "Mayores"
}

export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const hoy  = new Date()
  const nac  = new Date(fechaNacimiento)
  let edad   = hoy.getFullYear() - nac.getFullYear()
  const mes  = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export const esMenorDeEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return false
  return calcularEdad(fechaNacimiento) < 18
}
