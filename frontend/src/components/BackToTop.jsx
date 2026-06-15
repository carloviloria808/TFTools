import { useState, useEffect } from 'react'

function BackToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 400)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    function scrollUp() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <button
            className={`back-to-top ${visible ? 'back-to-top-visible' : ''}`}
            onClick={scrollUp}
            aria-label="Back to top"
            title="Back to top"
        >
            ↑
        </button>
    )
}

export default BackToTop
