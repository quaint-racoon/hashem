
let crate_img = new Image();
crate_img.src = 'crate.png';

const canvas = document.getElementsByTagName("canvas")[0]
const score = document.getElementById("score")
const endscore = document.getElementById("endscore")
const endscreen = document.getElementById("endscreen")
const bestscore = document.getElementById("bestscore")
const rampageBtn = document.getElementById("rampage-btn")

const ctx = canvas.getContext('2d')
const shoot_sound = new Audio('shoot.mp3')
const explode_sound = new Audio('explode.wav')
const hit_sound = new Audio('hit.wav')
const background_sound = new Audio('background.mp3')
const upgrade_sound = new Audio('upgrade.mp3')
const grid = 25
// 7x7 so grid would be 7 
//grids' can only be square!!
const tile_size = 50
const grid_size = grid * tile_size
let gridmatrix = makematrix(grid, grid)

background_sound.loop = true
background_sound.volume = 0.3
shoot_sound.volume = 0.25
hit_sound.volume = 0.5
explode_sound.volume = 0.1
canvas.width = innerWidth
canvas.height = innerHeight

const game = {
  runningSpeed: 1 / 60,
  rampage: {
    enabled: false,
    percentage: 0.95,
    interval: null,
  },
  points: 0,
  highscore: 0,
  enemyspawnrate: 1000,
  paused: false,
}

function play() {
  if (background_sound.paused === true) {
    background_sound.play()
  }
  else {
    background_sound.pause()
  }
}
function makematrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function updatescreen() {
  ctx.fillStyle = 'rgb(0,0,0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.save();
  followPlayer()
  drawGrid();
  ctx.restore()
}
function followPlayer() {
  ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);
}
function boxcirclecollision(c, b) {
  return (c.x + c.radius > b.x && c.x - c.radius < b.x + b.width && c.y + c.radius > b.y && c.y - c.radius < b.y + b.height)
}
function boxcircleadjust(circle, rect) {
  if (circle.x > rect.x + rect.width) {
    circle.x = rect.x + rect.width + circle.radius;
  }
  else if (circle.x < rect.x) {
    circle.x = rect.x - circle.radius;
  }
  if (circle.y > rect.y + rect.height) {
    circle.y = rect.y + rect.height + circle.radius;
  }
  else if (circle.y < rect.y) {
    circle.y = rect.y - circle.radius;
  }

}

function boxcirclebounce(c, b) {
  if (c.x < b.x || c.x > b.x + b.width) {
    c.x = c.x < b.x ? b.x - c.radius : b.x + b.width + c.radius;
    c.velocity.x *= -1;
  } else if (c.y < b.y || c.y > b.y + b.height) {
    c.y = c.y < b.y ? b.y - c.radius : b.y + b.height + c.radius;
    c.velocity.y *= -1;
  }
}

function findClosestEnemy(projectile) {
  let closestEnemy = null;
  let closestDistance = 100;
  enemies.forEach(enemy => {
    const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestEnemy = enemy;
    }
  });
  return closestEnemy;
}

function checkScreenBounds(item) {
  return (item.x + item.radius >= player.x - canvas.width / 2 && item.x - item.radius <= player.x + canvas.width / 2 && item.y + item.radius >= player.y - canvas.height / 2 && item.y - item.radius <= player.y + canvas.height / 2);
}
function checkgridbounds(item) {
  return (item.x - item.radius < 0 || item.x - item.radius > grid_size || item.y - item.radius < 0 || item.y - item.radius > grid_size)
}

