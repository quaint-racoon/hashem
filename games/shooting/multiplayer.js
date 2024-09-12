let gameStarted = false; // Flag to check if the game has started

// Modified startMultiplayerGame to set gameStarted to true once the player joins
function startMultiplayerGame() {
    // No need to change the display since 'canvas' is already block

    // Authenticate anonymously
    auth.signInAnonymously().catch((error) => {
        console.error('Firebase auth error: ', error);
    });

    // After authentication, set up the game
    auth.onAuthStateChanged((user) => {
        if (user) {
            playerId = user.uid; // Use Firebase Authentication UID as player ID
            playersRef = db.ref('players');
            playerRef = playersRef.child(playerId);
            bulletsRef = db.ref('bullets');

            // Add this player to the game
            playerRef.set({
                id: playerId,
                x: 100, // Initial X position
                y: 100, // Initial Y position
                vx: 0,  // Initial velocity X
                vy: 0,  // Initial velocity Y
                score: 0
            });

            // Remove player from Firebase when they disconnect
            playerRef.onDisconnect().remove();

            // Listen for changes in player data
            playersRef.on('value', (snapshot) => {
                players = snapshot.val() || {};
            });

            // Listen for bullets in the game
            bulletsRef.on('value', (snapshot) => {
                bullets = snapshot.val() || {};
            });

            // Set the gameStarted flag to true after joining the game
            gameStarted = true;

            // Start game loop
            gameLoop();
        } else {
            console.log('User signed out');
        }
    });
}

function shootBullet(e) {
    if (!gameStarted || !players[playerId]) {
        console.error('Cannot shoot bullet. Player not in game yet or game not started.');
        return;
    }

    const bulletId = db.ref('bullets').push().key;
    const bullet = {
        id: bulletId,
        ownerId: playerId,
        x: players[playerId].x,
        y: players[playerId].y,
        direction: 'up', // Simplified, can be expanded based on click direction
    };
    bulletsRef.child(bulletId).set(bullet);
}
