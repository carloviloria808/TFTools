import { useState, useEffect, useCallback } from 'react'

const KEY = 'tftools_favorites'
const EVENT = 'tftools-favorites-changed'

function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

/**
 * localStorage-backed favorite comp IDs.
 * Syncs across components via a custom window event + the native storage event.
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState(read)

    useEffect(() => {
        const handler = () => setFavorites(read())
        window.addEventListener(EVENT, handler)
        window.addEventListener('storage', handler)
        return () => {
            window.removeEventListener(EVENT, handler)
            window.removeEventListener('storage', handler)
        }
    }, [])

    const toggleFavorite = useCallback((id) => {
        const current = read()
        const next = current.includes(id)
            ? current.filter(x => x !== id)
            : [...current, id]
        localStorage.setItem(KEY, JSON.stringify(next))
        window.dispatchEvent(new Event(EVENT))
    }, [])

    const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

    const clearFavorites = useCallback(() => {
        localStorage.setItem(KEY, '[]')
        window.dispatchEvent(new Event(EVENT))
    }, [])

    return { favorites, isFavorite, toggleFavorite, clearFavorites }
}
