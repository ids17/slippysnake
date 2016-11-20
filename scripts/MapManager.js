var MapManager = {

    mapData: null,
    loadedImgCount: 0,
    imgLoaded: false,
    jsonLoaded: false,
    width: 0,
    height: 0,
    tileSize: 0,
    snakeSpawnX: 0,
    snakeSpawnY: 0,
    tileSet: [],
    data: [],
    victimSpawns: [],
    enemySpawns: [],

    loadMap: function(mapIndex) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                MapManager.parseMap(request.responseText);
            }
        }
        request.open("GET", "../maps/" + mapIndex + ".json", true);
        request.send();
    },

    parseMap: function(mapJSON) {

        this.mapData = JSON.parse(mapJSON);
        this.width = this.mapData.width;
        this.height = this.mapData.height;
        this.tileSize = this.mapData.tileSize;
        this.snakeSpawnX = this.mapData.snakeSpawnX;
        this.snakeSpawnY = this.mapData.snakeSpawnY;
        this.data = this.mapData.data;

        //victim spawns
        for (var i = 0; i < this.mapData.victimSpawns.length; i++)
            this.victimSpawns.push({
                x: this.mapData.victimSpawns[i].x * this.tileSize - this.tileSize/2, 
                y: this.mapData.victimSpawns[i].y * this.tileSize - this.tileSize/2
            });

        //enemy spawns
        for (var i = 0; i < this.mapData.enemySpawns.length; i++)
            this.enemySpawns.push({
                x: this.mapData.enemySpawns[i].x * this.tileSize - this.tileSize/2, 
                y: this.mapData.enemySpawns[i].y * this.tileSize - this.tileSize/2
            });
        
        //load tiles
        for (var i = 0; i < this.mapData.tileSet.length; i++) {
            var img = new Image();
            img.onload = function() {
                MapManager.loadedImgCount++;
                if (MapManager.loadedImgCount === MapManager.mapData.tileSet.length)
                    MapManager.imgLoaded = true;
            }
            img.src = this.mapData.tileSet[i].image;
            var tile = {
                collision: this.mapData.tileSet[i].collision,
                image: img
            }
            MapManager.tileSet.push(tile);
        }

        this.jsonLoaded = true;
    },

    drawBackground: function(context, windowX, windowY, scale) {
        for(var i = 0; i < this.height; i++)
            for(var j = 0; j < this.width; j++) {
                var x = (j * this.tileSize - windowX) * scale;
                var y = (i * this.tileSize - windowY) * scale;
                var w =  this.tileSize * scale;
                var h =  this.tileSize * scale;
                if (x > -w && y > -h && x < window.innerWidth + w && y < window.innerHeight + h)
                    context.drawImage(this.tileSet[0].image, x, y, w, h);
            }
    },

    getSnakeStartPosition: function() {
        return {
            x: this.snakeSpawnX * this.tileSize - this.tileSize/2,
            y: this.snakeSpawnY * this.tileSize - this.tileSize/2
        }
    },

    parseMapEntities: function() {
        mapEntities = [];
        for(var i = 0; i < this.height; i++)
            for(var j = 0; j < this.width; j++) {
                if (this.data[i * this.width + j]) {
                    mapEntities.push({
                        x: j * this.tileSize + this.tileSize/2,
                        y: i * this.tileSize + this.tileSize/2,
                        size: this.tileSize,
                        collision: this.tileSet[this.data[i * this.width + j]].collision,
                        image: this.tileSet[this.data[i * this.width + j]].image,
                        type: "mapObject",
                        update: function() {},
                        draw: function(context, windowX, windowY, scale) {
                            var x = (this.x - windowX) * scale;
                            var y = (this.y - windowY) * scale;
                            var size =  this.size * scale;
                            if (x > -size && y > -size && x < window.innerWidth + size && y < window.innerHeight + size)
                                context.drawImage(this.image, x - size/2, y - size/2, size, size);
                        }
                    });
                } 
            }
        return mapEntities;
    }

}