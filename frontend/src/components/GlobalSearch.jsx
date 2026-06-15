import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { getChampions, getTraits, getCombinedItems, getAugments, getCompositions } from '../services/api'

const MAX_PER_GROUP = 4

function cleanName(name) {
    return (name || '').replace(/^[\r\n\s]+/, '').trim()
}

const GROUP_LABELS = {
    comp:     'Compositions',
    champion: 'Champions',
    trait:    'Traits',
    item:     'Items',
    augment:  'Augments',
}

function GlobalSearch() {
    const navigate = useNavigate()
    const [query,   setQuery]   = useState('')
    const [open,    setOpen]    = useState(false)
    const [loaded,  setLoaded]  = useState(false)
    const [active,  setActive]  = useState(0)
    const [data,    setData]    = useState({ champions: [], traits: [], items: [], augments: [], comps: [] })
    const wrapRef  = useRef(null)
    const inputRef = useRef(null)

    // Lazy-load all searchable data on first focus
    function loadData() {
        if (loaded) return
        setLoaded(true)
        Promise.allSettled([
            getChampions(), getTraits(), getCombinedItems(), getAugments(), getCompositions(),
        ]).then(([ch, tr, it, au, co]) => {
            const pick = r => (r.status === 'fulfilled' ? r.value.data : [])
            setData({
                champions: pick(ch),
                traits:    pick(tr),
                items:     pick(it),
                augments:  pick(au),
                comps:     pick(co),
            })
        })
    }

    // Close on outside click
    useEffect(() => {
        function onClick(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    // Keyboard shortcut: "/" focuses search
    useEffect(() => {
        function onKey(e) {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    const q = query.trim().toLowerCase()

    // Build a flat, ordered list of results across all types
    const results = []
    if (q) {
        const match = (arr, type, toResult) =>
            arr.filter(x => cleanName(x.name).toLowerCase().includes(q))
               .slice(0, MAX_PER_GROUP)
               .forEach(x => results.push({ type, ...toResult(x) }))

        match(data.comps, 'comp', c => ({
            id: c.id, name: c.name, imageUrl: c.carryImageUrl, sub: `${c.tier?.trim()} Tier`, to: `/compositions/${c.id}`,
        }))
        match(data.champions, 'champion', c => ({
            id: c.id, name: c.name, imageUrl: c.imageUrl, sub: `${c.cost} cost`, to: `/champions/${c.id}`,
        }))
        match(data.traits, 'trait', t => ({
            id: t.id, name: t.name, imageUrl: t.imageUrl, sub: 'Trait', to: '/traits',
        }))
        match(data.items, 'item', i => ({
            id: i.id, name: i.name, imageUrl: i.imageUrl, sub: 'Item', to: '/items',
        }))
        match(data.augments, 'augment', a => ({
            id: a.id, name: cleanName(a.name), imageUrl: a.imageUrl, sub: 'Augment', to: '/augments',
        }))
    }

    // Group for rendering, but keep a flat index for keyboard nav
    const grouped = {}
    results.forEach((r, i) => {
        if (!grouped[r.type]) grouped[r.type] = []
        grouped[r.type].push({ ...r, flatIndex: i })
    })

    function select(r) {
        if (!r) return
        navigate(r.to)
        setQuery('')
        setOpen(false)
        inputRef.current?.blur()
    }

    function onKeyDown(e) {
        if (!open || results.length === 0) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % results.length) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a - 1 + results.length) % results.length) }
        else if (e.key === 'Enter') { e.preventDefault(); select(results[active]) }
        else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }

    const showDropdown = open && q.length > 0

    return (
        <div className="gsearch" ref={wrapRef}>
            <div className="gsearch-input-wrap">
                <FaMagnifyingGlass className="gsearch-icon" />
                <input
                    ref={inputRef}
                    className="gsearch-input"
                    type="text"
                    placeholder="Search…"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true) }}
                    onFocus={() => { loadData(); setOpen(true) }}
                    onKeyDown={onKeyDown}
                />
                {!query && <kbd className="gsearch-kbd">/</kbd>}
            </div>

            {showDropdown && (
                <div className="gsearch-dropdown">
                    {results.length === 0 ? (
                        <div className="gsearch-empty">No results for "{query}"</div>
                    ) : (
                        Object.keys(GROUP_LABELS)
                            .filter(type => grouped[type]?.length)
                            .map(type => (
                                <div key={type} className="gsearch-group">
                                    <div className="gsearch-group-label">{GROUP_LABELS[type]}</div>
                                    {grouped[type].map(r => (
                                        <button
                                            key={`${r.type}-${r.id}`}
                                            className={`gsearch-result ${r.flatIndex === active ? 'gsearch-result-active' : ''}`}
                                            onMouseEnter={() => setActive(r.flatIndex)}
                                            onClick={() => select(r)}
                                        >
                                            {r.imageUrl
                                                ? <img src={r.imageUrl} alt="" className={`gsearch-result-img ${r.type === 'item' || r.type === 'augment' ? 'gsearch-result-img-square' : ''}`} />
                                                : <span className="gsearch-result-img gsearch-result-img-ph" />
                                            }
                                            <span className="gsearch-result-name">{r.name}</span>
                                            <span className="gsearch-result-sub">{r.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            ))
                    )}
                </div>
            )}
        </div>
    )
}

export default GlobalSearch
