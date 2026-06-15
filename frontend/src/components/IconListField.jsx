import { useState, useEffect } from 'react'
import { getChampions, getItems, getGods, getAugments } from '../services/api'

// Fetch helpers per type
const FETCHERS = {
    champions: () => getChampions(),
    items:     () => getItems(),
    gods:      () => getGods(),
    augments:  () => getAugments(),
}

const COST_COLORS = {
    1: '#9e9e9e', 2: '#4caf50', 3: '#2196f3', 4: '#9c27b0', 5: '#ffc107',
}

const AUGMENT_TIER_COLORS = {
    '1': '#b0bec5', '2': '#ffd700', '3': '#e040fb',
}

// Parse the JSON string value → array of { name, imageUrl }
function parseValue(val) {
    if (!val) return []
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) || [] }
    catch { return [] }
}

// ── Picker modal ──────────────────────────────────────────────────────────────

function PickerModal({ type, allOptions, onSelect, onClose }) {
    const [search, setSearch] = useState('')

    const filtered = allOptions.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase())
    )

    // Champions: group by cost
    if (type === 'champions') {
        const byCost = [1, 2, 3, 4, 5].reduce((acc, cost) => {
            acc[cost] = filtered.filter(c => c.cost === cost)
            return acc
        }, {})

        return (
            <div className="ilp-overlay" onClick={onClose}>
                <div className="ilp-modal" onClick={e => e.stopPropagation()}>
                    <div className="ilp-modal-header">
                        <span className="ilp-modal-title">Add Champion</span>
                        <button className="ilp-modal-close" onClick={onClose}>✕</button>
                    </div>
                    <input className="ilp-modal-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                    <div className="ilp-modal-list">
                        {[1, 2, 3, 4, 5].map(cost => {
                            const group = byCost[cost]
                            if (!group.length) return null
                            return (
                                <div key={cost} className="ilp-cost-group">
                                    <div className="ilp-cost-label" style={{ color: COST_COLORS[cost] }}>{'★'.repeat(cost)} Cost</div>
                                    <div className="ilp-option-row">
                                        {group.map(opt => (
                                            <div key={opt.id} className="ilp-option ilp-option-circle" style={{ '--opt-color': COST_COLORS[opt.cost] }} onClick={() => onSelect(opt)} title={opt.name}>
                                                <img src={opt.imageUrl} alt={opt.name} className="ilp-option-img" />
                                                <span className="ilp-option-name">{opt.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Augments: group by tier
    if (type === 'augments') {
        const byTier = { '1': [], '2': [], '3': [] }
        filtered.forEach(a => {
            const t = String(a.tier ?? '1')
            if (byTier[t]) byTier[t].push(a)
        })
        const tierLabels = { '1': 'Silver', '2': 'Gold', '3': 'Prismatic' }

        return (
            <div className="ilp-overlay" onClick={onClose}>
                <div className="ilp-modal ilp-modal-wide" onClick={e => e.stopPropagation()}>
                    <div className="ilp-modal-header">
                        <span className="ilp-modal-title">Add Augment</span>
                        <button className="ilp-modal-close" onClick={onClose}>✕</button>
                    </div>
                    <input className="ilp-modal-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                    <div className="ilp-modal-list">
                        {['1', '2', '3'].map(tier => {
                            const group = byTier[tier]
                            if (!group.length) return null
                            return (
                                <div key={tier} className="ilp-cost-group">
                                    <div className="ilp-cost-label" style={{ color: AUGMENT_TIER_COLORS[tier] }}>{tierLabels[tier]}</div>
                                    <div className="ilp-option-row">
                                        {group.map(opt => (
                                            <div key={opt.id} className="ilp-option ilp-option-square" onClick={() => onSelect(opt)} title={opt.name}>
                                                <img src={opt.imageUrl} alt={opt.name} className="ilp-option-img" />
                                                <span className="ilp-option-name">{opt.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // Items / Gods: flat grid
    const titleMap = { items: 'Add Item', gods: 'Add God' }
    return (
        <div className="ilp-overlay" onClick={onClose}>
            <div className="ilp-modal" onClick={e => e.stopPropagation()}>
                <div className="ilp-modal-header">
                    <span className="ilp-modal-title">{titleMap[type] ?? 'Add'}</span>
                    <button className="ilp-modal-close" onClick={onClose}>✕</button>
                </div>
                <input className="ilp-modal-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                <div className="ilp-option-grid">
                    {filtered.map(opt => (
                        <div key={opt.id} className="ilp-option ilp-option-square" onClick={() => onSelect(opt)} title={opt.name}>
                            <img src={opt.imageUrl} alt={opt.name} className="ilp-option-img" />
                            <span className="ilp-option-name">{opt.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

function IconListField({ label, hint, type, value, onChange }) {
    const [allOptions, setAllOptions] = useState([])
    const [pickerOpen, setPickerOpen] = useState(false)

    useEffect(() => {
        const fetcher = FETCHERS[type]
        if (fetcher) fetcher().then(r => setAllOptions(r.data))
    }, [type])

    const items = parseValue(value)

    function addItem(opt) {
        const next = [...items, { name: opt.name, imageUrl: opt.imageUrl }]
        onChange(JSON.stringify(next))
        setPickerOpen(false)
    }

    function removeItem(index) {
        const next = items.filter((_, i) => i !== index)
        onChange(next.length ? JSON.stringify(next) : '')
    }

    function moveItem(index, dir) {
        const next = [...items]
        const swap = index + dir
        if (swap < 0 || swap >= next.length) return
        ;[next[index], next[swap]] = [next[swap], next[index]]
        onChange(JSON.stringify(next))
    }

    const isCircle = type === 'champions' || type === 'gods'

    return (
        <div className="ilp-field">
            <label className="ace-label">
                {label}
                {hint && <span className="ace-label-hint">{hint}</span>}
            </label>

            <div className="ilp-list">
                {items.map((item, i) => (
                    <div key={i} className={`ilp-placed ${isCircle ? 'ilp-placed-circle' : 'ilp-placed-square'}`} title={item.name}>
                        <img src={item.imageUrl} alt={item.name} className="ilp-placed-img" />
                        <div className="ilp-placed-controls">
                            <button className="ilp-placed-btn" onClick={() => moveItem(i, -1)} title="Move left" disabled={i === 0}>‹</button>
                            <button className="ilp-placed-btn ilp-placed-btn-remove" onClick={() => removeItem(i)} title="Remove">✕</button>
                            <button className="ilp-placed-btn" onClick={() => moveItem(i, 1)} title="Move right" disabled={i === items.length - 1}>›</button>
                        </div>
                    </div>
                ))}

                <button className="ilp-add-btn" onClick={() => setPickerOpen(true)}>
                    + Add
                </button>
            </div>

            {pickerOpen && (
                <PickerModal
                    type={type}
                    allOptions={allOptions}
                    onSelect={addItem}
                    onClose={() => setPickerOpen(false)}
                />
            )}
        </div>
    )
}

export default IconListField
