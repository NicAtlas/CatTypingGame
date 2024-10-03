document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.getElementById('gameArea');
    const sentenceDisplay = document.getElementById('sentence-display');
    const typingInput = document.getElementById('typing-input');
    const currentWpmValue = document.getElementById('current-wpm-value');
    const lastWpmValue = document.getElementById('last-wpm-value');
    const leaderboardList = document.getElementById('leaderboard-list');
    let startTime, chaseTimer;
    let currentCharIndex = 0;
    let chaseIndex = 0;
    let leaderboard = [];
    const desiredLength = 100;
    let chaseSpeed = 250; 
    const chaseDelay = 3000;
	const mouseImage = document.getElementById('mouse-image');
    const catImage = document.getElementById('cat-image');

    document.getElementById('playEasy').addEventListener('click', () => startGame(200, 'cat.gif'));
    document.getElementById('playMedium').addEventListener('click', () => startGame(130, 'cat2.gif'));
    document.getElementById('playHard').addEventListener('click', () => startGame(80, 'cat3.gif'));

    async function fetchSentence() {
        let content = '';
        while (content.length < desiredLength) {
            const response = await fetch('https://api.quotable.io/random');
            const data = await response.json();
            content = data.content;
            if (content.length > desiredLength) {
                content = content.substring(0, desiredLength);
            }
        }
        return content;
    }

    function startGame(speed, catGif) {
		mouseImage.style.display = 'none'; // Hide the mouse image when game starts
		catImage.src= catGif;
        chaseSpeed = speed; // Ensure chase speed is updated based on the button clicked
        gameArea.style.display = 'block';
        fetchSentence().then(sentence => {
            sentenceDisplay.textContent = '';
            sentence.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.textContent = char;
                sentenceDisplay.appendChild(charSpan);
            });
            typingInput.value = '';
            typingInput.addEventListener('input', handleTyping);
            startTime = new Date();
            currentCharIndex = 0;
            chaseIndex = 0;
            updateCurrentChar();
            typingInput.focus();
            chaseTimer = null; // Reset chase timer on new game start
        });
    }

    function handleTyping() {
        if (!chaseTimer) {
            chaseTimer = setTimeout(startChase, chaseDelay);
        }
        const typedChar = typingInput.value.slice(-1);
        const currentChar = sentenceDisplay.childNodes[currentCharIndex];
        if (typedChar === currentChar.textContent) {
            updateCurrentWPM();
            if (currentCharIndex >= chaseIndex) {
                currentChar.style.background = 'none';
            }
            currentCharIndex++;
            if (currentCharIndex < sentenceDisplay.childNodes.length) {
                updateCurrentChar();
            } else {
                endGame(false); // Player completed the sentence
            }
        } else {
            currentChar.style.background = 'red';
        }
        typingInput.value = '';
    }

    function startChase() {
		catImage.style.display = 'block'; // Show the cat GIF when chase starts

		const keyboardSound = document.getElementById('keyboard-sound');
    	keyboardSound.play();

		disableDifficultyButtons();
        chaseTimer = setInterval(() => {
            if (chaseIndex < sentenceDisplay.childNodes.length) {
                sentenceDisplay.childNodes[chaseIndex].style.background = 'red';
                chaseIndex++;
            } else {
                clearInterval(chaseTimer); // Stop timer if end of sentence is reached
            }
            if (chaseIndex > currentCharIndex) {
                endGame(true); // End game if chaser catches up
                clearInterval(chaseTimer); // Clear interval to stop chasing
            }
        }, chaseSpeed);
    }

    function endGame(gameOverByChase) {
		catImage.style.display = 'none'; // Hide the cat GIF when game ends
	
		// Hide the game area and reset the game state
		gameArea.style.display = 'none';
		enableDifficultyButtons();
		clearInterval(chaseTimer); // Clear the chase timer to prevent it from running after game ends
	
		// Stop the keyboard sound
		const keyboardSound = document.getElementById('keyboard-sound');
		keyboardSound.pause();
		keyboardSound.currentTime = 0; // Reset the sound to the start
	
		typingInput.removeEventListener('input', handleTyping);
		if (gameOverByChase) {
			alert("Game Over! The chase caught up.");
		} else {
			const endTime = new Date();
			const deltaTime = (endTime - startTime) / 60000; // Calculate time taken
			const words = sentenceDisplay.textContent.trim().split(' ').length;
			const wpm = Math.round(words / deltaTime);
			lastWpmValue.textContent = wpm;
			updateLeaderboard(wpm);
			alert("Congratulations! You've completed the game.");
		}
	
		// Reset game state
		typingInput.value = '';
		sentenceDisplay.textContent = '';
		currentCharIndex = 0;
		chaseIndex = 0;
	}

    function updateCurrentChar() {
        sentenceDisplay.childNodes.forEach((charSpan, index) => {
            if (index === currentCharIndex) {
                charSpan.style.background = 'rgba(0, 0, 255, 0.3)'; // Highlight current character
                charSpan.style.border = '2px solid blue'; // Make current character more visible
            } else if (index < chaseIndex) {
                charSpan.style.background = 'red'; // Keep chased characters red
            } else {
                charSpan.style.background = 'none'; // Remove background for all other characters
                charSpan.style.border = 'none'; // Remove border for all other characters
            }
            charSpan.style.color = 'black'; // Ensure text color is black for all
        });
    }

    function updateCurrentWPM() {
        const currentTime = new Date();
        const timeElapsed = (currentTime - startTime) / 60000; // Time in minutes
        const wordsTyped = currentCharIndex / 5; // Assuming 5 chars per word
        const currentWPM = Math.round(wordsTyped / timeElapsed);
        currentWpmValue.textContent = currentWPM;
    }

    function disableDifficultyButtons() {
        document.getElementById('playEasy').disabled = true;
        document.getElementById('playMedium').disabled = true;
        document.getElementById('playHard').disabled = true;
    }

    function enableDifficultyButtons() {
        document.getElementById('playEasy').disabled = false;
        document.getElementById('playMedium').disabled = false;
        document.getElementById('playHard').disabled = false;
    }

    function updateLeaderboard(wpm) {
        leaderboard.push(wpm);
        leaderboard.sort((a, b) => b - a);
        leaderboardList.innerHTML = '';
        leaderboard.slice(0, 5).forEach((score, index) => {
            const entry = document.createElement('li');
            entry.textContent = `${index + 1}. ${score} WPM`;
            leaderboardList.appendChild(entry);
        });
    }
});