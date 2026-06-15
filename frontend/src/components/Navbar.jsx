import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaGithub, FaXTwitter, FaChevronDown } from 'react-icons/fa6'
import GlobalSearch from './GlobalSearch'

function Navbar() {
    const isAdmin   = localStorage.getItem('admin_auth') === 'true'
    const navigate  = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    function close() { setMenuOpen(false) }

    function handleLogout() {
        localStorage.removeItem('admin_auth')
        navigate('/')
        close()
    }

    return (
        <nav className="navbar">
            {/* ── Brand + desktop dropdowns ── */}
            <div className="navbar-brand">
                <NavLink to="/" className="navbar-logo-link" onClick={close}>
                    <img src="/logo.png" alt="TFTools Logo" className="navbar-logo" />
                    <span>TF<span style={{ color: '#c89b3c' }}>Tools</span></span>
                </NavLink>
                <div className="patch-badge">
                    <span className="patch-badge-label">Current Patch</span>
                    <a
                        className="patch-badge-version"
                        href="https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/teamfight-tactics-patch-17-5/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        17.5
                    </a>
                </div>
                <div className="tierlist-dropdown">
                    <button className="tierlist-dropdown-btn">
                        Tier Lists <FaChevronDown className="tierlist-chevron" />
                    </button>
                    <div className="tierlist-dropdown-menu">
                        <NavLink to="/compositions" end>Comps</NavLink>
                        <NavLink to="/items/tierlist" end>Items</NavLink>
                        <NavLink to="/augments/tierlist" end>Augments</NavLink>
                        <NavLink to="/compositions/archive">Past Patches</NavLink>
                    </div>
                </div>
                <div className="planner-dropdown">
                    <button className="planner-dropdown-btn">
                        Planner <FaChevronDown className="planner-chevron" />
                    </button>
                    <div className="planner-dropdown-menu">
                        <NavLink to="/builder">Team Builder</NavLink>
                    </div>
                </div>
                <div className="planner-dropdown">
                    <button className="planner-dropdown-btn learn-dropdown-btn">
                        Learn <FaChevronDown className="planner-chevron" />
                    </button>
                    <div className="planner-dropdown-menu">
                        <NavLink to="/guide">Beginner Guide</NavLink>
                        <NavLink to="/glossary">Glossary</NavLink>
                        <NavLink to="/items/cheatsheet">Item Cheat Sheet</NavLink>
                        <NavLink to="/odds">Shop Odds</NavLink>
                    </div>
                </div>
                {isAdmin && (
                    <div className="admin-dropdown">
                        <button className="admin-dropdown-btn">
                            Admin <FaChevronDown className="admin-chevron" />
                        </button>
                        <div className="admin-dropdown-menu">
                            <NavLink to="/admin/stats">Stats Editor</NavLink>
                            <NavLink to="/admin/compositions">Comp Editor</NavLink>
                            <button className="admin-dropdown-logout" onClick={handleLogout}>
                                Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Global search ── */}
            <GlobalSearch />

            {/* ── Desktop links ── */}
            <div className="navbar-links">
                <a href="https://github.com/carloviloria808" target="_blank" rel="noreferrer" title="GitHub" className="navbar-social-icon"><FaGithub /></a>
                <a href="https://x.com/_carlovil" target="_blank" rel="noreferrer" title="X / Twitter" className="navbar-social-icon"><FaXTwitter /></a>
                <div className="navbar-divider" />
                <NavLink to="/champions">Champions</NavLink>
                <NavLink to="/traits">Traits</NavLink>
                <NavLink to="/items" end>Items</NavLink>
                <NavLink to="/augments" end>Augments</NavLink>
                <NavLink to="/gods">Gods</NavLink>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
                className="navbar-hamburger"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
            >
                {menuOpen ? '✕' : '☰'}
            </button>

            {/* ── Mobile menu ── */}
            {menuOpen && (
                <div className="navbar-mobile-menu">
                    <NavLink to="/champions"         onClick={close}>Champions</NavLink>
                    <NavLink to="/traits"            onClick={close}>Traits</NavLink>
                    <NavLink to="/items"          end onClick={close}>Items</NavLink>
                    <NavLink to="/augments"       end onClick={close}>Augments</NavLink>
                    <NavLink to="/gods"              onClick={close}>Gods</NavLink>
                    <div className="navbar-mobile-divider" />
                    <NavLink to="/compositions"   end onClick={close}>Comps Tier List</NavLink>
                    <NavLink to="/compositions/archive" onClick={close}>Past Patches</NavLink>
                    <NavLink to="/items/tierlist" end onClick={close}>Items Tier List</NavLink>
                    <NavLink to="/augments/tierlist" end onClick={close}>Augments Tier List</NavLink>
                    <NavLink to="/builder"           onClick={close}>Team Builder</NavLink>
                    <NavLink to="/guide"             onClick={close}>Beginner Guide</NavLink>
                    <NavLink to="/glossary"          onClick={close}>Glossary</NavLink>
                    <NavLink to="/items/cheatsheet"  onClick={close}>Item Cheat Sheet</NavLink>
                    <NavLink to="/odds"              onClick={close}>Shop Odds</NavLink>
                    {isAdmin && (
                        <>
                            <div className="navbar-mobile-divider" />
                            <NavLink to="/admin/stats"         onClick={close}>Stats Editor</NavLink>
                            <NavLink to="/admin/compositions"  onClick={close}>Comp Editor</NavLink>
                            <button className="navbar-mobile-logout" onClick={handleLogout}>Log Out</button>
                        </>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar
