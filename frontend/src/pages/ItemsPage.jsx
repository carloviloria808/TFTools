import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getComponents, getCombinedItems } from '../services/api'
import { highlightKeywords } from '../utils/highlightKeywords'

function ItemsPage() {
    usePageTitle('Items')
    const [components, setComponents] = useState([])
    const [combinedItems, setCombinedItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('combined')
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')

    const consumableNames = ['champion duplicator', 'lesser champion duplicator', 'magnetic remover', 'reforger']
    const psionicNames = ['biomatter preserver', 'drone uplink', 'malware matrix', 'sympathetic implant', 'target-lock optics']
    const animaNames = [
        "animapocalypse", "battle bunny crossbow", "broken prototype", "bunny prime ballista",
        "cyclonic slicers", "deep freeze", "echoing batblades", "evolved embershot",
        "guiding hex", "iceblast armor", "leaky prototype", "leonine lamentation",
        "lioness's lament", "omniweapon", "owo blaster", "radiant field",
        "rocket swarm", "savage slicer", "searing shortbow", "solar eclipse",
        "sparking prototype", "tentacle slam", "the annihilator", "unceasing cyclone",
        "uwu blaster", "vayne's chromablades"
    ]
    const artifactNames = [
        "aegis of dawn", "aegis of dusk", "ahri's aura", "blighting jewel",
        "cappa juice", "dawncore", "deathfire grasp", "death's defiance",
        "ekko's patience", "eternal pact", "evelynn's instinct", "fishbones",
        "flickerblade", "gambler's blade", "gold collector", "hellfire hatchet",
        "horizon focus", "hullcrusher", "indomitable gauntlet", "infinity force",
        "innervating locket", "kayle's exaltation", "kayle's radiant exaltation",
        "lesser mirrored persona", "lich bane", "lightshield crest", "luden's tempest",
        "manazane", "mending echoes", "mirrored persona", "mittens", "mogul's mail",
        "prowler's claw", "rapid firecannon", "seeker's armguard", "shadow puppet",
        "silvermere dawn", "sniper's focus", "soraka's miracle", "spectral cutlass",
        "statikk shiv", "suspicious trench coat", "talisman of ascension",
        "the darkin aegis", "the darkin bow", "the darkin scythe", "the darkin staff",
        "thresh's lantern", "titanic hydra", "trickster's glass", "unending despair",
        "varus's obsession", "void gauntlet", "wit's end", "yasuo's bladework",
        "zhonya's paradox"
    ]

    const filterItem = (item) => {
        const name = item.name.toLowerCase()
        switch (activeFilter) {
            case 'emblem':      return name.includes('emblem')
            case 'artifact':    return artifactNames.includes(name)
            case 'psionic':     return (name.includes('psionic') && !name.includes('emblem')) || psionicNames.includes(name)
            case 'radiant':     return name.includes('radiant')
            case 'consumable':  return consumableNames.includes(name)
            case 'anima':       return animaNames.includes(name)
            default:            return true
        }
    }

    useEffect(() => {
        Promise.all([getComponents(), getCombinedItems()])
            .then(([componentsRes, combinedRes]) => {
                setComponents(componentsRes.data)
                setCombinedItems(combinedRes.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load items')
                setLoading(false)
            })
    }, [])

    // Calculate filtered results directly — no useEffect needed!
    const filteredCombined = combinedItems
        .filter(filterItem)
        .filter(item =>
            search.trim() === '' ||
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            (item.component1 && item.component1.name.toLowerCase().includes(search.toLowerCase())) ||
            (item.component2 && item.component2.name.toLowerCase().includes(search.toLowerCase()))
        )

    const filteredComponents = components.filter(item =>
        search.trim() === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    )

    const activeItems = activeTab === 'combined' ? filteredCombined : filteredComponents

    if (loading) return <div className="loading">Loading items...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="items-page">
            <h1>Items</h1>

            {/* Search bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder={activeTab === 'combined'
                        ? 'Search by name, description, or component...'
                        : 'Search by name or description...'
                    }
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

            {/* Tab buttons */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'combined' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('combined'); setSearch(''); setActiveFilter('all') }}
                >
                    Combined Items ({filteredCombined.length})
                </button>
                <button
                    className={`tab ${activeTab === 'components' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('components'); setSearch('') }}
                >
                    Components ({filteredComponents.length})
                </button>
            </div>

            {/* Filters — only shown on Combined tab */}
            {activeTab === 'combined' && (
                <div className="item-filters">
                    {[
                        { key: 'all',        label: 'All' },
                        { key: 'emblem',     label: 'Emblems' },
                        { key: 'artifact',   label: 'Artifacts' },
                        { key: 'psionic',    label: 'Psionic Items' },
                        { key: 'radiant',    label: 'Radiant Items' },
                        { key: 'consumable', label: 'Consumables' },
                        { key: 'anima',      label: 'Anima Items' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`item-filter-btn ${activeFilter === key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {activeItems.length === 0 && (
                <div className="no-results">
                    No items found for "{search}"
                </div>
            )}

            {/* Items grid */}
            <div className="items-grid">
                {activeItems.map(item => (
                    <div key={item.id} className="item-card">
                        {item.imageUrl && (
                            <div
                                className="item-card-bg"
                                style={{ backgroundImage: `url(${item.imageUrl})` }}
                            />
                        )}
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="item-icon"
                            />
                        )}
                        <h3>{item.name}</h3>
                        <p className="item-description">{highlightKeywords(item.description)}</p>
                        {item.component1 && item.component2 && (
                            <div className="item-recipe">
                                <span className="recipe-label">Recipe:</span>
                                <div className="recipe-components">
                                    {item.component1.imageUrl && (
                                        <img
                                            src={item.component1.imageUrl}
                                            alt={item.component1.name}
                                            className="recipe-component-img"
                                            title={item.component1.name}
                                        />
                                    )}
                                    <span className="recipe-plus">+</span>
                                    {item.component2.imageUrl && (
                                        <img
                                            src={item.component2.imageUrl}
                                            alt={item.component2.name}
                                            className="recipe-component-img"
                                            title={item.component2.name}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ItemsPage