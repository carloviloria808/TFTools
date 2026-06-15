import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

function AdminLoginPage() {
    usePageTitle('Admin Login')
    const [password, setPassword]   = useState('')
    const [error,    setError]      = useState(false)
    const [shaking,  setShaking]    = useState(false)
    const navigate  = useNavigate()
    const location  = useLocation()

    // Redirect to the page they originally tried to visit, or default to /admin/stats
    const from = location.state?.from?.pathname || '/admin/stats'

    function handleSubmit(e) {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_auth', 'true')
            navigate(from, { replace: true })
        } else {
            setError(true)
            setPassword('')
            setShaking(true)
            setTimeout(() => setShaking(false), 500)
        }
    }

    return (
        <div className="al-page">
            <div className={`al-card ${shaking ? 'al-shake' : ''}`}>
                <div className="al-icon">🔒</div>
                <h2 className="al-title">Admin Access</h2>
                <p className="al-sub">Enter the admin password to continue</p>

                <form onSubmit={handleSubmit} className="al-form">
                    <input
                        type="password"
                        className={`al-input ${error ? 'al-input-error' : ''}`}
                        placeholder="Password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(false) }}
                        autoFocus
                    />
                    {error && <span className="al-error-msg">Incorrect password</span>}
                    <button type="submit" className="al-btn">Sign In</button>
                </form>
            </div>
        </div>
    )
}

export default AdminLoginPage
