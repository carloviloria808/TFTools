import { Link } from 'react-router-dom'
import { FaGithub, FaXTwitter, FaDiscord } from 'react-icons/fa6'

function Footer() {
    return (
        <footer className="site-footer">
            {/* Social icons */}
            <div className="footer-socials">
                <a href="https://github.com/carloviloria808" target="_blank" rel="noreferrer" className="footer-social-icon" title="GitHub">
                    <FaGithub />
                </a>
                <a href="https://x.com/_carlovil" target="_blank" rel="noreferrer" className="footer-social-icon" title="X / Twitter">
                    <FaXTwitter />
                </a>
            </div>

            {/* Nav links */}
            <div className="footer-links">
                <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                <Link to="/terms" className="footer-link">Terms of Use</Link>
                <Link to="/about" className="footer-link">About</Link>
                <Link to="/feedback" className="footer-link">Feedback</Link>
            </div>

            {/* Disclaimer */}
            <p className="footer-disclaimer">
                © 2026 TFTools. TFTools isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
            </p>
        </footer>
    )
}

export default Footer