class Player {
  constructor(x, y, radius, color, velocity = { x: 0, y: 0 }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.cooldown = {
      weapon: false,
      crate: false,
    }
    this.weapons = {
      triplet: {
        owned: false,
        cooldown: 125,
      },
      flank: {
        owned: false,
        cooldown: 75,
      },
      twin: {
        owned: false,
        cooldown: 100,
      },
      homing: {
        owned: false,
        cooldown: 200,
      },
      spray: {
        owned: false,
        cooldown: 700,
      },
      mono: {
        owned: true,
        cooldown: 200,
      },
      void: {
        owned: false,
        cooldown: 400,
      },
      flame: {
        owned: false,
        cooldown: 50,
      },
      equiped: "mono"
    }
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
  update() {
    this.draw()
    if (clicked.mouse) this.shoot(mousex,mousey)
    if (clicked.left) this.velocity.x = -2
    if (clicked.right) this.velocity.x = 2
    if (clicked.up) this.velocity.y = -2
    if (clicked.down) this.velocity.y = 2
    if (!clicked.left && !clicked.right) this.velocity.x = 0
    if (!clicked.down && !clicked.up) this.velocity.y = 0
    if ((clicked.down || clicked.up) && (clicked.left || clicked.right)) {
      this.velocity.x = clicked.left ? -Math.sqrt(8) : Math.sqrt(8)
      this.velocity.y = clicked.up ? -Math.sqrt(8) : Math.sqrt(8)
    }
    if (this.y + this.radius + this.velocity.y >= grid_size) {
      this.velocity.y = 0;
    }
    if (this.y - this.radius + this.velocity.y <= 0) {
      this.velocity.y = 0;
    }
    if (this.x + this.radius + this.velocity.x >= grid_size) {
      this.velocity.x = 0;
    }
    if (this.x - this.radius + this.velocity.x <= 0) {
      this.velocity.x = 0;
    }
    crates.forEach(pair => {
      let gx = pair.split("x")[0]
      let gy = pair.split("x")[1]
      let crate = gridmatrix[gx][gy]
      if (boxcirclecollision(this, crate)) {
        boxcircleadjust(this, crate)
        this.velocity.x = 0
        this.velocity.y = 0
      }
    })
    this.x += this.velocity.x * deltaTime / game.runningSpeed
    this.y += this.velocity.y * deltaTime / game.runningSpeed
  }
  shoot(clientX, clientY) {
    if (game.paused || this.cooldown.weapon) return;
      this.cooldown.weapon = true;
    setTimeout(() => {
        this.cooldown.weapon = false;
    }, this.weapons[this.weapons.equiped].cooldown);
    var velocity;
    const angle = Math.atan2(clientY - canvas.height / 2, clientX - canvas.width / 2);
    shoot_sound.pause();
    shoot_sound.currentTime = 0;
    shoot_sound.play();

    switch (this.weapons.equiped) {
      case "flame":
        for (let nangle = angle - (Math.PI / 18); nangle <= angle + (Math.PI / 18); nangle += (Math.PI / 36)) {
          projectiles.push(new Flame(this.x, this.y, 5, velocity = {
            x: Math.cos(nangle),
            y: Math.sin(nangle)
          }));
        }
        break;
      case "void":
        voidProjectiles.push(new VoidProjectile(this.x, this.y, 5, 'purple', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));
        break;
      case "spray":
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const angleOffset = (Math.random() * 30 - 15) * (Math.PI / 180); // +- 15 degrees in radians
            let newangle = angle + angleOffset;
            projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
              x: Math.cos(newangle) * 4,
              y: Math.sin(newangle) * 4
            }));
          }, i * 50); // 50ms delay between each bullet
        }
        break;
      case "homing":
        projectiles.push(new HomingProjectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));
        break;
      case "mono":
        projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));
        break;
      case "flank":
        projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle + Math.PI) * 4,
          y: Math.sin(angle + Math.PI) * 4
        }));
        projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));
        break;
      case "twin":
        projectiles.push(new Projectile(this.x + Math.cos(angle + Math.PI / 2) * 6, this.y + Math.sin(angle + Math.PI / 2) * 6, 5, 'white', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));

        projectiles.push(new Projectile(this.x - Math.cos(angle + Math.PI / 2) * 6, this.y - Math.sin(angle + Math.PI / 2) * 6, 5, 'white', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));
        break;
      case "triplet":
        projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(angle) * 4
        }));
        projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle + Math.PI * 2 / 3) * 4,
          y: Math.sin(angle + Math.PI * 2 / 3) * 4
        }));
        projectiles.push(new Projectile(this.x, this.y, 5, 'white', velocity = {
          x: Math.cos(angle + Math.PI * 4 / 3) * 4,
          y: Math.sin(angle + Math.PI * 4 / 3) * 4
        }));
        break;
    }
  };
}


