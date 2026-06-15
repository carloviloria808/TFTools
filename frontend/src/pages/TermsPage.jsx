import { usePageTitle } from '../hooks/usePageTitle'

function TermsPage() {
    usePageTitle('Terms of Use')
    return (
        <div className="legal-page">
            <h1>Terms of Use</h1>
            <p className="legal-updated">Last updated: June 2026</p>

            <section className="legal-section">
                <h2>Acceptance of Terms</h2>
                <p>By accessing and using TFTools, you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use this site.</p>
            </section>

            <section className="legal-section">
                <h2>Fan-Made Site</h2>
                <p>TFTools is an unofficial, fan-made reference site for Teamfight Tactics. It is not affiliated with, endorsed by, or connected to Riot Games in any way. All game assets, champion names, and related content are the property of Riot Games, Inc.</p>
            </section>

            <section className="legal-section">
                <h2>Accuracy of Information</h2>
                <p>While we strive to keep all information up to date, TFTools makes no guarantee that the data on this site is accurate, complete, or current. Game data may change with patches and updates. Always refer to official Riot Games sources for the most accurate information.</p>
            </section>

            <section className="legal-section">
                <h2>Intellectual Property</h2>
                <p>All Teamfight Tactics and League of Legends related content, including champion images and game assets, are the property of Riot Games, Inc. TFTools does not claim ownership of any such assets.</p>
            </section>

            <section className="legal-section">
                <h2>Changes to Terms</h2>
                <p>We reserve the right to update these terms at any time. Continued use of the site following any changes constitutes acceptance of the new terms.</p>
            </section>
        </div>
    )
}

export default TermsPage
