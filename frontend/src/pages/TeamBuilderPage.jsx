import { useState, useEffect, useRef } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import html2canvas from 'html2canvas'
import { Link2, Camera, Save, FolderOpen, RotateCcw, RotateCw, Trash2, Check, Gamepad2, ClipboardPaste } from 'lucide-react'
import { getChampions, getTraits, getCombinedItems, getAugments } from '../services/api'
import { buildTeamCode, parseTeamCode } from '../utils/teamCode'

// ── Item categorisation (mirrors ItemsPage) ──────────────────────────
const CONSUMABLE_NAMES = ['champion duplicator', 'lesser champion duplicator', 'magnetic remover', 'reforger']
const PSIONIC_NAMES    = ['biomatter preserver', 'drone uplink', 'malware matrix', 'sympathetic implant', 'target-lock optics']
const ANIMA_NAMES = [
    "animapocalypse","battle bunny crossbow","broken prototype","bunny prime ballista",
    "cyclonic slicers","deep freeze","echoing batblades","evolved embershot",
    "guiding hex","iceblast armor","leaky prototype","leonine lamentation",
    "lioness's lament","omniweapon","owo blaster","radiant field",
    "rocket swarm","savage slicer","searing shortbow","solar eclipse",
    "sparking prototype","tentacle slam","the annihilator","unceasing cyclone",
    "uwu blaster","vayne's chromablades"
]
const ARTIFACT_NAMES = [
    "aegis of dawn","aegis of dusk","ahri's aura","blighting jewel",
    "cappa juice","dawncore","deathfire grasp","death's defiance",
    "ekko's patience","eternal pact","evelynn's instinct","fishbones",
    "flickerblade","gambler's blade","gold collector","hellfire hatchet",
    "horizon focus","hullcrusher","indomitable gauntlet","infinity force",
    "innervating locket","kayle's exaltation","kayle's radiant exaltation",
    "lesser mirrored persona","lich bane","lightshield crest","luden's tempest",
    "manazane","mending echoes","mirrored persona","mittens","mogul's mail",
    "prowler's claw","rapid firecannon","seeker's armguard","shadow puppet",
    "silvermere dawn","sniper's focus","soraka's miracle","spectral cutlass",
    "statikk shiv","suspicious trench coat","talisman of ascension",
    "the darkin aegis","the darkin bow","the darkin scythe","the darkin staff",
    "thresh's lantern","titanic hydra","trickster's glass","unending despair",
    "varus's obsession","void gauntlet","wit's end","yasuo's bladework",
    "zhonya's paradox"
]

function categoriseItem(item) {
    const n = item.name.toLowerCase()
    if (n.includes('emblem'))                                                return 'emblem'
    if (ARTIFACT_NAMES.includes(n))                                          return 'artifact'
    if ((n.includes('psionic') && !n.includes('emblem')) || PSIONIC_NAMES.includes(n)) return 'psionic'
    if (n.includes('radiant'))                                               return 'radiant'
    if (CONSUMABLE_NAMES.includes(n))                                        return 'consumable'
    if (ANIMA_NAMES.includes(n))                                             return 'anima'
    return 'standard'
}

const ITEM_CATEGORIES = [
    { key: 'standard',   label: 'Standard' },
    { key: 'emblem',     label: 'Emblems' },
    { key: 'artifact',   label: 'Artifacts' },
    { key: 'psionic',    label: 'Psionic Items' },
    { key: 'radiant',    label: 'Radiant Items' },
    { key: 'anima',      label: 'Anima Items' },
    { key: 'consumable', label: 'Consumables' },
]

// TFT board: 4 rows × 7 cols with alternating offset rows
const ROWS = 4
const COLS = 7
const COST_COLORS = {
    1: '#8b9bb4',
    2: '#1a9e5f',
    3: '#1a73c8',
    4: '#b455e0',
    5: '#f0a843',
}

