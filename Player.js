class PLayer extends Physics
{
    constructor(pos,velocity,acceleration, accelerationMagnitude, dashTime)
    {
        super(velocity,acceleration, pos, [createVector(-11, -6), createVector(-5, -11), createVector(5, -11), createVector(11, -6), createVector(11, 4), createVector(6, 11), createVector(-6, 11), createVector(-10, 7)]);
        this.isDead = false;
        this.Dashing = false;
        this.accelerationMagnitude = accelerationMagnitude;
        this.dashTime = dashTime;
        this.timePassed = dashTime;
        this.dashCoolDown = .5;
        this.dashes = 0;
        this.dashDirection = new p5.Vector(0,0,0);
        this.gettingHit = [];
        this.granterpos = new p5.Vector(0,0,0);
        this.granterSpawnTime = 3;
        this.timePassedGranter = -1;
    }
	
	static getName()
	{
		if (sessionStorage.getItem("name"))
		{
			return sessionStorage.getItem("name");
		}
		var name = Math.floor(random() * 900001 + 100000).toString();
		sessionStorage.setItem("name", name);
		return name;
	}
	
    // update player
    update(deltaTime)
    {
        // get player input
        this.playerInput();
        // velocity cap
        if (this.velocity.mag() < 400)
		{
			this.updateVelocity(deltaTime);
		}
        else
        {
            // if cap is reached reduce acceleration and velocity
            this.acceleration.mult(.4);
            this.velocity.mult(.9);
        }
        // update position
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;
        // dashing
        if (this.Dashing)
        {
            this.acceleration = new p5.Vector(0,0,0);
            this.velocity = this.dashDirection;
            this.timePassed -= deltaTime;
            if (this.timePassed < 0)
            {
                this.Dashing = false;
                this.velocity.mult(.2);
                this.timePassed = this.dashTime;
                // if the mouse is still being held extend the dash (done here to keep invincibility)
                if (mouseIsPressed && (this.dashes > 0)) this.dash();
            }
        }
        // bounce of the edges of the screen
        this.bounceOfWalls();
        // death
        if (this.gettingHitAtAll() && !this.Dashing && !addedScore)
        {
            this.acceleration = new p5.Vector(0,0,0);
            this.velocity = new p5.Vector(0,0,0);
            this.dashes = 0;
            this.isDead = true;
			db.collection("leaderboard").add({name: PLayer.getName(), score: getScore()}).then(function() {
				playerScores = [];
				db.collection("leaderboard").orderBy("score", "desc").limit(10).get().then(function(snapshot) {
					snapshot.forEach(function(snap) {
						playerScores.push(snap.data());
					});
				});
				shouldShowLeaderboard = true;
			});
			addedScore = true;
        }
        // get dash back if near granter
        if (this.pos.dist(this.granterpos) < 35)
        {
            this.dashes++;
            this.granterpos = new p5.Vector(-20,-20,0);
            this.timePassedGranter = 0;
        }
        // respawn the granter 5 seconds after it is collected
        if ((this.timePassedGranter != -1) && (this.timePassedGranter < 5)) this.timePassedGranter += deltaTime;
        if (this.timePassedGranter > this.granterSpawnTime)
        {
            this.spawnGranter();
        }
    }
	
	gettingHitAtAll()
	{
		for (var i = 0; i < this.gettingHit.length; i++)
		{
			if (this.gettingHit[i])
			{
				this.gettingHit = [];
				return true;
			}
		}
		this.gettingHit = [];
		return false;
	}
	
    // draw player
    draw()
    {
        // change color when dashing
        if (this.Dashing) fill(93,125,252);
        else if (this.isDead) fill(200, 20, 20);
		else fill(0, 0, 0);
        // makes a "cursor" shape rotated for the acceleration
        translate(this.pos.x,this.pos.y);
        rotate(this.pos.angleBetween(this.acceleration));
        quad(8,-10,3,3,-10,8,16,16);
        rotate(-this.pos.angleBetween(this.acceleration));
        translate(-this.pos.x,-this.pos.y);
        // draw granter
        fill(93,125,255);
        ellipse(this.granterpos.x, this.granterpos.y, 10, 10);
        // draw dash amount text
        textSize(14);
        fill(0,0,0);
        text(this.dashes,this.pos.x + 20, this.pos.y + 20);
    }

    bounceOfWalls()
    {
        if ((this.pos.x - 12.5 < 0) || (this.pos.x + 12.5 > WIDTH)) this.velocity.x *= -1.5;
        else if ((this.pos.y - 12.5 < 0) || (this.pos.y + 12.5 > HEIGHT)) this.velocity.y *= -1.5;
    }

    playerInput()
    {
        let d = new p5.Vector(0,0,0);
        if (keyIsDown(65)) d.x = -1;
        if (keyIsDown(68)) d.x = 1;
        if (keyIsDown(87)) d.y = -1;
        if (keyIsDown(83)) d.y = 1;
        // change acceleration
        if (!this.Dashing && !this.isDead) this.updateAcceleration(d.x * this.accelerationMagnitude,d.y * this.accelerationMagnitude);
        if (!this.Dashing && mouseIsPressed && (this.dashes > 0)) this.dash();
    }

    dash()
    {
        this.dashes--;
        this.Dashing = true;
        this.dashDirection = new p5.Vector(this.pos.x - mouseX, this.pos.y - mouseY,0);
        this.dashDirection.normalize().mult(-1200);
		dashSound.play();
    }

    spawnGranter()
    {
        this.granterpos = new p5.Vector(20 + random()*(WIDTH-20),20 + random()*(HEIGHT-20),0);
        this.timePassedGranter = -1;
    }

    // getters and setters
    getIsDead() {return this.isDead};
    setIsDead(b) {this.isDead = b};

}