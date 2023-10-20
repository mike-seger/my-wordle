import { loadWordsFromURL } from './util.js';

const words = await loadWordsFromURL('wordlist.txt')

class WordlyGame {
    constructor() {
		this.words = words
		this.container = document.createElement('div');
		this.container.id = 'container';
		document.body.append(this.container);
		this.resetGame();
		this.addEventListeners();
    }

    resetGame() {
        this.currentRow = 0;
        this.nextRowBlock = 0;
        this.score = 0;
        this.remNotification = 0;
        this.gameFin = 0;
		const rand = Math.floor(Math.random() * this.words.length);
        this.chosenWord = this.words[rand];
        this.container.innerHTML = '';
		this.createUI();
		if(window.solveWindow && window.solveWindow.closed)
			window.solveWindow.postMessage('X', '*'); 
    }

    createUI() {
        this.addLogo();
        this.addNavBar();
        this.addGameArea();
        this.notification = this.addElement('div', null, 'notification', 'Start guessing!');
        this.addKeyboard();
    }

    addLogo() {
        const logo = this.addElement('div', 'logo');
        const domName = 'WORDLED';
        const spanClasses = ['logo_green', 'logo_gold'];

        domName.split('').forEach((char, idx) => {
            const logoSpan = this.addElement('span', spanClasses[idx % 2], null, char, logo);
        });
    }

    addNavBar() {
        const navBar = this.addElement('div', 'nav_bar');
        this.addBtn('Give up', 'giveUpBtn', this.quit.bind(this), navBar);
        this.addBtn('Restart', 'restartBtn', this.resetGame.bind(this), navBar);
        this.addBtn('Solve', 'solveBtn', this.solve.bind(this), navBar);
    }

    addGameArea() {
        const gameArea = this.addElement('div', 'game_area');
        for (let i = 0; i < 6; i++) {
            const row = this.addElement('div', 'row', null, null, gameArea);
            for (let j = 0; j < 5; j++) {
                this.addElement('div', 'row_block', null, null, row);
            }
        }
    }

    addKeyboard() {
        const keyboard = this.addElement('div', 'keyboard');

        const layouts = [
            { id: 'topKeys', keys: 'QWERTYUIOP', class: 'keyboardKey_s' },
            { id: 'midKeys', keys: 'ASDFGHJKL', class: 'keyboardKey_m' },
            { id: 'botKeys', keys: 'ZXCVBNM', class: 'keyboardKey_s' }
        ];

        layouts.forEach(layout => {
            const el = this.addElement('div', null, layout.id, null, keyboard);
            this.addKeys(el, layout.keys, layout.class);
        });

		let botKeys = document.getElementById('botKeys')
		this.addEnterKey(botKeys)
		this.addDeleteKey(botKeys)
    }

	addDeleteKey(parent) {
		let deleteKey = this.addElement('span', 'keyboardKey_l', null, '←', parent, false);
		let obj = this
		deleteKey.addEventListener("click", function deleteClick(event) {
			if(obj.gameFin == 0){
				let wordRow = document.getElementsByClassName('row')[obj.currentRow];
				let rowBlockEl = wordRow.childNodes;
				obj.deleteLetter(rowBlockEl);
			}
		});
	}

	addEnterKey(parent) {
		let enterKey = this.addElement('span', 'keyboardKey_l', null, 'Enter', parent);
		let obj = this
		enterKey.addEventListener("click", function enterClick(event) {
			if(obj.gameFin == 0){
				let wordRow = document.getElementsByClassName('row')[obj.currentRow];
				obj.submitWord(wordRow);
			} else obj.doRestart()
		});
	}

    addKeys(el, layout, keyClass) {
        layout.split('').forEach(char => {
            const key = this.addElement('span', keyClass, `keyboard_${char}`, char, el);
            key.addEventListener('click', () => this.handleKeyPress(char));
        });
    }