// Board cell shape: null | { champ: ChampionObject, items: ItemObject[] }
function buildEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function TeamBuilderPage() {
    usePageTitle('Team Builder')
    const [champions, setChampions] = useState([])
    const [traits, setTraits]       = useState([])
    const [allItems, setAllItems]   = useState([])
    const [allAugments, setAllAugments] = useState([])
    const [board, setBoard]         = useState(buildEmptyBoard)
    const [past, setPast]           = useState([])   // undo stack
    const [future, setFuture]       = useState([])   // redo stack
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState(null)

    // Augments: 6 slots (null = empty)
    const [selectedAugments, setSelectedAugments] = useState(Array(6).fill(null))
    const [augmentPickerOpen, setAugmentPickerOpen] = useState(false)
    const [augmentSearch, setAugmentSearch] = useState('')

    // Champion filters
    const [champSearch, setChampSearch] = useState('')
    const [costFilter, setCostFilter]   = useState(null)
    const [showNames, setShowNames]     = useState(false)

    // Item filters
    const [itemSearch, setItemSearch] = useState('')

    // Share link
    const [linkCopied, setLinkCopied] = useState(false)
    const [teamCodeCopied, setTeamCodeCopied] = useState(false)

    // Team code import
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [importCode,  setImportCode]  = useState('')
    const [importError, setImportError] = useState(null)

    function handleImportTeamCode() {
        const result = parseTeamCode(importCode, champions)
        if (result.error) { setImportError(result.error); return }

        // Place imported champions on a fresh board — middle rows first, left to right
        const next = buildEmptyBoard()
        const slots = []
        ;[1, 2, 0, 3].forEach(row => {
            for (let col = 0; col < COLS; col++) slots.push([row, col])
        })
        result.champions.forEach((champ, i) => {
            if (i >= slots.length) return
            const [row, col] = slots[i]
            next[row][col] = { champ, items: [], stars: 1 }
        })

        commitBoard(next)
        setImportModalOpen(false)
        setImportCode('')
        setImportError(null)
    }

    async function handleCopyTeamCode() {
        const champs = board.flat().filter(Boolean).map(cell => cell.champ)
        const code = buildTeamCode(champs)
        if (!code) return
        await navigator.clipboard.writeText(code)
        setTeamCodeCopied(true)
        setTimeout(() => setTeamCodeCopied(false), 2000)
    }

    async function handleShareLink() {
        const shareData = {
            b: board.map(row => row.map(cell => !cell ? null : {
                c: cell.champ.id,
                i: cell.items.map(it => it.id),
                s: cell.stars || 1
            })),
            a: selectedAugments.map(aug => aug ? aug.id : null)
        }
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))))
        const url = `${window.location.origin}${window.location.pathname}?comp=${encoded}`
        await navigator.clipboard.writeText(url)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    // Export
    const exportRef = useRef(null)
    const [exportModalOpen, setExportModalOpen] = useState(false)
    const [exportImageUrl, setExportImageUrl]   = useState(null)
    const [exporting, setExporting]             = useState(false)

    async function handleExport() {
        if (!exportRef.current) return
        setExporting(true)
        try {
            const canvas = await html2canvas(exportRef.current, {
                backgroundColor: '#0d0f1a',
                scale: 2,
                useCORS: true,
                logging: false,
            })
            setExportImageUrl(canvas.toDataURL('image/png'))
            setExportModalOpen(true)
        } catch (err) {
            console.error('Export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    function downloadExport() {
        if (!exportImageUrl) return
        const a = document.createElement('a')
        a.href = exportImageUrl
        a.download = 'tftools-comp.png'
        a.click()
    }

    // Save / Load
    const [saves, setSaves] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tftools_saves') || '[]') } catch { return [] }
    })
    const [saveModalOpen, setSaveModalOpen] = useState(false)
    const [saveName, setSaveName]           = useState('')
    const [loadModalOpen, setLoadModalOpen] = useState(false)

    // Drag state
    const [dragSource, setDragSource]     = useState(null)
    // { type: 'roster',     champ }
    // { type: 'board',      cell, row, col }
    // { type: 'item',       item }
    // { type: 'board-item', row, col, itemIndex, item }
    const [dragOverCell, setDragOverCell]   = useState(null)  // { row, col }
    const [dragOverPanel, setDragOverPanel] = useState(null)  // 'champions' | 'items' | null

    // Tooltip state — { type: 'champion'|'item', data, x, y }
    const [tooltip, setTooltip] = useState(null)

    // ── Undo / Redo ──────────────────────────────────────────────────────
    function commitBoard(newBoard) {
        setPast(prev => [...prev, board])
        setFuture([])
        setBoard(newBoard)
    }

    function undo() {
        if (past.length === 0) return
        const previous = past[past.length - 1]
        setFuture(f => [board, ...f])
        setPast(p => p.slice(0, -1))
        setBoard(previous)
    }

    function redo() {
        if (future.length === 0) return
        const next = future[0]
        setPast(p => [...p, board])
        setFuture(f => f.slice(1))
        setBoard(next)
    }

    useEffect(() => {
        function handleKey(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [past, future, board])

    function showTooltip(e, type, data) {
        setTooltip({ type, data, x: e.clientX, y: e.clientY })
    }
    function moveTooltip(e) {
        if (tooltip) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)
    }
    function hideTooltip() {
        setTooltip(null)
    }

    useEffect(() => {
        Promise.all([getChampions(), getTraits(), getCombinedItems(), getAugments()])
            .then(([champsRes, traitsRes, itemsRes, augmentsRes]) => {
                setChampions(champsRes.data)
                setTraits(traitsRes.data)
                setAllItems(itemsRes.data)
                setAllAugments(augmentsRes.data)
                setLoading(false)

                // Auto-load shared comp from URL
                const params = new URLSearchParams(window.location.search)
                const comp = params.get('comp')
                if (comp) {
                    try {
                        const shareData = JSON.parse(decodeURIComponent(escape(atob(comp))))
                        const newBoard = shareData.b.map(row => row.map(cell => {
                            if (!cell) return null
                            const champ = champsRes.data.find(c => c.id === cell.c)
                            if (!champ) return null
                            const items = (cell.i || []).map(id => itemsRes.data.find(i => i.id === id)).filter(Boolean)
                            return { champ, items, stars: cell.s || 1 }
                        }))
                        const newAugments = (shareData.a || Array(6).fill(null)).map(id =>
                            id ? (augmentsRes.data.find(a => a.id === id) || null) : null
                        )
                        setBoard(newBoard)
                        setSelectedAugments(newAugments)
                    } catch (e) {
                        console.error('Failed to load shared comp:', e)
                    }
                }
            })
            .catch(() => {
                setError('Failed to load data')
                setLoading(false)
            })
    }, [])

    // ── Trait count calculation ──────────────────────────────────────────
    function getActiveTraits() {
        const traitCount = {}
        board.flat().forEach(cell => {
            if (!cell) return
            cell.champ.traits.forEach(t => {
                traitCount[t.name] = (traitCount[t.name] || 0) + 1
            })
        })
        const active = []
        traits.forEach(trait => {
            const count = traitCount[trait.name] || 0
            if (count === 0) return
            const metBreakpoint = [...(trait.breakpoints || [])]
                .sort((a, b) => b.unitsRequired - a.unitsRequired)
                .find(bp => count >= bp.unitsRequired)
            active.push({ trait, count, metBreakpoint })
        })
        return active.sort((a, b) => {
            const aA = a.metBreakpoint ? 1 : 0
            const bA = b.metBreakpoint ? 1 : 0
            if (bA !== aA) return bA - aA
            return b.count - a.count
        })
    }

    // ── Drag handlers ────────────────────────────────────────────────────
    function handleRosterDragStart(e, champ) {
        hideTooltip()
        setDragSource({ type: 'roster', champ })
        e.dataTransfer.effectAllowed = 'copy'
    }

    function handleBoardDragStart(e, cell, row, col) {
        hideTooltip()
        setDragSource({ type: 'board', cell, row, col })
        e.dataTransfer.effectAllowed = 'move'
    }

    function handleItemDragStart(e, item) {
        hideTooltip()
        setDragSource({ type: 'item', item })
        e.dataTransfer.effectAllowed = 'copy'
    }

    // Dragging an equipped item off the board
    function handleBoardItemDragStart(e, row, col, itemIndex, item) {
        hideTooltip()
        e.stopPropagation()
        setDragSource({ type: 'board-item', row, col, itemIndex, item })
        e.dataTransfer.effectAllowed = 'move'
    }

    // ── Panel drop zones (drag board champ/item here to remove) ─────────
    function handlePanelDragOver(e, panel) {
        const isChampDrag = dragSource?.type === 'board'
        const isItemDrag  = dragSource?.type === 'board-item'
        if ((panel === 'champions' && isChampDrag) || (panel === 'items' && isItemDrag)) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setDragOverPanel(panel)
        }
    }

    function handlePanelDragLeave() {
        setDragOverPanel(null)
    }

    function handlePanelDrop(e, panel) {
        e.preventDefault()
        setDragOverPanel(null)
        if (!dragSource) return

        if (panel === 'champions' && dragSource.type === 'board') {
            const next = board.map(r => [...r])
            next[dragSource.row][dragSource.col] = null
            commitBoard(next)
        } else if (panel === 'items' && dragSource.type === 'board-item') {
            const next = board.map(r => [...r])
            const cell = next[dragSource.row][dragSource.col]
            if (cell) {
                next[dragSource.row][dragSource.col] = {
                    ...cell,
                    items: cell.items.filter((_, i) => i !== dragSource.itemIndex)
                }
                commitBoard(next)
            }
        }
        setDragSource(null)
    }

    function handleCellDragOver(e, row, col) {
        e.preventDefault()
        if (dragSource?.type === 'item') {
            const cell = board[row][col]
            e.dataTransfer.dropEffect = (cell && cell.items.length < 3) ? 'copy' : 'none'
        } else {
            e.dataTransfer.dropEffect = dragSource?.type === 'roster' ? 'copy' : 'move'
        }
        setDragOverCell({ row, col })
    }

    function handleCellDrop(e, targetRow, targetCol) {
        e.preventDefault()
        setDragOverCell(null)
        if (!dragSource) return

        const next = board.map(r => [...r])

        if (dragSource.type === 'item') {
            const cell = next[targetRow][targetCol]
            if (cell && cell.items.length < 3) {
                next[targetRow][targetCol] = { ...cell, items: [...cell.items, dragSource.item] }
                commitBoard(next)
            }
        } else if (dragSource.type === 'roster') {
            const existingItems = next[targetRow][targetCol]?.items || []
            const existingStars = next[targetRow][targetCol]?.stars || 1
            next[targetRow][targetCol] = { champ: dragSource.champ, items: existingItems, stars: existingStars }
            commitBoard(next)
        } else if (dragSource.type === 'board') {
            const srcCell  = next[dragSource.row][dragSource.col]
            const destCell = next[targetRow][targetCol]
            next[targetRow][targetCol]           = srcCell
            next[dragSource.row][dragSource.col] = destCell
            commitBoard(next)
        }
        setDragSource(null)
    }

    function handleCellDragLeave() {
        setDragOverCell(null)
    }

    function handleCellDragEnd() {
        setDragSource(null)
        setDragOverCell(null)
        setDragOverPanel(null)
    }

    // Right-click hex → remove champion + items
    function handleCellRightClick(e, row, col) {
        e.preventDefault()
        const next = board.map(r => [...r])
        next[row][col] = null
        commitBoard(next)
    }

    // Click placed champion → cycle star level 1→2→3→4→1
    function handleCycleStars(e, row, col) {
        e.stopPropagation()
        const next = board.map(r => [...r])
        const cell = next[row][col]
        if (!cell) return
        const currentStars = cell.stars || 1
        next[row][col] = { ...cell, stars: currentStars === 4 ? 1 : currentStars + 1 }
        commitBoard(next)
    }

    // Right-click item slot → remove just that item
    function handleRemoveItem(e, row, col, itemIndex) {
        e.preventDefault()
        e.stopPropagation()
        const next = board.map(r => [...r])
        const cell = next[row][col]
        if (!cell) return
        next[row][col] = { ...cell, items: cell.items.filter((_, i) => i !== itemIndex) }
        commitBoard(next)
    }

    function clearBoard() {
        commitBoard(buildEmptyBoard())
    }

    // ── Save / Load ──────────────────────────────────────────────────────
    function saveComp(name) {
        const label = name.trim() || `Comp ${saves.length + 1}`
        const saveData = {
            id: Date.now().toString(),
            name: label,
            savedAt: new Date().toISOString(),
            board: board.map(row => row.map(cell => !cell ? null : {
                champId:      cell.champ.id,
                champImageUrl: cell.champ.imageUrl,
                champCost:    cell.champ.cost,
                items: cell.items.map(it => ({ itemId: it.id })),
                stars: cell.stars || 1
            })),
            augments: selectedAugments.map(aug => aug ? { augId: aug.id } : null)
        }
        const updated = [...saves, saveData]
        localStorage.setItem('tftools_saves', JSON.stringify(updated))
        setSaves(updated)
        setSaveModalOpen(false)
        setSaveName('')
    }

    function loadComp(save) {
        const newBoard = save.board.map(row => row.map(cell => {
            if (!cell) return null
            const champ = champions.find(c => c.id === cell.champId)
            if (!champ) return null
            const items = (cell.items || [])
                .map(({ itemId }) => allItems.find(i => i.id === itemId))
                .filter(Boolean)
            return { champ, items, stars: cell.stars || 1 }
        }))
        const newAugments = (save.augments || Array(6).fill(null)).map(a =>
            a ? (allAugments.find(aug => aug.id === a.augId) || null) : null
        )
        commitBoard(newBoard)
        setSelectedAugments(newAugments)
        setLoadModalOpen(false)
    }

    function deleteSave(id) {
        const updated = saves.filter(s => s.id !== id)
        localStorage.setItem('tftools_saves', JSON.stringify(updated))
        setSaves(updated)
    }

    // ── Filtered data ────────────────────────────────────────────────────
    const filteredChampions = champions
        .filter(c => {
            const matchSearch = c.name.toLowerCase().includes(champSearch.toLowerCase())
            const matchCost   = costFilter === null || c.cost === costFilter
            return matchSearch && matchCost
        })
        .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))

    // Categorised item sections (search filters across all sections)
    const searchedItems = allItems.filter(item =>
        itemSearch.trim() === '' || item.name.toLowerCase().includes(itemSearch.toLowerCase())
    )
    const itemSections = ITEM_CATEGORIES.map(cat => ({
        ...cat,
        items: searchedItems
            .filter(item => categoriseItem(item) === cat.key)
            .sort((a, b) => a.name.localeCompare(b.name))
    })).filter(sec => sec.items.length > 0)

    // ── Component cost calculation ───────────────────────────────────────
    function getComponentCounts() {
        const counts = {}  // id → { component, count }
        board.flat().forEach(cell => {
            if (!cell) return
            cell.items.forEach(item => {
                [item.component1, item.component2].forEach(comp => {
                    if (!comp) return
                    if (!counts[comp.id]) counts[comp.id] = { component: comp, count: 0 }
                    counts[comp.id].count++
                })
            })
        })
        return Object.values(counts).sort((a, b) => b.count - a.count || a.component.name.localeCompare(b.component.name))
    }

    function getStarCostMultiplier(stars) {
        switch (stars) {
            case 2: return 3   // 3 copies
            case 3: return 9   // 9 copies
            case 4: return 27  // 3× three-stars = 27 copies
            default: return 1
        }
    }

    const placedCount      = board.flat().filter(Boolean).length
    const totalCost        = board.flat().reduce((sum, cell) => {
        if (!cell) return sum
        return sum + cell.champ.cost * getStarCostMultiplier(cell.stars || 1)
    }, 0)
    const activeTraits     = getActiveTraits()
    const componentCounts  = getComponentCounts()

    // Augment picker filtered list
    const pickerAugments = allAugments
        .filter(a =>
            augmentSearch.trim() === '' ||
            a.name.toLowerCase().includes(augmentSearch.toLowerCase()) ||
            a.description.toLowerCase().includes(augmentSearch.toLowerCase())
        )
        .sort((a, b) => {
            const tierOrder = { silver: 0, gold: 1, prismatic: 2 }
            const aRank = tierOrder[a.tier?.toLowerCase()] ?? 3
            const bRank = tierOrder[b.tier?.toLowerCase()] ?? 3
            return aRank - bRank || a.name.localeCompare(b.name)
        })

    function openAugmentPicker() {
        setAugmentPickerOpen(true)
        setAugmentSearch('')
    }

    function selectAugment(augment) {
        setSelectedAugments(prev => {
            // Fill the first empty slot, or do nothing if all full
            const firstEmpty = prev.findIndex(s => s === null)
            if (firstEmpty === -1) return prev
            const next = [...prev]
            next[firstEmpty] = augment
            return next
        })
        // Stay open so user can keep picking
    }

    function removeAugment(slotIndex) {
        setSelectedAugments(prev => {
            const next = [...prev]
            next[slotIndex] = null
            return next
        })
    }

    if (loading) return <div className="loading">Loading...</div>
    if (error)   return <div className="error">{error}</div>

    return (
        <div className="builder-page">
            <div className="builder-header">
                <h1>Team Builder</h1>
                <div className="builder-header-undo">
                    <button
                        className="builder-undo-btn"
                        onClick={undo}
                        disabled={past.length === 0}
                        title="Undo (Ctrl+Z)"
                    ><RotateCcw size={14} /> Undo</button>
                    <button
                        className="builder-undo-btn"
                        onClick={redo}
                        disabled={future.length === 0}
                        title="Redo (Ctrl+Y)"
                    ><RotateCw size={14} /> Redo</button>
                    <button
                        className={`builder-icon-btn builder-link-btn ${linkCopied ? 'builder-link-copied' : ''}`}
                        onClick={handleShareLink}
                        title="Copy share link"
                    >{linkCopied ? <Check size={15} /> : <Link2 size={15} />}</button>
                    <button
                        className={`builder-icon-btn builder-link-btn ${teamCodeCopied ? 'builder-link-copied' : ''}`}
                        onClick={handleCopyTeamCode}
                        disabled={placedCount === 0}
                        title="Copy in-game Team Code — paste into the TFT Team Planner"
                    >{teamCodeCopied ? <Check size={15} /> : <Gamepad2 size={15} />}</button>
                    <button
                        className="builder-icon-btn"
                        onClick={() => { setImportModalOpen(true); setImportCode(''); setImportError(null) }}
                        title="Import an in-game Team Code"
                    ><ClipboardPaste size={15} /></button>
                    <button className="builder-icon-btn builder-export-btn" onClick={handleExport} disabled={exporting} title="Export as image"><Camera size={15} /></button>
                    <button className="builder-icon-btn builder-save-file-btn" onClick={() => setSaveModalOpen(true)} title="Save composition"><Save size={15} /></button>
                    <button className="builder-icon-btn builder-load-btn" onClick={() => setLoadModalOpen(true)} title={`Load composition${saves.length > 0 ? ` (${saves.length} saved)` : ''}`}>
                        <FolderOpen size={15} />
                        {saves.length > 0 ? <span className="builder-save-badge">{saves.length}</span> : null}
                    </button>
                    <span className="builder-count">{placedCount} / 10 units</span>
                    <button className="builder-clear-btn" onClick={clearBoard}><Trash2 size={13} /> Clear</button>
                </div>
            </div>

            <div className="builder-layout">

                {/* ── Top row: Trait Tracker + Board ──────────── */}
                <div className="builder-top-row" ref={exportRef}>

                    {/* Left: Trait Tracker */}
                    <div className="builder-traits">
                        <h3 className="builder-section-title">Active Traits</h3>
                        <div className="builder-traits-scroll">
                        {activeTraits.length === 0 ? (
                            <p className="builder-traits-empty">Place champions to see active traits</p>
                        ) : (
                            activeTraits.map(({ trait, count, metBreakpoint }) => (
                                <div
                                    key={trait.id}
                                    className={`builder-trait-row ${metBreakpoint ? 'builder-trait-active' : 'builder-trait-partial'}`}
                                >
                                    {trait.imageUrl && (
                                        <img
                                            src={trait.imageUrl}
                                            alt={trait.name}
                                            className="builder-trait-icon"
                                            style={metBreakpoint ? {} : { filter: 'grayscale(80%) brightness(0.6)' }}
                                        />
                                    )}
                                    <span className="builder-trait-name">{trait.name}</span>
                                    <div className="builder-trait-pips">
                                        {(trait.breakpoints || [])
                                            .sort((a, b) => a.unitsRequired - b.unitsRequired)
                                            .map(bp => (
                                                <span
                                                    key={bp.unitsRequired}
                                                    className={`builder-trait-pip ${count >= bp.unitsRequired ? 'builder-trait-pip-filled' : ''}`}
                                                />
                                            ))}
                                    </div>
                                    <span
                                        className="builder-trait-count"
                                        style={{ color: metBreakpoint ? '#c89b3c' : '#888' }}
                                    >
                                        {count}
                                    </span>
                                </div>
                            ))
                        )}
                        </div>{/* end builder-traits-scroll */}
                        <div className="builder-traits-footer">
                            <hr className="builder-traits-divider" />
                            <div className="builder-traits-stats">
                                <div className="builder-traits-stat">
                                    <span className="builder-traits-stat-icon">⚔️</span>
                                    <span className="builder-traits-stat-value">{placedCount}</span>
                                </div>
                                <div className="builder-traits-stat">
                                    <span className="builder-traits-stat-icon">💰</span>
                                    <span className="builder-traits-stat-value" style={{ color: '#c89b3c' }}>{totalCost}g</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Hex Grid */}
                    <div className="builder-board-wrap">
                        <div className="builder-board-hint">
                            <span className="builder-hint-icon">ⓘ</span>
                            <div className="builder-hint-tooltip">
                                <div className="builder-hint-row"><kbd>Left click</kbd> cycle star level</div>
                                <div className="builder-hint-row"><kbd>Right click</kbd> remove champion</div>
                            </div>
                        </div>
                        <div className="builder-board-watermark">TFTools</div>
                        <div className="builder-board-labeled">
                            <div className="builder-board-row-labels">
                                {['FRONT', '', '', 'BACK'].map((label, i) => (
                                    <div key={i} className="builder-board-row-label">{label}</div>
                                ))}
                            </div>
                        <div className="builder-board">
                            {Array.from({ length: ROWS }, (_, r) => {
                                const displayRow  = ROWS - 1 - r
                                const isOffsetRow = displayRow % 2 === 1
                                return (
                                    <div
                                        key={displayRow}
                                        className="builder-hex-row"
                                        style={{ marginLeft: isOffsetRow ? 'calc(var(--hex-size) * 0.5 + 4px)' : '0' }}
                                    >
                                        {Array.from({ length: COLS }, (_, c) => {
                                            const cell   = board[displayRow][c]
                                            const isOver = dragOverCell?.row === displayRow && dragOverCell?.col === c
                                            const isItemDrag    = dragSource?.type === 'item'
                                            const validItemDrop = isItemDrag && cell && cell.items.length < 3
                                            const badItemDrop   = isItemDrag && isOver && (!cell || cell.items.length >= 3)

                                            return (
                                                <div
                                                    key={c}
                                                    className={[
                                                        'builder-hex-cell',
                                                        cell ? 'builder-hex-filled' : '',
                                                        isOver && !badItemDrop ? 'builder-hex-over' : '',
                                                        badItemDrop ? 'builder-hex-over-invalid' : '',
                                                        isOver && isItemDrag && validItemDrop ? 'builder-hex-item-valid' : '',
                                                    ].join(' ')}
                                                    onDragOver={e => handleCellDragOver(e, displayRow, c)}
                                                    onDrop={e => handleCellDrop(e, displayRow, c)}
                                                    onDragLeave={handleCellDragLeave}
                                                    onContextMenu={e => handleCellRightClick(e, displayRow, c)}
                                                >
                                                    {cell ? (
                                                        <div
                                                            className="builder-placed-champ"
                                                            draggable
                                                            onDragStart={e => handleBoardDragStart(e, cell, displayRow, c)}
                                                            onDragEnd={handleCellDragEnd}
                                                            onClick={e => handleCycleStars(e, displayRow, c)}
                                                            title={`${cell.champ.name} (${cell.stars || 1}★)\nClick to change star level\nRight-click to remove`}
                                                        >
                                                            <div
                                                                className="builder-placed-inner"
                                                                style={{ borderColor: COST_COLORS[cell.champ.cost] || '#aaa' }}
                                                            >
                                                                {/* Star display overlaid at top of circle */}
                                                                {(cell.stars || 1) > 1 && (
                                                                    <div className={`builder-placed-stars builder-placed-stars-${cell.stars || 1}`}>
                                                                        {Array.from({ length: cell.stars || 1 }, (_, si) => (
                                                                            <span key={si} className="builder-placed-star">★</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <img
                                                                    src={cell.champ.imageUrl}
                                                                    alt={cell.champ.name}
                                                                    className="builder-placed-img"
                                                                />
                                                                {/* Item slots overlaid at bottom of circle */}
                                                                <div className="builder-placed-items">
                                                                    {[0, 1, 2].map(i => (
                                                                        cell.items[i] ? (
                                                                            <img
                                                                                key={i}
                                                                                src={cell.items[i].imageUrl}
                                                                                alt={cell.items[i].name}
                                                                                className="builder-placed-item-icon"
                                                                                title={`${cell.items[i].name}\nDrag to item panel or right-click to remove`}
                                                                                draggable
                                                                                onDragStart={e => handleBoardItemDragStart(e, displayRow, c, i, cell.items[i])}
                                                                                onDragEnd={handleCellDragEnd}
                                                                                onContextMenu={e => handleRemoveItem(e, displayRow, c, i)}
                                                                            />
                                                                        ) : (
                                                                            <div key={i} className="builder-placed-item-slot" />
                                                                        )
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {showNames && (
                                                                <span
                                                                    className="builder-placed-name"
                                                                    style={{ color: COST_COLORS[cell.champ.cost] || '#aaa' }}
                                                                >
                                                                    {cell.champ.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="builder-hex-empty-inner" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                        </div>{/* end builder-board-labeled */}
                    </div>

                    {/* Right column: Components on top, Augments below */}
                    <div className="builder-right-column">

                        {/* Components Needed */}
                        <div className="builder-components">
                            <h3 className="builder-section-title">Components Needed</h3>
                            {componentCounts.length === 0 ? (
                                <p className="builder-traits-empty">Equip items to see components</p>
                            ) : (
                                <div className="builder-component-grid">
                                    {componentCounts.map(({ component, count }) => (
                                        <div
                                            key={component.id}
                                            className="builder-component-icon-wrap"
                                            title={`${component.name} ×${count}`}
                                        >
                                            {component.imageUrl && (
                                                <img
                                                    src={component.imageUrl}
                                                    alt={component.name}
                                                    className="builder-component-icon"
                                                />
                                            )}
                                            <span className="builder-component-count">×{count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Augments */}
                        <div className="builder-augments">
                            <h3 className="builder-section-title">Augments</h3>
                            <div className="builder-augment-grid">
                                {Array.from({ length: 6 }, (_, i) => {
                                    const aug = selectedAugments[i]
                                    return aug ? (
                                        <div
                                            key={i}
                                            className={`builder-augment-slot builder-augment-slot-filled builder-augment-tier-${aug.tier?.toLowerCase()}`}
                                            title={`${aug.name}\n${aug.description}\nRight-click to remove`}
                                            onContextMenu={e => { e.preventDefault(); removeAugment(i) }}
                                        >
                                            {aug.imageUrl
                                                ? <img src={aug.imageUrl} alt={aug.name} className="builder-augment-img" />
                                                : <span className="builder-augment-initials">{aug.name[0]}</span>
                                            }
                                        </div>
                                    ) : (
                                        <button
                                            key={i}
                                            className="builder-augment-slot builder-augment-slot-empty"
                                            onClick={openAugmentPicker}
                                            title="Add augment"
                                        >
                                            +
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                    </div>{/* end builder-right-column */}

                </div>{/* end builder-top-row */}

                {/* ── Bottom: Champions | Items side by side ── */}
                <div className="builder-bottom-row">

                    {/* Champions panel */}
                    <div
                        className={`builder-panel builder-champ-panel ${dragOverPanel === 'champions' ? 'builder-panel-drop-active' : ''}`}
                        onDragOver={e => handlePanelDragOver(e, 'champions')}
                        onDragLeave={handlePanelDragLeave}
                        onDrop={e => handlePanelDrop(e, 'champions')}
                    >
                        <div className="builder-panel-header">
                            <h3 className="builder-section-title" style={{ margin: 0 }}>Champions</h3>
                            <div className="builder-panel-filters">
                                <button
                                    className={`builder-name-toggle ${showNames ? 'builder-name-toggle-active' : ''}`}
                                    onClick={() => setShowNames(v => !v)}
                                    title="Toggle champion names"
                                >
                                    {showNames ? 'Hide Names' : 'Show Names'}
                                </button>
                                <input
                                    className="builder-search"
                                    type="text"
                                    placeholder="Search champion..."
                                    value={champSearch}
                                    onChange={e => setChampSearch(e.target.value)}
                                />
                                <div className="builder-cost-filters">
                                    {[null, 1, 2, 3, 4, 5].map(cost => (
                                        <button
                                            key={cost ?? 'all'}
                                            className={`builder-cost-btn ${costFilter === cost ? 'builder-cost-btn-active' : ''}`}
                                            style={cost !== null ? {
                                                borderColor: COST_COLORS[cost],
                                                color: costFilter === cost ? COST_COLORS[cost] : '#888'
                                            } : {}}
                                            onClick={() => setCostFilter(costFilter === cost ? null : cost)}
                                        >
                                            {cost === null ? 'All' : `${cost}★`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="builder-roster-grid">
                            {filteredChampions.map(champ => (
                                <div
                                    key={champ.id}
                                    className={`builder-roster-champ${showNames ? ' builder-roster-champ-named' : ''}`}
                                    draggable
                                    onDragStart={e => handleRosterDragStart(e, champ)}
                                    onDragEnd={handleCellDragEnd}
                                    onMouseEnter={e => showTooltip(e, 'champion', champ)}
                                    onMouseMove={moveTooltip}
                                    onMouseLeave={hideTooltip}
                                >
                                    <div
                                        className="builder-roster-img-wrap"
                                        style={{ borderColor: COST_COLORS[champ.cost] || '#aaa' }}
                                    >
                                        <img
                                            src={champ.imageUrl}
                                            alt={champ.name}
                                            className="builder-roster-img"
                                        />
                                    </div>
                                    {showNames && (
                                        <span className="builder-roster-champ-name">
                                            {champ.name}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="builder-panel-divider" />

                    {/* Items panel */}
                    <div
                        className={`builder-panel builder-item-panel ${dragOverPanel === 'items' ? 'builder-panel-drop-active' : ''}`}
                        onDragOver={e => handlePanelDragOver(e, 'items')}
                        onDragLeave={handlePanelDragLeave}
                        onDrop={e => handlePanelDrop(e, 'items')}
                    >
                        <div className="builder-panel-header">
                            <h3 className="builder-section-title" style={{ margin: 0 }}>Items</h3>
                            <input
                                className="builder-search"
                                type="text"
                                placeholder="Search item..."
                                value={itemSearch}
                                onChange={e => setItemSearch(e.target.value)}
                            />
                        </div>

                        {/* Sectioned item list */}
                        <div className="builder-item-sections">
                            {itemSections.map(section => (
                                <div key={section.key} className="builder-item-section">
                                    <div className="builder-item-section-header">{section.label}</div>
                                    <div className="builder-item-grid">
                                        {section.items.map(item => (
                                            <div
                                                key={item.id}
                                                className="builder-item-card"
                                                draggable
                                                onDragStart={e => handleItemDragStart(e, item)}
                                                onDragEnd={handleCellDragEnd}
                                                onMouseEnter={e => showTooltip(e, 'item', item)}
                                                onMouseMove={moveTooltip}
                                                onMouseLeave={hideTooltip}
                                            >
                                                <div className="builder-item-img-wrap">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="builder-item-img"
                                                        />
                                                    ) : (
                                                        <div className="builder-item-img-placeholder" />
                                                    )}
                                                </div>
                                                <span className="builder-item-name">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            {/* ── Export modal ────────────────────────────────── */}
            {exportModalOpen && (
                <div className="save-modal-overlay" onClick={() => setExportModalOpen(false)}>
                    <div className="export-modal" onClick={e => e.stopPropagation()}>
                        <div className="load-modal-header">
                            <h3 className="save-modal-title">Export Composition</h3>
                            <button className="augment-picker-close" onClick={() => setExportModalOpen(false)}>✕</button>
                        </div>
                        <div className="export-modal-preview">
                            <img src={exportImageUrl} alt="Composition preview" className="export-modal-img" />
                        </div>
                        <div className="export-modal-actions">
                            <button className="save-modal-cancel" onClick={() => setExportModalOpen(false)}>Close</button>
                            <button className="save-modal-confirm" onClick={downloadExport}>⬇ Download PNG</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Import team code modal ──────────────────────── */}
            {importModalOpen && (
                <div className="save-modal-overlay" onClick={() => setImportModalOpen(false)}>
                    <div className="save-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="save-modal-title">Import Team Code</h3>
                        <p className="import-modal-hint">
                            Paste a Team Code from the in-game Team Planner (or anywhere else). This replaces your current board.
                        </p>
                        <input
                            className="builder-search save-modal-input"
                            type="text"
                            placeholder="02181519253c3d16001a00TFTSet17"
                            value={importCode}
                            onChange={e => { setImportCode(e.target.value); setImportError(null) }}
                            onKeyDown={e => { if (e.key === 'Enter') handleImportTeamCode() }}
                            autoFocus
                            spellCheck={false}
                        />
                        {importError && <p className="import-modal-error">{importError}</p>}
                        <div className="save-modal-actions">
                            <button className="save-modal-cancel" onClick={() => setImportModalOpen(false)}>Cancel</button>
                            <button className="save-modal-confirm" onClick={handleImportTeamCode} disabled={!importCode.trim()}>
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Save modal ──────────────────────────────────── */}
            {saveModalOpen && (
                <div className="save-modal-overlay" onClick={() => setSaveModalOpen(false)}>
                    <div className="save-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="save-modal-title">Save Composition</h3>
                        <input
                            className="builder-search save-modal-input"
                            type="text"
                            placeholder={`Comp ${saves.length + 1}`}
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveComp(saveName) }}
                            autoFocus
                        />
                        <div className="save-modal-actions">
                            <button className="save-modal-cancel" onClick={() => setSaveModalOpen(false)}>Cancel</button>
                            <button className="save-modal-confirm" onClick={() => saveComp(saveName)}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Load modal ──────────────────────────────────── */}
            {loadModalOpen && (
                <div className="save-modal-overlay" onClick={() => setLoadModalOpen(false)}>
                    <div className="load-modal" onClick={e => e.stopPropagation()}>
                        <div className="load-modal-header">
                            <h3 className="save-modal-title">Load Composition</h3>
                            <button className="augment-picker-close" onClick={() => setLoadModalOpen(false)}>✕</button>
                        </div>
                        {saves.length === 0 ? (
                            <p className="load-modal-empty">No saved compositions yet.</p>
                        ) : (
                            <div className="load-modal-list">
                                {[...saves].reverse().map(save => {
                                    const placedCells = save.board.flat().filter(Boolean)
                                    return (
                                        <div key={save.id} className="load-modal-card">
                                            <div className="load-modal-card-info">
                                                <span className="load-modal-card-name">{save.name}</span>
                                                <span className="load-modal-card-date">
                                                    {new Date(save.savedAt).toLocaleDateString()} · {new Date(save.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="load-modal-card-units">{placedCells.length} units</span>
                                            </div>
                                            <div className="load-modal-card-preview">
                                                {placedCells.map((cell, i) => (
                                                    <img
                                                        key={i}
                                                        src={cell.champImageUrl}
                                                        alt=""
                                                        className="load-modal-champ-icon"
                                                        style={{ borderColor: COST_COLORS[cell.champCost] || '#3a3d4a' }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="load-modal-card-actions">
                                                <button className="load-modal-load-btn" onClick={() => loadComp(save)}>Load</button>
                                                <button className="load-modal-delete-btn" onClick={() => deleteSave(save.id)}>Delete</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Augment picker modal ─────────────────────────── */}
            {augmentPickerOpen && (
                <div className="augment-picker-overlay" onClick={() => setAugmentPickerOpen(false)}>
                    <div className="augment-picker-modal" onClick={e => e.stopPropagation()}>
                        <div className="augment-picker-header">
                            <h3 className="augment-picker-title">Select Augment</h3>
                            <input
                                className="builder-search augment-picker-header-search"
                                type="text"
                                placeholder="Search augments..."
                                value={augmentSearch}
                                onChange={e => setAugmentSearch(e.target.value)}
                                autoFocus
                            />
                            <button className="augment-picker-close" onClick={() => setAugmentPickerOpen(false)}>✕</button>
                        </div>

                        {/* Currently selected augments */}
                        <div className="augment-picker-selected">
                            <span className="augment-picker-selected-label">Selected ({selectedAugments.filter(Boolean).length}/6)</span>
                            <div className="augment-picker-selected-slots">
                                {Array.from({ length: 6 }, (_, i) => {
                                    const aug = selectedAugments[i]
                                    return aug ? (
                                        <div key={i} className="augment-picker-selected-slot">
                                            <div
                                                className={`augment-picker-selected-filled augment-picker-tier-${aug.tier?.toLowerCase()}`}
                                                title={`${aug.name} — click to remove`}
                                                onClick={() => removeAugment(i)}
                                            >
                                                <img src={aug.imageUrl} alt={aug.name} className="augment-picker-selected-img" />
                                                <div className="augment-picker-selected-remove">✕</div>
                                            </div>
                                            <span className="augment-picker-selected-name">{aug.name}</span>
                                        </div>
                                    ) : (
                                        <div key={i} className="augment-picker-selected-slot augment-picker-selected-empty" />
                                    )
                                })}
                            </div>
                        </div>

                        {/* Augment grid */}
                        <div className="augment-picker-list">
                            {pickerAugments.length === 0 ? (
                                <p className="augment-picker-empty">No augments found</p>
                            ) : (
                                <div className="augment-picker-grid">
                                    {pickerAugments.map(aug => (
                                        <div
                                            key={aug.id}
                                            className={`augment-picker-item augment-picker-tier-${aug.tier?.toLowerCase()}`}
                                            onClick={() => selectAugment(aug)}
                                            title={aug.description}
                                        >
                                            {aug.imageUrl && (
                                                <img src={aug.imageUrl} alt={aug.name} className="augment-picker-img" />
                                            )}
                                            <span className="augment-picker-name">{aug.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Floating tooltip ─────────────────────────────── */}
            {tooltip && (
                <div
                    className="builder-tooltip"
                    style={{
                        left: tooltip.x + 16,
                        top:  tooltip.y,
                        transform: 'translateY(-100%)',
                        borderColor: tooltip.type === 'champion'
                            ? COST_COLORS[tooltip.data.cost] || '#2a2d3a'
                            : '#2a2d3a',
                        boxShadow: tooltip.type === 'champion'
                            ? `0 8px 32px rgba(0,0,0,0.7), 0 0 12px ${COST_COLORS[tooltip.data.cost]}44`
                            : '0 8px 32px rgba(0,0,0,0.7)',
                    }}
                >
                    {tooltip.type === 'champion' && (
                        <div className="builder-tooltip-champ">
                            {/* Header: portrait + name + cost + role badge */}
                            <div className="builder-tt-header">
                                <img
                                    src={tooltip.data.imageUrl}
                                    alt={tooltip.data.name}
                                    className="builder-tt-champ-img"
                                    style={{ borderColor: COST_COLORS[tooltip.data.cost] || '#3a3d4a' }}
                                />
                                <div className="builder-tt-champ-info">
                                    <div className="builder-tt-name-row">
                                        <span className="builder-tt-champ-name">{tooltip.data.name}</span>
                                        {tooltip.data.role && (
                                            <span className="builder-tt-role-badge">{tooltip.data.role}</span>
                                        )}
                                    </div>
                                    <span className="builder-tt-cost" style={{ color: COST_COLORS[tooltip.data.cost] }}>
                                        {tooltip.data.cost}g
                                    </span>
                                </div>
                            </div>

                            {/* Traits */}
                            {tooltip.data.traits?.length > 0 && (
                                <div className="builder-tt-traits">
                                    {tooltip.data.traits.map(t => (
                                        <div key={t.id} className="builder-tt-trait-row">
                                            {t.imageUrl && (
                                                <img src={t.imageUrl} alt={t.name} className="builder-tt-trait-icon" />
                                            )}
                                            <span className="builder-tt-trait-name">{t.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ability */}
                            {tooltip.data.ability && (
                                <div className="builder-tt-ability">
                                    <div className="builder-tt-ability-header">
                                        {tooltip.data.ability.imageUrl && (
                                            <img
                                                src={tooltip.data.ability.imageUrl}
                                                alt={tooltip.data.ability.name}
                                                className="builder-tt-ability-icon"
                                            />
                                        )}
                                        <div className="builder-tt-ability-meta">
                                            <span className="builder-tt-ability-name">{tooltip.data.ability.name}</span>
                                            {tooltip.data.mana && (
                                                <span className="builder-tt-mana">
                                                    <span className="builder-tt-mana-dot" />
                                                    {tooltip.data.mana.starting} / {tooltip.data.mana.total}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="builder-tt-ability-desc">{tooltip.data.ability.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {tooltip.type === 'item' && (
                        <div className="builder-tooltip-item">
                            <div className="builder-tt-header">
                                {tooltip.data.imageUrl && (
                                    <img
                                        src={tooltip.data.imageUrl}
                                        alt={tooltip.data.name}
                                        className="builder-tt-item-img"
                                    />
                                )}
                                <span className="builder-tt-item-name">{tooltip.data.name}</span>
                            </div>

                            {tooltip.data.description && (
                                <p className="builder-tt-item-desc">{tooltip.data.description}</p>
                            )}

                            {tooltip.data.component1 && tooltip.data.component2 && (
                                <div className="builder-tt-recipe">
                                    <img
                                        src={tooltip.data.component1.imageUrl}
                                        alt={tooltip.data.component1.name}
                                        className="builder-tt-component"
                                        title={tooltip.data.component1.name}
                                    />
                                    <span className="builder-tt-plus">+</span>
                                    <img
                                        src={tooltip.data.component2.imageUrl}
                                        alt={tooltip.data.component2.name}
                                        className="builder-tt-component"
                                        title={tooltip.data.component2.name}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TeamBuilderPage
