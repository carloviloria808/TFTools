import { useState, useEffect, useRef } from 'react'
import { getChampions, getCombinedItems, updateCompositionBoard } from '../services/api'

const ROWS = 4
const COLS = 7

const COST_COLORS = {
    1: '#9e9e9e', 2: '#4caf50', 3: '#2196f3', 4: '#9c27b0', 5: '#ffc107',
}

const STAR_COLORS = {
    1: '#9e9e9e', 2: '#4caf50', 3: '#ffc107',
}

// ── helpers ──────────────────────────────────────────────────────────────────

function championsToBoard(champions) {
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    for (const cc of (champions || [])) {
        const r = cc.row ?? cc.Row, c = cc.col ?? cc.Col
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            board[r][c] = {
                championId: cc.champion.id,
                name:       cc.champion.name,
                imageUrl:   cc.champion.imageUrl,
                cost:       cc.champion.cost,
                isCarry:    cc.isCarry,
                starLevel:  cc.starLevel ?? 1,
                items: [
                    cc.items?.[0] ? { itemId: cc.items[0].id, name: cc.items[0].name, imageUrl: cc.items[0].imageUrl } : null,
                    cc.items?.[1] ? { itemId: cc.items[1].id, name: cc.items[1].name, imageUrl: cc.items[1].imageUrl } : null,
                    cc.items?.[2] ? { itemId: cc.items[2].id, name: cc.items[2].name, imageUrl: cc.items[2].imageUrl } : null,
                ],
            }
        }
    }
    return board
}

function boardToPayload(board) {
    const champions = []
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = board[r][c]
            if (cell) {
                champions.push({
                    championId: cell.championId,
                    row:        r,
                    col:        c,
                    isCarry:    cell.isCarry,
                    starLevel:  cell.starLevel ?? 1,
                    items:      cell.items
                        .map((item, i) => item ? { itemId: item.itemId, slotIndex: i } : null)
                        .filter(Boolean),
                })
            }
        }
    }
    return { champions }
}

// ── Champion Picker ───────────────────────────────────────────────────────────

