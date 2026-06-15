import { usePageTitle } from '../hooks/usePageTitle'

function PrivacyPage() {
    usePageTitle('Privacy Policy')
    return (
        <div className="legal-page">
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last updated: June 2026</p>

            <section className="legal-section">
                <h2>Information We Collect</h2>
                <p>TFTools does not collect any personal information. We do not require account creation, and no user data is stored on our servers.</p>
            </section>

            <section className="legal-section">
                <h2>Local Storage</h2>
                <p>TFTools uses your browser's local storage to save preferences such as saved team compositions in the Team Builder and the admin authentication state. This data never leaves your device.</p>
            </section>

            <section className="legal-section">
                <h2>Third-Party Assets</h2>
                <p>Champion images and game assets are sourced from CommunityDragon and other community resources. TFTools does not store or redistribute these assets.</p>
            </section>

            <section className="legal-section">
                <h2>Analytics</h2>
                <p>TFTools does not currently use any analytics or tracking services.</p>
            </section>

            <section className="legal-section">
                <h2>Contact</h2>
                <p>If you have any questions about this privacy policy, you can reach us via our GitHub page.</p>
            </section>
        </div>
    )
}

export default PrivacyPage
