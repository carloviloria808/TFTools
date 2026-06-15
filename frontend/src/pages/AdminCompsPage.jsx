import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCompositions, getCompositionById, updateComposition, createComposition, deleteComposition } from '../services/api'
import BoardEditor from '../components/BoardEditor'
import IconListField from '../components/IconListField'

const TIERS  = ['S', 'A', 'B', 'C', 'X']
const TRENDS = ['none', 'up', 'down', 'new']
const TIER_COLORS = {
    S: '#ff7675', A: '#fdcb6e', B: '#6c5ce7', C: '#00b894', X: '#b2bec3'
}
const PLAYSTYLES  = ['Standard', 'Fast 8', 'Fast 9', 'Reroll']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const PLAYSTYLE_COLORS = {
    'Standard': '#74b9ff', 'Fast 8': '#6c5ce7', 'Fast 9': '#e17055', 'Reroll': '#00b894',
}
const DIFFICULTY_COLORS = {
    'Easy': '#00b894', 'Medium': '#fdcb6e', 'Hard': '#e55050',
}
const STAGE_LABELS = ['Stage 2', 'Stage 3', 'Stage 4']

// ── helpers ──────────────────────────────────────────────────────────────────

function prettyJson(val) {
    if (val === null || val === undefined) return ''
    // Already a parsed object/array (API deserializes JSON fields before returning)
    if (typeof val !== 'string') {
        try { return JSON.stringify(val, null, 2) }
        catch { return '' }
    }
    // String — parse then pretty-print
    if (val.trim() === '') return ''
    try { return JSON.stringify(JSON.parse(val), null, 2) }
    catch { return val }
}

function isValidJson(str) {
    if (!str || str.trim() === '') return true   // empty = treat as null, OK
    try { JSON.parse(str); return true }
    catch { return false }
}

// Pull the 3 stage descriptions out of the JSON string or pre-parsed array → ['...','...','...']
function parseStageGuide(val) {
    try {
        const arr = Array.isArray(val) ? val : JSON.parse(val || '[]')
        return STAGE_LABELS.map((_, i) => arr[i]?.description ?? '')
    } catch { return ['', '', ''] }
}

// Rebuild the full stageGuide JSON from 3 description strings
function buildStageGuide(descs) {
    return JSON.stringify(
        STAGE_LABELS.map((label, i) => ({ stage: label, description: descs[i] }))
    )
}

// ── sub-components ────────────────────────────────────────────────────────────

function JsonField({ label, hint, value, onChange, error }) {
    return (
        <div className="ace-field">
            <label className="ace-label">
                {label}
                {hint && <span className="ace-label-hint">{hint}</span>}
            </label>
            <textarea
                className={`ace-textarea ace-textarea-mono ${error ? 'ace-textarea-error' : ''}`}
                rows={6}
                value={value}
                onChange={e => onChange(e.target.value)}
                spellCheck={false}
            />
            {error && <span className="ace-error-msg">Invalid JSON</span>}
        </div>
    )
}

// ── main component ────────────────────────────────────────────────────────────

