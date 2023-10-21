import { loadWordsFromURL } from './util.js'

class WordledSolver {
    constructor() { 
        loadWordsFromURL('wordlist.txt').then((words) => {
            this.allwords = words
            this.reset() 
            this.init()
        })
    }

    reset() {
        this.words = this.allwords
        this.history = []
    }

    submitFeedback(feedback) {
        const feedbackElem = document.getElementById('feedback')
        const outputElem = document.getElementById('output')
        const guess = this.makeGuess(feedbackElem.value)
        outputElem.innerHTML = `Guess: ${guess}`
        feedbackElem.value = ''
        document.getElementById('submitButton').disabled = true
    }
    
    restart() {
        if(this.isLinked()) window.opener.postMessage('X', '*')
        this.reset()
        this.makeGuess()
    }

    init() {
        document.getElementById('submitButton').addEventListener('click', this.submitFeedback.bind(this))
        document.getElementById('restartButton').addEventListener('click', this.restart.bind(this))
        document.getElementById('output').innerHTML = `Guess: ${this.makeGuess()}`
        document.getElementById('feedback').addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-z_]/g, '_')
            document.getElementById('submitButton').disabled = (this.value.length !== 5)
        })
        document.getElementById('feedback').addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && this.value.length === 5) {
                this.submitFeedback()
            }
        })
        
        window.addEventListener('message', (event) => {
            if(!this.isLinked()) return
            if(event.data.length>0) {
                if(event.data === 'X') {
                    this.reset()
                    this.makeGuess()
                } else {
                    document.getElementById('feedback').value = event.data
                    document.getElementById('submitButton').disabled = (event.data.length !== 5)
                }
            }
        })
    }

    isLinked() {
        return window.opener && document.getElementById('linkUiCheck').checked
    }
    
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
    }

    filterWords(guess, feedback) {
        return this.words.filter(word => {
            return this.encodeFeedback(guess, word) === feedback
        })
    }

    enterWord(word) {
        if(this.isLinked()) window.opener.postMessage(word, '*')
        document.getElementById('output').innerHTML = `Guess: ${word}`
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

new WordledSolver()