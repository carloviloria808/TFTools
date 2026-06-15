import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCompHistory } from '../services/api'

const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3',
}

const CHANGE_META = {
    added:   { label: 'Added',   icon: '＋', color: '#00b894' },
    updated: { label: 'Updated', icon: '✎', color: '#74b9ff' },
    removed: { label: 'Removed', icon: '✕', color: '#e55050' },
}

function formatDate(dateStr) {
    const normalized = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
    const d = new Date(normalized)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Group entries by calendar day
function dayKey(dateStr) {
    const normalized = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
    return new Date(normalized).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function HistoryPage() {
    usePageTitle('Tier List History')
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState(null)
    const [filter,  setFilter]  = useState('all')

    useEffect(() => {
        getCompHistory()
            .then(r => { setEntries(r.data); setLoading(false) })
            .catch(() => { setError('Failed to load history'); setLoading(false) })
    }, [])

    if (loading) return <div className="loading">Loading history...</div>
    if (error)   return <div className="error">{error}</div>

    const filtered = filter === 'all' ? entries : entries.filter(e => e.changeType === filter)

    // Group by day (entries already sorted newest-first)
    const groups = []
    filtered.forEach(e => {
        const key = dayKey(e.timestamp)
        let group = groups.find(g => g.key === key)
        if (!group) { group = { key, items: [] }; groups.push(group) }
        group.items.push(e)
    })

    return (
        <div className="history-page">
            <div className="history-header">
                <div>
                    <h1>Tier List History</h1>
                    <p className="page-subtitle">Recent changes to the composition tier list</p>
                </div>
                <div className="history-header-links">
                    <Link to="/compositions/archive" className="history-back">Patch Archive →</Link>
                    <Link to="/compositions" className="history-back">← Back to Tier List</Link>
                </div>
            </div>

            {/* Filter pills */}
            <div className="history-filters">
                {['all', 'added', 'updated', 'removed'].map(f => (
                    <button
                        key={f}
                        className={`history-filter-pill ${filter === f ? 'history-filter-pill-active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : CHANGE_META[f].label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="no-results">No changes recorded yet.</div>
            ) : (
                <div className="history-timeline">
                    {groups.map(group => (
                        <div key={group.key} className="history-day-group">
                            <div className="history-day-label">{group.key}</div>
                            {group.items.map(e => {
                                const meta = CHANGE_META[e.changeType] ?? CHANGE_META.updated
                                const card = (
                                    <>
                                        <span className="history-badge" style={{ background: `${meta.color}22`, color: meta.color, borderColor: `${meta.color}55` }}>
                                            <span className="history-badge-icon">{meta.icon}</span>
                                            {meta.label}
                                        </span>
                                        {e.carryImageUrl
                                            ? <img src={e.carryImageUrl} alt="" className="history-carry" />
                                            : <span className="history-carry history-carry-ph" />
                                        }
                                        <span className="history-name">{e.name}</span>
                                        {e.tier && (
                                            <span className="history-tier" style={{ background: TIER_COLORS[e.tier] ?? '#888' }}>
                                                {e.tier}
                                            </span>
                                        )}
                                        {e.note && <span className="history-note">{e.note}</span>}
                                        <span className="history-time">{formatDate(e.timestamp)}</span>
                                    </>
                                )
                                return e.stillExists ? (
                                    <Link key={e.id} to={`/compositions/${e.compositionId}`} className="history-row history-row-link">
                                        {card}
                                    </Link>
                                ) : (
                                    <div key={e.id} className="history-row history-row-removed">
                                        {card}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default HistoryPage