function AdminCompsPage() {
    usePageTitle('Comp Editor')
    const navigate = useNavigate()
    const [comps,        setComps]        = useState([])
    const [selected,     setSelected]     = useState(null)
    const [loadingList,  setLoadingList]  = useState(true)
    const [loadingComp,  setLoadingComp]  = useState(false)
    const [saving,       setSaving]       = useState(false)
    const [saveStatus,   setSaveStatus]   = useState(null)
    const [search,       setSearch]       = useState('')
    const [creating,     setCreating]     = useState(false)
    const [createError,  setCreateError]  = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting,     setDeleting]     = useState(false)

    // ── form state ────────────────────────────────────────────────────────────
    const [form, setForm] = useState({})
    // stage guide split into 3 separate strings
    const [stages, setStages] = useState(['', '', ''])
    // JSON field error flags
    const [jsonErrors, setJsonErrors] = useState({})

    useEffect(() => {
        getCompositions().then(r => {
            setComps(r.data)
            setLoadingList(false)
        })
    }, [])

    const loadComp = useCallback(async (id) => {
        setLoadingComp(true)
        setSaveStatus(null)
        const r = await getCompositionById(id)
        const c = r.data
        setSelected(c)
        setForm({
            name:         c.name          ?? '',
            tier:         c.tier?.trim()  ?? 'C',
            description:  c.description   ?? '',
            playstyle:    c.playstyle      ?? 'Standard',
            difficulty:   c.difficulty     ?? 'Medium',
            patchVersion: c.patchVersion   ?? '',
            isConditional: c.isConditional ?? false,
            trend:        c.trend         ?? 'none',
            carryImageUrl: c.carryImageUrl ?? '',
            tips:         c.tips           ?? '',
            itemPriority: prettyJson(c.itemPriority),
            earlyUnits:   prettyJson(c.earlyUnits),
            gods:         prettyJson(c.gods),
            augments:     prettyJson(c.augments),
        })
        setStages(parseStageGuide(c.stageGuide))
        setJsonErrors({})
        setLoadingComp(false)
    }, [])

    async function handleCreate() {
        setCreating(true)
        setCreateError(null)
        try {
            const r = await createComposition()
            const newComp = r.data
            const refreshed = await getCompositions()
            setComps(refreshed.data)
            await loadComp(newComp.id)
        } catch (err) {
            const msg = err?.response?.data ?? err?.message ?? 'Unknown error'
            setCreateError(typeof msg === 'string' ? msg : JSON.stringify(msg))
        } finally {
            setCreating(false)
        }
    }

    async function handleDelete() {
        if (!selected) return
        setDeleting(true)
        try {
            await deleteComposition(selected.id)
            const refreshed = await getCompositions()
            setComps(refreshed.data)
            setSelected(null)
            setForm({})
            setConfirmDelete(false)
        } catch {
            // silent fail
        } finally {
            setDeleting(false)
        }
    }

    function setField(key, val) {
        setForm(f => ({ ...f, [key]: val }))
        setSaveStatus(null)
    }

    function setJsonField(key, val) {
        setForm(f => ({ ...f, [key]: val }))
        setJsonErrors(e => ({ ...e, [key]: !isValidJson(val) }))
        setSaveStatus(null)
    }

    function setStage(i, val) {
        setStages(prev => { const n = [...prev]; n[i] = val; return n })
        setSaveStatus(null)
    }

    async function handleSave() {
        // Validate JSON fields before saving
        const jsonKeys = ['itemPriority', 'earlyUnits', 'gods', 'augments']
        const errs = {}
        jsonKeys.forEach(k => { if (!isValidJson(form[k])) errs[k] = true })
        if (Object.keys(errs).length > 0) { setJsonErrors(errs); return }

        setSaving(true)
        setSaveStatus(null)

        const payload = {
            name:          form.name,
            tier:          form.tier,
            description:   form.description,
            playstyle:     form.playstyle,
            difficulty:    form.difficulty,
            patchVersion:  form.patchVersion,
            isConditional: form.isConditional,
            trend:         form.trend ?? 'none',
            carryImageUrl: form.carryImageUrl,
            tips:          form.tips,
            stageGuide:    buildStageGuide(stages),
            itemPriority:  form.itemPriority?.trim() || null,
            earlyUnits:    form.earlyUnits?.trim()   || null,
            gods:          form.gods?.trim()          || null,
            augments:      form.augments?.trim()      || null,
        }

        // Compact the JSON fields before saving (remove pretty-print whitespace)
        ;['itemPriority', 'earlyUnits', 'gods', 'augments'].forEach(k => {
            if (payload[k]) {
                try { payload[k] = JSON.stringify(JSON.parse(payload[k])) }
                catch { /* leave as-is, already validated above */ }
            }
        })

        try {
            await updateComposition(selected.id, payload)
            setSaveStatus('saved')
            // Refresh the sidebar list so name/tier changes are reflected
            const r = await getCompositions()
            setComps(r.data)
            setTimeout(() => setSaveStatus(null), 3000)
        } catch {
            setSaveStatus('error')
        } finally {
            setSaving(false)
        }
    }

    // ── filtered sidebar list ─────────────────────────────────────────────────
    const filtered = comps.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )
    const grouped = TIERS.reduce((acc, t) => {
        acc[t] = filtered.filter(c => c.tier?.trim() === t)
        return acc
    }, {})

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="ace-page">

            {/* ── Sidebar ── */}
            <aside className="ace-sidebar">
                <div className="ace-sidebar-header">
                    <span className="ace-sidebar-title">Compositions</span>
                    <span className="ace-sidebar-count">{comps.length}</span>
                </div>
                <button
                    className="ace-logout-btn"
                    onClick={() => { localStorage.removeItem('admin_auth'); navigate('/admin/login') }}
                >
                    Log Out
                </button>
                <input
                    className="ace-search"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="ace-new-comp-btn" onClick={handleCreate} disabled={creating}>
                    {creating ? 'Creating...' : '+ New Comp'}
                </button>
                {createError && (
                    <div className="ace-create-error" title={createError}>
                        ✕ {createError.length > 60 ? createError.slice(0, 60) + '…' : createError}
                    </div>
                )}
                <div className="ace-sidebar-list">
                    {loadingList ? (
                        <div className="ace-sidebar-empty">Loading...</div>
                    ) : (
                        TIERS.map(tier => {
                            const items = grouped[tier] || []
                            if (items.length === 0) return null
                            return (
                                <div key={tier} className="ace-sidebar-group">
                                    <div
                                        className="ace-sidebar-tier"
                                        style={{ color: TIER_COLORS[tier] }}
                                    >
                                        {tier}
                                    </div>
                                    {items.map(c => (
                                        <button
                                            key={c.id}
                                            className={`ace-sidebar-item ${selected?.id === c.id ? 'ace-sidebar-item-active' : ''}`}
                                            onClick={() => loadComp(c.id)}
                                        >
                                            {c.carryImageUrl && (
                                                <img src={c.carryImageUrl} alt="" className="ace-sidebar-thumb" />
                                            )}
                                            <span className="ace-sidebar-name">{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )
                        })
                    )}
                </div>
            </aside>

            {/* ── Editor panel ── */}
            <main className="ace-editor">
                {!selected && !loadingComp && (
                    <div className="ace-empty-state">
                        <div className="ace-empty-icon">✎</div>
                        <p>Select a composition from the sidebar to edit it</p>
                    </div>
                )}

                {loadingComp && (
                    <div className="ace-empty-state">
                        <p>Loading...</p>
                    </div>
                )}

                {selected && !loadingComp && (
                    <>
                        {/* Editor header */}
                        <div className="ace-editor-header">
                            <div className="ace-editor-title-row">
                                {selected.carryImageUrl && (
                                    <img src={selected.carryImageUrl} alt="" className="ace-editor-thumb" />
                                )}
                                <div>
                                    <h2 className="ace-editor-title">{selected.name}</h2>
                                    <span className="ace-editor-id">ID #{selected.id}</span>
                                </div>
                            </div>
                            <div className="ace-editor-actions">
                                {saveStatus === 'saved' && <span className="ace-status-saved">✓ Saved</span>}
                                {saveStatus === 'error' && <span className="ace-status-error">✕ Error</span>}

                                {confirmDelete ? (
                                    <div className="ace-delete-confirm">
                                        <span className="ace-delete-confirm-text">Delete this comp?</span>
                                        <button className="ace-delete-confirm-yes" onClick={handleDelete} disabled={deleting}>
                                            {deleting ? '...' : 'Yes, Delete'}
                                        </button>
                                        <button className="ace-delete-confirm-cancel" onClick={() => setConfirmDelete(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button className="ace-delete-btn" onClick={() => setConfirmDelete(true)}>
                                        Delete
                                    </button>
                                )}

                                <button
                                    className="ace-save-btn"
                                    onClick={handleSave}
                                    disabled={saving || Object.values(jsonErrors).some(Boolean)}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        <div className="ace-form">

                            {/* ── Row 1: identity fields ── */}
                            <div className="ace-section-label">Identity</div>
                            <div className="ace-row-3">
                                <div className="ace-field">
                                    <label className="ace-label">Name</label>
                                    <input className="ace-input" value={form.name} onChange={e => setField('name', e.target.value)} />
                                </div>
                                <div className="ace-field">
                                    <label className="ace-label">Patch Version</label>
                                    <input className="ace-input" value={form.patchVersion} onChange={e => setField('patchVersion', e.target.value)} placeholder="e.g. 17.3" />
                                </div>
                                <div className="ace-field">
                                    <label className="ace-label">Carry Image URL</label>
                                    <input className="ace-input" value={form.carryImageUrl} onChange={e => setField('carryImageUrl', e.target.value)} />
                                </div>
                            </div>

                            {/* ── Row 2: dropdowns + toggle ── */}
                            <div className="ace-row-4">
                                <div className="ace-field">
                                    <label className="ace-label">Tier</label>
                                    <select className="ace-select" value={form.tier} style={{ color: TIER_COLORS[form.tier] }} onChange={e => setField('tier', e.target.value)}>
                                        {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="ace-field">
                                    <label className="ace-label">Playstyle</label>
                                    <div className="ace-tag-group">
                                        {PLAYSTYLES.map(p => {
                                            const active = form.playstyle === p
                                            const color  = PLAYSTYLE_COLORS[p]
                                            return (
                                                <button
                                                    key={p}
                                                    className={`ace-tag ${active ? 'ace-tag-active' : ''}`}
                                                    style={active ? { borderColor: color, color, background: `${color}22` } : {}}
                                                    onClick={() => setField('playstyle', p)}
                                                    type="button"
                                                >{p}</button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="ace-field">
                                    <label className="ace-label">Difficulty</label>
                                    <div className="ace-tag-group">
                                        {DIFFICULTIES.map(d => {
                                            const active = form.difficulty === d
                                            const color  = DIFFICULTY_COLORS[d]
                                            return (
                                                <button
                                                    key={d}
                                                    className={`ace-tag ${active ? 'ace-tag-active' : ''}`}
                                                    style={active ? { borderColor: color, color, background: `${color}22` } : {}}
                                                    onClick={() => setField('difficulty', d)}
                                                    type="button"
                                                >{d}</button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="ace-field ace-field-toggle">
                                    <label className="ace-label">Conditional</label>
                                    <div
                                        className={`ace-toggle ${form.isConditional ? 'ace-toggle-on' : ''}`}
                                        onClick={() => setField('isConditional', !form.isConditional)}
                                    >
                                        <span className="ace-toggle-thumb" />
                                    </div>
                                </div>
                                <div className="ace-field">
                                    <label className="ace-label">Trend</label>
                                    <select className="ace-select" value={form.trend ?? 'none'} onChange={e => setField('trend', e.target.value)}>
                                        {TRENDS.map(t => <option key={t} value={t}>{t === 'none' ? '— None' : t === 'up' ? '↑ Buffed' : t === 'down' ? '↓ Nerfed' : '✦ New'}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* ── Description ── */}
                            <div className="ace-section-label">Content</div>
                            <div className="ace-field">
                                <label className="ace-label">Description <span className="ace-label-hint">short summary shown on the tier list card</span></label>
                                <input className="ace-input" value={form.description} onChange={e => setField('description', e.target.value)} />
                            </div>

                            {/* ── Tips ── */}
                            <div className="ace-field">
                                <label className="ace-label">Tips <span className="ace-label-hint">shown in the detail modal left panel — one tip per line</span></label>
                                <textarea className="ace-textarea" rows={5} value={form.tips} onChange={e => setField('tips', e.target.value)} />
                            </div>

                            {/* ── Stage Guide ── */}
                            <div className="ace-section-label">Stage Guide</div>
                            <div className="ace-row-3">
                                {STAGE_LABELS.map((label, i) => (
                                    <div key={label} className="ace-field">
                                        <label className="ace-label">{label}</label>
                                        <textarea
                                            className="ace-textarea"
                                            rows={4}
                                            value={stages[i]}
                                            onChange={e => setStage(i, e.target.value)}
                                            placeholder={`What to do on ${label}...`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* ── Board Editor ── */}
                            <div className="ace-section-label">Board</div>
                            <BoardEditor
                                key={selected.id}
                                initialChampions={selected.champions || []}
                                compositionId={selected.id}
                            />

                            {/* ── Icon list fields ── */}
                            <div className="ace-section-label">Unit Data</div>
                            <div className="ace-row-2">
                                <IconListField
                                    label="Item Priority"
                                    hint="click to add, ‹ › to reorder, ✕ to remove"
                                    type="items"
                                    value={form.itemPriority}
                                    onChange={v => setJsonField('itemPriority', v)}
                                />
                                <IconListField
                                    label="Early Units"
                                    hint="champions to build around early"
                                    type="champions"
                                    value={form.earlyUnits}
                                    onChange={v => setJsonField('earlyUnits', v)}
                                />
                                <IconListField
                                    label="Gods"
                                    hint="gods that benefit this comp"
                                    type="gods"
                                    value={form.gods}
                                    onChange={v => setJsonField('gods', v)}
                                />
                                <IconListField
                                    label="Augments"
                                    hint="recommended augments"
                                    type="augments"
                                    value={form.augments}
                                    onChange={v => setJsonField('augments', v)}
                                />
                            </div>

                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default AdminCompsPage
