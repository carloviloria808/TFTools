import { useEffect } from 'react'

/**
 * Sets document.title to "<title> | TFTools".
 * Pass null to show plain "TFTools" (home page).
 */
export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | TFTools` : 'TFTools'
        return () => { document.title = 'TFTools' }
    }, [title])
}
