import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getChampionById, getCompositions } from '../services/api'
import { usePageTitle } from '../hooks/usePageTitle'
import {
    GiHealthNormal,
    GiShield,
    GiCrossedSwords,
    GiBoltShield,
    GiSwordWound,
    GiDroplets,
} from 'react-icons/gi'
import { MdSpeed } from 'react-icons/md'

const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3',
}

function ChampionDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { state: routeState } = useLocation()
    const [champion, setChampion] = useState(null)
    usePageTitle(champion?.name ?? null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [usedInComps, setUsedInComps] = useState([])

    // Use data passed from the champions list for instant background render
    const previewImageUrl = routeState?.imageUrl || null

    useEffect(() => {
        getChampionById(id)
            .then(response => {
                setChampion(response.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load champion')
                setLoading(false)
            })
    }, [id])

    // Find which comps use this champion
    useEffect(() => {
        const champId = Number(id)
        getCompositions()
            .then(r => {
                const comps = r.data
                    .map(comp => {
                        const inComp = (comp.champions || []).find(cc => cc.id === champId)
                        return inComp ? { ...comp, isCarryHere: inComp.isCarry } : null
                    })
                    .filter(Boolean)
                    .sort((a, b) => {
                        // Carry comps first, then by tier
                        if (a.isCarryHere !== b.isCarryHere) return a.isCarryHere ? -1 : 1
                        const order = { S: 0, A: 1, B: 2, C: 3, X: 4 }
                        return (order[a.tier?.trim()] ?? 5) - (order[b.tier?.trim()] ?? 5)
                    })
                setUsedInComps(comps)
            })
            .catch(() => setUsedInComps([]))
    }, [id])

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

    if (loading) return (
        <div className="champion-detail-page">
            {previewImageUrl && (
                <div
                    className="champion-page-bg"
                    style={{ backgroundImage: `url(${previewImageUrl})` }}
                />
            )}
            <div className="loading">Loading champion...</div>
        </div>
    )
    if (error) return <div className="error">{error}</div>
    if (!champion) return null

    const costColor = getCostColor(champion.cost)

    return (
        <div className="champion-detail-page">

            {/* Full page blurred background */}
            {champion.imageUrl && (
                <div
                    className="champion-page-bg"
                    style={{ backgroundImage: `url(${champion.imageUrl})` }}
                />
            )}

            {/* Back button */}
            <button
                className="back-btn"
                onClick={() => navigate('/champions')}
            >
                ← Back to Champions
            </button>

            {/* Champion header */}
            <div
                className="champion-detail-header"
                style={{ borderTop: `4px solid ${costColor}` }}
            >
                {/* Blurred portrait background */}
                {champion.imageUrl && (
                    <div
                        className="champion-detail-bg"
                        style={{ backgroundImage: `url(${champion.imageUrl})` }}
                    />
                )}

                <div className="champion-detail-portrait">
                    {champion.imageUrl ? (
                        <img
                            src={champion.imageUrl}
                            alt={champion.name}
                        />
                    ) : (
                        <div
                            className="champion-detail-placeholder"
                            style={{ backgroundColor: costColor + '33' }}
                        >
                            {champion.name.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="champion-detail-info">
                    <h1>{champion.name}</h1>
                    <div
                        className="champion-detail-cost"
                        style={{ backgroundColor: costColor }}
                    >
                        {champion.cost} Gold
                    </div>

                    {/* Traits */}
                    <div className="champion-detail-traits">
                        <h3>Traits</h3>
                        <div className="champion-detail-trait-list">
                            {champion.traits.map(trait => (
                                <div key={trait.id} className="champion-detail-trait">
                                    {trait.imageUrl && (
                                        <img
                                            src={trait.imageUrl}
                                            alt={trait.name}
                                            className="detail-trait-icon"
                                        />
                                    )}
                                    <span>{trait.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ability section */}
            {champion.ability && (
                <div className="champion-detail-section">
                    <h2>Ability</h2>
                    <div className="ability-card">
                        {champion.ability.imageUrl && (
                            <div
                                className="champion-detail-bg"
                                style={{ backgroundImage: `url(${champion.ability.imageUrl})` }}
                            />
                        )}
                        {champion.ability.imageUrl && (
                            <img
                                src={champion.ability.imageUrl}
                                alt={champion.ability.name}
                                className="ability-icon"
                            />
                        )}
                        <div className="ability-info">
                            <h3 className="ability-name">{champion.ability.name}</h3>
                            <p className="ability-description">{champion.ability.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats section */}
            {champion.stats && (
                <div className="champion-detail-section">
                    <h2>{champion.name} Stats</h2>
                    <div className="stats-grid">

                        <div className="stat-card">
                            <span className="stat-label">Health</span>
                            <span className="stat-value stat-health">
                                <GiHealthNormal className="stat-icon" />
                                {champion.stats.health1} / {champion.stats.health2} / {champion.stats.health3}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">Armor</span>
                            <span className="stat-value stat-defense">
                                <GiShield className="stat-icon" />
                                {champion.stats.armor}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">Damage</span>
                            <span className="stat-value stat-offense">
                                <GiCrossedSwords className="stat-icon" />
                                {champion.stats.damage1} / {champion.stats.damage2} / {champion.stats.damage3}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">Attack Speed</span>
                            <span className="stat-value stat-speed">
                                <MdSpeed className="stat-icon" />
                                {champion.stats.attackSpeed}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">DPS</span>
                            <span className="stat-value stat-offense">
                                <GiSwordWound className="stat-icon" />
                                {champion.stats.dps1} / {champion.stats.dps2} / {champion.stats.dps3}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">Mana</span>
                            <span className="stat-value stat-mana">
                                <GiDroplets className="stat-icon" />
                                {champion.stats.startingMana} / {champion.stats.totalMana}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">MR</span>
                            <span className="stat-value stat-mr">
                                <GiBoltShield className="stat-icon" />
                                {champion.stats.mr}
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">Range</span>
                            <div className="stat-range-bars">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div
                                        key={i}
                                        className={`range-bar ${i <= champion.stats.range ? 'range-bar--active' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Recommended Items section */}
            {champion.recommendedItems && champion.recommendedItems.length > 0 && (
                <div className="champion-detail-section">
                    <h2>Recommended Items</h2>
                    <div className="recommended-items-list">
                        {champion.recommendedItems.map(item => (
                            <div key={item.id} className="recommended-item-card">
                                <div className="recommended-item-left">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="recommended-item-icon"
                                        />
                                    )}
                                    <div className="recommended-item-info">
                                        <span className="recommended-item-name">{item.name}</span>
                                        <span className="recommended-item-desc">{item.description}</span>
                                    </div>
                                </div>
                                <div className="recommended-item-components">
                                    {item.component1 && (
                                        <img
                                            src={item.component1.imageUrl}
                                            alt={item.component1.name}
                                            title={item.component1.name}
                                            className="component-icon"
                                        />
                                    )}
                                    {item.component2 && (
                                        <img
                                            src={item.component2.imageUrl}
                                            alt={item.component2.name}
                                            title={item.component2.name}
                                            className="component-icon"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Used in Comps section */}
            {usedInComps.length > 0 && (
                <div className="champion-detail-section">
                    <h2>Comps Using {champion.name}</h2>
                    <div className="champ-comps-grid">
                        {usedInComps.map(comp => (
                            <div
                                key={comp.id}
                                className="champ-comp-card"
                                onClick={() => navigate(`/compositions/${comp.id}`)}
                                style={{ borderLeftColor: TIER_COLORS[comp.tier?.trim()] ?? '#888' }}
                            >
                                {comp.carryImageUrl && (
                                    <img src={comp.carryImageUrl} alt={comp.name} className="champ-comp-carry" />
                                )}
                                <div className="champ-comp-info">
                                    <div className="champ-comp-name-row">
                                        <span className="champ-comp-name">{comp.name}</span>
                                        <span
                                            className="champ-comp-tier"
                                            style={{ background: TIER_COLORS[comp.tier?.trim()] ?? '#888' }}
                                        >
                                            {comp.tier?.trim()}
                                        </span>
                                    </div>
                                    <div className="champ-comp-meta">
                                        {comp.isCarryHere && <span className="champ-comp-carry-badge">★ Carry</span>}
                                        {comp.playstyle && <span className="champ-comp-playstyle">{comp.playstyle}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trait details section */}
            <div className="champion-detail-section">
                <h2>Trait Details</h2>
                <div className="champion-trait-details">
                    {champion.traits.map(trait => (
                        <div key={trait.id} className="trait-detail-card">
                            <div className="trait-detail-header">
                                {trait.imageUrl && (
                                    <img
                                        src={trait.imageUrl}
                                        alt={trait.name}
                                        className="trait-icon"
                                    />
                                )}
                                <h3>{trait.name}</h3>
                            </div>
                            <p className="trait-description">{trait.description}</p>

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

        </div>
    )
}

export default ChampionDetailPage