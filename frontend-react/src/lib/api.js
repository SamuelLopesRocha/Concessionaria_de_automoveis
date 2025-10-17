import axios from 'axios'

const host = (location.hostname === 'localhost' || location.hostname.startsWith('127.'))
  ? `http://${location.hostname}:5001`
  : 'http://localhost:5001'

export const api = axios.create({
  baseURL: host,
  timeout: 8000,
})

export const fmt = {
  onlyDigits: (v='') => String(v).replace(/\D/g, ''),
  cpf: (v='') => {
    const d = String(v).replace(/\D/g, '')
    if (d.length !== 11) return v
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },
  placaNorm: (v='') => String(v).toUpperCase().replace(/-/g,''),
  placaValid: (v='') => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(String(v).toUpperCase().replace(/-/g,''))
}
