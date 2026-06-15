import { usePageTitle } from '../hooks/usePageTitle'
import { FaGithub, FaXTwitter, FaLinkedin, FaGamepad, FaReact, FaInstagram } from 'react-icons/fa6'
import { SiDotnet, SiVite, SiAxios } from 'react-icons/si'

const STAT_CHIPS = [
    { icon: '🎓', label: 'CS Graduate' },
    { icon: '📍', label: "Hawai'i" },
    { icon: '🏐', label: 'Volleyball' },
    { icon: '🎮', label: 'Gamer' },
]

const TECH_STACK = [
    { icon: <FaReact />,  label: 'React',      color: '#61dafb' },
    { icon: <SiVite />,   label: 'Vite',       color: '#646cff' },
    { icon: <SiDotnet />, label: 'ASP.NET',    color: '#512bd4' },
    { icon: '🗄️',         label: 'SQL Server', color: '#cc2927' },
    { icon: <SiAxios />,  label: 'Axios',      color: '#5a29e4' },
]

function AboutPage() {
    usePageTitle('About')
    return (
        <div className="about-page">

            {/* ── Hero banner ── */}
            <div className="about-hero">
                <div className="about-hero-bg" />
                <img src="/carlo.jpg" alt="Carlo" className="about-hero-photo" />
                <div className="about-hero-text">
                    <div className="about-name-row">
                        <h1 className="about-name">Carlo</h1>
                        <span className="about-ign">IGN: Xyloh</span>
                    </div>
                    {/* Stat chips */}
                    <div className="about-chips">
                        {STAT_CHIPS.map(c => (
                            <span key={c.label} className="about-chip">
                                {c.icon} {c.label}
                            </span>
                        ))}
                    </div>
                    {/* TFT rank history */}
                    <div className="about-ranks">
                        {['S16', 'S15', 'S14', 'S13', 'S12'].map(s => (
                            <span key={s} className="about-rank-badge">
                                <span className="about-rank-dot" />
                                {s} Master
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main card ── */}
            <div className="about-card">

                {/* Left: Socials */}
                <div className="about-left">
                    <div className="about-socials-card">
                        <h3 className="about-socials-title">Socials</h3>
                        <div className="about-socials-list">
                            <a href="https://x.com/_carlovil" target="_blank" rel="noreferrer" className="about-social-row">
                                <FaXTwitter className="about-social-row-icon" /> @_carlovil
                            </a>
                            <a href="https://github.com/carloviloria808" target="_blank" rel="noreferrer" className="about-social-row">
                                <FaGithub className="about-social-row-icon" /> GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/carlovil/" target="_blank" rel="noreferrer" className="about-social-row">
                                <FaLinkedin className="about-social-row-icon" /> LinkedIn
                            </a>
                            <a href="https://www.instagram.com/carlovilolol/" target="_blank" rel="noreferrer" className="about-social-row">
                                <FaInstagram className="about-social-row-icon" /> carlovilolol
                            </a>
                            <a href="https://tactics.tools/player/na/Xyloh" target="_blank" rel="noreferrer" className="about-social-row">
                                <FaGamepad className="about-social-row-icon" /> Xyloh
                            </a>
                        </div>
                    </div>
                    <img src="/pengu.jpg" alt="Pengu" className="about-pengu" />
                </div>

                {/* Right: Bio */}
                <div className="about-info">
                    <p className="about-bio">
                        Recent Graduate from the University of Hawai'i at Manoa with a Computer Science degree (BS).
                    </p>
                    <p className="about-bio">
                        Born and raised in Hawai'i 🌺. I have a heavy addiction to video games and everything volleyball (men and womens).
                    </p>
                    <p className="about-bio">
                        Made Masters rank in multiple TFT sets and currently have a gamba addiction playing Uma-Musume Pretty Derby, Honkai Star Rail, and Genshin Impact.
                    </p>

                    <div className="about-section">
                        <h2 className="about-section-title">Why I built TFTools</h2>
                        <p className="about-section-text">
                            TFTools was built to give both new and experienced TFT players a single place to find everything, including tier lists, comp guides, item recipes, and augment ratings. The goal is simple: help you play better.
                        </p>
                        <p className="about-section-text">
                            As a long-time TFT player, I wanted a site that had everything in one place. TFTools is that site for players who want to learn, improve, and reach their peak.
                        </p>
                        <p className="about-section-text">
                            TFTools started as a personal project to make TFT easier to learn and master. Whether you're just starting out or pushing for Masters, everything you need is right here.
                        </p>
                    </div>
                </div>

            </div>

            {/* ── Built with ── */}
            <div className="about-built-with">
                <h2 className="about-built-title">Built with</h2>
                <div className="about-tech-row">
                    {TECH_STACK.map(t => (
                        <div key={t.label} className="about-tech-chip" style={{ '--tech-color': t.color }}>
                            <span className="about-tech-icon" style={{ color: t.color }}>{t.icon}</span>
                            <span className="about-tech-label">{t.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <p className="about-disclaimer">
                TFTools is not affiliated with or endorsed by Riot Games. All game assets and trademarks are the property of Riot Games, Inc.
            </p>
        </div>
    )
}

export default AboutPage
