import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCompositionById } from '../services/api'
import CompDetailView from '../components/CompDetailView'
import { usePageTitle } from '../hooks/usePageTitle'

const CDN = 'https://raw.communitydragon.org/latest/game/assets/characters'
const champImg = name =>
    `${CDN}/tft17_${name.toLowerCase()}/hud/tft17_${name.toLowerCase()}_square.tft_set17.png`

// Mock data — swap to live API once compositions are seeded
const MOCK_COMP = {
    id: 1,
    name: 'Rebel Jinx',
    tier: 'S',
    description:
        "A high-damage carry build centred around Jinx, leveraging Rebel synergy for bonus Omnivamp and Gunslinger's multi-target attacks to shred entire rows.",
    playstyle: 'Fast 8',
    difficulty: 'Medium',
    tips:
        "Level to 7 at Stage 3-5 and roll down for Jinx 3-star.\nRebel bonus activates at 3 units - Vi, Riven, and Jinx core.\nPrioritize Infinity Edge and Last Whisper on Jinx.\nStreak early and hold interest at 50g whenever possible.",
    patchVersion: '17.5',
    isConditional: false,
    carryImageUrl: champImg('jinx'),
    champions: [
        {
            id: 1, row: 0, col: 0, isCarry: false,
            champion: { id: 10, name: 'Vi', cost: 1, imageUrl: champImg('vi'), traits: [{ id: 1, name: 'Rebel' }, { id: 2, name: 'Brawler' }] },
            items: [],
        },
        {
            id: 2, row: 0, col: 1, isCarry: false,
            champion: { id: 11, name: 'Riven', cost: 2, imageUrl: champImg('riven'), traits: [{ id: 1, name: 'Rebel' }, { id: 3, name: 'Slayer' }] },
            items: [],
        },
        {
            id: 3, row: 0, col: 2, isCarry: false,
            champion: { id: 12, name: 'Jayce', cost: 3, imageUrl: champImg('jayce'), traits: [{ id: 1, name: 'Rebel' }, { id: 4, name: 'Transformer' }] },
            items: [],
        },
        {
            id: 4, row: 1, col: 3, isCarry: false,
            champion: { id: 13, name: 'Tristana', cost: 2, imageUrl: champImg('tristana'), traits: [{ id: 1, name: 'Rebel' }, { id: 5, name: 'Gunslinger' }] },
            items: [],
        },
        {
            id: 5, row: 1, col: 4, isCarry: false,
            champion: { id: 14, name: 'Lucian', cost: 3, imageUrl: champImg('lucian'), traits: [{ id: 5, name: 'Gunslinger' }, { id: 6, name: 'Deadeye' }] },
            items: [],
        },
        {
            id: 6, row: 1, col: 5, isCarry: false,
            champion: { id: 15, name: 'Ziggs', cost: 1, imageUrl: champImg('ziggs'), traits: [{ id: 1, name: 'Rebel' }, { id: 7, name: 'Demolitionist' }] },
            items: [],
        },
        {
            id: 7, row: 2, col: 5, isCarry: false,
            champion: { id: 16, name: 'Sona', cost: 4, imageUrl: champImg('sona'), traits: [{ id: 8, name: 'Star Guardian' }, { id: 9, name: 'Enchanter' }] },
            items: [],
        },
        {
            id: 8, row: 3, col: 4, isCarry: true,
            champion: {
                id: 17, name: 'Jinx', cost: 4, imageUrl: champImg('jinx'),
                traits: [{ id: 1, name: 'Rebel' }, { id: 5, name: 'Gunslinger' }],
            },
            items: [
                { id: 1, name: 'Infinity Edge', imageUrl: '' },
                { id: 2, name: 'Last Whisper', imageUrl: '' },
                { id: 3, name: 'Runaans Hurricane', imageUrl: '' },
            ],
        },
    ],
}

function CompositionDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [comp, setComp] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    usePageTitle(comp?.name ?? null)

    useEffect(() => {
        setLoading(true)
        getCompositionById(id)
            .then(r => { setComp(r.data); setLoading(false) })
            .catch(() => { setError('Failed to load composition'); setLoading(false) })
    }, [id])

    if (loading) return <div className="loading">Loading composition...</div>
    if (error)   return <div className="error">{error}</div>
    if (!comp)   return null

    return (
        <div className="comp-detail-page">
            {comp.carryImageUrl && (
                <div
                    className="comp-detail-page-bg"
                    style={{ backgroundImage: `url(${comp.carryImageUrl})` }}
                />
            )}

            <button className="back-btn" onClick={() => navigate('/compositions')}>
                ← Tier List
            </button>

            <CompDetailView comp={comp} />
        </div>
    )
}

export default CompositionDetailPage
