var SoundManager = {

    clips: [],
    context: null,
    gainNode: null,
    loaded: false,
    source: null,

    init: function() {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
    },

    load: function(path, callback) {
        if(this.clips[path]) {
            callback(this.clips[path]);
            return;
        }
        var clip = {path: path, buffer: null, loaded: false};
        clip.play = function(volume, loop) {
            SoundManager.play(this.path, 
                {looping: loop?loop:false, volume: volume?volume:1});
        };
        this.clips[path] = clip;
        
        var request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
            SoundManager.context.decodeAudioData(request.response,
                function(buffer) {
                    clip.buffer = buffer;
                    clip.loaded = true;
                    callback(clip);
                }, 
                function(error) {
                    console.error("decodeAudioData error", error);
                });
        };
        request.send();
    },

    loadArray: function(array) {
        for(var i = 0; i < array.length; i++) {
            SoundManager.load(array[i], function() {
                if(array.length === Object.keys(SoundManager.clips).length) {
                    for(s in SoundManager.clips)
                        if (!SoundManager.clips[s].loaded) return;
                    SoundManager.loaded = true;
                }
            });
        }
    },

    play: function(path, settings) {
        if (!SoundManager.loaded) {
            setTimeout(function() {SoundManager.play(path, settings);}, 100);
            return;
        }
        var looping = false;
        var volume = 1;
        if (settings) {
            if (settings.looping) looping = settings.looping;
            if (settings.volume) volume = settings.volume;
        }
        var s = this.clips[path];
        if (s === null) return false;
        var sound = SoundManager.context.createBufferSource();
        sound.buffer = s.buffer;
        sound.connect(SoundManager.gainNode);
        sound.loop = looping;
        SoundManager.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    },

    playWorldSound: function(path, x, y) {
        if (GameManager.snake === null)
            return;
        var viewSize = Math.max(window.innerWidth, window.innerWidth) * 0.5;
        var dx = Math.abs(GameManager.snake.x - x);
        var dy = Math.abs(GameManager.snake.y - y);
        var distance = Math.sqrt(dx * dx + dy * dy);
        var norm = distance / viewSize;
        if (norm > 1) norm = 1;
        var volume = 1.0 - norm;
        if (volume) this.play(path, {looping: false, volume: volume});
    }
}