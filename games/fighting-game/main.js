const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
var player;
var enemy;
var winner;
var gravity = 0.7;
canvas.width = 1024;
canvas.height = 576;
class sprite
{
	constructor(
	{
		position,
		velocity,
		color = 'red',
		offset,
		hp = 100
	})
	{
		this.position = position;
		this.velocity = velocity;
		this.offset = offset;
		this.height = 150;
		this.width = 50;
		this.lastKey;
		this.hp = hp
		this.attackBox = {
      position:this.position,
      offset:this.offset,
			width: 100,
			height: 50,
      hit(obj){
        let myleft = this.position.x+this.offset.x;
		let objleft = obj.position.x
		let myright = this.position.x + this.width+this.offset.x;
		let objright = obj.position.x + obj.width;
		let mytop = this.position.y+this.offset.y;
		let objtop = obj.position.y
		let mybottom = this.position.y + this.height+this.offset.y
		let objbottom = obj.position.y + obj.height
		if (myright >= objleft && myleft <= objright && mybottom >= objtop && mytop <= objbottom) return true
		else return false
      },
		}
		this.color = color;
	}
	draw()
	{
		ctx.fillStyle = this.color;
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
		//attack box render
		if (this.attacking)
		{
			ctx.fillStyle = "yellow"
			ctx.fillRect(this.position.x+this.offset.x, this.position.y+this.offset.y, this.attackBox.width, this.attackBox.height)
		}
	}
	update()
	{
		this.draw()
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
		if (this.position.y + this.height + this.velocity.y >= canvas.height)
		{
			this.velocity.y = 0
		}
		else this.velocity.y += gravity;
	}
	crash(obj)
	{
		let myleft = this.position.x;
		let objleft = obj.position.x
		let myright = this.position.x + this.width;
		let objright = obj.position.x + obj.width;
		let mytop = this.position.y;
		let objtop = obj.position.y
		let mybottom = this.position.y + this.height
		let objbottom = obj.position.y + obj.height
		if (myright >= objleft && myleft <= objright && mybottom >= objtop && mytop <= objbottom) return true
		else return false
	}
	attack()
	{
		this.attacking = true
		setTimeout(() =>
		{
			this.attacking = false
		}, 100)
	}
}
player = new sprite(
{
	position:
	{
		x: 0,
		y: 0
	},
	velocity:
	{
		x: 0,
		y: 0
	},
	color: "blue",
	offset:
	{
		x: 0,
		y: 0
	}
});
enemy = new sprite(
{
	position:
	{
		x: 1000,
		y: 0
	},
	velocity:
	{
		x: 0,
		y: 0
	},
	offset:
	{
		x: -50,
		y: 0
	}
});
const keys = {
	a:
	{
		pressed: false
	},
	d:
	{
		pressed: false
	},
	right:
	{
		pressed: false
	},
	left:
	{
		pressed: false
	},
}

function endgame()
{
	if (enemy.hp > player.hp) winner = "enemy"
	if (player.hp > enemy.hp) winner = "player"
	ctx.font = '50px serif';
	ctx.fillText(`${winner} WON!`, 512, 288);
}
var timer = setInterval(function()
{
	let time = document.getElementById("timer").innerHTML
	if (time === "0") return endgame()
	document.getElementById("timer").innerHTML = parseInt(time) - 1
	window.cancelAnimationFrame(animate)
}, 1000);

function animate()
{
	window.requestAnimationFrame(animate)
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	enemy.update()
	player.update()
	player.velocity.x = 0;
	if (keys.a.pressed && player.lastKey === "a")
	{
		player.velocity.x = -5
	}
	else if (keys.d.pressed && player.lastKey === "d")
	{
		player.velocity.x = 5
	};
	enemy.velocity.x = 0;
	if (keys.left.pressed && enemy.lastKey === "left")
	{
		enemy.velocity.x = -5
	}
	else if (keys.right.pressed && enemy.lastKey === "right")
	{
		enemy.velocity.x = 5
	};
	if (player.attacking && player.attackBox.hit(enemy))
	{
		player.attacking = false
		enemy.hp += -10
		document.getElementById("enemyhp").style.width = enemy.hp + "%"
	};
	if (enemy.attacking && enemy.attackBox.hit(player))
	{
		enemy.attacking = false
		player.hp += -10
		document.getElementById("playerhp").style.width = player.hp + "%"
	}
}
animate()
window.addEventListener("keydown", (event) =>
{
	switch (event.key)
	{
		case 'd':
			keys.d.pressed = true
			player.lastKey = "d"
			break
		case 'a':
			keys.a.pressed = true
			player.lastKey = "a"
			break
		case 's':
			if (!player.attacking) player.attack()
			break
		case 'w':
			if (player.position.y + player.height <= canvas.height) break
			player.velocity.y = -20
			break
		case 'ArrowRight':
			keys.right.pressed = true
			enemy.lastKey = "right"
			break
		case 'ArrowLeft':
			keys.left.pressed = true
			enemy.lastKey = "left"
			break
		case 'ArrowDown':
			if (!enemy.attacking) enemy.attack()
			break
		case 'ArrowUp':
			if (enemy.position.y + enemy.height <= canvas.height) break
			enemy.velocity.y = -20
			break
	}
})
window.addEventListener("keyup", (event) =>
{
	switch (event.key)
	{
		case 'd':
			keys.d.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		case 'ArrowRight':
			keys.right.pressed = false
			break
		case 'ArrowLeft':
			keys.left.pressed = false
			break
	}
})
console.log("%cDONT TYPE ANYTHING HERE IF YOU DONT KNOW WHAT YOUR DOING!", "color:#ffffff;background-color:#e61010;font-size:50px;")
