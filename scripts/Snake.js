var Snake = {
    headImage: null,
    alive: true,
    rotateSpeed: 8,
    acceleration: 0,
    deathCause: null,
    maxAcceleration: 0.5,
    stopAcceleration: -0.3,
    pushSpeed: 3,
    border: 3,
    maxSpeed: 5,
    tailWidth: 5,
    borderTailWidth: 2,
    width: 9,
    speed: 0,
    length: 50,
    color: "#DF0000",
    borderColor: "#B00000",
    body: [],
    size: 30,

    draw: function(context, windowX, windowY, scale) {

        //dark peace
        for(var i = 0; i < this.body.length; i++) {
            context.beginPath();
            var radius = this.width - i * i * this.width / this.body.length / this.body.length;
            if (radius > this.tailWidth)
                context.arc((this.body[i].x - windowX) * scale, (this.body[i].y - windowY) * scale,
                    radius * scale, 0, 2 * Math.PI, false);
            context.fillStyle = this.borderColor;
            context.fill();
        }

        //light peace
        for(var i = 0; i < this.body.length; i++) {
            context.beginPath();
            var radius = this.width - i * i * this.width / this.body.length / this.body.length - this.border;
            if (radius > this.borderTailWidth)
                context.arc((this.body[i].x - windowX) * scale, (this.body[i].y - windowY) * scale,
                    radius * scale, 0, 2 * Math.PI, false);
            context.fillStyle = this.color;
            context.fill();
        }

        //head
        drawRotatedImage(context, this.headImage, (this.x - windowX) * scale, (this.y - windowY) * scale, 
            this.headImage.width * scale, this.headImage.height * scale, this.direction, 0);
    },

    update: function() {

        //check collisions
        var cx = this.x + this.size/2 * Math.cos((this.direction - 90)* Math.PI / 180);
        var cy = this.y + this.size/2 * Math.sin((this.direction - 90) * Math.PI / 180);
        for(var i = 1; i < GameManager.entities.length; i++) {
            var e = GameManager.entities[i];
            if (cx > e.x + e.size/2 || cx < e.x - e.size/2 ||
                cy > e.y + e.size/2 || cy < e.y - e.size/2)
                continue;
            if (e.collision) {
                this.alive = false;
                this.deathCause = "hit";
                GameManager.soundManager.play("../sounds/shh.mp3");
                GameManager.saveScore();
            }
            if (e.type === "victim") {
                GameManager.kill(e);
                this.body.push(this.body.slice(-1));
                GameManager.score++;
                GameManager.soundManager.play("../sounds/eat.mp3");
            }
            if (e.type === "enemy") {
                this.alive = false;
                this.deathCause = "killed";
                GameManager.soundManager.play("../sounds/shh.mp3");
                GameManager.saveScore();
            }
        }

        switch(key){
            //right
            case 39:
                this.direction += this.rotateSpeed;
                this.acceleration = this.maxAcceleration;
                if (this.speed < this.pushSpeed) this.speed = this.pushSpeed;
                break;

            //left
            case 37:
                this.direction -= this.rotateSpeed;
                this.acceleration = this.maxAcceleration;
                if (this.speed < this.pushSpeed) this.speed = this.pushSpeed;
                break;

            //no key
            case 0:
                if (this.speed) this.acceleration = this.stopAcceleration;
                else this.acceleration = 0;
                break;
            default: break;
        }
        
        //speed manipulations
        this.speed += this.acceleration;
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < 1) return;

        //replace snake
        for (var i = this.body.length-1; i > 0; i--) {
            this.body[i].x = this.body[i-1].x;
            this.body[i].y = this.body[i-1].y;
        }
        this.body[0].x = this.x;
        this.body[0].y = this.y;
        var dx = this.speed * Math.cos((this.direction - 90)* Math.PI / 180);
        var dy = this.speed * Math.sin((this.direction - 90) * Math.PI / 180);
        this.x += dx;
        this.y += dy;

        //window following
        if (this.x - windowX < 300 || this.x - windowX > window.innerWidth - 300) 
            windowX += dx;
        if (this.y - windowY < 150 || this.y - windowY > window.innerHeight - 150) 
            windowY += dy;

    }
}