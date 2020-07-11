class Physics
{
    constructor(velocity, acceleration, pos, vertices)
    {
        this.velocity = velocity;
        this.acceleration = acceleration;
		this.pos = pos;
		this.vertices = vertices;
		this.shouldDelete = false;
    }
	
    updateVelocity(delta)
    {
        this.velocity.x += this.acceleration.x * delta;
        this.velocity.y += this.acceleration.y * delta;
    }
	
    updateAcceleration(deltaX, deltaY)
    {
        this.acceleration.x += deltaX;
        this.acceleration.y += deltaY;    
    }
	
	vecCompare(v1, v2)
	{
		if (v1.x > v2.x)
		{
			return 1;
		}
		if (v1.x == v2.x && v1.y > v2.y)
		{
			return 1;
		}
		if (v1.x == v2.x && v1.y == v2.y)
		{
			return 0;
		}
		return -1;
	}
	
	squash(v1, v2)
	{
		var proj = createVector(v2.x - v1.x, v2.y - v1.y).normalize();
		var points = [];
		var rv = this.getRealVertices();
		for (var i = 0; i < rv.length; i++)
		{
			var vec = rv[i];
			var pproj = p5.Vector.mult(proj, vec.dot(proj));
			points.push(pproj);
		}
		points.sort(Physics.vecCompare);
		return [points[0], points[points.length - 1]];
	}
	
	intervalsIntersect(i1, i2)
	{
		var comp = vecCompare(i1[0], i2[0])
		if (comp > 0)
		{
			return Physics.intervalsIntersect(i2, i1)
		}
		return vecCompare(i1[1], i2[0]) >= 0;
	}
	
	getRealVertices()
	{
		var result = [];
		for (var i = 0; i < this.vertices.length; i++)
		{
			result.push(p5.Vector.add(this.vertices[i]. this.pos));
		}
		return result;
	}
    
    collidingWith(other)
    {
		var rv = this.getRealVertices();
		var otherrv = other.getRealVertices();
		
		for (var i = 0; i < rv.length; i++)
		{
			var v1 = rv[i];
			var v2 = rv[(i + 1) % rv.length];
			var inte = this.squash(v1, v2);
			var otherInte = other.squash(v1, v2);
			if (Physics.intervalsIntersect(inte, otherInte))
			{
				return true;
			}
		}
		return false;
    }
	
	updatePosition(deltaTime)
	{
		this.pos = p5.Vector.add(this.pos, p5.Vector.mult(this.velocity, deltaTime));
	}
	
	updateMovement(deltaTime)
	{
		this.updatePosition(deltaTime);
		this.updateVelocity(deltaTime);
	}
	
	update(deltaTime)
	{
		this.updateMovement(deltaTime);
	}
    
    // getters
    getVelocity(){return this.velocity};
    getAcceleration(){return this.acceleration};


};