class Projectile {
  constructor(x, y, radius, color, velocity, damage=10) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.damage = damage
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
  update() {
    if (checkScreenBounds(this)) { this.draw() }
    this.x += this.velocity.x * deltaTime / game.runningSpeed
    this.y += this.velocity.y * deltaTime / game.runningSpeed
  }
}
class Flame extends Projectile {
  constructor(x, y, radius, velocity,damage=2) {
    super(x, y, radius, `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 0, 0.5)`, velocity);
    this.velocity.x *= 4; // Double the speed
    this.velocity.y *= 4;
    this.birthTime = Date.now();
    this.damage = damage;
    this.lifetime = 200; // 0.5 seconds in milliseconds
  }

  update() {
    super.update();
    if (Date.now() - this.birthTime > this.lifetime) {
      setTimeout(()=>{
        const index = projectiles.indexOf(this)
        if(index==-1)return;
        projectiles.splice(index, 1)
      },this.lifetime)

    }
  }
}
class Enemy {
  constructor(x, y, radius, color, velocity, buff) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.buff = buff
    this.locked = true
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()

  }
  update() {
    if (checkScreenBounds(this)) { this.draw() }
    if (this.locked) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity = {
        x: Math.cos(angle) * this.buff,
        y: Math.sin(angle) * this.buff
      }
    }
    this.x += this.velocity.x * deltaTime / game.runningSpeed
    this.y += this.velocity.y * deltaTime / game.runningSpeed
  }
  takeDamage(damage) {
    game.points += damage*10
    score.innerHTML = game.points
    for (let i = 0; i < this.radius *damage/5; i++) {
      particles.push(new Particle(this.x, this.y, Math.random() * 2, this.color, { x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8) }))
    }
    if (this.radius - damage > 6) {
      hit_sound.pause()
      hit_sound.currentTime = 0
      hit_sound.play()
      gsap.to(this, {
        radius: this.radius - damage
      })
    }
    else {
      if (tempdead.includes(this)) return
      tempdead.push(this)
      explode_sound.pause()
      explode_sound.currentTime = 0
      explode_sound.play()
      setTimeout(() => {
        const index = enemies.indexOf(this);
        enemies.splice(index, 1);
        tempdead.splice(tempdead.indexOf(this), 1);
      }, 0);
    }

  }
}

class VoidProjectile extends Projectile {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.pullRadius = 100;
    this.pulling = false;
    this.pullDuration = 1; // Duration of the pull in seconds
    this.pullStartTime = null;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Visualize the pull radius (optional)
    if (this.pulling) {
      ctx.strokeStyle = this.color;
      ctx.save()
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.pullRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    if (checkScreenBounds(this)) { this.draw() }
    if (!this.pulling) {
      this.x += this.velocity.x * deltaTime / game.runningSpeed;
      this.y += this.velocity.y * deltaTime / game.runningSpeed;

      enemies.forEach(enemy => {
        const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (distance <= 50) {
          this.pulling = true;
          this.pullStartTime = Date.now();
        }
      });
    } else {
      const elapsedTime = (Date.now() - this.pullStartTime) / 1000;
      if (elapsedTime >= this.pullDuration) {
        // Deal damage to enemies within pull radius
        enemies.forEach(enemy => {
          const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (distance <= this.pullRadius) {
            for (let i = 0; i < this.radius * 2; i++) {
              particles.push(new Particle(this.x, this.y, Math.random() * 10, this.color, { x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8) }))
            }
            enemy.takeDamage(5); // Replace with actual damage calculation
            enemy.locked = true; // Unlock the enemy
          }
        });
        // Remove the void projectile
        const index = voidProjectiles.indexOf(this);
        voidProjectiles.splice(index, 1);
      } else {
        // Calculate pull force and apply it to the enemy
        enemies.forEach(enemy => {
          const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (distance <= this.pullRadius) {
            enemy.locked = false
            enemy.velocity = {
              x: ((this.x - enemy.x) * Math.cos(Math.PI / 4) - (this.y - enemy.y) * Math.sin(Math.PI / 4)) / distance * enemy.buff,
              y: ((this.x - enemy.x) * Math.sin(Math.PI / 4) + (this.y - enemy.y) * Math.cos(Math.PI / 4)) / distance * enemy.buff
            };

          }
        });
      }
    }
  }
}


