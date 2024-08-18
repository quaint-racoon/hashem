const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const grav = 0.5;

const clicked = {
  left: false,
  up: false,
  right: false,
  down: false,
  space: false,
};

class Player {
  constructor(x, y, velocity, size) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.size = size;
    this.isJumping = false;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update(platforms) {
    this.draw();

    if (clicked.left) {
      this.velocity.x = -5;
    } else if (clicked.right) {
      this.velocity.x = 5;
    } else {
      this.velocity.x *= 0.9; // Friction
    }

    let isOnGround = this.y + this.size >= canvas.height;
    for (const platform of platforms) {
      const platformTop = platform.y;
      const platformBottom = platform.y + platform.height;
      const platformLeft = platform.x;
      const platformRight = platform.x + platform.width;

      // Check for horizontal overlap
      if (this.x + this.size > platformLeft && this.x < platformRight) {
        // Check for vertical overlap (top or bottom)
        if (this.y + this.size >= platformTop && this.y < platformBottom) {
          isOnGround = true;

          // Adjust position based on collision side
          if (this.y + this.size > platformBottom) {
            this.y = platformBottom - this.size; // Hit bottom, prevent falling
            this.velocity.y = 0; // Stop vertical movement on collision
          }
          break;
        }
      }
    }

    if (isOnGround) {
      this.isJumping = false;
      this.velocity.y = 0;
    } else {
      this.velocity.y += grav;
    }

    if (clicked.space && isOnGround) {
      this.velocity.y = -10;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, velocity, size) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.size = size;
    this.isJumping = false;
    this.jumpForce = -10;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update(playerX, playerY, platforms) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;

    // Only move horizontally
    this.velocity.x = dx * 0.1; // Adjust speed as needed
    let isOnGround = this.y + this.size >= canvas.height;
    for (const platform of platforms) {
      const platformTop = platform.y;
      const platformBottom = platform.y + platform.height;
      const platformLeft = platform.x;
      const platformRight = platform.x + platform.width;

      // Check for horizontal overlap
      if (this.x + this.size > platformLeft && this.x < platformRight) {
        // Check for vertical overlap (top or bottom)
        if (this.y + this.size >= platformTop && this.y < platformBottom) {
          isOnGround = true;

          // Adjust position based on collision side
          if (this.y + this.size > platformBottom) {
            this.y = platformBottom - this.size; // Hit bottom, prevent falling
            this.velocity.y = 0; // Stop vertical movement on collision
          }
          break;
        }
      }
    }

    if (isOnGround) {
      this.isJumping = false;
      this.velocity.y = 0;
    } else {
      this.velocity.y += grav;
    }

    if (isOnGround && Math.random() < 0.01) {
      this.jump();
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.draw();
  }

  jump() {
    if (!this.isJumping && this.y + this.size >= canvas.height) {
      this.velocity.y = this.jumpForce;
      this.isJumping = true;
    }
  }
}

class Platform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

let player = new Player(100, 100, { x: 0, y: 0 }, 20);
let enemy = new Enemy(300, 300, { x: 0, y: 0 }, 20);
let platforms = [
  new Platform(200, canvas.height - 50, 100, 20),
  // Add more platforms as needed
];

addEventListener('keydown', (e) => {
  const key = e.key;
  if (key === 'a') return (clicked.left = true);
  if (key === 'd') return (clicked.right = true);
  if (key === 'w') return (clicked.up = true);
  if (key === 's') return (clicked.down = true);
  if (key === ' ') return (clicked.space = true);
});

addEventListener('keyup', (e) => {
  const key = e.key;
  if (key === 'a') return (clicked.left = false);
  if (key === 'd') return (clicked.right = false);
  if (key === 'w') return (clicked.up = false);
  if (key === 's') return (clicked.down = false);
  if (key === ' ') return (clicked.space = false);
});

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const platform of platforms) {
    platform.draw();
  }

  player.update(platforms);
  enemy.update(player.x, player.y, platforms);
}
animate();