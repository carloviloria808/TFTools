import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getComponents, getCombinedItems } from '../services/api'

function ItemCheatSheetPage() {
    usePageTitle('Item Cheat Sheet')
    const [components, setComponents] = useState([])
    const [combined,   setCombined]   = useState([])
    const [loading,    setLoading]    = useState(true)
    const [error,      setError]      = useState(null)
    const [hover,      setHover]      = useState(null)   // { r, c }

    useEffect(() => {
        Promise.all([getComponents(), getCombinedItems()])
            .then(([compRes, combRes]) => {
                setComponents([...compRes.data].sort((a, b) => a.id - b.id))
                setCombined(combRes.data)
                setLoading(false)
            })
            .catch(() => { setError('Failed to load items'); setLoading(false) })
    }, [])

    // Lookup combined item by unordered component-id pair
    const lookup = {}
    combined.forEach(item => {
        if (item.component1Id && item.component2Id) {
            const key = [item.component1Id, item.component2Id].sort((a, b) => a - b).join('-')
            lookup[key] = item
        }
    })
    const getCombined = (a, b) => lookup[[a, b].sort((x, y) => x - y).join('-')]

    if (loading) return <div className="loading">Loading cheat sheet...</div>
    if (error)   return <div className="error">{error}</div>

    // Currently hovered combined item (for the info panel)
    const hoverItem = hover ? getCombined(components[hover.r].id, components[hover.c].id) : null
    const hoverRecipe = hover ? `${components[hover.r].name} + ${components[hover.c].name}` : null

    return (
        <div className="cheatsheet-page">
            <h1>Item Cheat Sheet</h1>
            <p className="page-subtitle">Combine any two components to build a finished item</p>

            {/* Info panel */}
            <div className="cheatsheet-info">
                {hoverItem ? (
                    <>
                        <img src={hoverItem.imageUrl} alt={hoverItem.name} className="cheatsheet-info-img" />
                        <div className="cheatsheet-info-text">
                            <div className="cheatsheet-info-name">{hoverItem.name}</div>
                            <div className="cheatsheet-info-recipe">{hoverRecipe}</div>
                            <div className="cheatsheet-info-desc">{hoverItem.description}</div>
                        </div>
                    </>
                ) : (
                    <span className="cheatsheet-info-hint">Hover a cell to see the item it builds</span>
                )}
            </div>

            {/* Recipe grid */}
            <div className="cheatsheet-scroll">
                <table className="cheatsheet-table">
                    <thead>
                        <tr>
                            <th className="cheatsheet-corner" />
                            {components.map((c, ci) => (
                                <th key={c.id} className={`cheatsheet-head ${hover?.c === ci ? 'cheatsheet-head-active' : ''}`}>
                                    <img src={c.imageUrl} alt={c.name} title={c.name} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {components.map((rowComp, ri) => (
                            <tr key={rowComp.id}>
                                <th className={`cheatsheet-head ${hover?.r === ri ? 'cheatsheet-head-active' : ''}`}>
                                    <img src={rowComp.imageUrl} alt={rowComp.name} title={rowComp.name} />
                                </th>
                                {components.map((colComp, ci) => {
                                    const item = getCombined(rowComp.id, colComp.id)
                                    const isActive = hover && (hover.r === ri || hover.c === ci)
                                    return (
                                        <td
                                            key={colComp.id}
                                            className={`cheatsheet-cell ${isActive ? 'cheatsheet-cell-active' : ''} ${hover?.r === ri && hover?.c === ci ? 'cheatsheet-cell-hover' : ''}`}
                                            onMouseEnter={() => setHover({ r: ri, c: ci })}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            {item?.imageUrl && (
                                                <img src={item.imageUrl} alt={item.name} className="cheatsheet-item-img" />
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ItemCheatSheetPage
