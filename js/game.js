// Check authentication
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    return currentUser;
}


let gameState = {
    minNumber: 1,
    maxNumber: 100,
    currentGuess: 0,
    attempts: 0,
    totalGames: 0,
    totalGuesses: 0,
    bestScore: Infinity,
    isPlaying: false,
    startTime: 0,
    totalTime: 0,
    achievements: {
        firstWin: false,
        speedster: false,
        master: false,
        perfect: false
    }
};

// DOM Elements
const gameSetup = document.getElementById('game-setup');
const gamePlay = document.getElementById('game-play');
const rangeDisplay = document.getElementById('range-display');
const currentGuessDisplay = document.getElementById('current-guess');
const totalGamesDisplay = document.getElementById('total-games');
const avgGuessesDisplay = document.getElementById('avg-guesses');
const bestScoreDisplay = document.getElementById('best-score');
const timePlayedDisplay = document.getElementById('time-played');
const messageBox = document.getElementById('game-message');
const progressFill = document.getElementById('progress-fill');
const hintText = document.getElementById('hint-text');
const achievementsList = document.getElementById('achievements-list');


function loadUserData() {
    const currentUser = checkAuth();
    if (!currentUser) return;

    const userData = JSON.parse(localStorage.getItem(`userData_${currentUser.email}`)) || {
        totalGames: 0,
        totalGuesses: 0,
        bestScore: Infinity,
        totalTime: 0,
        achievements: {
            firstWin: false,
            speedster: false,
            master: false,
            perfect: false
        }
    };

    gameState = { ...gameState, ...userData };
    updateStats();
    initAchievements();
}

// Save user data
function saveUserData() {
    const currentUser = checkAuth();
    if (!currentUser) return;

    const userData = {
        totalGames: gameState.totalGames,
        totalGuesses: gameState.totalGuesses,
        bestScore: gameState.bestScore,
        totalTime: gameState.totalTime,
        achievements: gameState.achievements
    };

    localStorage.setItem(`userData_${currentUser.email}`, JSON.stringify(userData));
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    const isDark = body.getAttribute('data-theme') === 'dark';
    
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Initialize achievements
function initAchievements() {
    const achievements = [
        { id: 'firstWin', title: '🎯 First Victory', description: 'Win your first game' },
        { id: 'speedster', title: '⚡ Speedster', description: 'Win in under 5 attempts' },
        { id: 'master', title: '👑 Master', description: 'Win 5 games' },
        { id: 'perfect', title: '💫 Perfect', description: 'Win in minimum possible attempts' }
    ];

    achievementsList.innerHTML = '';
    achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = `achievement ${gameState.achievements[achievement.id] ? '' : 'locked'}`;
        div.innerHTML = `
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
        `;
        achievementsList.appendChild(div);
    });
}

function startGame(range) {
    const currentUser = checkAuth();
    if (!currentUser) return;

    gameState.maxNumber = range;
    gameState.minNumber = 1;
    gameState.attempts = 0;
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    
    gameSetup.classList.add('hidden');
    gamePlay.classList.remove('hidden');
    rangeDisplay.textContent = `Think of a number between 1 and ${range}`;
    progressFill.style.width = '0%';
    hintText.classList.add('hidden');
    
    
    makeGuess();
}

function makeGuess() {
    if (!gameState.isPlaying) return;
    
    gameState.currentGuess = Math.floor((gameState.minNumber + gameState.maxNumber) / 2);
    gameState.attempts++;
    
    currentGuessDisplay.textContent = gameState.currentGuess;
    
    // Update progress bar
    const progress = (gameState.attempts / Math.ceil(Math.log2(gameState.maxNumber))) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
}

function handleResponse(response) {
    if (!gameState.isPlaying) return;

    switch (response) {
        case 'H':
            gameState.maxNumber = gameState.currentGuess - 1;
            break;
        case 'L':
            gameState.minNumber = gameState.currentGuess + 1;
            break;
        case 'C':
            handleWin();
            return;
        default:
            showMessage('Invalid response!', 'error');
            return;
    }

    if (gameState.minNumber > gameState.maxNumber) {
        showMessage('Something seems wrong. Are you sure you\'re giving me the correct hints?', 'error');
        endGame();
        return;
    }

    makeGuess();
}

function showHint() {
    const hints = [
        `The number is between ${gameState.minNumber} and ${gameState.maxNumber}`,
        `I've made ${gameState.attempts} attempts so far`,
        `The number is ${gameState.currentGuess > gameState.minNumber ? 'greater' : 'less'} than ${gameState.minNumber}`,
        `I'm getting closer! The range is getting smaller`
    ];
    
    hintText.textContent = hints[Math.floor(Math.random() * hints.length)];
    hintText.classList.remove('hidden');
}

function handleWin() {
    gameState.totalGames++;
    gameState.totalGuesses += gameState.attempts;
    gameState.bestScore = Math.min(gameState.bestScore, gameState.attempts);
    gameState.totalTime += (Date.now() - gameState.startTime) / 1000;
    
    // Check achievements
    checkAchievements();
    
    updateStats();
    showMessage(`🎉 I won in ${gameState.attempts} attempts!`, 'success');
    triggerConfetti();
    endGame();
}

function checkAchievements() {
    if (!gameState.achievements.firstWin) {
        gameState.achievements.firstWin = true;
        unlockAchievement('firstWin');
    }
    
    if (gameState.attempts <= 5 && !gameState.achievements.speedster) {
        gameState.achievements.speedster = true;
        unlockAchievement('speedster');
    }
    
    if (gameState.totalGames >= 5 && !gameState.achievements.master) {
        gameState.achievements.master = true;
        unlockAchievement('master');
    }
    
    const minPossibleAttempts = Math.ceil(Math.log2(gameState.maxNumber));
    if (gameState.attempts === minPossibleAttempts && !gameState.achievements.perfect) {
        gameState.achievements.perfect = true;
        unlockAchievement('perfect');
    }
}

function unlockAchievement(id) {
    const achievement = document.querySelector(`.achievement:nth-child(${
        ['firstWin', 'speedster', 'master', 'perfect'].indexOf(id) + 1
    })`);
    
    achievement.classList.remove('locked');
    showMessage(`🏆 Achievement Unlocked: ${achievement.querySelector('h4').textContent}!`, 'success');
}

function endGame() {
    gameState.isPlaying = false;
    setTimeout(() => {
        gamePlay.classList.add('hidden');
        gameSetup.classList.remove('hidden');
        messageBox.classList.add('hidden');
    }, 2000);
}

function updateStats() {
    totalGamesDisplay.textContent = gameState.totalGames;
    avgGuessesDisplay.textContent = (gameState.totalGuesses / gameState.totalGames).toFixed(2);
    bestScoreDisplay.textContent = gameState.bestScore === Infinity ? '-' : gameState.bestScore;
    
    // Update time played
    const minutes = Math.floor(gameState.totalTime / 60);
    const seconds = Math.floor(gameState.totalTime % 60);
    timePlayedDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = 'message-box ' + type;
    messageBox.classList.remove('hidden');
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

//  logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-btn').innerHTML = 
            savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Load user data
    loadUserData();
}); 