class HomingProjectile extends Projectile {
  constructor(x, y, radius, color, velocity,damage) {
    super(x, y, radius, color, velocity,damage);
    this.homing = true;
    this.target = null;
    this.homingSpeed = 2.5 * (Math.PI / 180); // Convert 5 degrees to radians
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const angle = Math.atan2(this.velocity.y, this.velocity.x);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    if (checkScreenBounds(this)) {
      this.draw();
    }
    this.target = findClosestEnemy(this);
    if (this.target) {
      const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      let currentAngle = Math.atan2(this.velocity.y, this.velocity.x);

      let angleDifference = angleToTarget - currentAngle;

      // Normalize the angleDifference to the range [-Math.PI, Math.PI]
      if (angleDifference > Math.PI) {
        angleDifference -= 2 * Math.PI;
      } else if (angleDifference < -Math.PI) {
        angleDifference += 2 * Math.PI;
      }

      // Gradually turn the projectile towards the target
      if (Math.abs(angleDifference) < this.homingSpeed) {
        currentAngle = angleToTarget; // If the difference is smaller than homingSpeed, snap to target angle
      } else if (angleDifference > 0) {
        currentAngle += this.homingSpeed;
      } else {
        currentAngle -= this.homingSpeed;
      }
      this.velocity.x = Math.cos(currentAngle) * 4;
      this.velocity.y = Math.sin(currentAngle) * 4;
    }

    this.x += this.velocity.x * deltaTime / game.runningSpeed;
    this.y += this.velocity.y * deltaTime / game.runningSpeed;
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }
  update() {
    if (checkScreenBounds(this)) { this.draw() }
    this.alpha -= 0.01
    this.x += this.velocity.x * friction * deltaTime / game.runningSpeed
    this.y += this.velocity.y * friction * deltaTime / game.runningSpeed
  }
}

class ShootingEnemy extends Enemy {
  constructor(x, y, radius, color, velocity, buff, firingRate) {
    super(x, y, radius, color, velocity, buff);
    this.firingRate = firingRate;
    this.speed = 5;
    this.radius = radius
    this.color = "red"
    this.locked = true
  }

  update() {
    if (checkScreenBounds(this)) { this.draw() }
    if (this.locked) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.velocity = {
        x: Math.cos(angle) * this.buff,
        y: Math.sin(angle) * this.buff
      };
    }
    this.x += this.velocity.x * deltaTime / game.runningSpeed;
    this.y += this.velocity.y * deltaTime / game.runningSpeed;

    if (frame % this.firingRate === 0) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const velocity = {
        x: Math.cos(angle) * this.speed,
        y: Math.sin(angle) * this.speed
      };
      enemyProjectiles.push(new enemyProjectile(this.x, this.y, this.radius * 0.3, this.color, velocity));
    }
  }
}

