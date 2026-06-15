import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useNavigate } from 'react-router-dom'
import { getCompositions, updateCompStats } from '../services/api'

const TIERS = ['S', 'A', 'B', 'C', 'X']
const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3'
}

// Row state: values the user types are percentages (e.g. "67.0") for rates,
// raw decimal for avgPlacement (e.g. "3.41")
function compToRow(comp) {
    return {
        tier:     comp.tier ?? 'C',
        top4:     comp.top4Rate    != null ? (comp.top4Rate * 100).toFixed(1)  : '',
        win:      comp.winRate     != null ? (comp.winRate  * 100).toFixed(1)  : '',
        play:     comp.playRate    != null ? (comp.playRate  * 100).toFixed(1) : '',
        avg:      comp.avgPlacement != null ? comp.avgPlacement.toFixed(2)     : '',
    }
}

function AdminStatsPage() {
    usePageTitle('Stats Editor')
    const [comps,   setComps]   = useState([])
    const [rows,    setRows]    = useState({})   // { [id]: { tier, top4, win, play, avg } }
    const [status,  setStatus]  = useState({})   // { [id]: 'saving' | 'saved' | 'error' }
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    function handleLogout() {
        localStorage.removeItem('admin_auth')
        navigate('/admin/login')
    }

    useEffect(() => {
        getCompositions().then(r => {
            const data = r.data
            setComps(data)
            const initial = {}
            data.forEach(c => { initial[c.id] = compToRow(c) })
            setRows(initial)
            setLoading(false)
        })
    }, [])

    function handleChange(id, field, value) {
        setRows(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
        // Clear status when user edits
        setStatus(prev => { const n = { ...prev }; delete n[id]; return n })
    }

    async function handleSave(id) {
        const row = rows[id]
        const payload = {
            tier:         row.tier || undefined,
            top4Rate:     row.top4 !== '' ? parseFloat(row.top4) / 100 : undefined,
            winRate:      row.win  !== '' ? parseFloat(row.win)  / 100 : undefined,
            playRate:     row.play !== '' ? parseFloat(row.play) / 100 : undefined,
            avgPlacement: row.avg  !== '' ? parseFloat(row.avg)        : undefined,
        }
        // Remove undefined keys
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

        setStatus(prev => ({ ...prev, [id]: 'saving' }))
        try {
            await updateCompStats(id, payload)
            setStatus(prev => ({ ...prev, [id]: 'saved' }))
            setTimeout(() => setStatus(prev => { const n = { ...prev }; delete n[id]; return n }), 2000)
        } catch {
            setStatus(prev => ({ ...prev, [id]: 'error' }))
        }
    }

    async function handleSaveAll() {
        const ids = comps.map(c => c.id)
        for (const id of ids) {
            await handleSave(id)
        }
    }

    if (loading) return <div className="loading">Loading comps...</div>

    const grouped = TIERS.reduce((acc, t) => {
        acc[t] = comps.filter(c => c.tier?.trim() === t)
        return acc
    }, {})

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Stats Editor</h1>
                    <p className="admin-subtitle">
                        Update per-comp stats each patch. Top 4, Win, and Play values are percentages (e.g. <code>67.0</code> for 67%). Avg Placement is a decimal (e.g. <code>3.41</code>).
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="admin-save-all-btn" onClick={handleSaveAll}>
                        Save All
                    </button>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div>

            {TIERS.map(tier => {
                const tierComps = grouped[tier] || []
                if (tierComps.length === 0) return null
                return (
                    <div key={tier} className="admin-tier-section">
                        <div className="admin-tier-label" style={{ borderColor: TIER_COLORS[tier], color: TIER_COLORS[tier] }}>
                            {tier} Tier
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="admin-th admin-th-name">Composition</th>
                                    <th className="admin-th">Tier</th>
                                    <th className="admin-th">Top 4 %</th>
                                    <th className="admin-th">Win %</th>
                                    <th className="admin-th">Play %</th>
                                    <th className="admin-th">Avg Place</th>
                                    <th className="admin-th" />
                                </tr>
                            </thead>
                            <tbody>
                                {tierComps.map(comp => {
                                    const row = rows[comp.id] ?? {}
                                    const st  = status[comp.id]
                                    return (
                                        <tr
                                            key={comp.id}
                                            className={`admin-row ${st === 'saved' ? 'admin-row-saved' : st === 'error' ? 'admin-row-error' : ''}`}
                                        >
                                            {/* Name */}
                                            <td className="admin-td admin-td-name">
                                                {comp.carryImageUrl && (
                                                    <img src={comp.carryImageUrl} alt="" className="admin-carry-thumb" />
                                                )}
                                                <span>{comp.name}</span>
                                            </td>

                                            {/* Tier selector */}
                                            <td className="admin-td">
                                                <select
                                                    className="admin-select"
                                                    value={row.tier ?? tier}
                                                    style={{ color: TIER_COLORS[row.tier] ?? TIER_COLORS[tier] }}
                                                    onChange={e => handleChange(comp.id, 'tier', e.target.value)}
                                                >
                                                    {TIERS.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Stats inputs */}
                                            {['top4', 'win', 'play'].map(field => (
                                                <td key={field} className="admin-td">
                                                    <div className="admin-input-wrap">
                                                        <input
                                                            type="number"
                                                            className="admin-input"
                                                            value={row[field] ?? ''}
                                                            min="0" max="100" step="0.1"
                                                            onChange={e => handleChange(comp.id, field, e.target.value)}
                                                        />
                                                        <span className="admin-input-suffix">%</span>
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="admin-td">
                                                <input
                                                    type="number"
                                                    className="admin-input admin-input-avg"
                                                    value={row.avg ?? ''}
                                                    min="1" max="8" step="0.01"
                                                    onChange={e => handleChange(comp.id, 'avg', e.target.value)}
                                                />
                                            </td>

                                            {/* Save button */}
                                            <td className="admin-td">
                                                <button
                                                    className={`admin-save-btn ${st === 'saving' ? 'admin-save-btn-saving' : st === 'saved' ? 'admin-save-btn-saved' : st === 'error' ? 'admin-save-btn-error' : ''}`}
                                                    onClick={() => handleSave(comp.id)}
                                                    disabled={st === 'saving'}
                                                >
                                                    {st === 'saving' ? '...' : st === 'saved' ? '✓ Saved' : st === 'error' ? '✕ Error' : 'Save'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            })}
        </div>
    )
}

export default AdminStatsPage
