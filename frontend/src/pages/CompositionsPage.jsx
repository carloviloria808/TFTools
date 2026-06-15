import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCompositions, getCompositionById, getTierListLastUpdated } from '../services/api'
import CompDetailModal from '../components/CompDetailModal'
import { TierListSkeleton } from '../components/Skeleton'
import { useFavorites } from '../hooks/useFavorites'

function timeAgo(dateStr) {
    const normalized = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
    const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000)
    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
}

const TIERS = ['S', 'A', 'B', 'C', 'X']

const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3'
}

const TIER_DESCRIPTIONS = {
    S: 'META', A: 'STRONG', B: 'SOLID', C: 'SITUATIONAL', X: 'CONDITIONAL'
}

const LEGEND_DESCRIPTIONS = {
    S: 'Strongest in the meta',
    A: 'Very strong and consistent',
    B: 'Solid options worth playing',
    C: 'Situational or weaker picks',
    X: 'Requires specific augments or items'
}

const PLAYSTYLES = ['Standard', 'Fast 8', 'Fast 9', 'Reroll']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const PLAYSTYLE_COLORS = {
    'Standard': '#74b9ff',
    'Fast 8':   '#6c5ce7',
    'Fast 9':   '#e17055',
    'Reroll':   '#00b894',
}

const SORT_OPTIONS = [
    { value: 'tier',      label: 'Tier (Default)' },
    { value: 'top4',      label: 'Top 4 Rate' },
    { value: 'winrate',   label: 'Win Rate' },
    { value: 'placement', label: 'Avg Placement' },
]