function ChampionPicker({ allChampions, placedIds, onSelect, onClose }) {
    const [search, setSearch] = useState('')

    const filtered = allChampions.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    const byCost = [1, 2, 3, 4, 5].reduce((acc, cost) => {
        acc[cost] = filtered.filter(c => c.cost === cost)
        return acc
    }, {})

    return (
        <div className="be-picker-overlay" onClick={onClose}>
            <div className="be-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="be-picker-header">
                    <span className="be-picker-title">Place Champion</span>
                    <button className="be-picker-close" onClick={onClose}>✕</button>
                </div>
                <input
                    className="be-picker-search"
                    placeholder="Search champions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                />
                <div className="be-picker-champ-list">
                    {[1, 2, 3, 4, 5].map(cost => {
                        const comps = byCost[cost]
                        if (!comps.length) return null
                        return (
                            <div key={cost} className="be-picker-cost-group">
                                <div className="be-picker-cost-label" style={{ color: COST_COLORS[cost] }}>
                                    {'★'.repeat(cost)} Cost
                                </div>
                                <div className="be-picker-champ-row">
                                    {comps.map(champ => (
                                        <div
                                            key={champ.id}
                                            className={`be-picker-champ ${placedIds.has(champ.id) ? 'be-picker-champ-placed' : ''}`}
                                            style={{ '--cost-color': COST_COLORS[champ.cost] }}
                                            onClick={() => onSelect(champ)}
                                            title={champ.name}
                                        >
                                            <img src={champ.imageUrl} alt={champ.name} className="be-picker-champ-img" />
                                            <span className="be-picker-champ-name">{champ.name}</span>
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

// ── Item Picker ───────────────────────────────────────────────────────────────

function ItemPicker({ allItems, slotNum, onSelect, onClose }) {
    const [search, setSearch] = useState('')

    const filtered = allItems.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="be-picker-overlay" onClick={onClose}>
            <div className="be-picker-modal be-picker-modal-items" onClick={e => e.stopPropagation()}>
                <div className="be-picker-header">
                    <span className="be-picker-title">Assign Item — Slot {slotNum}</span>
                    <button className="be-picker-close" onClick={onClose}>✕</button>
                </div>
                <input
                    className="be-picker-search"
                    placeholder="Search items..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                />
                <div className="be-picker-item-grid">
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            className="be-picker-item"
                            onClick={() => onSelect(item)}
                            title={item.name}
                        >
                            <img src={item.imageUrl} alt={item.name} className="be-picker-item-img" />
                            <span className="be-picker-item-name">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Board Editor ──────────────────────────────────────────────────────────────

function BoardEditor({ initialChampions, compositionId }) {
    const [board,       setBoard]       = useState(() => championsToBoard(initialChampions))
    const [allChamps,   setAllChamps]   = useState([])
    const [allItems,    setAllItems]    = useState([])
    const [selected,    setSelected]    = useState(null)   // { r, c }
    const [champPicker, setChampPicker] = useState(null)   // { r, c }
    const [itemPicker,  setItemPicker]  = useState(null)   // { r, c, slot }
    const [saving,      setSaving]      = useState(false)
    const [saveStatus,  setSaveStatus]  = useState(null)

    // Drag state
    const dragSrc = useRef(null)  // { r, c }

    useEffect(() => {
        getChampions().then(r => setAllChamps(r.data))
        getCombinedItems().then(r => setAllItems(r.data))
    }, [])

    useEffect(() => {
        setBoard(championsToBoard(initialChampions))
        setSelected(null)
        setSaveStatus(null)
    }, [initialChampions])

    // ── interactions ──────────────────────────────────────────────────────────

    function handleCellClick(r, c) {
        const cell = board[r][c]
        if (!cell) {
            setChampPicker({ r, c })
            setSelected(null)
        } else {
            setSelected(prev => (prev?.r === r && prev?.c === c) ? null : { r, c })
        }
    }

    function placeChampion(champ) {
        if (!champPicker) return
        const { r, c } = champPicker
        setBoard(prev => {
            const next = prev.map(row => [...row])
            next[r][c] = {
                championId: champ.id,
                name:       champ.name,
                imageUrl:   champ.imageUrl,
                cost:       champ.cost,
                isCarry:    false,
                starLevel:  1,
                items:      [null, null, null],
            }
            return next
        })
        setChampPicker(null)
        setSelected({ r, c })
    }

    function removeChampion(r, c) {
        setBoard(prev => {
            const next = prev.map(row => [...row])
            next[r][c] = null
            return next
        })
        setSelected(null)
    }

    function toggleCarry(r, c) {
        setBoard(prev => {
            const next = prev.map(row => [...row])
            next[r][c] = { ...next[r][c], isCarry: !next[r][c].isCarry }
            return next
        })
    }

    function setStarLevel(r, c, level) {
        setBoard(prev => {
            const next = prev.map(row => [...row])
            next[r][c] = { ...next[r][c], starLevel: level }
            return next
        })
    }

    function handleItemSlotClick(e, r, c, slot) {
        e.stopPropagation()
        const cell = board[r][c]
        if (!cell) return
        if (cell.items[slot]) {
            setBoard(prev => {
                const next = prev.map(row => [...row])
                const items = [...next[r][c].items]
                items[slot] = null
                next[r][c] = { ...next[r][c], items }
                return next
            })
        } else {
            setItemPicker({ r, c, slot })
        }
    }

    function assignItem(item) {
        if (!itemPicker) return
        const { r, c, slot } = itemPicker
        setBoard(prev => {
            const next = prev.map(row => [...row])
            const items = [...next[r][c].items]
            items[slot] = { itemId: item.id, name: item.name, imageUrl: item.imageUrl }
            next[r][c] = { ...next[r][c], items }
            return next
        })
        setItemPicker(null)
    }

    // ── drag and drop ─────────────────────────────────────────────────────────

    function handleDragStart(e, r, c) {
        dragSrc.current = { r, c }
        e.dataTransfer.effectAllowed = 'move'
    }

    function handleDragOver(e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    function handleDrop(e, r, c) {
        e.preventDefault()
        const src = dragSrc.current
        if (!src || (src.r === r && src.c === c)) return

        setBoard(prev => {
            const next = prev.map(row => [...row])
            // Swap the two cells (works for empty→occupied, occupied→empty, occupied→occupied)
            ;[next[src.r][src.c], next[r][c]] = [next[r][c], next[src.r][src.c]]
            return next
        })

        // If the dragged cell was selected, follow it to the new position
        if (selected?.r === src.r && selected?.c === src.c) {
            setSelected({ r, c })
        }

        dragSrc.current = null
    }

    async function handleSave() {
        setSaving(true)
        setSaveStatus(null)
        try {
            await updateCompositionBoard(compositionId, boardToPayload(board))
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus(null), 3000)
        } catch {
            setSaveStatus('error')
        } finally {
            setSaving(false)
        }
    }

    // ── derived ───────────────────────────────────────────────────────────────

    const placedIds    = new Set(board.flat().filter(Boolean).map(c => c.championId))
    const selectedCell = selected ? board[selected.r][selected.c] : null
    const champCount   = board.flat().filter(Boolean).length

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="be-wrap">

            {/* ── Hex board ── */}
            <div className="be-board">
                <div className="be-board-inner">
                {Array.from({ length: ROWS }, (_, r) => {
                    const displayRow  = ROWS - 1 - r
                    const isOffsetRow = displayRow % 2 === 0

                    return (
                        <div
                            key={displayRow}
                            className="be-hex-row"
                            style={{ marginLeft: isOffsetRow ? 'calc(var(--be-hex-size) * 0.5 + 4px)' : '0' }}
                        >
                            {Array.from({ length: COLS }, (_, c) => {
                                const cell  = board[displayRow][c]
                                const isSel = selected?.r === displayRow && selected?.c === c

                                return (
                                    <div
                                        key={c}
                                        className={`be-hex-cell ${cell ? 'be-hex-occ' : 'be-hex-empty'} ${isSel ? 'be-hex-sel' : ''}`}
                                        onClick={() => handleCellClick(displayRow, c)}
                                        onDragOver={handleDragOver}
                                        onDrop={e => handleDrop(e, displayRow, c)}
                                        title={cell ? cell.name : 'Click to place champion'}
                                    >
                                        {cell ? (
                                            <>
                                                {/* Star level — above the portrait */}
                                                <div className="be-star-row" onClick={e => e.stopPropagation()}>
                                                    {[1, 2, 3].map(lvl => (
                                                        <span
                                                            key={lvl}
                                                            className="be-star"
                                                            style={{ color: lvl <= cell.starLevel ? STAR_COLORS[cell.starLevel] : 'rgba(255,255,255,0.15)' }}
                                                            onClick={() => setStarLevel(displayRow, c, lvl)}
                                                            title={`Set ${lvl}★`}
                                                        >★</span>
                                                    ))}
                                                </div>

                                                <div
                                                    className={`be-hex-inner ${cell.isCarry ? 'be-hex-carry' : ''}`}
                                                    style={{
                                                        borderColor: COST_COLORS[cell.cost] ?? '#aaa',
                                                        '--cost-color': COST_COLORS[cell.cost] ?? '#aaa',
                                                    }}
                                                    draggable
                                                    onDragStart={e => handleDragStart(e, displayRow, c)}
                                                >
                                                    {cell.isCarry && <span className="be-carry-star">★</span>}
                                                    <img
                                                        src={cell.imageUrl}
                                                        alt={cell.name}
                                                        className="be-hex-img"
                                                        onError={e => { e.target.style.display = 'none' }}
                                                    />
                                                </div>

                                                {/* Item slots */}
                                                <div className="be-item-strip" onClick={e => e.stopPropagation()}>
                                                    {cell.items.map((item, slot) => (
                                                        <div
                                                            key={slot}
                                                            className={`be-item-slot ${item ? 'be-item-slot-filled' : 'be-item-slot-empty'}`}
                                                            onClick={e => handleItemSlotClick(e, displayRow, c, slot)}
                                                            title={item ? `${item.name} — click to remove` : 'Click to add item'}
                                                        >
                                                            {item
                                                                ? <img src={item.imageUrl} alt={item.name} className="be-item-img" />
                                                                : <span className="be-item-plus">+</span>
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="be-cell-plus">+</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
                </div>
            </div>

            {/* ── Selected champion actions ── */}
            {selectedCell && (
                <div className="be-action-bar">
                    {selectedCell.imageUrl && (
                        <img src={selectedCell.imageUrl} alt={selectedCell.name} className="be-action-thumb" />
                    )}
                    <span className="be-action-name">{selectedCell.name}</span>
                    <div className="be-action-btns">
                        <button
                            className={`be-action-btn ${selectedCell.isCarry ? 'be-action-btn-carry-on' : ''}`}
                            onClick={() => toggleCarry(selected.r, selected.c)}
                        >
                            ★ {selectedCell.isCarry ? 'Carry' : 'Set Carry'}
                        </button>
                        <button
                            className="be-action-btn be-action-btn-remove"
                            onClick={() => removeChampion(selected.r, selected.c)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="be-footer">
                <span className="be-champ-count">{champCount} / {ROWS * COLS} cells filled</span>
                <div className="be-footer-right">
                    {saveStatus === 'saved' && <span className="be-status-saved">✓ Board saved</span>}
                    {saveStatus === 'error' && <span className="be-status-error">✕ Save failed</span>}
                    <button className="be-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Board'}
                    </button>
                </div>
            </div>

            {/* ── Champion picker ── */}
            {champPicker && (
                <ChampionPicker
                    allChampions={allChamps}
                    placedIds={placedIds}
                    onSelect={placeChampion}
                    onClose={() => setChampPicker(null)}
                />
            )}

            {/* ── Item picker ── */}
            {itemPicker && (
                <ItemPicker
                    allItems={allItems}
                    slotNum={itemPicker.slot + 1}
                    onSelect={assignItem}
                    onClose={() => setItemPicker(null)}
                />
            )}
        </div>
    )
}

export default BoardEditor