class enemyProjectile extends Projectile {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    if (checkScreenBounds(this)) { this.draw() }
    this.x += this.velocity.x * deltaTime / game.runningSpeed;
    this.y += this.velocity.y * deltaTime / game.runningSpeed;
  }
}
class Crate {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.HP = 10;
    this.maxHP = 10;
  }

  draw() {
    ctx.fillStyle = this.color;
    let alpha = (this.HP + 1) / this.maxHP
    if (alpha > 1) { alpha = 1 }
    ctx.globalAlpha = alpha
    ctx.drawImage(crate_img, this.x, this.y, this.width, this.height);
  }
}
const player = new Player(grid_size / 2, grid_size / 2, 10, 'white')
const crates = [];
const enemyProjectiles = [];
const projectiles = []
const voidProjectiles = []
const enemies = []
const particles = []
let enemyid
function spawnEnemies() {
  //return
  enemyid = setInterval(() => {


    const isShootingEnemy = Math.random() < 0.1;

    if (isShootingEnemy) {
      // spawn shooting enemy
      const radius = Math.random() * (30 - 10) + 10;
      let x;
      let y;
      let axis = Math.random() < 0.5
      if (axis) {
        x = Math.random() < 0.5 ? player.x - (radius + (canvas.width / 2)) : canvas.width / 2 + radius + player.x;
        y = (canvas.height * Math.random()) + player.y - canvas.height / 2;

      }
      if (!axis) {
        y = Math.random() < 0.5 ? player.y - (radius + (canvas.height / 2)) : canvas.height / 2 + radius + player.y;
        x = (canvas.width * Math.random()) + player.x - canvas.width / 2;
      }
      const color = `hsl(${Math.random() * 360},50%,50%)`;
      const angle = Math.atan2(player.y / 2 - y, player.x / 2 - x);
      let speedbuff = Math.random() * (2.5 - 1) + 1;
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      const firingRate = Math.floor(Math.random() * (200 - 100) + 100);
      enemies.push(new ShootingEnemy(x, y, radius, color, velocity, speedbuff, firingRate));
    } else {
      // spawn normal enemy
      const radius = Math.random() * (30 - 6) + 6;
      let x;
      let y;
      let axis = Math.random() < 0.5
      if (axis) {
        x = Math.random() < 0.5 ? player.x - (radius + (canvas.width / 2)) : canvas.width / 2 + radius + player.x;
        y = (canvas.height * Math.random()) + player.y - canvas.height / 2;

      }
      if (!axis) {
        y = Math.random() < 0.5 ? player.y - (radius + (canvas.height / 2)) : canvas.height / 2 + radius + player.y;
        x = (canvas.width * Math.random()) + player.x - canvas.width / 2;
      }
      const color = `hsl(${Math.random() * 360},50%,50%)`;
      const angle = Math.atan2(player.y / 2 - y, player.x / 2 - x);
      let speedbuff = Math.random() * (2.5 - 1) + 1;
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      enemies.push(new Enemy(x, y, radius, color, velocity, speedbuff));
    }
  }, game.enemyspawnrate);
}

let animationid;

function popup(text) {
  let p = document.createElement("span")
  p.innerHTML = text
  p.style.position = "fixed"
  p.style.top = "5"
  p.style.left = `${canvas.width / 2}`
  p.style.color = "white"
  p.style.transform = "translateX(-50%)"
  p.style.backgroundColor = "#4d4b49"
  p.style.borderRadius = "10px"
  p.style.paddingLeft = "10px"
  p.style.paddingRight = "10px"
  p.style.paddingTop = "3px"
  p.style.paddingBottom = "3px"
  document.body.append(p)
  setTimeout(() => { p.remove() }, 3000)
}
function buy(item) {
  if (player.weapons[item.name].owned === false) {
    if (game.points >= item.price) {
      player.weapons[item.name].owned = true
      game.points -= item.price
      score.innerHTML = game.points
      endscore.innerHTML = game.points
      document.getElementById(player.weapons.equiped).style.backgroundColor = "#73ff00"
      document.getElementById(item.name).style.backgroundColor = "blue"
      player.weapons.equiped = item.name
      upgrade_sound.play()
    }
    else {

      popup(`you need ${item.price} game.points to buy ${item.name}`)
    }
  }
  if (player.weapons[item.name].owned === true) {
    document.getElementById(player.weapons.equiped).style.backgroundColor = "#73ff00"
    document.getElementById(item.name).style.backgroundColor = "blue"
    player.weapons.equiped = item.name

  }
}
let clicked = {
  left: false,
  right: false,
  down: false,
  up: false,
  mouse: false,
}
function drawGrid() {

  ctx.beginPath();
  for (let x = 0; x <= grid_size; x += tile_size) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, grid_size);
  }
  for (let y = 0; y <= grid_size; y += tile_size) {
    ctx.moveTo(0, y);
    ctx.lineTo(grid_size, y);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; // Adjust the color and transparency of the grid
  ctx.stroke();
}
let frame = 0;
//rampage mode
function rampage() {
  game.enemyspawnrate = 1000
  clearInterval(game.rampage.interval)
  if (game.rampage.enabled) {
    if(deltaTime == 0) deltaTime = 1/60
    game.rampage.interval = setInterval(() => {
      if (game.paused) return
      game.enemyspawnrate = game.enemyspawnrate * game.rampage.percentage
      console.log(game.enemyspawnrate)
      clearInterval(enemyid)
      spawnEnemies()
    }, 1000 * 10 * deltaTime / game.runningSpeed)
  } else {
    clearInterval(game.rampage.interval)
  }
}