function CompositionsPage() {
    usePageTitle('Comp Tier List')
    const [compositions,  setCompositions]  = useState([])
    const [lastUpdated,   setLastUpdated]   = useState(null)
    const [loading,       setLoading]       = useState(true)
    const [error,         setError]         = useState(null)

    // Filters
    const [search,           setSearch]           = useState('')
    const [playstyleFilter, setPlaystyleFilter] = useState(null)   // null = All
    const [difficultyFilter, setDifficultyFilter] = useState(null) // null = All
    const [favoritesOnly,    setFavoritesOnly]    = useState(false)
    const [sortBy, setSortBy] = useState('tier')

    const { isFavorite, toggleFavorite, favorites, clearFavorites } = useFavorites()

    // Modal state
    const [modalOpen,     setModalOpen]     = useState(false)
    const [selectedComp,  setSelectedComp]  = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)

    useEffect(() => {
        Promise.all([getCompositions(), getTierListLastUpdated()])
            .then(([compsRes, lastUpdatedRes]) => {
                setCompositions(compsRes.data)
                setLastUpdated(lastUpdatedRes.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load compositions')
                setLoading(false)
            })
    }, [])

    function openComp(comp) {
        setSelectedComp({
            id: comp.id,
            name: comp.name,
            tier: comp.tier,
            description: comp.description,
            playstyle: comp.playstyle,
            difficulty: comp.difficulty,
            patchVersion: comp.patchVersion,
            isConditional: comp.isConditional,
            carryImageUrl: comp.carryImageUrl,
            top4Rate: comp.top4Rate,
            winRate: comp.winRate,
            playRate: comp.playRate,
            avgPlacement: comp.avgPlacement,
            tips: '',
            champions: [],
        })
        setModalOpen(true)
        setDetailLoading(true)

        getCompositionById(comp.id)
            .then(r => { setSelectedComp(r.data); setDetailLoading(false) })
            .catch(() => { setDetailLoading(false) })
    }

    function closeModal() {
        setModalOpen(false)
        setSelectedComp(null)
        setDetailLoading(false)
    }

    function togglePlaystyle(p) {
        setPlaystyleFilter(prev => prev === p ? null : p)
    }

    function toggleDifficulty(d) {
        setDifficultyFilter(prev => prev === d ? null : d)
    }

    if (error) return <div className="error">{error}</div>

    // ── Filter + sort ────────────────────────────────────────────
    let filtered = compositions
    if (search)           filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    if (playstyleFilter)  filtered = filtered.filter(c => c.playstyle  === playstyleFilter)
    if (difficultyFilter) filtered = filtered.filter(c => c.difficulty === difficultyFilter)
    if (favoritesOnly)    filtered = filtered.filter(c => isFavorite(c.id))

    // Sort within each tier group (or globally for stat sorts)
    const sortFn = {
        tier:      null, // default — preserve natural tier grouping
        top4:      (a, b) => (b.top4Rate     ?? -1) - (a.top4Rate     ?? -1),
        winrate:   (a, b) => (b.winRate      ?? -1) - (a.winRate      ?? -1),
        placement: (a, b) => (a.avgPlacement ?? 99) - (b.avgPlacement ?? 99),
    }[sortBy]

    const grouped = TIERS.reduce((acc, tier) => {
        let comps = filtered.filter(c => c.tier?.trim() === tier)
        if (sortFn) comps = [...comps].sort(sortFn)
        acc[tier] = comps
        return acc
    }, {})

    const totalFiltered = filtered.length
    const isFiltering   = search || playstyleFilter || difficultyFilter || favoritesOnly

    return (
        <div className="compositions-page">
            <h1>Comp Tier List</h1>
            <p className="page-subtitle">
                Patch 17.5
                {lastUpdated && (
                    <span className="tierlist-last-updated">
                        {' | '}
                        <Link to="/compositions/history" className="tierlist-history-link">
                            Last updated: {timeAgo(lastUpdated)}
                        </Link>
                    </span>
                )}
            </p>

            {/* ── Filter bar ── */}
            <div className="comp-filter-bar">
                <div className="comp-search-row">
                    <input
                        className="comp-search-input"
                        type="text"
                        placeholder="Search compositions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="comp-search-clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>
                <div className="comp-filter-row">
                <div className="comp-filter-group">
                    <span className="comp-filter-label">Playstyle</span>
                    <div className="comp-filter-pills">
                        {PLAYSTYLES.map(p => {
                            const active = playstyleFilter === p
                            const color  = PLAYSTYLE_COLORS[p]
                            return (
                                <button
                                    key={p}
                                    className={`comp-filter-pill ${active ? 'comp-filter-pill-active' : ''}`}
                                    style={active ? { borderColor: color, color, background: `${color}18` } : {}}
                                    onClick={() => togglePlaystyle(p)}
                                >
                                    {p}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="comp-filter-group">
                    <span className="comp-filter-label">Difficulty</span>
                    <div className="comp-filter-pills">
                        {DIFFICULTIES.map(d => (
                            <button
                                key={d}
                                className={`comp-filter-pill ${difficultyFilter === d ? 'comp-filter-pill-active comp-filter-pill-diff' : ''}`}
                                onClick={() => toggleDifficulty(d)}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="comp-filter-group">
                    <span className="comp-filter-label">Saved</span>
                    <div className="comp-fav-pill-wrap">
                        <button
                            className={`comp-filter-pill comp-fav-pill ${favoritesOnly ? 'comp-fav-pill-active' : ''}`}
                            onClick={() => setFavoritesOnly(v => !v)}
                            title="Show only favorited comps"
                        >
                            ★ Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
                        </button>
                        {favorites.length > 0 && (
                            <button
                                className="comp-fav-clear"
                                onClick={() => { clearFavorites(); setFavoritesOnly(false) }}
                                title="Clear all favorites"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="comp-filter-group comp-filter-group-right">
                    <span className="comp-filter-label">Sort by</span>
                    <select
                        className="comp-sort-select"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
                </div>
            </div>

            {/* ── Results count when filtering ── */}
            {isFiltering && (
                <p className="comp-filter-count">
                    {totalFiltered === 0
                        ? 'No comps match the selected filters'
                        : `Showing ${totalFiltered} comp${totalFiltered !== 1 ? 's' : ''}`
                    }
                    <button className="comp-filter-clear" onClick={() => { setSearch(''); setPlaystyleFilter(null); setDifficultyFilter(null); setFavoritesOnly(false) }}>
                        Clear filters
                    </button>
                </p>
            )}

            {/* ── Tier list ── */}
            {loading ? <TierListSkeleton /> : <div className="comp-tier-list">
                {TIERS.map(tier => {
                    const comps = grouped[tier] || []
                    if (comps.length === 0) return null
                    return (
                        <div key={tier} className="comp-tier-row" style={{ borderColor: TIER_COLORS[tier] }}>
                            <div className="comp-tier-label" style={{ backgroundColor: TIER_COLORS[tier] }}>
                                <span className="comp-tier-letter">{tier}</span>
                                <span className="comp-tier-desc">{TIER_DESCRIPTIONS[tier]}</span>
                            </div>

                            <div className="comp-tier-items">
                                {comps.map(comp => (
                                    <div
                                        key={comp.id}
                                        className="comp-card-icon"
                                        onClick={() => openComp(comp)}
                                        style={{ cursor: 'pointer' }}
                                        title={`View ${comp.name}`}
                                    >
                                        <div
                                            className="comp-card-icon-img-wrapper"
                                            style={{ borderColor: TIER_COLORS[tier] }}
                                        >
                                            {comp.carryImageUrl ? (
                                                <img src={comp.carryImageUrl} alt={comp.name} className="comp-card-icon-img" />
                                            ) : (
                                                <div className="comp-card-icon-placeholder" />
                                            )}
                                            {comp.isConditional && (
                                                <span className="comp-card-conditional-dot" title="Conditional" />
                                            )}
                                        </div>
                                        <button
                                            className={`comp-fav-star ${isFavorite(comp.id) ? 'comp-fav-star-on' : ''}`}
                                            onClick={e => { e.stopPropagation(); toggleFavorite(comp.id) }}
                                            title={isFavorite(comp.id) ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            ★
                                        </button>
                                        {comp.trend === 'up'   && <span className="comp-trend-badge comp-trend-up"  title="Buffed this patch">▲</span>}
                                        {comp.trend === 'down' && <span className="comp-trend-badge comp-trend-down" title="Nerfed this patch">▼</span>}
                                        {comp.trend === 'new'  && <span className="comp-trend-badge comp-trend-new"  title="New this patch">+</span>}
                                        <div className="comp-card-tooltip">
                                            <span className="comp-card-tooltip-name">{comp.name}</span>
                                            {(comp.top4Rate != null || comp.winRate != null) && (
                                                <span className="comp-card-tooltip-stats">
                                                    {comp.top4Rate != null && `Top4 ${(comp.top4Rate * 100).toFixed(1)}%`}
                                                    {comp.top4Rate != null && comp.winRate != null && ' · '}
                                                    {comp.winRate != null && `Win ${(comp.winRate * 100).toFixed(1)}%`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>}

            {/* ── Legend ── */}
            <div className="comp-legend">
                {TIERS.map(tier => (
                    <div key={tier} className="comp-legend-item">
                        <div className="comp-legend-badge" style={{ backgroundColor: TIER_COLORS[tier] }} />
                        <span className="comp-legend-desc">{LEGEND_DESCRIPTIONS[tier]}</span>
                    </div>
                ))}
            </div>

            {/* ── Detail modal ── */}
            {modalOpen && (
                <CompDetailModal
                    comp={selectedComp}
                    loading={detailLoading && !selectedComp?.champions?.length}
                    onClose={closeModal}
                />
            )}
        </div>
    )
}

export default CompositionsPage
