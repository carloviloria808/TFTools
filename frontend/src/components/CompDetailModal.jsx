import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CompDetailView from './CompDetailView'
import { CompDetailSkeleton } from './Skeleton'

// Build a /builder?comp=... URL pre-populated with the comp's board layout
function buildBuilderUrl(comp) {
    // Empty 4-row × 7-col board (rows 0=front … 3=back)
    const board = Array.from({ length: 4 }, () => Array(7).fill(null))

    for (const cc of (comp.champions || [])) {
        const r = cc.row
        const c = cc.col
        if (r >= 0 && r < 4 && c >= 0 && c < 7) {
            board[r][c] = {
                c: cc.champion.id,
                i: (cc.items || []).map(item => item.id),
                s: 1
            }
        }
    }

    const shareData = {
        b: board,
        a: Array(6).fill(null)   // augments left empty; user can add their own
    }
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))))
    return `/builder?comp=${encoded}`
}

function CompDetailModal({ comp, loading, onClose }) {
    const navigate = useNavigate()
    const [showNames, setShowNames] = useState(false)

    // Close on Escape
    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    return (
        <div className="cdm-overlay" onMouseDown={onClose}>
            <div
                className="cdm-modal"
                onMouseDown={e => e.stopPropagation()}
            >
                {/* Ambient background from carry portrait */}
                {comp?.carryImageUrl && (
                    <div
                        className="cdm-ambient-bg"
                        style={{ backgroundImage: `url(${comp.carryImageUrl})` }}
                    />
                )}

                {/* Close button */}
                <button className="cdm-close" onClick={onClose} title="Close (Esc)">
                    ✕
                </button>

                {/* Content */}
                <div className="cdm-scroll">
                    {loading ? (
                        <CompDetailSkeleton />
                    ) : comp ? (
                        <CompDetailView
                            comp={comp}
                            showNames={showNames}
                            onToggleNames={() => setShowNames(n => !n)}
                            onOpenBuilder={() => { onClose(); navigate(buildBuilderUrl(comp)) }}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default CompDetailModal
