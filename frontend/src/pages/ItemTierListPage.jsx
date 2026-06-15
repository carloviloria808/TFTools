import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getItemTierList } from '../services/api'
import { highlightKeywords } from '../utils/highlightKeywords'

const tiers = ['S', 'A', 'B', 'C', 'D']

const tierColors = {
    S: '#ff7675',
    A: '#fdcb6e',
    B: '#6c5ce7',
    C: '#00b894',
    D: '#b2bec3'
}

const tierLabels = {
    S: 'Best in game',
    A: 'Very strong',
    B: 'Solid pick',
    C: 'Situational',
    D: 'Weak'
}

function ItemTierListPage() {
    usePageTitle('Item Tier List')
    const [tierList, setTierList] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        getItemTierList()
            .then(response => {
                setTierList(response.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load tier list')
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loading">Loading tier list...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="augment-tierlist-page">
            <h1>Item Tier List</h1>
            <p className="page-subtitle">Patch 17.5 — Standard Items</p>

            <div className="augment-tier-list">
                {tiers.map(tier => {
                    const items = tierList[tier] || []
                    if (items.length === 0) return null
                    return (
                        <div key={tier} className="augment-tier-row">
                            <div
                                className="augment-tier-label"
                                style={{ backgroundColor: tierColors[tier] }}
                            >
                                <span className="augment-tier-letter">{tier}</span>
                                <span className="augment-tier-desc">{tierLabels[tier]}</span>
                            </div>
                            <div className="augment-tier-items">
                                {items.map(item => (
                                    <div key={item.id} className="augment-tier-card">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="augment-tier-icon"
                                            />
                                        )}
                                        <span className="augment-tier-name">{item.name}</span>
                                        <div className="tier-card-tooltip">
                                            <div className="tier-tooltip-header">
                                                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="tier-tooltip-icon" />}
                                                <span className="tier-tooltip-name">{item.name}</span>
                                            </div>
                                            {item.description && (
                                                <p className="tier-tooltip-desc">{highlightKeywords(item.description)}</p>
                                            )}
                                            {(item.component1 || item.component2) && (
                                                <div className="tier-tooltip-recipe">
                                                    {item.component1?.imageUrl && (
                                                        <img src={item.component1.imageUrl} alt={item.component1.name} title={item.component1.name} className="tier-tooltip-component" />
                                                    )}
                                                    {item.component1 && item.component2 && <span className="tier-tooltip-plus">+</span>}
                                                    {item.component2?.imageUrl && (
                                                        <img src={item.component2.imageUrl} alt={item.component2.name} title={item.component2.name} className="tier-tooltip-component" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {Object.values(tierList).every(arr => arr.length === 0) && (
                <div className="no-results">No items have been rated yet.</div>
            )}
        </div>
    )
}

export default ItemTierListPage
