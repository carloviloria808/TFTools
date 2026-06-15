import { useState } from 'react'

const BANNER_KEY = 'patch_banner_dismissed_17_5'

function PatchBanner() {
    const [visible, setVisible] = useState(() => {
        return localStorage.getItem(BANNER_KEY) !== 'true'
    })

    function dismiss() {
        localStorage.setItem(BANNER_KEY, 'true')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="patch-banner">
            <span className="patch-banner-fire">🔥</span>
            <span className="patch-banner-text">
                <strong>Patch 17.5 is live</strong> — big augment shakeup, Vex & Veigar buffed, Space Groove nerfed.
            </span>
            <a
                className="patch-banner-link"
                href="https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-patch-17-5/"
                target="_blank"
                rel="noreferrer"
            >
                See patch notes →
            </a>
            <button className="patch-banner-close" onClick={dismiss} aria-label="Dismiss">✕</button>
        </div>
    )
}

export default PatchBanner