let lastTime = performance.now();
let deltaTime = 0;

function animate(currentTime) {
  animationid = requestAnimationFrame(animate)
  deltaTime = (currentTime - lastTime) / 1000;
  if (deltaTime == 0) deltaTime = 1 / 60
  lastTime = currentTime;
  //console.log("fps:",deltaTime,"lasttime",lastTime)
  frame++;
  tempdead = []

  ctx.fillStyle = 'rgb(0,0,0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.save();
  followPlayer()
  drawGrid();


  player.update()
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    }
    else {
      particle.update()
    }
  })
  projectiles.forEach((projectile, pindex) => {
    projectile.update()
    if (checkgridbounds(projectile)) {
      setTimeout(() => {
        projectiles.splice(pindex, 1)
      }, 0)
    }
  })
  voidProjectiles.forEach((projectile, pindex) => {
    projectile.update()
    if (checkgridbounds(projectile)) {
      setTimeout(() => {
        voidProjectiles.splice(pindex, 1)
      }, 0)
    }
  })

  projectiles.forEach((projectile, pindex) => {
    enemyProjectiles.forEach((enemyProjectile, bindex) => {
      const dist = Math.hypot(enemyProjectile.x - projectile.x, enemyProjectile.y - projectile.y)

      if (dist - (enemyProjectile.radius + projectile.radius) < 0) {

        setTimeout(() => {
          projectiles.splice(pindex, 1)
          enemyProjectiles.splice(bindex, 1)
          game.points += 10
        }, 0)
      }
    })
  })

  enemyProjectiles.forEach((enemyProjectile, bindex) => {
    enemyProjectile.update()
    if (checkgridbounds(enemyProjectile)) {
      setTimeout(() => {
        enemyProjectiles.splice(bindex, 1)
      }, 0)
    }
    const dist = Math.hypot(enemyProjectile.x - player.x, enemyProjectile.y - player.y)
    if (dist - player.radius - enemyProjectile.radius < 1) {
      cancelAnimationFrame(animationid)
      clearInterval(enemyid)

      endgame()
    }
  })
  enemies.forEach((enemy, eindex) => {
    enemy.update()
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationid)
      clearInterval(enemyid)

      endgame()
    }
    projectiles.forEach((projectile, pindex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      if (dist - enemy.radius - projectile.radius < 1) {
        enemy.takeDamage(projectile.damage)
        if(tempdead.includes(enemy)) return enemy;
        setTimeout(()=>{
          projectiles.splice(pindex, 1)
        },0)
      }
    })

  })
  crates.forEach((pair, cindex) => {
    let gx = pair.split("x")[0]
    let gy = pair.split("x")[1]
    let crate = gridmatrix[gx][gy]
    crate.draw()
    enemyProjectiles.forEach((projectile, pindex) => {
      if (boxcirclecollision(projectile, crate)) {
        enemyProjectiles.splice(pindex, 1)
        crate.HP -= 1
      }
    })
    projectiles.forEach((projectile, pindex) => {
      if (boxcirclecollision(projectile, crate)) {
        boxcirclebounce(projectile, crate)
      }


    })
    enemies.forEach((enemy, eindex) => {
      if (boxcirclecollision(enemy, crate)) {
        enemy.locked = false
        const angle = Math.atan2(crate.y - enemy.y, crate.x - enemy.x);

        gsap.to(enemy.velocity, {
          x: Math.cos(angle) * enemy.buff * -3,
          y: Math.sin(angle) * enemy.buff * -3,
          duration: 0.1,
          onComplete: () => {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
            gsap.to(enemy.velocity, {
              x: Math.cos(angle) * enemy.buff,
              y: Math.sin(angle) * enemy.buff,
              duration: 0.1,
              onComplete: () => {
                enemy.locked = true
              }
            })
          }
        })

        setTimeout(() => {
          enemy.locked = true
        }, 200)
        crate.HP -= 1
      }
    })
    if (crate.HP <= 0) {
      crates.splice(cindex, 1)
      gridmatrix[gx][gy] = 0
    }
  })
  ctx.restore();
}
addEventListener('mousemove', (e) => {
  mousex = e.clientX
  mousey = e.clientY
})
addEventListener('mousedown', (e) => {
  clicked.mouse = true
  player.shoot(e.clientX,e.clientY)
})
addEventListener('mouseup', (e) => {
  clicked.mouse = false
})
function placecrate() {
  if (game.paused) return;
  if (player.cooldown.crate) return;
  player.cooldown.crate = true
  setTimeout(() => {
    player.cooldown.crate = false
  }, 10000)
  const canvasx = player.x - canvas.width / 2
  const canvasy = player.y - canvas.height / 2
  let gx = Math.floor((canvasx + mousex) / grid_size * grid)
  let gy = Math.floor((canvasy + mousey) / grid_size * grid)
  if (gridmatrix[gx][gy] != 0) return

  x = gx * tile_size
  y = gy * tile_size
  let crate = new Crate(x, y, tile_size, tile_size, 1)
  if (boxcirclecollision(player, crate)) return
  gridmatrix[gx][gy] = crate
  crates.push(`${gx}x${gy}`)
}
addEventListener('keydown', (e) => {
  const key = e.code

  switch (key) {
    case "KeyA":
      clicked.left = true
      break
    case "KeyD":
      clicked.right = true
      break
    case "KeyS":
      clicked.down = true
      break
    case "KeyW":
      clicked.up = true
      break
    case "KeyC":
      placecrate()
      break
    case "Space":
      pausegame()
      break
  }
})
addEventListener('keyup', (e) => {
  const key = e.code
  switch (key) {
    case "KeyA":
      clicked.left = false
      break
    case "KeyD":
      clicked.right = false
      break
    case "KeyS":
      clicked.down = false
      break
    case "KeyW":
      clicked.up = false
      break
  }
})

