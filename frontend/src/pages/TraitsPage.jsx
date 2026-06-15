import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useNavigate } from 'react-router-dom'
import { getTraits } from '../services/api'

function TraitsPage() {
    usePageTitle('Traits')
    const navigate = useNavigate()
    const [traits, setTraits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [activeColor, setActiveColor] = useState('all')

    useEffect(() => {
        getTraits()
            .then(response => {
                setTraits(response.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load traits')
                setLoading(false)
            })
    }, [])

    // Get unique color tiers from traits data
    const colorTiers = ['all', 'Bronze', 'Silver', 'Gold', 'Prismatic']

    // Calculate filtered results directly
    const filtered = traits
        .filter(trait =>
            activeColor === 'all' ||
            trait.color.includes(activeColor)
        )
        .filter(trait =>
            search.trim() === '' ||
            trait.name.toLowerCase().includes(search.toLowerCase()) ||
            trait.description.toLowerCase().includes(search.toLowerCase()) ||
            trait.breakpoints.some(bp =>
                bp.bonus.toLowerCase().includes(search.toLowerCase())
            )
        )

    const colorStyles = {
        'Bronze':   { bg: '#cd7f32', text: '#000000' },
        'Silver':   { bg: '#a0a0a0', text: '#000000' },
        'Gold':     { bg: '#c89b3c', text: '#000000' },
        'Prismatic':{ bg: '#b566ff', text: '#ffffff' }
    }

    function cleanBonus(text) {
        return (text || '').replace(/^[\r\n\s]+/, '').trim()
    }

    if (loading) return <div className="loading">Loading traits...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="traits-page">
            <h1>Traits</h1>
            <p className="page-subtitle">{filtered.length} traits</p>

            {/* Search bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name, description, or bonus..."
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

            {/* Color tier filters */}
            <div className="color-filters">
                {colorTiers.map(color => (
                    <button
                        key={color}
                        className={`color-btn ${activeColor === color ? 'active' : ''}`}
                        style={color !== 'all' && activeColor === color ? {
                            backgroundColor: colorStyles[color].bg,
                            color: colorStyles[color].text,
                            borderColor: colorStyles[color].bg
                        } : color !== 'all' ? {
                            borderColor: colorStyles[color].bg,
                            color: colorStyles[color].bg
                        } : {}}
                        onClick={() => setActiveColor(color)}
                    >
                        {color === 'all' ? 'All' : color}
                    </button>
                ))}
            </div>

            {/* No results */}
            {filtered.length === 0 && (
                <div className="no-results">
                    No traits found for "{search}"
                </div>
            )}

            {/* Traits grid */}
            <div className="traits-grid">
                {filtered.map(trait => (
                    <div key={trait.id} className="trait-card">
                        <div className="trait-header">
                            {trait.imageUrl && (
                                <img
                                    src={trait.imageUrl}
                                    alt={trait.name}
                                    className="trait-icon"
                                />
                            )}
                            <div>
                                <h3>{trait.name}</h3>
                                {/* Color tier badges */}
                                <div className="trait-color-badges">
                                    {trait.color.split(',').map(c => c.trim()).map(c => (
                                        <span
                                            key={c}
                                            className="color-badge"
                                            style={{
                                                backgroundColor: colorStyles[c]?.bg || '#555',
                                                color: colorStyles[c]?.text || '#fff'
                                            }}
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="trait-description">{trait.description}</p>
                        <div className="trait-breakpoints">
                            {trait.breakpoints.map((bp, i) => {
                                const tiers    = trait.color.split(',').map(c => c.trim())
                                const tierName = tiers[i] ?? tiers[tiers.length - 1]
                                const color    = colorStyles[tierName]?.bg ?? '#c89b3c'
                                return (
                                    <div key={bp.id} className="breakpoint">
                                        <span className="breakpoint-units" style={{ backgroundColor: color }}>
                                            {bp.unitsRequired}
                                        </span>
                                        <span className="breakpoint-bonus">
                                            {cleanBonus(bp.bonus)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Champion portraits */}
                        {trait.champions && trait.champions.length > 0 && (
                            <div className="trait-champion-list">
                                {trait.champions.map(c => (
                                    <div
                                        key={c.id}
                                        className="trait-champion-portrait"
                                        onClick={() => navigate(`/champions/${c.id}`)}
                                        title={c.name}
                                    >
                                        {c.imageUrl ? (
                                            <img src={c.imageUrl} alt={c.name} />
                                        ) : (
                                            <div className="trait-champion-placeholder">
                                                {c.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="trait-champion-name">{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TraitsPage