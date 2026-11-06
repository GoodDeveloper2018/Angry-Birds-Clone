// Tiny synthesized sound effects (Web Audio), so the game needs no audio files.
// Browsers only allow audio after a user gesture, so init() is called on the first click.
var Sfx = {
    ctx: null,
    muted: false,
    lastHit: 0,

    init: function () {
        try {
            if (!this.ctx) {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (AC) this.ctx = new AC();
            }
            if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        } catch (e) {
            this.ctx = null;
        }
    },

    // One oscillator note with an optional pitch slide.
    tone: function (freq, dur, type, vol, slideTo, delay) {
        if (this.muted || !this.ctx) return;
        var t0 = this.ctx.currentTime + (delay || 0);
        var osc = this.ctx.createOscillator();
        var gain = this.ctx.createGain();
        osc.type = type || "sine";
        osc.frequency.setValueAtTime(freq, t0);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
        gain.gain.setValueAtTime(vol || 0.15, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    },

    // Short burst of filtered noise (crunch, thud).
    noise: function (dur, vol, cutoff, delay) {
        if (this.muted || !this.ctx) return;
        var t0 = this.ctx.currentTime + (delay || 0);
        var len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
        var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        var src = this.ctx.createBufferSource();
        src.buffer = buf;
        var filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = cutoff || 1200;
        var gain = this.ctx.createGain();
        gain.gain.value = vol || 0.2;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(t0);
    },

    click: function () { this.tone(520, 0.06, "square", 0.06); },
    launch: function () { this.tone(280, 0.28, "sawtooth", 0.1, 900); },
    hit: function (strength) {
        var now = Date.now();
        if (now - this.lastHit < 70) return;
        this.lastHit = now;
        this.noise(0.08, Math.min(0.25, 0.05 + strength * 0.02), 700);
    },
    wood: function () { this.noise(0.22, 0.22, 1800); this.tone(160, 0.12, "square", 0.05, 80); },
    pig: function () {
        this.tone(420, 0.25, "square", 0.1, 120);
        this.noise(0.18, 0.12, 900);
    },
    win: function () {
        var notes = [523, 659, 784, 1047];
        for (var i = 0; i < notes.length; i++) this.tone(notes[i], 0.22, "triangle", 0.14, null, i * 0.13);
    },
    lose: function () {
        var notes = [392, 330, 262, 196];
        for (var i = 0; i < notes.length; i++) this.tone(notes[i], 0.28, "triangle", 0.14, null, i * 0.17);
    },
    star: function (i) { this.tone(660 + i * 180, 0.18, "triangle", 0.12); }
};