    addElement(tag, className, id, text, parent = this.container, append = true) {
        const el = document.createElement(tag);
        if (className) el.className = className;
		if(id) el.id = id;
        if (text) el.innerText = text;
        if(append) parent.appendChild(el);
		else parent.prepend(el);
        return el;
    }

    addBtn(text, id, handler, parent) {
        const btn = this.addElement('button', null, id, text, parent);
        btn.addEventListener('click', handler);
    }

    addEventListeners() {
		const inst = this
        document.addEventListener('keyup', this.handleGlobalKeyPress.bind(this));
		window.addEventListener('message', (event) => {
			const word = event.data
			if(word === 'X') inst.resetGame()
			else inst.enterWord(word)
		})
	}

    handleGlobalKeyPress(event) {
        if (this.gameFin) return;

        const letter = event.key.toUpperCase();
        if (letter.length === 1 && /^[A-Z]$/.test(letter)) {
            this.handleKeyPress(letter);
        } else if (event.key === 'Enter') {
            this.submitWord();
        } else if (event.key === 'Backspace') {
            this.deleteLetter();
        }
    }

    handleKeyPress(letter) {
        if (this.gameFin) return;
        const wordRow = document.getElementsByClassName('row')[this.currentRow];
        this.addLetter(wordRow, letter);
    }

    submitWord() {
        const currentRowBlocks = document.getElementsByClassName('row')[this.currentRow].getElementsByClassName('row_block');
        let wordGuessed = '';
        for (const block of currentRowBlocks) {
            wordGuessed += block.innerText;
        }

		let encodedAnswer = ''
        for (let i = 0; i < 5; i++) {
			const letter = this.chosenWord[i]
			const guessedLetter = wordGuessed[i]
            if (letter === wordGuessed[i]) {
                currentRowBlocks[i].classList.add('correct');
				encodedAnswer += guessedLetter
            } else if (this.chosenWord.includes(guessedLetter)) {
                currentRowBlocks[i].classList.add('present');
				encodedAnswer += guessedLetter.toLowerCase()
            } else {
                currentRowBlocks[i].classList.add('absent');
				encodedAnswer += '_'
            }
        }

        if (wordGuessed === this.chosenWord) {
            this.notification.innerText = "Correct! You've guessed the word.";
            this.gameFin = 1;
            return;
        }

        if (this.currentRow === 5) {
            this.gameFin = 1;
            this.notification.innerText = `You failed to guess the word. It was ${this.chosenWord}`;
            return;
        }

		if(window.solveWindow && !(window.solveWindow.closed))
			window.solveWindow.postMessage(encodedAnswer, '*'); 

        this.currentRow++;
        this.remNotification = 1;
    }

	enterWord(word) {
		if(this.gameFin == 1) return
		let text = word.split('')
		let wordRow = document.getElementsByClassName('row')[this.currentRow];
		for (let i in text) this.deleteLetter()
		for (let letter of text) {
			console.log(letter)
			this.addLetter(wordRow, letter)
		}
		this.submitWord()
	}

    deleteLetter() {
        if (this.remNotification) {
            this.notification.innerText = 'Start guessing!';
            this.remNotification = 0;
        }

        const wordRow = document.getElementsByClassName('row')[this.currentRow];
        const currentRowBlocks = wordRow.getElementsByClassName('row_block');

        for (let i = 4; i >= 0; i--) {
            if (currentRowBlocks[i].innerText !== '') {
                currentRowBlocks[i].innerText = '';
                break;
            }
        }
    }

    addLetter(wordRow, letter) {
        const blocks = wordRow.getElementsByClassName('row_block');
        for (const block of blocks) {
            if (!block.innerText) {
                block.innerText = letter;
                break;
            }
        }
    }

    solve() {
		if(!window.solveWindow || window.solveWindow.closed) {
			window.solveWindow = window.open('solver.html', 'solverWindow', 'width=800,height=400');
		}
    }

    quit() {
        this.notification.innerText = `You gave up! The word was ${this.chosenWord}`;
        this.gameFin = 1;
    }
}

new WordlyGame();
