export async function loadWordsFromURL(url, wordArray) {
    try {
        // Fetch the content from the URL
        const response = await fetch(url)

        // Check if the response status is OK (200)
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        // Read the response body as text
        const data = await response.text()

        // Split the text into an array using line breaks
        const words = data.split('\n')
        
        // Remove any empty elements from the array and add them to the provided wordArray
        words.forEach(word => {
            const trimmedWord = word.trim().toUpperCase()
            if (trimmedWord !== '') {
                wordArray.push(trimmedWord)
            }
        })
    } catch (error) {
        console.error('There was a problem fetching the data:', error)
        throw error
    }
}
