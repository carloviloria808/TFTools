import { useState, useEffect } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { getGods } from '../services/api'


function GodsPage() {
    usePageTitle('Gods')
    const [gods, setGods] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        getGods()
            .then(response => {
                setGods(response.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load gods')
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loading">Loading gods...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="gods-page">
            <div className="gods-page-header">
                <h1>Gods</h1>
                <a
                    href="https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/tft-set-17-space-gods-overview/"
                    target="_blank"
                    rel="noreferrer"
                    className="gods-overview-btn"
                >
                    Space Gods Overview ↗
                </a>
            </div>
            <div className="gods-grid">
                {gods.map(god => (
                    <div key={god.id} className="god-card">

                        {/* Blurred background */}
                        {god.imageUrl && (
                            <div
                                className="god-card-bg"
                                style={{ backgroundImage: `url(${god.imageUrl})` }}
                            />
                        )}

                        {/* Portrait + name */}
                        <div className="god-header">
                            {god.imageUrl && (
                                <div className="god-image-wrapper">
                                    <img
                                        src={god.imageUrl}
                                        alt={god.name}
                                        className="god-image"
                                    />
                                </div>
                            )}
                            <div className="god-title">
                                <h2>{god.name}</h2>
                                <span className="god-specialty">
                                    {god.specialty}
                                </span>
                            </div>
                        </div>

                        {/* Offerings */}
                        <div className="god-offerings">
                            {god.offerings.map(offering => (
                                <div key={offering.id} className="offering">
                                    <span className="offering-stage">
                                        {offering.stage}
                                    </span>
                                    <span className="offering-text">
                                        {offering.offerings}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GodsPage
