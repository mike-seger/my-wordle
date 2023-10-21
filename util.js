export async function loadWordsFromURL(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const data = await response.text()
        const words = data.split('\n')
        const wordArray = []
        words.forEach(word => {
            const trimmedWord = word.trim().toUpperCase()
            if (trimmedWord !== '') {
                wordArray.push(trimmedWord)
            }
        })
        return wordArray
    } catch (error) {
        console.error('There was a problem fetching the data:', error)
        throw error
    }
}
