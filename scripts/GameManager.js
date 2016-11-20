var GameManager = {

    mapManager: null,
    soundManager: null,
    factory: {},
    entities: [],
    laterKill: [],
    snake: null,
    resourceCount: 6,
    loadedCount: 0,
    context: null,
    score: 0,
    bestScore: 0,
    sounds: ["../sounds/eat.mp3", "../sounds/shh.mp3", "../sounds/frr.mp3"],
    sprites: ["snake_head", "victim0", "victim1", "enemy", "hit", "killed"],

    initSnake: function(object) {
        this.snake = object;
        this.entities.push(object);
    },

    kill: function(object) {
        this.laterKill.push(object);
    },

    update: function() {
        
        if (this.snake.alive) {

            //update entities
            this.entities.forEach(function(entity) {
                entity.update();
            });

            //kill entities
            for (var i = 0; i < this.laterKill.length; i++) {
                var index = this.entities.indexOf(this.laterKill[i]);
                if (index != -1) {
                    if (this.entities[index].type == "victim") this.createVictim("random");
                    this.entities.splice(index, 1);
                }
            }
            this.laterKill = [];

        } else {
            if (key == 13) window.location.reload();
        }
        this.render();        
    },

    render: function() {

        //prerpare canvas
        this.context.canvas.width  = window.innerWidth;
        this.context.canvas.height = window.innerHeight;
        var scale = window.innerWidth / defaultWindowWidth;

        //clear screen
        this.context.rect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fillStyle = "black";
        this.context.fill();

        //black screen of death
        if (!this.snake.alive) {
            var img = this.sprites[this.snake.deathCause];
            this.context.drawImage(img, window.innerWidth/2 - img.width/2 * scale, 
                window.innerHeight/2 - img.height/2 * scale, img.width * scale, img.height * scale);
            this.context.fillStyle = "white";
            this.context.font = Math.floor(20 * scale) + "px Arial";
            this.context.fillText("Your score: " + this.score,  window.innerWidth/2 - (img.width/2 - 90) * scale, 
                window.innerHeight/2 - (img.height/2 + 40) * scale);
            this.context.fillText("Best score: " + this.bestScore,  window.innerWidth/2 - (img.width/2 - 90) * scale, 
                window.innerHeight/2 - (img.height/2 + 10) * scale);
            return;
        }

        //draw objects
        this.mapManager.drawBackground(this.context, windowX, windowY, scale);
        this.entities.forEach(function(entity) {
            if (entity.type === "victim") entity.draw(GameManager.context, windowX, windowY, scale);
        });
        this.snake.draw(GameManager.context, windowX, windowY, scale);
        this.entities.forEach(function(entity) {
            if (entity.type === "enemy") entity.draw(GameManager.context, windowX, windowY, scale);
        });
        this.entities.forEach(function(entity) {
            if (entity.type === "mapObject") entity.draw(GameManager.context, windowX, windowY, scale);
        });

        //draw score
        this.context.fillStyle = "white";
        this.context.font = "20px Arial";
        this.context.fillText("Score: " + this.score, 10, 25);
        this.context.fill();

    },

    loadResources: function() {

        //load map
        this.mapManager = MapManager;
        this.mapManager.loadMap(0);

        //load sprites
        for(var i = 0; i < this.sprites.length; i++) {
            var name = this.sprites[i];
            this.sprites[name] = new Image();
            this.sprites[name].onload = function() {
                gameManager.loadedCount++;
            }
            this.sprites[name].src = "../img/" + name + ".png";
        }

        //load sound manager
        this.soundManager = SoundManager;
        this.soundManager.init();
        this.soundManager.loadArray(this.sounds);

        //load game objects
        this.factory["Snake"] = Snake;
        this.factory["Victim"] = Victim;
        this.factory["Enemy"] = Enemy;

        //start synchronized init
        startInit = function() {
            if (gameManager.loadedCount == gameManager.resourceCount &&
                gameManager.mapManager.imgLoaded && 
                gameManager.mapManager.jsonLoaded)
                gameManager.init();
            else
                setTimeout(startInit, 200);
        }
        startInit();

    },

    init: function() {
        
        this.context = document.getElementById("canvas").getContext("2d");

        //snake
        var snake = Entity.extend(this.factory["Snake"]);
        var snakePosition = this.mapManager.getSnakeStartPosition();
        snake.x = snakePosition.x;
        snake.y = snakePosition.y;
        snake.headImage = this.sprites["snake_head"];
        for (var i = 0; i < snake.length; i++)
            snake.body.push({x: snake.x, y: snake.y + i * snake.maxSpeed});
        this.initSnake(snake);

        //victims
        for (var i = 0; i < this.mapManager.victimSpawns.length; i++) 
            this.createVictim(i);

        //enemies
        for (var i = 0; i < this.mapManager.enemySpawns.length; i++)
            this.createEnemy(i);

        //map entities
        var mapEntities = this.mapManager.parseMapEntities();
        for(var i = 0; i < mapEntities.length; i++)
            this.entities.push(mapEntities[i]);

        windowX = this.snake.x - window.innerWidth / 2;
        windowY = this.snake.y - window.innerHeight / 2;
        this.start();    
    },

    start: function() {
        setInterval(function() { GameManager.update(); }, 20);
    },

    createVictim: function(spawnIndex) {
        var victim = Entity.extend(this.factory["Victim"]);
        var spawn;
        if (spawnIndex === "random") spawnIndex = Math.floor(Math.random()*this.mapManager.victimSpawns.length);
        victim.x = this.mapManager.victimSpawns[spawnIndex].x;
        victim.y = this.mapManager.victimSpawns[spawnIndex].y;
        victim.size = 30;
        victim.direction = Math.random() * 360;
        victim.state = victim.wander;
        victim.image[0] = this.sprites["victim0"];
        victim.image[1] = this.sprites["victim1"];
        this.entities.push(victim);
    },

    createEnemy: function(spawnIndex) {
        var enemy = Entity.extend(this.factory["Enemy"]);
        enemy.x = this.mapManager.enemySpawns[spawnIndex].x;
        enemy.y = this.mapManager.enemySpawns[spawnIndex].y;
        enemy.size = 45;
        enemy.direction = Math.random() * 360;
        enemy.state = enemy.wander;
        enemy.image = this.sprites["enemy"];
        this.entities.push(enemy);
    },

    saveScore: function() {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                GameManager.bestScore = request.responseText;
            }
        }
        request.open("GET", "../php/save_score.php?score=" + this.score, false);
        request.send();
    }

}