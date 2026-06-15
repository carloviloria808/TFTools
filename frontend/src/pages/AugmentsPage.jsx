import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getAugmentsByTier } from '../services/api'

function AugmentsPage() {
    usePageTitle('Augments')
    const [augments, setAugments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTier, setActiveTier] = useState('1')
    const [search, setSearch] = useState('')

    useEffect(() => {
        let cancelled = false

        getAugmentsByTier(activeTier)
            .then(response => {
                if (!cancelled) {
                    setAugments(response.data)
                    setLoading(false)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Failed to load augments')
                    setLoading(false)
                }
            })

        return () => { cancelled = true }
    }, [activeTier])

    const handleTierChange = (tier) => {
        setAugments([])
        setLoading(true)
        setSearch('')       // clear search when switching tiers
        setActiveTier(tier)
    }

    // Calculate filtered results directly — no useEffect needed!
    const filtered = augments.filter(augment =>
        search.trim() === '' ||
        augment.name.toLowerCase().includes(search.toLowerCase()) ||
        augment.description.toLowerCase().includes(search.toLowerCase())
    )

    const tierNames = {
        '1': 'Silver',
        '2': 'Gold',
        '3': 'Prismatic'
    }

    if (error) return <div className="error">{error}</div>

    return (
        <div className="augments-page">
            <h1>Augments</h1>

            {/* Tier tabs */}
            <div className="tabs">
                <button
                    className={`tab silver ${activeTier === '1' ? 'active' : ''}`}
                    onClick={() => handleTierChange('1')}
                >
                    Silver
                </button>
                <button
                    className={`tab gold ${activeTier === '2' ? 'active' : ''}`}
                    onClick={() => handleTierChange('2')}
                >
                    Gold
                </button>
                <button
                    className={`tab prismatic ${activeTier === '3' ? 'active' : ''}`}
                    onClick={() => handleTierChange('3')}
                >
                    Prismatic
                </button>
            </div>

            {/* Search bar */}
            <div className="search-bar" style={{ marginTop: '16px' }}>
                <input
                    type="text"
                    placeholder={`Search ${tierNames[activeTier]} augments...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
                />
                {search && (
                    <button
                        className="search-clear"
                        onClick={() => setSearch('')}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Results count */}
            {!loading && (
                <p className="page-subtitle" style={{ marginTop: '8px' }}>
                    {filtered.length} augments
                </p>
            )}

            {loading ? (
                <div className="loading">Loading augments...</div>
            ) : (
                <>
                    {/* No results */}
                    {filtered.length === 0 && (
                        <div className="no-results">
                            No augments found for "{search}"
                        </div>
                    )}

                    <div className="augments-grid">
                        {filtered.map(augment => (
                            <div
                                key={augment.id}
                                className={`augment-card tier-${activeTier}`}
                            >
                                {augment.imageUrl && (
                                    <img
                                        src={augment.imageUrl}
                                        alt={augment.name}
                                        className="augment-icon"
                                    />
                                )}
                                <div className="augment-info">
                                    <h3>{augment.name}</h3>
                                    <p>{augment.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default AugmentsPage