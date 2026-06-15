import { usePageTitle } from '../hooks/usePageTitle'

function FeedbackPage() {
    usePageTitle('Feedback')
    return (
        <div className="feedback-page">
            <div className="feedback-header">
                <h1>Feedback</h1>
                <p className="feedback-subtitle">Have a bug report, feature request, or general thoughts? Let us know — every piece of feedback helps improve TFTools.</p>
            </div>

            <div className="feedback-form-wrap">
                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSfNejg3OviWKFzqc2dnORaqJDoCDmcoe068sUMrTqeJVm3JmQ/viewform?embedded=true"
                    width="100%"
                    height="700"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    title="TFTools Feedback Form"
                >
                    Loading…
                </iframe>
            </div>
        </div>
    )
}

export default FeedbackPage
