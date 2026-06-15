import { useState, useEffect, useCallback } from 'react'

const KEY = 'tftools_recent'
const EVENT = 'tftools-recent-changed'
const MAX = 6

function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

/**
 * localStorage-backed list of recently viewed comps (lightweight snapshots).
 * Most-recent first, capped at MAX, deduped by id.
 */
export function useRecentlyViewed() {
    const [recent, setRecent] = useState(read)

    useEffect(() => {
        const handler = () => setRecent(read())
        window.addEventListener(EVENT, handler)
        window.addEventListener('storage', handler)
        return () => {
            window.removeEventListener(EVENT, handler)
            window.removeEventListener('storage', handler)
        }
    }, [])

    const recordView = useCallback((comp) => {
        if (!comp?.id) return
        const snapshot = {
            id:            comp.id,
            name:          comp.name,
            tier:          comp.tier,
            description:   comp.description,
            playstyle:     comp.playstyle,
            difficulty:    comp.difficulty,
            carryImageUrl: comp.carryImageUrl,
            top4Rate:      comp.top4Rate,
            winRate:       comp.winRate,
            avgPlacement:  comp.avgPlacement,
        }
        const current = read().filter(c => c.id !== comp.id)
        const next = [snapshot, ...current].slice(0, MAX)
        localStorage.setItem(KEY, JSON.stringify(next))
        window.dispatchEvent(new Event(EVENT))
    }, [])

    const clearRecent = useCallback(() => {
        localStorage.setItem(KEY, '[]')
        window.dispatchEvent(new Event(EVENT))
    }, [])

    return { recent, recordView, clearRecent }
}
