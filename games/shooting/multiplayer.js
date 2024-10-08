// Initialize Firebase App and Database
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);
const auth = firebase.auth();

let playerId;
let playersRef;
let playerRef;
let bulletsRef;
let bullets = {};
let players = {};
let gameStarted = false; // Flag to check if the game has started

// Setup canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// Key state for handling continuous movement
const keys = {};

// Handle player movement and bullets
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });
document.addEventListener('click', shootBullet);

// Automatically sign in users
auth.signInAnonymously().catch((error) => {
    console.error('Firebase auth error: ', error);
});

// Listen for player data immediately after the script loads
playersRef = db.ref('players');
bulletsRef = db.ref('bullets');

// Listen for changes in player data (start listening immediately)
playersRef.on('value', (snapshot) => {
    players = snapshot.val() || {};
    console.log('Players updated:', players); // Debug log for players data
});

// Listen for bullets in the game
bulletsRef.on('value', (snapshot) => {
    bullets = snapshot.val() || {};
});

// After authentication, set up the player
auth.onAuthStateChanged((user) => {
    if (user) {
        playerId = user.uid;
        console.log('Player ID:', playerId); // Debug log for player ID
        playerRef = playersRef.child(playerId);

        // Notify user that they need to start the game
        console.log('Please run startGame() to begin playing.');
    } else {
        console.log('User signed out');
    }
});

// Function to start the game and spawn the player
function startGame() {
    console.log('startGame called');
    if (gameStarted) {
        console.log('Game already started.');
        return;
    }

    // Add this player to the game
    playerRef.set({
        id: playerId,
        x: 100, // Initial X position
        y: 100, // Initial Y position
        vx: 0,  // Initial velocity X
        vy: 0,  // Initial velocity Y
        score: 0
    }).then(() => {
        console.log('Player added to Firebase');
        // Remove player from Firebase when they disconnect
        playerRef.onDisconnect().remove();

        // Ensure gameStarted is only set to true after player appears in 'players'
        const waitForPlayer = setInterval(() => {
            if (players && players[playerId]) {
                console.log('Player successfully loaded in players object');
                gameStarted = true;
                clearInterval(waitForPlayer);
                gameLoop(); // Start the game loop
            } else {
                console.log('Waiting for player to appear in players object...',players);
            }
        }, 100); // Check every 100ms if player is loaded in the players object
    }).catch((error) => {
        console.error('Error adding player to Firebase: ', error);
    });
}

function shootBullet(e) {
    console.log('Game Started:', gameStarted);
    console.log('Player in game:', !!players[playerId]);
    console.log('Players:', players); // Debug log to verify player data

    if (!gameStarted || !players[playerId]) {
        console.error('Cannot shoot bullet. Player not in game yet or game not started.');
        return;
    }

    const bulletId = bulletsRef.push().key;
    const bullet = {
        id: bulletId,
        ownerId: playerId,
        x: players[playerId].x,
        y: players[playerId].y,
        direction: 'up',
    };
    bulletsRef.child(bulletId).set(bullet);
}

function updatePlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player velocities and positions
    const player = players[playerId];
    if (player) {
        player.vx = 0;
        player.vy = 0;
        if (keys['ArrowUp']) player.vy -= 5;
        if (keys['ArrowDown']) player.vy += 5;
        if (keys['ArrowLeft']) player.vx -= 5;
        if (keys['ArrowRight']) player.vx += 5;

        // Update player's position with velocity
        player.x += player.vx;
        player.y += player.vy;

        // Update player position in Firebase
        playerRef.update({ x: player.x, y: player.y, vx: player.vx, vy: player.vy });
    }

    // Draw all players
    Object.keys(players).forEach(id => {
        const player = players[id];
        ctx.fillStyle = id === playerId ? 'blue' : 'red'; // Different color for local player
        ctx.fillRect(player.x, player.y, 20, 20); // Draw players as rectangles
    });

    // Draw bullets
    Object.keys(bullets).forEach(id => {
        const bullet = bullets[id];
        ctx.fillStyle = 'black';
        ctx.fillRect(bullet.x, bullet.y, 5, 5); // Draw bullets as small squares

        // Move bullet
        bullet.y -= 5; // Simplified, bullets move up
        bulletsRef.child(bullet.id).set(bullet);

        // Check collision with players
        Object.keys(players).forEach(playerId => {
            const player = players[playerId];
            if (bullet.ownerId !== playerId && isColliding(bullet, player)) {
                playersRef.child(playerId).update({ score: player.score + 1 });
                bulletsRef.child(bullet.id).remove(); // Remove bullet on hit
            }
        });
    });
}

function isColliding(bullet, player) {
    return bullet.x < player.x + 20 &&
           bullet.x + 5 > player.x &&
           bullet.y < player.y + 20 &&
           bullet.y + 5 > player.y;
}

function gameLoop() {
    updatePlayers();
    requestAnimationFrame(gameLoop);
}
