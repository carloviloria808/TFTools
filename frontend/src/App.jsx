import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PatchBanner from './components/PatchBanner'
import HomePage from './pages/HomePage'
import ChampionsPage from './pages/ChampionsPage'
import ChampionDetailPage from './pages/ChampionDetailPage'
import TraitsPage from './pages/TraitsPage'
import ItemsPage from './pages/ItemsPage'
import AugmentsPage from './pages/AugmentsPage'
import AugmentTierListPage from './pages/AugmentTierListPage'
import ItemTierListPage from './pages/ItemTierListPage'
import ItemCheatSheetPage from './pages/ItemCheatSheetPage'
import ShopOddsPage from './pages/ShopOddsPage'
import GodsPage from './pages/GodsPage'
import CompositionsPage from './pages/CompositionsPage'
import CompositionDetailPage from './pages/CompositionDetailPage'
import HistoryPage from './pages/HistoryPage'
import ArchivePage from './pages/ArchivePage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import GuidePage from './pages/GuidePage'
import GlossaryPage from './pages/GlossaryPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import AboutPage from './pages/AboutPage'
import FeedbackPage from './pages/FeedbackPage'
import AdminStatsPage from './pages/AdminStatsPage'
import AdminCompsPage from './pages/AdminCompsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'

function App() {
    return (
        <BrowserRouter>
            <PatchBanner />
            <Navbar />
            <div className="app-shell">
                <div className="content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/champions" element={<ChampionsPage />} />
                    <Route path="/champions/:id" element={<ChampionDetailPage />} />
                    <Route path="/traits" element={<TraitsPage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/augments" element={<AugmentsPage />} />
                    <Route path="/augments/tierlist" element={<AugmentTierListPage />} />
                    <Route path="/items/tierlist" element={<ItemTierListPage />} />
                    <Route path="/items/cheatsheet" element={<ItemCheatSheetPage />} />
                    <Route path="/odds" element={<ShopOddsPage />} />
                    <Route path="/gods" element={<GodsPage />} />
                    <Route path="/compositions" element={<CompositionsPage />} />
                    <Route path="/compositions/history" element={<HistoryPage />} />
                    <Route path="/compositions/archive" element={<ArchivePage />} />
                    <Route path="/compositions/archive/:patch" element={<ArchivePage />} />
                    <Route path="/compositions/:id" element={<CompositionDetailPage />} />
                    <Route path="/builder" element={<TeamBuilderPage />} />
                    <Route path="/guide" element={<GuidePage />} />
                    <Route path="/glossary" element={<GlossaryPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/stats" element={<ProtectedRoute><AdminStatsPage /></ProtectedRoute>} />
                    <Route path="/admin/compositions" element={<ProtectedRoute><AdminCompsPage /></ProtectedRoute>} />
                </Routes>
                </div>
                <Footer />
            </div>
            <BackToTop />
        </BrowserRouter>
    )
}

export default App