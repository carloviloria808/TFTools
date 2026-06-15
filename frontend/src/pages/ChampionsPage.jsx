import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useNavigate } from 'react-router-dom'
import { getChampions } from '../services/api'

function ChampionsPage() {
    usePageTitle('Champions')
    const [champions, setChampions] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [activeCost, setActiveCost] = useState('all')
    const [search, setSearch] = useState('')
    const [traitFilter, setTraitFilter] = useState(null)

    useEffect(() => {
        getChampions()
            .then(response => {
                setChampions(response.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load champions')
                setLoading(false)
            })
    }, [])

    // Unique sorted list of all trait names (for the dropdown)
    const allTraitNames = [...new Set(
        champions.flatMap(c => c.traits.map(t => t.name))
    )].sort((a, b) => a.localeCompare(b))

    // Calculate filtered results directly — no useEffect needed!
    // This runs every render automatically when search/cost/trait changes
    const filtered = champions
        .filter(c => activeCost === 'all' || c.cost === activeCost)
        .filter(c => !traitFilter || c.traits.some(t => t.name === traitFilter))
        .filter(c =>
            search.trim() === '' ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.traits.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
        )

    const getCostColor = (cost) => {
        switch(cost) {
            case 1: return '#888888'
            case 2: return '#2ecc71'
            case 3: return '#3498db'
            case 4: return '#9b59b6'
            case 5: return '#f1c40f'
            default: return '#888888'
        }
    }

    if (loading) return <div className="loading">Loading champions...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="champions-page">
            <h1>Champions</h1>
            <p className="page-subtitle">{filtered.length} champions</p>

            {/* Search bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name or trait..."
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

            

            {/* Cost filter buttons */}
            <div className="cost-filters">
                <button
                    className={`cost-btn ${activeCost === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCost('all')}
                >
                    All
                </button>
                {[1, 2, 3, 4, 5].map(cost => (
                    <button
                        key={cost}
                        className={`cost-btn ${activeCost === cost ? 'active' : ''}`}
                        style={{
                            borderColor: getCostColor(cost),
                            color: activeCost === cost ? '#000' : getCostColor(cost),
                            backgroundColor: activeCost === cost ? getCostColor(cost) : 'transparent'
                        }}
                        onClick={() => setActiveCost(cost)}
                    >
                        {cost}g
                    </button>
                ))}

                {/* Trait filter dropdown */}
                <select
                    className={`champ-trait-select ${traitFilter ? 'champ-trait-select-active' : ''}`}
                    value={traitFilter ?? ''}
                    onChange={e => setTraitFilter(e.target.value || null)}
                >
                    <option value="">All Traits</option>
                    {allTraitNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>

                {traitFilter && (
                    <button className="champ-trait-clear" onClick={() => setTraitFilter(null)}>
                        Clear: {traitFilter} ✕
                    </button>
                )}
            </div>

            {/* No results message */}
            {filtered.length === 0 && (
                <div className="no-results">
                    {search
                        ? `No champions found for "${search}"`
                        : traitFilter
                            ? `No champions found for ${traitFilter}`
                            : 'No champions found'}
                </div>
            )}

            {/* Champions grid */}
            <div className="champions-grid">
                {filtered.map(champion => (
                    <div
                        key={champion.id}
                        className="champion-card"
                        style={{ borderTop: `3px solid ${getCostColor(champion.cost)}` }}
                        onClick={() => navigate(`/champions/${champion.id}`, {
                            state: { name: champion.name, imageUrl: champion.imageUrl, cost: champion.cost }
                        })}
                    >
                        {/* Blurred portrait background */}
                        {champion.imageUrl && (
                            <div
                                className="champion-card-bg"
                                style={{ backgroundImage: `url(${champion.imageUrl})` }}
                            />
                        )}

                        <div
                            className="champion-portrait"
                            style={{ borderColor: getCostColor(champion.cost) }}
                        >
                            {champion.imageUrl ? (
                                <img
                                    src={champion.imageUrl}
                                    alt={champion.name}
                                />
                            ) : (
                                <div
                                    className="champion-portrait-placeholder"
                                    style={{ backgroundColor: getCostColor(champion.cost) + '33' }}
                                >
                                    {champion.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h3 className="champion-name">{champion.name}</h3>
                        <div
                            className="champion-cost"
                            style={{ backgroundColor: getCostColor(champion.cost) }}
                        >
                            {champion.cost}g
                        </div>
                        <div className="champion-traits">
                            {champion.traits.map(trait => (
                                <span
                                    key={trait.id}
                                    className={`trait-tag trait-tag-clickable ${traitFilter === trait.name ? 'trait-tag-active' : ''}`}
                                    onClick={e => { e.stopPropagation(); setTraitFilter(trait.name) }}
                                    title={`Filter by ${trait.name}`}
                                >
                                    {trait.name}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChampionsPage