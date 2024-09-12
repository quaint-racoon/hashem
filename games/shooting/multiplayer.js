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

let gameStarted = false; // Flag to check if the game has started

// Automatically sign in users
auth.signInAnonymously().catch((error) => {
    console.error('Firebase auth error: ', error);
});

// After authentication, set up game data
auth.onAuthStateChanged((user) => {
    if (user) {
        playerId = user.uid;
        console.log('Player ID:', playerId); // Debug log for player ID
        playersRef = db.ref('players');
        playerRef = playersRef.child(playerId);
        bulletsRef = db.ref('bullets');

        // Listen for changes in player data
        playersRef.on('value', (snapshot) => {
            players = snapshot.val() || {};
            console.log('Players:', players); // Debug log for players data
        });

        // Listen for bullets in the game
        bulletsRef.on('value', (snapshot) => {
            bullets = snapshot.val() || {};
        });

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

        // Set the gameStarted flag to true after joining the game
        gameStarted = true;

        // Start game loop
        gameLoop();
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
