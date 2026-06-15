import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
    const isAuth = localStorage.getItem('admin_auth') === 'true'
    return isAuth ? children : <Navigate to="/admin/login" replace />
}

export default ProtectedRoute
