var windowX = 0;
var windowY = 0;
var defaultWindowWidth = 1366;
var defaultWindowHeight = 638;
var key;
var gameManager;


window.onload = function() {

    gameManager = GameManager;
    gameManager.loadResources();

    document.body.onkeydown = function(event) {key = event.keyCode};
    document.body.onkeyup = function(event) {key = 0};
}

var Entity = {
    x: 0, y: 0, size: 0, direction: 0, speed: 0,
    extend: function(extendEntity) {
        var object = Object.create(this);
        for (var property in extendEntity) {
            if (this.hasOwnProperty(property) || typeof object[property] === "undefined")
                object[property] = extendEntity[property];
        }
        return object;
    }
}

function drawRotatedImage(context, image, x, y, width, height, angle, offset) {
    context.save();
    context.translate(x, y);
    context.rotate(angle*Math.PI/180);
    context.drawImage(image, -width/2, -height/2 + offset, width, height);
    context.restore();
}