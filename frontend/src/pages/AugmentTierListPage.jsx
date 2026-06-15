import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getAugmentTierList } from '../services/api'
import { highlightKeywords } from '../utils/highlightKeywords'

const TIERS = ['S', 'A', 'B', 'C', 'D']

const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', D: '#b2bec3'
}

const TIER_LABELS = {
    S: 'Best in game', A: 'Very strong', B: 'Solid pick', C: 'Situational', D: 'Weak'
}

const QUALITY_FILTERS = ['All', '1', '2', '3']
const QUALITY_LABELS  = { All: 'All', '1': 'Silver', '2': 'Gold', '3': 'Prismatic' }
const QUALITY_COLORS  = { '1': '#b0bec5', '2': '#ffd700', '3': '#e040fb' }

function cleanName(name) {
    return (name || '').replace(/^[\r\n\s]+/, '').trim()
}

function AugmentTierListPage() {
    usePageTitle('Augment Tier List')
    const [tierList, setTierList] = useState({})
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState(null)
    const [quality,  setQuality]  = useState('All')
    const [search,   setSearch]   = useState('')

    useEffect(() => {
        getAugmentTierList()
            .then(r => { setTierList(r.data); setLoading(false) })
            .catch(() => { setError('Failed to load tier list'); setLoading(false) })
    }, [])

    if (loading) return <div className="loading">Loading tier list...</div>
    if (error)   return <div className="error">{error}</div>

    function filter(augments) {
        let list = augments
        if (quality !== 'All') list = list.filter(a => a.tier === quality)
        if (search)             list = list.filter(a => cleanName(a.name).toLowerCase().includes(search.toLowerCase()))
        return list
    }

    const totalShown = TIERS.reduce((sum, t) => sum + filter(tierList[t] || []).length, 0)
    const isFiltering = quality !== 'All' || search

    return (
        <div className="augment-tierlist-page">
            <h1>Augment Tier List</h1>
            <p className="page-subtitle">Patch 17.5</p>

            {/* ── Filter bar ── */}
            <div className="atl-filter-bar">
                {/* Search */}
                <div className="atl-search-wrap">
                    <input
                        className="atl-search"
                        type="text"
                        placeholder="Search augments..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="atl-search-clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>

                {/* Quality pills */}
                <div className="atl-quality-pills">
                    {QUALITY_FILTERS.map(q => {
                        const active = quality === q
                        const color  = QUALITY_COLORS[q]
                        return (
                            <button
                                key={q}
                                className={`atl-quality-pill ${active ? 'atl-quality-pill-active' : ''}`}
                                style={active && color ? { borderColor: color, color, background: `${color}18` } : {}}
                                onClick={() => setQuality(q)}
                            >
                                {QUALITY_LABELS[q]}
                            </button>
                        )
                    })}
                </div>

                {/* Results count */}
                {isFiltering && (
                    <span className="atl-count">
                        {totalShown} augment{totalShown !== 1 ? 's' : ''}
                        <button className="atl-clear" onClick={() => { setQuality('All'); setSearch('') }}>
                            Clear
                        </button>
                    </span>
                )}
            </div>

            {/* ── Tier rows ── */}
            <div className="augment-tier-list">
                {TIERS.map(tier => {
                    const augments = filter(tierList[tier] || [])
                    if (augments.length === 0) return null
                    return (
                        <div key={tier} className="augment-tier-row">
                            <div className="augment-tier-label" style={{ backgroundColor: TIER_COLORS[tier] }}>
                                <span className="augment-tier-letter">{tier}</span>
                                <span className="augment-tier-desc">{TIER_LABELS[tier]}</span>
                                <span className="augment-tier-count">{augments.length}</span>
                            </div>
                            <div className="augment-tier-items">
                                {augments.map(augment => {
                                    const name    = cleanName(augment.name)
                                    const qColor  = QUALITY_COLORS[augment.tier]
                                    return (
                                        <div key={augment.id} className="augment-tier-card">
                                            {/* Quality colour bar at top of card */}
                                            <div className="augment-card-bar" style={{ background: qColor }} />

                                            {augment.imageUrl && (
                                                <img src={augment.imageUrl} alt={name} className="augment-tier-icon" />
                                            )}
                                            <span className="augment-tier-name">{name}</span>

                                            {/* Quality badge */}
                                            <span className="augment-quality-badge" style={{ color: qColor, borderColor: `${qColor}44` }}>
                                                {QUALITY_LABELS[augment.tier]}
                                            </span>

                                            {/* Hover tooltip */}
                                            <div className="tier-card-tooltip">
                                                <div className="tier-tooltip-header">
                                                    {augment.imageUrl && <img src={augment.imageUrl} alt={name} className="tier-tooltip-icon" />}
                                                    <span className="tier-tooltip-name">{name}</span>
                                                </div>
                                                {augment.description && (
                                                    <p className="tier-tooltip-desc">{highlightKeywords(augment.description)}</p>
                                                )}
                                                <div className="tier-tooltip-recipe">
                                                    <span className="tier-tooltip-tier-badge" style={{ color: qColor }}>
                                                        {QUALITY_LABELS[augment.tier]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {totalShown === 0 && (
                <div className="no-results">No augments match your filters.</div>
            )}
        </div>
    )
}

export default AugmentTierListPage
