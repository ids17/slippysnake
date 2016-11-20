var Enemy = {

    image: null,
    rotateSpeed: 8,
    speed: 0,
    maxSpeed: 3,
    wanderSpeed: 1,
    targetDirection: 0,
    watchArea: 200,
    type: "enemy",
    collision: false,
    collisionTimerMax: 100,
    collisionTimer: 0,
    soundTimer: 80,
    soundTimerMax: 80,

    state: function() {},

    draw: function(context, windowX, windowY, scale) {
        drawRotatedImage(context, this.image, (this.x - windowX) * scale, (this.y - windowY) * scale, 
            this.image.width * scale, this.image.height * scale, this.direction, 0);
    },

    update: function() {

        this.state();

        //collision escape timer
        if (this.collisionTimer) this.collisionTimer++;
        if (this.collisionTimer > this.collisionTimerMax)
            this.collisionTimer = 0;

        //check colissions
        var newX = this.x + this.speed * Math.cos((this.direction - 90)* Math.PI / 180);
        var newY = this.y + this.speed * Math.sin((this.direction - 90) * Math.PI / 180);
        var collision = false;
        for(var i = 1; i < GameManager.entities.length; i++) {
            var e = GameManager.entities[i];
            if (newX - this.size/2 > e.x + e.size/2 || newX + this.size/2 < e.x - e.size/2 ||
                newY - this.size/2 > e.y + e.size/2 || newY + this.size/2 < e.y - e.size/2)
                continue;
            if (e.collision || e.type == "victim" || (e.type == "enemy" && e != this)) {
                this.direction += 180;
                this.targetDirection = this.direction;
                collision = true;
                this.collisionTimer++;
                break;
            }
        }
        if (!collision) {
            this.x = newX;
            this.y = newY;
        }

        //FRRR
        this.soundTimer++;
        if (this.soundTimer > this.soundTimerMax) {
            this.soundTimer = 0;
            GameManager.soundManager.playWorldSound("../sounds/frr.mp3", this.x, this.y);
        }

    },

    wander: function() {
        this.speed = this.wanderSpeed;
        if (this.direction > 359) this.direction = 0;
        if (this.direction < 0) this.direction = 359;

        if (this.direction == this.targetDirection && !this.collisionTimer) {
            this.targetDirection = Math.floor(Math.random()*360);
        }
        if (this.direction > this.targetDirection)
            if (this.direction - this.targetDirection < 180) this.direction--;
            else this.direction++;
        if (this.direction < this.targetDirection)
            if (this.targetDirection - this.direction < 180) this.direction++;
            else this.direction--;

        if (this.isSnakeHere()) {
            this.state = this.hunt;
        }
    },

    hunt: function() {
        
        this.speed = this.maxSpeed;

        if (!this.collisionTimer) {
            var dx = GameManager.snake.x - this.x;
            var dy = -GameManager.snake.y + this.y;
            if (dy < 0) this.direction = Math.atan(dx/dy)*180/Math.PI + 180;
            if (dy > 0) this.direction = Math.atan(dx/dy)*180/Math.PI;
        }

        if (!this.isSnakeHere()) this.state = this.wander;
    },

    isSnakeHere: function() {
        if (Math.abs(GameManager.snake.x - this.x) < this.watchArea && 
            Math.abs(GameManager.snake.y - this.y) < this.watchArea)
            return true;
        return false;
    }

}