import { loadWordsFromURL } from './util.js';

const url = 'wordlist.txt'
const words = [] // Your list of worldle words here

await loadWordsFromURL(url, words)

class WordlySolver {
    constructor(words) {
        this.words = words
        this.history = []
    }

    reset() {
        this.words = words
        this.history = []
    }

    encodeFeedback(guess, word) {
        let feedback = '';
        let wordLetterCount = {}; // To store frequency of each letter in the word
    
        // Count the frequency of each letter in the word
        for (let letter of word) {
            if (wordLetterCount[letter]) {
                wordLetterCount[letter]++;
            } else {
                wordLetterCount[letter] = 1;
            }
        }
    
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === word[i]) {
                feedback += guess[i].toUpperCase();
                if (wordLetterCount[guess[i].toUpperCase()]) {
                    wordLetterCount[guess[i].toUpperCase()]--; // Decrement the count as it's correctly guessed
                }
            } else if (word.includes(guess[i]) && wordLetterCount[guess[i].toUpperCase()]) {
                feedback += guess[i].toLowerCase();
                wordLetterCount[guess[i].toUpperCase()]--; // Decrement the count as it's present but in wrong position
            } else {
                feedback += '_';
            }
        }
    
        return feedback;
    }
    /*
    encodeFeedback(guess, word) {
        let feedback = ''
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === word[i]) {
                feedback += guess[i].toUpperCase()
            } else if (word.includes(guess[i])) {
                feedback += guess[i].toLowerCase()
            } else {
                feedback += '_'
            }
        }
        return feedback
    }*/

    filterWords(guess, feedback) {
        return this.words.filter(word => {
            return this.encodeFeedback(guess, word) === feedback
        })
    }

    enterWord(word) {
        window.opener.postMessage(word, '*'); 
    }

    makeGuess(feedback = '') {
        if (feedback === '') {
            const guess = "BEACH"
            this.history.push({ guess, feedback })
            this.enterWord(guess)
            return guess
        }

        const lastGuess = this.history[this.history.length - 1].guess
        this.words = this.filterWords(lastGuess, feedback)
        console.log(this.words)

        const nextGuess = this.words[Math.floor(Math.random() * this.words.length)]
        this.history.push({ guess: nextGuess, feedback })
        this.enterWord(nextGuess)
        return nextGuess
    }
}

const solver = new WordlySolver(words)

function submitFeedback(feedback) {
    const feedbackElem = document.getElementById('feedback')
    const outputElem = document.getElementById('output')
    const guess = solver.makeGuess(feedbackElem.value)
    outputElem.innerHTML = `Next Guess: ${guess}`
    feedbackElem.value = '' // Clear input for the next feedback
}

function restart() {
    window.opener.postMessage('X', '*'); 
}

// Function to copy text to clipboard
// function copyToClipboard(word) {
//     const text = word?word : document.getElementById('output').innerText.split(': ')[1]
//     if (navigator.clipboard) {
//         navigator.clipboard.writeText(text)
//     }
// }

// Add the event listener
document.getElementById('submitButton').addEventListener('click', submitFeedback)
document.getElementById('restartButton').addEventListener('click', restart)

// First guess on page load
document.getElementById('output').innerHTML = `First Guess: ${solver.makeGuess()}`

// Handle input sanitization and submit button state
document.getElementById('feedback').addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-z_]/g, '_')
    document.getElementById('submitButton').disabled = (this.value.length !== 5)
})

// Submit on Enter key press
document.getElementById('feedback').addEventListener('keyup', function(e) {
    if (e.key === 'Enter' && this.value.length === 5) {
        submitFeedback()
    }
})

window.addEventListener('message', (event) => {
    if(event.data.length>0) {
        if(event.data === 'X') {
            solver.reset()
            solver.makeGuess()
        } else document.getElementById('feedback').value = event.data
    }
})