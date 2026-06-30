import axios from 'axios'

// This is the base URL of your backend API
// All requests will start with this. Set VITE_API_URL on Vercel to your
// Render backend; falls back to localhost for local development.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5232/api'

const api = axios.create({
    baseURL: API_BASE_URL
})

// Champions
export const getChampions = () => api.get('/Champions')
export const getChampionById = (id) => api.get(`/Champions/${id}`)
export const getChampionsByCost = (cost) => api.get(`/Champions/cost/${cost}`)

// Traits
export const getTraits = () => api.get('/Traits')
export const getTraitById = (id) => api.get(`/Traits/${id}`)

// Items
export const getItems = () => api.get('/Items')
export const getItemById = (id) => api.get(`/Items/${id}`)
export const getComponents = () => api.get('/Items/components')
export const getCombinedItems = () => api.get('/Items/combined')
export const getItemTierList = () => api.get('/Items/tierlist')

// Augments
export const getAugments = () => api.get('/Augments')
export const getAugmentById = (id) => api.get(`/Augments/${id}`)
export const getAugmentsByTier = (tier) => api.get(`/Augments/tier/${tier}`)
export const getAugmentTierList = () => api.get('/Augments/tierlist')

// Gods
export const getGods = () => api.get('/Gods')
export const getGodById = (id) => api.get(`/Gods/${id}`)

// Compositions
export const getCompositions = () => api.get('/Compositions')
export const getCompositionById = (id) => api.get(`/Compositions/${id}`)
export const getCompositionsByTier = (tier) => api.get(`/Compositions/tier/${tier}`)
export const getTierListLastUpdated = () => api.get('/Compositions/lastupdated')
export const getCompHistory         = () => api.get('/Compositions/history')
export const getArchiveList         = () => api.get('/Compositions/archive')
export const getArchiveSnapshot     = (patch) => api.get(`/Compositions/archive/${patch}`)
export const updateCompStats        = (id, data) => api.patch(`/Compositions/${id}/stats`, data)
export const updateComposition     = (id, data) => api.patch(`/Compositions/${id}`, data)
export const updateCompositionBoard = (id, data) => api.put(`/Compositions/${id}/board`, data)
export const createComposition     = ()         => api.post(`/Compositions`)
export const deleteComposition     = (id)       => api.delete(`/Compositions/${id}`)