function endgame() {
  if (game.points > game.highscore) {
    game.highscore = game.points
    bestscore.innerHTML = game.highscore
  }
  cancelAnimationFrame(animationid)
  clearInterval(enemyid)
  endscreen.style.display = "flex"
  endscore.innerHTML = game.points

}
function pausegame() {
  if (endscreen.style.display != "none") return
  if (!game.paused) {
    game.paused = true
    cancelAnimationFrame(animationid)
    clearInterval(enemyid)
    ctx.fillStyle = "green";
    ctx.font = "60px impact";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED GAME", canvas.width / 2, canvas.height / 2);
    return
  }
  if (game.paused) {
    game.paused = false
    spawnEnemies()
    lastTime = performance.now();
    animationid = requestAnimationFrame(animate)
    return
  }
}
async function startgame() {
  endscreen.style.display = "none"
  game.points = 0
  score.innerHTML = game.points
  projectiles.length = 0
  crates.length = 0
  gridmatrix = makematrix(grid, grid)
  for (let i1 = 0; i1 < enemies.length; i1++) {
    let enemy = enemies[i1];
    for (let i = 0; i < enemy.radius * 2; i++) {
      particles.push(new Particle(enemy.x, enemy.y, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * (Math.random() * 8), y: (Math.random() - 0.5) * (Math.random() * 8) }))
    }
  }
  enemies.length = 0
  enemyProjectiles.length = 0
  voidProjectiles.length = 0
  player.x = grid_size / 2
  player.y = grid_size / 2
  player.cooldown.crate = false
  player.cooldown.weapon = false
  rampage()
  spawnEnemies()
  animationid = requestAnimationFrame(animate)
}
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)
player.draw()
async function togglefullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    canvas.width = innerWidth
    canvas.height = innerHeight
  } else {
    await document.documentElement.requestFullscreen();
    canvas.width = document.documentElement.scrollWidth
    canvas.height = document.documentElement.scrollHeight
  }

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()
}
if (document.addEventListener) {
  document.addEventListener('fullscreenchange', exitHandler, false);
  document.addEventListener('mozfullscreenchange', exitHandler, false);
  document.addEventListener('MSFullscreenChange', exitHandler, false);
  document.addEventListener('webkitfullscreenchange', exitHandler, false);
}

function exitHandler() {
  if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
    canvas.width = innerWidth
    canvas.height = innerHeight
  }
}
if (/Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  addEventListener("deviceorientation", handleOrientation, true);
  function handleOrientation() {
    canvas.width = innerWidth
    canvas.height = innerHeight
  }
}