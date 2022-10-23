var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// ../Shaku/lib/manager.js
var require_manager = __commonJS({
  "../Shaku/lib/manager.js"(exports, module) {
    "use strict";
    var IManager = class {
      setup() {
        throw new Error("Not Implemented!");
      }
      startFrame() {
        throw new Error("Not Implemented!");
      }
      endFrame() {
        throw new Error("Not Implemented!");
      }
      destroy() {
        throw new Error("Not Implemented!");
      }
    };
    module.exports = IManager;
  }
});

// ../Shaku/lib/logger.js
var require_logger = __commonJS({
  "../Shaku/lib/logger.js"(exports, module) {
    "use strict";
    var _drivers = console;
    var _application = "Shaku";
    var Logger = class {
      constructor(name) {
        this._nameHeader = "[" + _application + "][" + name + "]";
        this._throwErrors = false;
      }
      trace(msg) {
        _drivers.trace(this._nameHeader, msg);
      }
      debug(msg) {
        _drivers.debug(this._nameHeader, msg);
      }
      info(msg) {
        _drivers.info(this._nameHeader, msg);
      }
      warn(msg) {
        _drivers.warn(this._nameHeader, msg);
        if (this._throwErrors) {
          throw new Error(msg);
        }
      }
      error(msg) {
        _drivers.error(this._nameHeader, msg);
        if (this._throwErrors) {
          throw new Error(msg);
        }
      }
      throwErrorOnWarnings(enable) {
        this._throwErrors = Boolean(enable);
      }
    };
    var NullDrivers = class {
      constructor() {
      }
      trace(msg) {
      }
      debug(msg) {
      }
      info(msg) {
      }
      warn(msg) {
      }
      error(msg) {
      }
    };
    module.exports = {
      getLogger: function(name) {
        return new Logger(name);
      },
      silent: function() {
        _drivers = new NullDrivers();
      },
      setDrivers: function(drivers) {
        _drivers = drivers;
      },
      setApplicationName: function(name) {
        _application = name;
        return this;
      }
    };
  }
});

// ../Shaku/lib/assets/asset.js
var require_asset = __commonJS({
  "../Shaku/lib/assets/asset.js"(exports, module) {
    "use strict";
    var Asset = class {
      constructor(url) {
        this._url = url;
        this._waitingCallbacks = [];
      }
      onReady(callback) {
        if (this.valid || this._waitingCallbacks === null) {
          callback(this);
          return;
        }
        this._waitingCallbacks.push(callback);
      }
      waitForReady() {
        return new Promise((resolve, reject2) => {
          this.onReady(resolve);
        });
      }
      _notifyReady() {
        if (this._waitingCallbacks) {
          for (let i = 0; i < this._waitingCallbacks.length; ++i) {
            this._waitingCallbacks[i](this);
          }
          this._waitingCallbacks = null;
        }
      }
      get url() {
        return this._url;
      }
      get valid() {
        throw new Error("Not Implemented!");
      }
      load(params) {
        throw new Error("Not Implemented!");
      }
      create(source, params) {
        throw new Error("Not Supported for this asset type.");
      }
      destroy() {
        throw new Error("Not Implemented!");
      }
    };
    module.exports = Asset;
  }
});

// ../Shaku/lib/assets/sound_asset.js
var require_sound_asset = __commonJS({
  "../Shaku/lib/assets/sound_asset.js"(exports, module) {
    "use strict";
    var Asset = require_asset();
    var SoundAsset = class extends Asset {
      constructor(url) {
        super(url);
        this._valid = false;
      }
      load() {
        return new Promise((resolve, reject2) => {
          let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          var request = new XMLHttpRequest();
          request.open("GET", this.url, true);
          request.responseType = "arraybuffer";
          request.onload = () => {
            var audioData = request.response;
            this._valid = true;
            this._notifyReady();
            audioCtx.decodeAudioData(
              audioData,
              function(buffer) {
                resolve();
              },
              (e) => {
                reject2(e.err);
              }
            );
          };
          request.onerror = (e) => {
            reject2(e);
          };
          request.send();
        });
      }
      get valid() {
        return this._valid;
      }
      destroy() {
        this._valid = false;
      }
    };
    module.exports = SoundAsset;
  }
});

// ../Shaku/lib/sfx/sound_instance.js
var require_sound_instance = __commonJS({
  "../Shaku/lib/sfx/sound_instance.js"(exports, module) {
    "use strict";
    var _logger = require_logger().getLogger("sfx");
    var SoundInstance = class {
      constructor(sfxManager, url) {
        if (!url) {
          _logger.error("Sound type can't be null or invalid!");
          throw new Error("Invalid sound type to play in SoundInstance!");
        }
        this._sfx = sfxManager;
        this._audio = new Audio(url);
        this._volume = 1;
      }
      disposeWhenDone() {
        this._audio.onended = () => {
          this.dispose();
        };
      }
      dispose() {
        this._audio.src = "";
        this._audio.srcObject = null;
        this._audio.remove();
        this._audio = null;
      }
      play() {
        if (this.playing) {
          return;
        }
        let promise = this._audio.play();
        this._sfx._playingSounds.add(this);
        return promise;
      }
      get playbackRate() {
        return this._audio.playbackRate;
      }
      set playbackRate(val) {
        if (val < 0.1) {
          _logger.error("playbackRate value set is too low, value was capped to 0.1.");
        }
        if (val > 10) {
          _logger.error("playbackRate value set is too high, value was capped to 10.");
        }
        this._audio.playbackRate = val;
      }
      get preservesPitch() {
        return Boolean(this._audio.preservesPitch || this._audio.mozPreservesPitch);
      }
      set preservesPitch(val) {
        return this._audio.preservesPitch = this._audio.mozPreservesPitch = Boolean(val);
      }
      pause() {
        this._audio.pause();
      }
      replay() {
        this.stop();
        return this.play();
      }
      stop() {
        try {
          this.pause();
          this.currentTime = 0;
          return true;
        } catch (e) {
          return false;
        }
      }
      get loop() {
        return this._audio.loop;
      }
      set loop(value) {
        this._audio.loop = value;
        return this._audio.loop;
      }
      get volume() {
        return this._volume;
      }
      set volume(value) {
        this._volume = value;
        var volume = value * SoundInstance._masterVolume;
        if (volume < 0) {
          volume = 0;
        }
        if (volume > 1) {
          volume = 1;
        }
        this._audio.volume = volume;
        return this._volume;
      }
      get currentTime() {
        return this._audio.currentTime;
      }
      set currentTime(value) {
        return this._audio.currentTime = value;
      }
      get duration() {
        return this._audio.duration;
      }
      get paused() {
        return this._audio.paused;
      }
      get playing() {
        return !this.paused && !this.finished;
      }
      get finished() {
        return this._audio.ended;
      }
    };
    SoundInstance._masterVolume = 1;
    module.exports = SoundInstance;
  }
});

// ../Shaku/lib/sfx/sound_mixer.js
var require_sound_mixer = __commonJS({
  "../Shaku/lib/sfx/sound_mixer.js"(exports, module) {
    "use strict";
    var SoundInstance = require_sound_instance();
    var SoundMixer = class {
      constructor(sound1, sound2, allowOverlapping) {
        this._sound1 = sound1;
        this._sound2 = sound2;
        this.fromSoundVolume = this._sound1 ? this._sound1.volume : 0;
        this.toSoundVolume = this._sound2 ? this._sound2.volume : 0;
        this.allowOverlapping = allowOverlapping;
        this.update(0);
      }
      stop() {
        if (this._sound1) {
          this._sound1.stop();
        }
        if (this._sound2) {
          this._sound2.stop();
        }
      }
      get fromSound() {
        return this._sound1;
      }
      get toSound() {
        return this._sound2;
      }
      get progress() {
        return this._progress;
      }
      updateDelta(delta) {
        this.update(this._progress + delta);
      }
      update(progress) {
        if (progress <= 0) {
          if (this._sound1) {
            this._sound1.volume = this.fromSoundVolume;
          }
          if (this._sound2) {
            this._sound2.volume = 0;
            this._sound2.stop();
          }
          this._progress = 0;
        }
        if (progress >= 1) {
          if (this._sound2) {
            this._sound2.volume = this.toSoundVolume;
          }
          if (this._sound1) {
            this._sound1.volume = 0;
            this._sound1.stop();
          }
          this._progress = 1;
        } else {
          this._progress = progress;
          if (this._sound1) {
            this._sound1.play();
          }
          if (this._sound2) {
            this._sound2.play();
          }
          if (this.allowOverlapping) {
            if (this._sound1) {
              this._sound1.volume = this.fromSoundVolume * (1 - progress);
            }
            if (this._sound2) {
              this._sound2.volume = this.toSoundVolume * progress;
            }
          } else {
            progress *= 2;
            if (this._sound1) {
              this._sound1.volume = Math.max(this.fromSoundVolume * (1 - progress), 0);
            }
            if (this._sound2) {
              this._sound2.volume = Math.max(this.toSoundVolume * (progress - 1), 0);
            }
          }
        }
      }
    };
    module.exports = SoundMixer;
  }
});

// ../Shaku/lib/sfx/sfx.js
var require_sfx = __commonJS({
  "../Shaku/lib/sfx/sfx.js"(exports, module) {
    "use strict";
    var SoundAsset = require_sound_asset();
    var IManager = require_manager();
    var _logger = require_logger().getLogger("sfx");
    var SoundInstance = require_sound_instance();
    var SoundMixer = require_sound_mixer();
    var Sfx = class extends IManager {
      constructor() {
        super();
        this._playingSounds = null;
      }
      setup() {
        return new Promise((resolve, reject2) => {
          _logger.info("Setup sfx manager..");
          this._playingSounds = /* @__PURE__ */ new Set();
          resolve();
        });
      }
      startFrame() {
        var playingSounds = Array.from(this._playingSounds);
        for (var i = 0; i < playingSounds.length; ++i) {
          var sound = playingSounds[i];
          if (!sound.isPlaying) {
            this._playingSounds.delete(sound);
          }
        }
      }
      endFrame() {
        var playingSounds = Array.from(this._playingSounds);
        for (var i = 0; i < playingSounds.length; ++i) {
          var sound = playingSounds[i];
          if (!sound.isPlaying) {
            this._playingSounds.delete(sound);
          }
        }
      }
      destroy() {
        this.stopAll();
        this._playingSounds = /* @__PURE__ */ new Set();
      }
      get SoundMixer() {
        return SoundMixer;
      }
      play(sound, volume, playbackRate, preservesPitch) {
        var sound = this.createSound(sound);
        sound.volume = volume !== void 0 ? volume : 1;
        if (playbackRate !== void 0) {
          sound.playbackRate = playbackRate;
        }
        if (preservesPitch !== void 0) {
          sound.preservesPitch = preservesPitch;
        }
        let ret = sound.play();
        sound.disposeWhenDone();
        return ret;
      }
      stopAll() {
        var playingSounds = Array.from(this._playingSounds);
        for (var i = 0; i < playingSounds.length; ++i) {
          var sound = playingSounds[i];
          sound.stop();
        }
        this._playingSounds = /* @__PURE__ */ new Set();
      }
      get playingSoundsCount() {
        return this._playingSounds.size;
      }
      createSound(sound) {
        if (!(sound instanceof SoundAsset)) {
          throw new Error("Sound type must be an instance of SoundAsset!");
        }
        var ret = new SoundInstance(this, sound.url);
        return ret;
      }
      get masterVolume() {
        return SoundInstance._masterVolume;
      }
      set masterVolume(value) {
        SoundInstance._masterVolume = value;
        return value;
      }
    };
    module.exports = new Sfx();
  }
});

// ../Shaku/lib/sfx/index.js
var require_sfx2 = __commonJS({
  "../Shaku/lib/sfx/index.js"(exports, module) {
    "use strict";
    module.exports = require_sfx();
  }
});

// ../Shaku/lib/utils/math_helper.js
var require_math_helper = __commonJS({
  "../Shaku/lib/utils/math_helper.js"(exports, module) {
    "use strict";
    var _toRadsFactor = Math.PI / 180;
    var _toDegreesFactor = 180 / Math.PI;
    var MathHelper = class {
      static lerp(start, end, amount) {
        if (start === end) {
          return end;
        }
        return (1 - amount) * start + amount * end;
      }
      static dot(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
      }
      static toRadians(degrees) {
        return degrees * _toRadsFactor;
      }
      static toDegrees(radians) {
        return radians * _toDegreesFactor;
      }
      static radiansDistanceSigned(a1, a2) {
        var max = Math.PI * 2;
        var da = (a2 - a1) % max;
        return 2 * da % max - da;
      }
      static radiansDistance(a1, a2) {
        return Math.abs(this.radiansDistanceSigned(a1, a2));
      }
      static degreesDistanceSigned(a1, a2) {
        let a1r = a1 * _toRadsFactor;
        let a2r = a2 * _toRadsFactor;
        let ret = this.radiansDistanceSigned(a1r, a2r);
        return ret * _toDegreesFactor;
      }
      static degreesDistance(a1, a2) {
        let a1r = a1 * _toRadsFactor;
        let a2r = a2 * _toRadsFactor;
        let ret = this.radiansDistance(a1r, a2r);
        return ret * _toDegreesFactor;
      }
      static lerpRadians(a1, a2, alpha) {
        if (a1 === a2) {
          return a2;
        }
        return a1 + this.radiansDistanceSigned(a1, a2) * alpha;
      }
      static lerpDegrees(a1, a2, alpha) {
        if (a1 === a2) {
          return a2;
        }
        a1 = this.toRadians(a1);
        a2 = this.toRadians(a2);
        var ret = this.lerpRadians(a1, a2, alpha);
        return this.toDegrees(ret);
      }
      static round10(num) {
        return Math.round(num * 1e8) / 1e8;
      }
      static wrapDegrees(degrees) {
        degrees = degrees % 360;
        if (degrees < 0) {
          degrees += 360;
        }
        return degrees;
      }
    };
    MathHelper.PI2 = Math.PI * 2;
    module.exports = MathHelper;
  }
});

// ../Shaku/lib/utils/color.js
var require_color = __commonJS({
  "../Shaku/lib/utils/color.js"(exports, module) {
    "use strict";
    var MathHelper = require_math_helper();
    var Color2 = class {
      constructor(r, g, b, a) {
        this.set(r, g, b, a);
      }
      set(r, g, b, a) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a === void 0 ? 1 : a;
        this._asHex = null;
        return this;
      }
      setByte(r, g, b, a) {
        this._r = r / 255;
        this._g = g / 255;
        this._b = b / 255;
        this._a = a === void 0 ? 1 : a / 255;
        this._asHex = null;
        return this;
      }
      copy(other) {
        this.set(other.r, other.g, other.b, other.a);
        return this;
      }
      get r() {
        return this._r;
      }
      get g() {
        return this._g;
      }
      get b() {
        return this._b;
      }
      get a() {
        return this._a;
      }
      set r(val) {
        this._r = val;
        this._asHex = null;
        return this._r;
      }
      set g(val) {
        this._g = val;
        this._asHex = null;
        return this._g;
      }
      set b(val) {
        this._b = val;
        this._asHex = null;
        return this._b;
      }
      set a(val) {
        this._a = val;
        this._asHex = null;
        return this._a;
      }
      static componentToHex(c) {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      get asHex() {
        if (!this._asHex) {
          this._asHex = "#" + Color2.componentToHex(this.r * 255) + Color2.componentToHex(this.g * 255) + Color2.componentToHex(this.b * 255) + Color2.componentToHex(this.a * 255);
        }
        return this._asHex;
      }
      static fromHex(val) {
        if (typeof val !== "string" && val[0] != "#") {
          throw new PintarJS.Error("Invalid color format!");
        }
        var parsed = hexToColor(val);
        if (!parsed) {
          throw new Error("Invalid hex value to parse!");
        }
        return new Color2(parsed.r, parsed.g, parsed.b, 1);
      }
      static fromDecimal(val, includeAlpha) {
        let ret = new Color2(1, 1, 1, 1);
        if (includeAlpha) {
          ret.a = (val & 255) / 255;
          val = val >> 8;
        }
        ret.b = (val & 255) / 255;
        val = val >> 8;
        ret.g = (val & 255) / 255;
        val = val >> 8;
        ret.r = (val & 255) / 255;
      }
      static fromDict(data) {
        return new Color2(
          data.r !== void 0 ? data.r : 1,
          data.g !== void 0 ? data.g : 1,
          data.b !== void 0 ? data.b : 1,
          data.a !== void 0 ? data.a : 1
        );
      }
      toDict(minimized) {
        if (minimized) {
          const ret = {};
          if (this.r !== 1) {
            ret.r = this.r;
          }
          if (this.g !== 1) {
            ret.g = this.g;
          }
          if (this.b !== 1) {
            ret.b = this.b;
          }
          if (this.a !== 1) {
            ret.a = this.a;
          }
          return ret;
        }
        return { r: this.r, g: this.g, b: this.b, a: this.a };
      }
      get asDecimalRGBA() {
        return (Math.round(this.r * 255) << 8 * 3 | Math.round(this.g * 255) << 8 * 2 | Math.round(this.b * 255) << 8 * 1 | Math.round(this.a * 255)) >>> 0;
      }
      get asDecimalABGR() {
        return (Math.round(this.a * 255) << 8 * 3 | Math.round(this.b * 255) << 8 * 2 | Math.round(this.g * 255) << 8 * 1 | Math.round(this.r * 255)) >>> 0;
      }
      get floatArray() {
        return [this.r, this.g, this.b, this.a];
      }
      clone() {
        return new Color2(this.r, this.g, this.b, this.a);
      }
      string() {
        return this.r + "," + this.g + "," + this.b + "," + this.a;
      }
      get isBlack() {
        return this.r == 0 && this.g == 0 && this.b == 0;
      }
      static random(includeAlpha) {
        return new Color2(Math.random(), Math.random(), Math.random(), includeAlpha ? Math.random() : 1);
      }
      static fromBytesArray(bytes) {
        return new Color2(bytes[0] / 255, bytes[1] / 255, bytes[2] / 255, bytes[3] !== void 0 ? bytes[3] / 255 : 1);
      }
      get isTransparentBlack() {
        return this._r == this._g && this._g == this._b && this._b == this._a && this._a == 0;
      }
      static get webColorNames() {
        return colorKeys;
      }
      equals(other) {
        return this === other || other && other.constructor === this.constructor && this._r == other._r && this._g == other._g && this._b == other._b && this._a == other._a;
      }
      static lerp(p1, p2, a) {
        let lerpScalar = MathHelper.lerp;
        return new Color2(
          lerpScalar(p1.r, p2.r, a),
          lerpScalar(p1.g, p2.g, a),
          lerpScalar(p1.b, p2.b, a),
          lerpScalar(p1.a, p2.a, a)
        );
      }
    };
    var colorNameToHex = {
      "aliceblue": "#f0f8ff",
      "antiquewhite": "#faebd7",
      "aqua": "#00ffff",
      "aquamarine": "#7fffd4",
      "azure": "#f0ffff",
      "beige": "#f5f5dc",
      "bisque": "#ffe4c4",
      "black": "#000000",
      "blanchedalmond": "#ffebcd",
      "blue": "#0000ff",
      "blueviolet": "#8a2be2",
      "brown": "#a52a2a",
      "burlywood": "#deb887",
      "cadetblue": "#5f9ea0",
      "chartreuse": "#7fff00",
      "chocolate": "#d2691e",
      "coral": "#ff7f50",
      "cornflowerblue": "#6495ed",
      "cornsilk": "#fff8dc",
      "crimson": "#dc143c",
      "cyan": "#00ffff",
      "darkblue": "#00008b",
      "darkcyan": "#008b8b",
      "darkgoldenrod": "#b8860b",
      "darkgray": "#a9a9a9",
      "darkgreen": "#006400",
      "darkkhaki": "#bdb76b",
      "darkmagenta": "#8b008b",
      "darkolivegreen": "#556b2f",
      "darkorange": "#ff8c00",
      "darkorchid": "#9932cc",
      "darkred": "#8b0000",
      "darksalmon": "#e9967a",
      "darkseagreen": "#8fbc8f",
      "darkslateblue": "#483d8b",
      "darkslategray": "#2f4f4f",
      "darkturquoise": "#00ced1",
      "darkviolet": "#9400d3",
      "deeppink": "#ff1493",
      "deepskyblue": "#00bfff",
      "dimgray": "#696969",
      "dodgerblue": "#1e90ff",
      "firebrick": "#b22222",
      "floralwhite": "#fffaf0",
      "forestgreen": "#228b22",
      "fuchsia": "#ff00ff",
      "gainsboro": "#dcdcdc",
      "ghostwhite": "#f8f8ff",
      "gold": "#ffd700",
      "goldenrod": "#daa520",
      "gray": "#808080",
      "green": "#008000",
      "greenyellow": "#adff2f",
      "honeydew": "#f0fff0",
      "hotpink": "#ff69b4",
      "indianred ": "#cd5c5c",
      "indigo": "#4b0082",
      "ivory": "#fffff0",
      "khaki": "#f0e68c",
      "lavender": "#e6e6fa",
      "lavenderblush": "#fff0f5",
      "lawngreen": "#7cfc00",
      "lemonchiffon": "#fffacd",
      "lightblue": "#add8e6",
      "lightcoral": "#f08080",
      "lightcyan": "#e0ffff",
      "lightgoldenrodyellow": "#fafad2",
      "lightgrey": "#d3d3d3",
      "lightgreen": "#90ee90",
      "lightpink": "#ffb6c1",
      "lightsalmon": "#ffa07a",
      "lightseagreen": "#20b2aa",
      "lightskyblue": "#87cefa",
      "lightslategray": "#778899",
      "lightsteelblue": "#b0c4de",
      "lightyellow": "#ffffe0",
      "lime": "#00ff00",
      "limegreen": "#32cd32",
      "linen": "#faf0e6",
      "magenta": "#ff00ff",
      "maroon": "#800000",
      "mediumaquamarine": "#66cdaa",
      "mediumblue": "#0000cd",
      "mediumorchid": "#ba55d3",
      "mediumpurple": "#9370d8",
      "mediumseagreen": "#3cb371",
      "mediumslateblue": "#7b68ee",
      "mediumspringgreen": "#00fa9a",
      "mediumturquoise": "#48d1cc",
      "mediumvioletred": "#c71585",
      "midnightblue": "#191970",
      "mintcream": "#f5fffa",
      "mistyrose": "#ffe4e1",
      "moccasin": "#ffe4b5",
      "navajowhite": "#ffdead",
      "navy": "#000080",
      "oldlace": "#fdf5e6",
      "olive": "#808000",
      "olivedrab": "#6b8e23",
      "orange": "#ffa500",
      "orangered": "#ff4500",
      "orchid": "#da70d6",
      "palegoldenrod": "#eee8aa",
      "palegreen": "#98fb98",
      "paleturquoise": "#afeeee",
      "palevioletred": "#d87093",
      "papayawhip": "#ffefd5",
      "peachpuff": "#ffdab9",
      "peru": "#cd853f",
      "pink": "#ffc0cb",
      "plum": "#dda0dd",
      "powderblue": "#b0e0e6",
      "purple": "#800080",
      "rebeccapurple": "#663399",
      "red": "#ff0000",
      "rosybrown": "#bc8f8f",
      "royalblue": "#4169e1",
      "saddlebrown": "#8b4513",
      "salmon": "#fa8072",
      "sandybrown": "#f4a460",
      "seagreen": "#2e8b57",
      "seashell": "#fff5ee",
      "sienna": "#a0522d",
      "silver": "#c0c0c0",
      "skyblue": "#87ceeb",
      "slateblue": "#6a5acd",
      "slategray": "#708090",
      "snow": "#fffafa",
      "springgreen": "#00ff7f",
      "steelblue": "#4682b4",
      "tan": "#d2b48c",
      "teal": "#008080",
      "thistle": "#d8bfd8",
      "tomato": "#ff6347",
      "turquoise": "#40e0d0",
      "violet": "#ee82ee",
      "wheat": "#f5deb3",
      "white": "#ffffff",
      "whitesmoke": "#f5f5f5",
      "yellow": "#ffff00",
      "yellowgreen": "#9acd32"
    };
    for (key in colorNameToHex) {
      if (colorNameToHex.hasOwnProperty(key)) {
        colorValue = hexToColor(colorNameToHex[key]);
        (function(_colValue) {
          Object.defineProperty(Color2, key, {
            get: function() {
              return _colValue.clone();
            }
          });
        })(colorValue);
      }
    }
    var colorValue;
    var key;
    var colorKeys = Object.keys(colorNameToHex);
    Object.freeze(colorKeys);
    Object.defineProperty(Color2, "transparent", {
      get: function() {
        return new Color2(0, 0, 0, 0);
      }
    });
    Object.defineProperty(Color2, "transwhite", {
      get: function() {
        return new Color2(1, 1, 1, 0);
      }
    });
    function hexToColor(hex) {
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      var components = result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : null;
      if (!components) {
        throw new Error("Invalid hex value to parse!");
      }
      return new Color2(components.r, components.g, components.b, 1);
    }
    module.exports = Color2;
  }
});

// ../Shaku/lib/gfx/blend_modes.js
var require_blend_modes = __commonJS({
  "../Shaku/lib/gfx/blend_modes.js"(exports, module) {
    "use strict";
    var BlendModes2 = {
      AlphaBlend: "alpha",
      Opaque: "opaque",
      Additive: "additive",
      Multiply: "multiply",
      Subtract: "subtract",
      Screen: "screen",
      Overlay: "overlay",
      Invert: "invert",
      Darken: "darken",
      DestIn: "dest-in",
      DestOut: "dest-out"
    };
    Object.defineProperty(BlendModes2, "_values", {
      value: new Set(Object.values(BlendModes2)),
      writable: false
    });
    Object.freeze(BlendModes2);
    module.exports = { BlendModes: BlendModes2 };
  }
});

// ../Shaku/lib/utils/vector2.js
var require_vector2 = __commonJS({
  "../Shaku/lib/utils/vector2.js"(exports, module) {
    "use strict";
    var MathHelper = require_math_helper();
    var Vector22 = class {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      clone() {
        return new Vector22(this.x, this.y);
      }
      set(x, y) {
        this.x = x;
        this.y = y;
        return this;
      }
      copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
      }
      add(other) {
        if (typeof other === "number") {
          return new Vector22(this.x + other, this.y + (arguments[1] === void 0 ? other : arguments[1]));
        }
        return new Vector22(this.x + other.x, this.y + other.y);
      }
      sub(other) {
        if (typeof other === "number") {
          return new Vector22(this.x - other, this.y - (arguments[1] === void 0 ? other : arguments[1]));
        }
        return new Vector22(this.x - other.x, this.y - other.y);
      }
      div(other) {
        if (typeof other === "number") {
          return new Vector22(this.x / other, this.y / (arguments[1] === void 0 ? other : arguments[1]));
        }
        return new Vector22(this.x / other.x, this.y / other.y);
      }
      mul(other) {
        if (typeof other === "number") {
          return new Vector22(this.x * other, this.y * (arguments[1] === void 0 ? other : arguments[1]));
        }
        return new Vector22(this.x * other.x, this.y * other.y);
      }
      round() {
        return new Vector22(Math.round(this.x), Math.round(this.y));
      }
      floor() {
        return new Vector22(Math.floor(this.x), Math.floor(this.y));
      }
      ceil() {
        return new Vector22(Math.ceil(this.x), Math.ceil(this.y));
      }
      normalized() {
        if (this.x == 0 && this.y == 0) {
          return Vector22.zero;
        }
        let mag = this.length;
        return new Vector22(this.x / mag, this.y / mag);
      }
      rotatedRadians(radians) {
        return Vector22.fromRadians(this.getRadians() + radians).mulSelf(this.length);
      }
      rotatedDegrees(degrees) {
        return Vector22.fromDegree(this.getDegrees() + degrees).mulSelf(this.length);
      }
      addSelf(other) {
        if (typeof other === "number") {
          this.x += other;
          this.y += arguments[1] === void 0 ? other : arguments[1];
        } else {
          this.x += other.x;
          this.y += other.y;
        }
        return this;
      }
      subSelf(other) {
        if (typeof other === "number") {
          this.x -= other;
          this.y -= arguments[1] === void 0 ? other : arguments[1];
        } else {
          this.x -= other.x;
          this.y -= other.y;
        }
        return this;
      }
      divSelf(other) {
        if (typeof other === "number") {
          this.x /= other;
          this.y /= arguments[1] === void 0 ? other : arguments[1];
        } else {
          this.x /= other.x;
          this.y /= other.y;
        }
        return this;
      }
      mulSelf(other) {
        if (typeof other === "number") {
          this.x *= other;
          this.y *= arguments[1] === void 0 ? other : arguments[1];
        } else {
          this.x *= other.x;
          this.y *= other.y;
        }
        return this;
      }
      roundSelf() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
      }
      floorSelf() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
      }
      ceilSelf() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
      }
      normalizeSelf() {
        if (this.x == 0 && this.y == 0) {
          return this;
        }
        let mag = this.length;
        this.x /= mag;
        this.y /= mag;
        return this;
      }
      equals(other) {
        return this === other || other.constructor === this.constructor && this.x === other.x && this.y === other.y;
      }
      approximate(other, threshold) {
        threshold = threshold || 1;
        return this === other || Math.abs(this.x - other.x) <= threshold && Math.abs(this.y - other.y) <= threshold;
      }
      get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
      scaled(fac) {
        return new Vector22(this.x * fac, this.y * fac);
      }
      static get zero() {
        return new Vector22();
      }
      static get one() {
        return new Vector22(1, 1);
      }
      static get half() {
        return new Vector22(0.5, 0.5);
      }
      static get left() {
        return new Vector22(-1, 0);
      }
      static get right() {
        return new Vector22(1, 0);
      }
      static get up() {
        return new Vector22(0, -1);
      }
      static get down() {
        return new Vector22(0, 1);
      }
      static get random() {
        return Vector22.fromDegree(Math.random() * 360);
      }
      degreesTo(other) {
        return Vector22.degreesBetween(this, other);
      }
      radiansTo(other) {
        return Vector22.radiansBetween(this, other);
      }
      degreesToFull(other) {
        return Vector22.degreesBetweenFull(this, other);
      }
      radiansToFull(other) {
        return Vector22.radiansBetweenFull(this, other);
      }
      distanceTo(other) {
        return Vector22.distance(this, other);
      }
      static fromDegree(degrees) {
        let rads = degrees * (Math.PI / 180);
        return new Vector22(Math.cos(rads), Math.sin(rads));
      }
      static fromRadians(radians) {
        return new Vector22(Math.cos(radians), Math.sin(radians));
      }
      static lerp(p1, p2, a) {
        let lerpScalar = MathHelper.lerp;
        return new Vector22(lerpScalar(p1.x, p2.x, a), lerpScalar(p1.y, p2.y, a));
      }
      static degreesBetween(P1, P2) {
        let deltaY = P2.y - P1.y, deltaX = P2.x - P1.x;
        return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      }
      static radiansBetween(P1, P2) {
        return MathHelper.toRadians(Vector22.degreesBetween(P1, P2));
      }
      static degreesBetweenFull(P1, P2) {
        let temp = P2.sub(P1);
        return temp.getDegrees();
      }
      getDegrees() {
        var angle = Math.atan2(this.y, this.x);
        var degrees = 180 * angle / Math.PI;
        return (360 + Math.round(degrees)) % 360;
      }
      getRadians() {
        var angle = Math.atan2(this.y, this.x);
        return angle;
      }
      static radiansBetweenFull(P1, P2) {
        return MathHelper.toRadians(Vector22.degreesBetweenFull(P1, P2));
      }
      static distance(p1, p2) {
        let a = p1.x - p2.x;
        let b = p1.y - p2.y;
        return Math.sqrt(a * a + b * b);
      }
      static cross(p1, p2) {
        return p1.x * p2.y - p1.y * p2.x;
      }
      static dot(p1, p2) {
        return p1.x * p2.x + p1.y * p2.y;
      }
      string() {
        return this.x + "," + this.y;
      }
      static parse(str) {
        let parts = str.split(",");
        return new Vector22(parseFloat(parts[0].trim()), parseFloat(parts[1].trim()));
      }
      toArray() {
        return [this.x, this.y];
      }
      static fromArray(arr) {
        return new Vector22(arr[0], arr[1]);
      }
      static fromDict(data) {
        return new Vector22(data.x || 0, data.y || 0);
      }
      toDict(minimized) {
        if (minimized) {
          const ret = {};
          if (this.x) {
            ret.x = this.x;
          }
          if (this.y) {
            ret.y = this.y;
          }
          return ret;
        }
        return { x: this.x, y: this.y };
      }
    };
    module.exports = Vector22;
  }
});

// ../Shaku/lib/utils/circle.js
var require_circle = __commonJS({
  "../Shaku/lib/utils/circle.js"(exports, module) {
    "use strict";
    var MathHelper = require_math_helper();
    var Vector22 = require_vector2();
    var Circle = class {
      constructor(center, radius) {
        this.center = center.clone();
        this.radius = radius;
      }
      clone() {
        return new Circle(this.center, this.radius);
      }
      containsVector(p) {
        return this.center.distanceTo(p) <= this.radius;
      }
      equals(other) {
        return other === this || other && other.constructor === this.constructor && this.center.equals(other.center) && this.radius == other.radius;
      }
      static fromDict(data) {
        return new Circle(Vector22.fromDict(data.center || {}), data.radius || 0);
      }
      toDict(minimized) {
        if (minimized) {
          const ret = {};
          if (this.radius) {
            ret.radius = this.radius;
          }
          if (this.center.x || this.center.y) {
            ret.center = this.center.toDict(true);
          }
          return ret;
        }
        return { center: this.center.toDict(), radius: this.radius };
      }
      static lerp(p1, p2, a) {
        let lerpScalar = MathHelper.lerp;
        return new Circle(Vector22.lerp(p1.center, p2.center, a), lerpScalar(p1.radius, p2.radius, a));
      }
    };
    module.exports = Circle;
  }
});

// ../Shaku/lib/utils/line.js
var require_line = __commonJS({
  "../Shaku/lib/utils/line.js"(exports, module) {
    "use strict";
    var Vector22 = require_vector2();
    var Line2 = class {
      constructor(from, to) {
        this.from = from.clone();
        this.to = to.clone();
      }
      clone() {
        return new Line2(this.from, this.to);
      }
      static fromDict(data) {
        return new Line2(Vector22.fromDict(data.from || {}), Vector22.fromDict(data.to || {}));
      }
      toDict(minimized) {
        if (minimized) {
          const ret = {};
          if (this.from.x || this.from.y) {
            ret.from = this.from.toDict(true);
          }
          if (this.to.x || this.to.y) {
            ret.to = this.to.toDict(true);
          }
          return ret;
        }
        return { from: this.from.toDict(), to: this.to.toDict() };
      }
      containsVector(p, threshold) {
        let A = this.from;
        let B = this.to;
        let distance = Vector22.distance;
        if (threshold === void 0) {
          threshold = 0.5;
        }
        return Math.abs(distance(A, p) + distance(B, p) - distance(A, B)) <= threshold;
      }
      collideLine(other) {
        let p0 = this.from;
        let p1 = this.to;
        let p2 = other.from;
        let p3 = other.to;
        if (p0.equals(p2) || p0.equals(p3) || p1.equals(p2) || p1.equals(p3)) {
          return true;
        }
        let s1_x, s1_y, s2_x, s2_y;
        s1_x = p1.x - p0.x;
        s1_y = p1.y - p0.y;
        s2_x = p3.x - p2.x;
        s2_y = p3.y - p2.y;
        let s, t;
        s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);
        return s >= 0 && s <= 1 && t >= 0 && t <= 1;
      }
      distanceToVector(v) {
        let x1 = this.from.x;
        let x2 = this.to.x;
        let y1 = this.from.y;
        let y2 = this.to.y;
        var A = v.x - x1;
        var B = v.y - y1;
        var C = x2 - x1;
        var D = y2 - y1;
        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0)
          param = dot / len_sq;
        var xx, yy;
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }
        var dx = v.x - xx;
        var dy = v.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
      }
      equals(other) {
        return this === other || other && other.constructor === this.constructor && this.from.equals(other.from) && this.to.equals(other.to);
      }
      static lerp(l1, l2, a) {
        return new Line2(Vector22.lerp(l1.from, l2.from, a), Vector22.lerp(l1.to, l2.to, a));
      }
    };
    module.exports = Line2;
  }
});

// ../Shaku/lib/utils/rectangle.js
var require_rectangle = __commonJS({
  "../Shaku/lib/utils/rectangle.js"(exports, module) {
    "use strict";
    var Circle = require_circle();
    var Line2 = require_line();
    var MathHelper = require_math_helper();
    var Vector22 = require_vector2();
    var Rectangle2 = class {
      constructor(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width;
        this.height = height;
      }
      set(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
      }
      copy(other) {
        this.x = other.x;
        this.y = other.y;
        this.width = other.width;
        this.height = other.height;
        return this;
      }
      getPosition() {
        return new Vector22(this.x, this.y);
      }
      getSize() {
        return new Vector22(this.width, this.height);
      }
      getCenter() {
        return new Vector22(Math.round(this.x + this.width / 2), Math.round(this.y + this.height / 2));
      }
      get left() {
        return this.x;
      }
      get right() {
        return this.x + this.width;
      }
      get top() {
        return this.y;
      }
      get bottom() {
        return this.y + this.height;
      }
      clone() {
        return new Rectangle2(this.x, this.y, this.width, this.height);
      }
      getTopLeft() {
        return new Vector22(this.x, this.y);
      }
      getTopRight() {
        return new Vector22(this.x + this.width, this.y);
      }
      getBottomLeft() {
        return new Vector22(this.x, this.y + this.height);
      }
      getBottomRight() {
        return new Vector22(this.x + this.width, this.y + this.height);
      }
      string() {
        return this.x + "," + this.y + "," + this.width + "," + this.height;
      }
      containsVector(p) {
        return p.x >= this.x && p.x <= this.x + this.width && p.y >= this.y && p.y <= this.y + this.height;
      }
      collideRect(other) {
        let r1 = this;
        let r2 = other;
        return !(r2.left >= r1.right || r2.right <= r1.left || r2.top >= r1.bottom || r2.bottom <= r1.top);
      }
      collideLine(line) {
        if (this.containsVector(line.from) || this.containsVector(line.to)) {
          return true;
        }
        let topLeft = this.getTopLeft();
        let topRight = this.getTopRight();
        let bottomLeft = this.getBottomLeft();
        let bottomRight = this.getBottomRight();
        if (line.collideLine(new Line2(topLeft, topRight))) {
          return true;
        }
        if (line.collideLine(new Line2(topLeft, bottomLeft))) {
          return true;
        }
        if (line.collideLine(new Line2(topRight, bottomRight))) {
          return true;
        }
        if (line.collideLine(new Line2(bottomLeft, bottomRight))) {
          return true;
        }
        return false;
      }
      collideCircle(circle) {
        let center = circle.center;
        let radius = circle.radius;
        let rect = this;
        if (rect.containsVector(center)) {
          return true;
        }
        let rectCenter = rect.getCenter();
        let topLeft = rect.getTopLeft();
        let topRight = rect.getTopRight();
        let bottomRight = rect.getBottomRight();
        let bottomLeft = rect.getBottomLeft();
        let lines = [];
        if (rectCenter.x > center.x) {
          lines.push([topLeft, bottomLeft]);
        } else {
          lines.push([topRight, bottomRight]);
        }
        if (rectCenter.y > center.y) {
          lines.push([topLeft, topRight]);
        } else {
          lines.push([bottomLeft, bottomRight]);
        }
        for (let i = 0; i < lines.length; ++i) {
          let disToLine = pointLineDistance(center, lines[i][0], lines[i][1]);
          if (disToLine <= radius) {
            return true;
          }
        }
        return false;
      }
      getBoundingCircle() {
        let center = this.getCenter();
        let radius = center.distanceTo(this.getTopLeft());
        return new Circle(center, radius);
      }
      static fromPoints(points) {
        let min_x = points[0].x;
        let min_y = points[0].y;
        let max_x = min_x;
        let max_y = min_y;
        for (let i = 1; i < points.length; ++i) {
          min_x = Math.min(min_x, points[i].x);
          min_y = Math.min(min_y, points[i].y);
          max_x = Math.max(max_x, points[i].x);
          max_y = Math.max(max_y, points[i].y);
        }
        return new Rectangle2(min_x, min_y, max_x - min_x, max_y - min_y);
      }
      resize(amount) {
        if (typeof amount === "number") {
          amount = new Vector22(amount, amount);
        }
        return new Rectangle2(this.x - amount.x / 2, this.y - amount.y / 2, this.width + amount.x, this.height + amount.y);
      }
      equals(other) {
        return this === other || other && other.constructor === this.constructor && this.x == other.x && this.y == other.y && this.width == other.width && this.height == other.height;
      }
      static lerp(p1, p2, a) {
        let lerpScalar = MathHelper.lerp;
        return new Rectangle2(
          lerpScalar(p1.x, p2.x, a),
          lerpScalar(p1.y, p2.y, a),
          lerpScalar(p1.width, p2.width, a),
          lerpScalar(p1.height, p2.height, a)
        );
      }
      static fromDict(data) {
        return new Rectangle2(data.x || 0, data.y || 0, data.width || 0, data.height || 0);
      }
      toDict(minimized) {
        if (minimized) {
          const ret = {};
          if (this.x) {
            ret.x = this.x;
          }
          if (this.y) {
            ret.y = this.y;
          }
          if (this.width) {
            ret.width = this.width;
          }
          if (this.height) {
            ret.height = this.height;
          }
          return ret;
        }
        return { x: this.x, y: this.y, width: this.width, height: this.height };
      }
    };
    function pointLineDistance(p1, l1, l2) {
      let x = p1.x;
      let y = p1.y;
      let x1 = l1.x;
      let y1 = l1.y;
      let x2 = l2.x;
      let y2 = l2.y;
      var A = x - x1;
      var B = y - y1;
      var C = x2 - x1;
      var D = y2 - y1;
      var dot = A * C + B * D;
      var len_sq = C * C + D * D;
      var param = -1;
      if (len_sq != 0)
        param = dot / len_sq;
      var xx, yy;
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
      var dx = x - xx;
      var dy = y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    }
    module.exports = Rectangle2;
  }
});

// ../Shaku/lib/gfx/texture_filter_modes.js
var require_texture_filter_modes = __commonJS({
  "../Shaku/lib/gfx/texture_filter_modes.js"(exports, module) {
    "use strict";
    var TextureFilterModes = {
      Nearest: "NEAREST",
      Linear: "LINEAR",
      NearestMipmapNearest: "NEAREST_MIPMAP_NEAREST",
      LinearMipmapNearest: "LINEAR_MIPMAP_NEAREST",
      NearestMipmapLinear: "NEAREST_MIPMAP_LINEAR",
      LinearMipmapLinear: "LINEAR_MIPMAP_LINEAR"
    };
    Object.defineProperty(TextureFilterModes, "_values", {
      value: new Set(Object.values(TextureFilterModes)),
      writable: false
    });
    Object.freeze(TextureFilterModes);
    module.exports = { TextureFilterModes };
  }
});

// ../Shaku/lib/gfx/texture_wrap_modes.js
var require_texture_wrap_modes = __commonJS({
  "../Shaku/lib/gfx/texture_wrap_modes.js"(exports, module) {
    "use strict";
    var TextureWrapModes = {
      Clamp: "CLAMP_TO_EDGE",
      Repeat: "REPEAT",
      RepeatMirrored: "MIRRORED_REPEAT"
    };
    Object.defineProperty(TextureWrapModes, "_values", {
      value: new Set(Object.values(TextureWrapModes)),
      writable: false
    });
    Object.freeze(TextureWrapModes);
    module.exports = { TextureWrapModes };
  }
});

// ../Shaku/lib/assets/texture_asset.js
var require_texture_asset = __commonJS({
  "../Shaku/lib/assets/texture_asset.js"(exports, module) {
    "use strict";
    var Asset = require_asset();
    var { TextureFilterMode, TextureFilterModes } = require_texture_filter_modes();
    var { TextureWrapMode, TextureWrapModes } = require_texture_wrap_modes();
    var Color2 = require_color();
    var Vector22 = require_vector2();
    var _logger = require_logger().getLogger("assets");
    var gl = null;
    var TextureAsset = class extends Asset {
      constructor(url) {
        super(url);
        this._image = null;
        this._width = 0;
        this._height = 0;
        this._texture = null;
        this._filter = null;
        this._wrapMode = null;
        this._ctxForPixelData = null;
      }
      static _setWebGl(_gl) {
        gl = _gl;
      }
      get filter() {
        return this._filter;
      }
      set filter(value) {
        this._filter = value;
      }
      get wrapMode() {
        return this._wrapMode;
      }
      set wrapMode(value) {
        this._wrapMode = value;
      }
      load(params) {
        params = params || {};
        return new Promise((resolve, reject2) => {
          if (!gl) {
            return reject2("Can't load textures before initializing gfx manager!");
          }
          const image = new Image();
          if (params.crossOrigin !== void 0) {
            image.crossOrigin = params.crossOrigin;
          }
          image.onload = async () => {
            try {
              await this.create(image, params);
              this._notifyReady();
              resolve();
            } catch (e) {
              reject2(e);
            }
          };
          image.onerror = () => {
            reject2("Failed to load texture image!");
          };
          image.src = this.url;
        });
      }
      createRenderTarget(width, height, channels) {
        const targetTextureWidth = width;
        const targetTextureHeight = height;
        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        var _format = gl.RGBA;
        if (channels !== void 0) {
          switch (channels) {
            case 1:
              _format = gl.LUMINANCE;
              break;
            case 3:
              _format = gl.RGB;
              break;
            case 4:
              _format = gl.RGBA;
              break;
            default:
              throw new Error("Unknown render target format!");
          }
        }
        {
          const level = 0;
          const internalFormat = _format;
          const border = 0;
          const format = _format;
          const type = gl.UNSIGNED_BYTE;
          const data = null;
          gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            targetTextureWidth,
            targetTextureHeight,
            border,
            format,
            type,
            data
          );
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        this._width = width;
        this._height = height;
        this._texture = targetTexture;
        this._notifyReady();
      }
      fromImage(image, params) {
        if (image.width === 0) {
          throw new Error("Image to build texture from must be loaded and have valid size!");
        }
        if (this.valid) {
          throw new Error("Texture asset is already initialized!");
        }
        params = params || {};
        this._image = image;
        this._width = image.width;
        this._height = image.height;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        if (params.generateMipMaps) {
          if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            _logger.warn("Tried to generate MipMaps for a texture with size that is *not* a power of two. This might not work as expected.");
          }
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        this._texture = texture;
        this._notifyReady();
      }
      create(source, params) {
        return new Promise(async (resolve, reject2) => {
          if (typeof source === "string") {
            let img = new Image();
            img.onload = () => {
              this.fromImage(source, params);
              this._notifyReady();
              resolve();
            };
            if (params.crossOrigin !== void 0) {
              img.crossOrigin = params.crossOrigin;
            }
            img.src = source;
          } else {
            this.fromImage(source, params);
            resolve();
          }
        });
      }
      get image() {
        return this._image;
      }
      get width() {
        return this._width;
      }
      get height() {
        return this._height;
      }
      get size() {
        return new Vector22(this.width, this.height);
      }
      get texture() {
        return this._texture;
      }
      getPixel(x, y) {
        if (!this._image) {
          throw new Error("'getPixel()' only works on textures loaded from image!");
        }
        if (!this._ctxForPixelData) {
          let canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          this._ctxForPixelData = canvas.getContext("2d");
        }
        let ctx = this._ctxForPixelData;
        ctx.drawImage(this._image, x, y, 1, 1, 0, 0, 1, 1);
        let pixelData = ctx.getImageData(0, 0, 1, 1).data;
        return Color2.fromBytesArray(pixelData);
      }
      get valid() {
        return Boolean(this._texture);
      }
      destroy() {
        gl.deleteTexture(this._texture);
        this._image = null;
        this._width = this._height = 0;
        this._ctxForPixelData = null;
        this._texture = null;
      }
    };
    function isPowerOf2(value) {
      return (value & value - 1) == 0;
    }
    module.exports = TextureAsset;
  }
});

// ../Shaku/lib/utils/vector3.js
var require_vector3 = __commonJS({
  "../Shaku/lib/utils/vector3.js"(exports, module) {
    "use strict";
    var MathHelper = require_math_helper();
    var Vector32 = class {
      constructor(x = 0, y = 0, z2 = 0) {
        this.x = x;
        this.y = y;
        this.z = z2;
      }
      clone() {
        return new Vector32(this.x, this.y, this.z);
      }
      set(x, y) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }
      copy(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
      }
      add(other) {
        if (typeof other === "number") {
          return new Vector32(
            this.x + other,
            this.y + (arguments[1] === void 0 ? other : arguments[1]),
            this.z + (arguments[2] === void 0 ? other : arguments[2])
          );
        }
        return new Vector32(this.x + other.x, this.y + other.y, this.z + other.z);
      }
      sub(other) {
        if (typeof other === "number") {
          return new Vector32(
            this.x - other,
            this.y - (arguments[1] === void 0 ? other : arguments[1]),
            this.z - (arguments[2] === void 0 ? other : arguments[2])
          );
        }
        return new Vector32(this.x - other.x, this.y - other.y, this.z - other.z);
      }
      div(other) {
        if (typeof other === "number") {
          return new Vector32(
            this.x / other,
            this.y / (arguments[1] === void 0 ? other : arguments[1]),
            this.z / (arguments[2] === void 0 ? other : arguments[2])
          );
        }
        return new Vector32(this.x / other.x, this.y / other.y, this.z / other.z);
      }
      mul(other) {
        if (typeof other === "number") {
          return new Vector32(
            this.x * other,
            this.y * (arguments[1] === void 0 ? other : arguments[1]),
            this.z * (arguments[2] === void 0 ? other : arguments[2])
          );
        }
        return new Vector32(this.x * other.x, this.y * other.y, this.z * other.z);
      }
      round() {
        return new Vector32(Math.round(this.x), Math.round(this.y), Math.round(this.z));
      }
      floor() {
        return new Vector32(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
      }
      ceil() {
        return new Vector32(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
      }
      normalized() {
        if (this.x == 0 && this.y == 0 && this.z == 0) {
          return Vector32.zero;
        }
        let mag = this.length;
        return new Vector32(this.x / mag, this.y / mag, this.z / mag);
      }
      addSelf(other) {
        if (typeof other === "number") {
          this.x += other;
          this.y += arguments[1] === void 0 ? other : arguments[1];
          this.z += arguments[2] === void 0 ? other : arguments[2];
        } else {
          this.x += other.x;
          this.y += other.y;
          this.z += other.z;
        }
        return this;
      }
      subSelf(other) {
        if (typeof other === "number") {
          this.x -= other;
          this.y -= arguments[1] === void 0 ? other : arguments[1];
          this.z -= arguments[2] === void 0 ? other : arguments[2];
        } else {
          this.x -= other.x;
          this.y -= other.y;
          this.z -= other.z;
        }
        return this;
      }
      divSelf(other) {
        if (typeof other === "number") {
          this.x /= other;
          this.y /= arguments[1] === void 0 ? other : arguments[1];
          this.z /= arguments[2] === void 0 ? other : arguments[2];
        } else {
          this.x /= other.x;
          this.y /= other.y;
          this.z /= other.z;
        }
        return this;
      }
      mulSelf(other) {
        if (typeof other === "number") {
          this.x *= other;
          this.y *= arguments[1] === void 0 ? other : arguments[1];
          this.z *= arguments[2] === void 0 ? other : arguments[2];
        } else {
          this.x *= other.x;
          this.y *= other.y;
          this.z *= other.z;
        }
        return this;
      }
      roundSelf() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
      }
      floorSelf() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
      }
      ceilSelf() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
      }
      normalizeSelf() {
        if (this.x == 0 && this.y == 0 && this.z == 0) {
          return this;
        }
        let mag = this.length;
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
        return this;
      }
      equals(other) {
        return this === other || other.constructor === this.constructor && this.x === other.x && this.y === other.y && this.z === other.z;
      }
      approximate(other, threshold) {
        threshold = threshold || 1;
        return this === other || Math.abs(this.x - other.x) <= threshold && Math.abs(this.y - other.y) <= threshold && Math.abs(this.z - other.z) <= threshold;
      }
      get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      }
      scaled(fac) {
        return new Vector32(this.x * fac, this.y * fac, this.z * fac);
      }
      static get zero() {
        return new Vector32();
      }
      static get one() {
        return new Vector32(1, 1, 1);
      }
      static get half() {
        return new Vector32(0.5, 0.5, 0.5);
      }
      static get left() {
        return new Vector32(-1, 0, 0);
      }
      static get right() {
        return new Vector32(1, 0, 0);
      }
      static get up() {
        return new Vector32(0, -1, 0);
      }
      static get down() {
        return new Vector32(0, 1, 0);
      }
      static get front() {
        return new Vector32(0, 0, -1);
      }
      static get back() {
        return new Vector32(0, 0, 1);
      }
      distanceTo(other) {
        return Vector32.distance(this, other);
      }
      static lerp(p1, p2, a) {
        let lerpScalar = MathHelper.lerp;
        return new Vector32(lerpScalar(p1.x, p2.x, a), lerpScalar(p1.y, p2.y, a), lerpScalar(p1.z, p2.z, a));
      }
      static distance(p1, p2) {
        let a = p1.x - p2.x;
        let b = p1.y - p2.y;
        let c = p1.z - p2.z;
        return Math.sqrt(a * a + b * b + c * c);
      }
      static crossVector(p1, p2) {
        const ax = p1.x, ay = p1.y, az = p1.z;
        const bx = p2.x, by = p2.y, bz = p2.z;
        let x = ay * bz - az * by;
        let y = az * bx - ax * bz;
        let z2 = ax * by - ay * bx;
        return new Vector32(x, y, z2);
      }
      string() {
        return this.x + "," + this.y + "," + this.z;
      }
      static parse(str) {
        let parts = str.split(",");
        return new Vector32(parseFloat(parts[0].trim()), parseFloat(parts[1].trim()), parseFloat(parts[2].trim()));
      }
      toArray() {
        return [this.x, this.y, this.z];
      }
      static fromArray(arr) {
        return new Vector32(arr[0], arr[1], arr[2]);
      }
      static fromDict(data) {
        return new Vector32(data.x || 0, data.y || 0, data.z || 0);
      }
      toDict(minimized) {
        if (minimized) {
          const ret = {};
          if (this.x) {
            ret.x = this.x;
          }
          if (this.y) {
            ret.y = this.y;
          }
          if (this.z) {
            ret.z = this.z;
          }
          return ret;
        }
        return { x: this.x, y: this.y, z: this.z };
      }
    };
    module.exports = Vector32;
  }
});

// ../Shaku/lib/utils/animator.js
var require_animator = __commonJS({
  "../Shaku/lib/utils/animator.js"(exports, module) {
    "use strict";
    var _autoAnimators = [];
    var Animator = class {
      constructor(target) {
        this._target = target;
        this._fromValues = {};
        this._toValues = {};
        this._progress = 0;
        this._onFinish = null;
        this._smoothDamp = false;
        this._repeats = false;
        this._repeatsWithReverseAnimation = false;
        this._isInAutoUpdate = false;
        this._originalFrom = null;
        this._originalTo = null;
        this._originalRepeats = null;
        this.speedFactor = 1;
      }
      update(delta) {
        if (this._progress >= 1) {
          return;
        }
        delta *= this.speedFactor;
        this._progress += delta;
        if (this._progress >= 1) {
          this._progress = 1;
          if (this._onFinish) {
            this._onFinish();
          }
        }
        for (let key in this._toValues) {
          let keyParts = this._toValues[key].keyParts;
          let toValue = this._toValues[key].value;
          let fromValue = this._fromValues[key];
          if (fromValue === void 0) {
            this._fromValues[key] = fromValue = this._getValueFromTarget(keyParts);
            if (fromValue === void 0) {
              throw new Error(`Animator issue: missing origin value for key '${key}' and property not found in target object.`);
            }
          }
          if (typeof toValue === "function") {
            toValue = toValue();
          }
          if (typeof fromValue === "function") {
            fromValue = toValue();
          }
          let a = this._smoothDamp && this._progress < 1 ? this._progress * (1 + 1 - this._progress) : this._progress;
          let newValue = null;
          if (typeof fromValue === "number") {
            newValue = lerp(fromValue, toValue, a);
          } else if (fromValue.constructor.lerp) {
            newValue = fromValue.constructor.lerp(fromValue, toValue, a);
          } else {
            throw new Error(`Animator issue: from-value for key '${key}' is not a number, and its class type don't implement a 'lerp()' method!`);
          }
          this._setValueToTarget(keyParts, newValue);
        }
        if (this._repeats && this._progress >= 1) {
          if (typeof this._repeats === "number") {
            this._repeats--;
          }
          this._progress = 0;
          if (this._repeatsWithReverseAnimation) {
            this.flipFromAndTo();
          }
        }
      }
      _getValueFromTarget(keyParts) {
        if (keyParts.length === 1) {
          return this._target[keyParts[0]];
        }
        function index(obj, i) {
          return obj[i];
        }
        return keyParts.reduce(index, this._target);
      }
      _setValueToTarget(keyParts, value) {
        if (keyParts.length === 1) {
          this._target[keyParts[0]] = value;
          return;
        }
        function index(obj, i) {
          return obj[i];
        }
        let parent = keyParts.slice(0, keyParts.length - 1).reduce(index, this._target);
        parent[keyParts[keyParts.length - 1]] = value;
      }
      _validateValueType(value) {
        return typeof value === "number" || typeof value === "function" || value && value.constructor && value.constructor.lerp;
      }
      then(callback) {
        this._onFinish = callback;
        return this;
      }
      smoothDamp(enable) {
        this._smoothDamp = enable;
        return this;
      }
      repeats(enable, reverseAnimation) {
        this._originalRepeats = this._repeats = enable;
        this._repeatsWithReverseAnimation = Boolean(reverseAnimation);
        return this;
      }
      from(values) {
        for (let key in values) {
          if (!this._validateValueType(values[key])) {
            throw new Error("Illegal value type to use with Animator! All values must be either numbers, methods, or a class instance that has a static lerp() method.");
          }
          this._fromValues[key] = values[key];
        }
        this._originalFrom = null;
        return this;
      }
      to(values) {
        for (let key in values) {
          if (!this._validateValueType(values[key])) {
            throw new Error("Illegal value type to use with Animator! All values must be either numbers, methods, or a class instance that has a static lerp() method.");
          }
          this._toValues[key] = { keyParts: key.split("."), value: values[key] };
        }
        this._originalTo = null;
        return this;
      }
      flipFromAndTo() {
        let newFrom = {};
        let newTo = {};
        if (!this._originalFrom) {
          this._originalFrom = this._fromValues;
        }
        if (!this._originalTo) {
          this._originalTo = this._toValues;
        }
        for (let key in this._toValues) {
          newFrom[key] = this._toValues[key].value;
          newTo[key] = { keyParts: key.split("."), value: this._fromValues[key] };
        }
        this._fromValues = newFrom;
        this._toValues = newTo;
      }
      duration(seconds) {
        this.speedFactor = 1 / seconds;
        return this;
      }
      reset() {
        if (this._originalFrom) {
          this._fromValues = this._originalFrom;
        }
        if (this._originalTo) {
          this._toValues = this._originalTo;
        }
        if (this._originalRepeats !== null) {
          this._repeats = this._originalRepeats;
        }
        this._progress = 0;
        return this;
      }
      play() {
        if (this._isInAutoUpdate) {
          return;
        }
        _autoAnimators.push(this);
        this._isInAutoUpdate = true;
        return this;
      }
      get ended() {
        return this._progress >= 1;
      }
      static updateAutos(delta) {
        for (let i = _autoAnimators.length - 1; i >= 0; --i) {
          _autoAnimators[i].update(delta);
          if (_autoAnimators[i].ended) {
            _autoAnimators[i]._isInAutoUpdate = false;
            _autoAnimators.splice(i, 1);
          }
        }
      }
    };
    function lerp(start, end, amt) {
      return (1 - amt) * start + amt * end;
    }
    module.exports = Animator;
  }
});

// ../Shaku/lib/utils/game_time.js
var require_game_time = __commonJS({
  "../Shaku/lib/utils/game_time.js"(exports, module) {
    "use strict";
    var GameTime = class {
      constructor() {
        this.timestamp = _currElapsed;
        this.deltaTime = {
          milliseconds: _currDelta,
          seconds: _currDelta / 1e3
        };
        this.elapsedTime = {
          milliseconds: _currElapsed,
          seconds: _currElapsed / 1e3
        };
        this.delta = this.deltaTime ? this.deltaTime.seconds : null;
        this.elapsed = this.elapsedTime.seconds;
        Object.freeze(this);
      }
      static update() {
        let curr = getAccurateTimestampMs();
        let delta = 0;
        if (_prevTime) {
          delta = curr - _prevTime;
        }
        _prevTime = curr;
        _currDelta = delta;
        _currElapsed += delta;
      }
      static rawTimestamp() {
        return getAccurateTimestampMs();
      }
      static reset() {
        _prevTime = null;
        _currDelta = 0;
        _currElapsed = 0;
      }
      static resetDelta() {
        _prevTime = null;
        _currDelta = 0;
      }
    };
    var gotPerformance = typeof performance !== "undefined" && performance.now;
    function getAccurateTimestampMs() {
      if (gotPerformance) {
        return performance.now();
      }
      return Date.now();
    }
    var _prevTime = null;
    var _currDelta = 0;
    var _currElapsed = 0;
    module.exports = GameTime;
  }
});

// ../Shaku/lib/utils/seeded_random.js
var require_seeded_random = __commonJS({
  "../Shaku/lib/utils/seeded_random.js"(exports, module) {
    "use strict";
    var SeededRandom = class {
      constructor(seed) {
        if (seed === void 0) {
          seed = 0;
        }
        this.seed = seed;
      }
      random(min, max) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        let rnd = this.seed / 233280;
        if (min && max) {
          return min + rnd * (max - min);
        } else if (min) {
          return rnd * min;
        }
        return rnd;
      }
      pick(options) {
        return options[Math.floor(this.random(options.length))];
      }
    };
    module.exports = SeededRandom;
  }
});

// ../Shaku/lib/utils/perlin.js
var require_perlin = __commonJS({
  "../Shaku/lib/utils/perlin.js"(exports, module) {
    "use strict";
    var MathHelper = require_math_helper();
    var lerp = MathHelper.lerp;
    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function Grad(x, y, z2) {
      this.x = x;
      this.y = y;
      this.z = z2;
    }
    Grad.prototype.dot2 = function(x, y) {
      return this.x * x + this.y * y;
    };
    var p = [
      151,
      160,
      137,
      91,
      90,
      15,
      131,
      13,
      201,
      95,
      96,
      53,
      194,
      233,
      7,
      225,
      140,
      36,
      103,
      30,
      69,
      142,
      8,
      99,
      37,
      240,
      21,
      10,
      23,
      190,
      6,
      148,
      247,
      120,
      234,
      75,
      0,
      26,
      197,
      62,
      94,
      252,
      219,
      203,
      117,
      35,
      11,
      32,
      57,
      177,
      33,
      88,
      237,
      149,
      56,
      87,
      174,
      20,
      125,
      136,
      171,
      168,
      68,
      175,
      74,
      165,
      71,
      134,
      139,
      48,
      27,
      166,
      77,
      146,
      158,
      231,
      83,
      111,
      229,
      122,
      60,
      211,
      133,
      230,
      220,
      105,
      92,
      41,
      55,
      46,
      245,
      40,
      244,
      102,
      143,
      54,
      65,
      25,
      63,
      161,
      1,
      216,
      80,
      73,
      209,
      76,
      132,
      187,
      208,
      89,
      18,
      169,
      200,
      196,
      135,
      130,
      116,
      188,
      159,
      86,
      164,
      100,
      109,
      198,
      173,
      186,
      3,
      64,
      52,
      217,
      226,
      250,
      124,
      123,
      5,
      202,
      38,
      147,
      118,
      126,
      255,
      82,
      85,
      212,
      207,
      206,
      59,
      227,
      47,
      16,
      58,
      17,
      182,
      189,
      28,
      42,
      223,
      183,
      170,
      213,
      119,
      248,
      152,
      2,
      44,
      154,
      163,
      70,
      221,
      153,
      101,
      155,
      167,
      43,
      172,
      9,
      129,
      22,
      39,
      253,
      19,
      98,
      108,
      110,
      79,
      113,
      224,
      232,
      178,
      185,
      112,
      104,
      218,
      246,
      97,
      228,
      251,
      34,
      242,
      193,
      238,
      210,
      144,
      12,
      191,
      179,
      162,
      241,
      81,
      51,
      145,
      235,
      249,
      14,
      239,
      107,
      49,
      192,
      214,
      31,
      181,
      199,
      106,
      157,
      184,
      84,
      204,
      176,
      115,
      121,
      50,
      45,
      127,
      4,
      150,
      254,
      138,
      236,
      205,
      93,
      222,
      114,
      67,
      29,
      24,
      72,
      243,
      141,
      128,
      195,
      78,
      66,
      215,
      61,
      156,
      180
    ];
    var Perlin = class {
      constructor(seed) {
        if (seed === void 0) {
          seed = Math.random();
        }
        this.seed(seed);
      }
      seed(seed) {
        if (seed > 0 && seed < 1) {
          seed *= 65536;
        }
        seed = Math.floor(seed);
        if (seed < 256) {
          seed |= seed << 8;
        }
        var perm = new Array(512);
        var gradP = new Array(512);
        var grad3 = [
          new Grad(1, 1, 0),
          new Grad(-1, 1, 0),
          new Grad(1, -1, 0),
          new Grad(-1, -1, 0),
          new Grad(1, 0, 1),
          new Grad(-1, 0, 1),
          new Grad(1, 0, -1),
          new Grad(-1, 0, -1),
          new Grad(0, 1, 1),
          new Grad(0, -1, 1),
          new Grad(0, 1, -1),
          new Grad(0, -1, -1)
        ];
        for (var i = 0; i < 256; i++) {
          var v;
          if (i & 1) {
            v = p[i] ^ seed & 255;
          } else {
            v = p[i] ^ seed >> 8 & 255;
          }
          perm[i] = perm[i + 256] = v;
          gradP[i] = gradP[i + 256] = grad3[v % 12];
        }
        this._perm = perm;
        this._gradP = gradP;
      }
      generateSmooth(x, y, blurDistance, contrast) {
        if (blurDistance === void 0) {
          blurDistance = 0.25;
        }
        let a = this.generate(x - blurDistance, y - blurDistance, contrast);
        let b = this.generate(x + blurDistance, y + blurDistance, contrast);
        let c = this.generate(x - blurDistance, y + blurDistance, contrast);
        let d = this.generate(x + blurDistance, y - blurDistance, contrast);
        return (a + b + c + d) / 4;
      }
      generate(x, y, contrast) {
        if (contrast === void 0) {
          contrast = 1;
        }
        let perm = this._perm;
        let gradP = this._gradP;
        var X = Math.floor(x), Y = Math.floor(y);
        x = x - X;
        y = y - Y;
        X = X & 255;
        Y = Y & 255;
        var n00 = gradP[X + perm[Y]].dot2(x, y) * contrast;
        var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1) * contrast;
        var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y) * contrast;
        var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1) * contrast;
        var u = fade(x);
        return Math.min(lerp(
          lerp(n00, n10, u),
          lerp(n01, n11, u),
          fade(y)
        ) + 0.5, 1);
      }
    };
    module.exports = Perlin;
  }
});

// ../Shaku/lib/utils/storage_adapter.js
var require_storage_adapter = __commonJS({
  "../Shaku/lib/utils/storage_adapter.js"(exports, module) {
    "use strict";
    var StorageAdapter = class {
      get persistent() {
        throw new Error("Not Implemented.");
      }
      isValid() {
        throw new Error("Not Implemented.");
      }
      exists(key) {
        throw new Error("Not Implemented.");
      }
      setItem(key, value) {
        throw new Error("Not Implemented.");
      }
      getItem(key) {
        throw new Error("Not Implemented.");
      }
      deleteItem(key) {
        throw new Error("Not Implemented.");
      }
      clear(prefix) {
        throw new Error("Not Implemented.");
      }
    };
    var StorageAdapterMemory = class {
      constructor() {
        this._data = {};
      }
      get persistent() {
        return false;
      }
      isValid() {
        return true;
      }
      exists(key) {
        return Boolean(this._data[key]);
      }
      setItem(key, value) {
        this._data[key] = value;
      }
      getItem(key) {
        return this._data[key];
      }
      deleteItem(key) {
        delete this._data[key];
      }
      clear(prefix) {
        for (let key in this._data) {
          if (key.indexOf(prefix) === 0) {
            delete this._data[key];
          }
        }
      }
    };
    StorageAdapter.memory = StorageAdapterMemory;
    var StorageAdapterLocalStorage = class {
      get persistent() {
        return true;
      }
      isValid() {
        try {
          return typeof localStorage !== "undefined" && localStorage !== null;
        } catch (e) {
          return false;
        }
      }
      exists(key) {
        return localStorage.getItem(key) !== null;
      }
      setItem(key, value) {
        localStorage.setItem(key, value);
      }
      getItem(key) {
        return localStorage.getItem(key);
      }
      deleteItem(key) {
        localStorage.deleteItem(key);
      }
      clear(prefix) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.indexOf(prefix) === 0) {
            delete localStorage.deleteItem(key);
          }
        }
      }
    };
    StorageAdapter.localStorage = StorageAdapterLocalStorage;
    var StorageAdapterSessionStorage = class {
      get persistent() {
        return false;
      }
      isValid() {
        try {
          return typeof sessionStorage !== "undefined" && sessionStorage !== null;
        } catch (e) {
          return false;
        }
      }
      exists(key) {
        return sessionStorage.getItem(key) !== null;
      }
      setItem(key, value) {
        sessionStorage.setItem(key, value);
      }
      getItem(key) {
        return sessionStorage.getItem(key);
      }
      deleteItem(key) {
        sessionStorage.deleteItem(key);
      }
      clear(prefix) {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key.indexOf(prefix) === 0) {
            delete sessionStorage.deleteItem(key);
          }
        }
      }
    };
    StorageAdapter.sessionStorage = StorageAdapterSessionStorage;
    module.exports = StorageAdapter;
  }
});

// ../Shaku/lib/utils/storage.js
var require_storage = __commonJS({
  "../Shaku/lib/utils/storage.js"(exports, module) {
    "use strict";
    var StorageAdapter = require_storage_adapter();
    var Storage = class {
      constructor(adapters, prefix, valuesAsBase64, keysAsBase64) {
        adapters = adapters || Storage.defaultAdapters;
        if (!(adapters instanceof Array)) {
          adapters = [adapters];
        }
        this._adapter = null;
        for (let adapter of adapters) {
          if (adapter.isValid()) {
            this._adapter = adapter;
            break;
          }
        }
        this.valuesAsBase64 = Boolean(valuesAsBase64);
        this.keysAsBase64 = Boolean(keysAsBase64);
        this._keysPrefix = "shaku_storage_" + (prefix || "") + "_";
      }
      get persistent() {
        return this.isValid && this._adapter.persistent;
      }
      get isValid() {
        return Boolean(this._adapter);
      }
      normalizeKey(key) {
        key = this._keysPrefix + key.toString();
        if (this.keysAsBase64) {
          key = btoa(key);
        }
        return key;
      }
      exists(key) {
        if (typeof key !== "string") {
          throw new Error("Key must be a string!");
        }
        key = this.normalizeKey(key);
        return this._adapter.exists(key);
      }
      _set(key, value) {
        value = JSON.stringify({
          data: value,
          timestamp: new Date().getTime(),
          src: "Shaku",
          sver: 1
        });
        if (this.valuesAsBase64) {
          value = btoa(value);
        }
        this._adapter.setItem(key, value);
      }
      _get(key) {
        var value = this._adapter.getItem(key);
        if (value === null) {
          return null;
        }
        if (this.valuesAsBase64) {
          try {
            value = atob(value);
          } catch (e) {
            throw new Error("Failed to parse Base64 string while reading data. Did you try to read a value as Base64 that wasn't encoded as Base64 when written to storage?");
          }
        }
        try {
          value = JSON.parse(value);
        } catch (e) {
          throw new Error("Failed to JSON-parse data from storage. Did you try to read something that wasn't written with the Storage utility?");
        }
        return value.data;
      }
      setItem(key, value) {
        if (typeof key !== "string") {
          throw new Error("Key must be a string!");
        }
        key = this.normalizeKey(key);
        this._set(key, value);
      }
      getItem(key) {
        if (typeof key !== "string") {
          throw new Error("Key must be a string!");
        }
        key = this.normalizeKey(key);
        return this._get(key);
      }
      getJson(key) {
        return this.getItem(key) || null;
      }
      setJson(key, value) {
        key = this.normalizeKey(key);
        this._set(key, value);
      }
      deleteItem(key) {
        if (typeof key !== "string") {
          throw new Error("Key must be a string!");
        }
        key = this.normalizeKey(key);
        this._adapter.deleteItem(key);
      }
      clear() {
        this._adapter.clear(this._keysPrefix);
      }
    };
    Storage.defaultAdapters = [new StorageAdapter.localStorage(), new StorageAdapter.sessionStorage(), new StorageAdapter.memory()];
    module.exports = Storage;
  }
});

// ../Shaku/lib/utils/path_finder.js
var require_path_finder = __commonJS({
  "../Shaku/lib/utils/path_finder.js"(exports, module) {
    "use strict";
    var Vector22 = require_vector2();
    var IGrid = class {
      isBlocked(_from, _to) {
        throw new Error("Not Implemented");
      }
      getPrice(_index) {
        throw new Error("Not Implemented");
      }
    };
    var Node = class {
      constructor(position) {
        this.position = position;
        this.gCost = 0;
        this.hCost = 0;
        this.parent = null;
        this.price = 1;
      }
      get fCost() {
        return this.gCost + this.hCost;
      }
    };
    function findPath(grid, startPos, targetPos, options) {
      let ret = _ImpFindPath(grid, startPos, targetPos, options || {});
      return ret;
    }
    function _ImpFindPath(grid, startPos, targetPos, options) {
      const allowDiagonal = options.allowDiagonal;
      let nodesCache = {};
      function getOrCreateNode(position) {
        let key = position.x + "," + position.y;
        if (nodesCache[key]) {
          return nodesCache[key];
        }
        let ret = new Node(position);
        nodesCache[key] = ret;
        return ret;
      }
      let startNode = getOrCreateNode(startPos);
      let targetNode = getOrCreateNode(targetPos);
      let openSet = [];
      openSet.push(startNode);
      let closedSet = /* @__PURE__ */ new Set();
      function removeFromArray(arr, val) {
        let index = arr.indexOf(val);
        if (index !== -1) {
          arr.splice(index, 1);
        }
      }
      let iterationsCount = -1;
      while (openSet.length > 0) {
        if (options.maxIterations) {
          if (iterationsCount++ > options.maxIterations) {
            break;
          }
        }
        let currentNode = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
          if (openSet[i].fCost <= currentNode.fCost && openSet[i].hCost < currentNode.hCost) {
            currentNode = openSet[i];
          }
        }
        removeFromArray(openSet, currentNode);
        closedSet.add(currentNode);
        if (currentNode == targetNode) {
          let finalPath = retracePath(startNode, targetNode);
          return finalPath;
        }
        let neighbors = [];
        for (let nx = -1; nx <= 1; nx++) {
          for (let ny = -1; ny <= 1; ny++) {
            if (nx === 0 && ny === 0) {
              continue;
            }
            if (!allowDiagonal && (nx !== 0 && ny !== 0)) {
              continue;
            }
            neighbors.push(getOrCreateNode({ x: currentNode.position.x + nx, y: currentNode.position.y + ny, z: currentNode.position.z }));
          }
        }
        for (let neighbor of neighbors) {
          if (closedSet.has(neighbor) || grid.isBlocked(currentNode.position, neighbor.position)) {
            continue;
          }
          let price = options.ignorePrices ? 1 : grid.getPrice(neighbor.position);
          let currStepCost = currentNode.gCost + getDistance(currentNode, neighbor) * price;
          let isInOpenSet = openSet.indexOf(neighbor) !== -1;
          if (!isInOpenSet || currStepCost < neighbor.gCost) {
            neighbor.gCost = currStepCost;
            neighbor.hCost = getDistance(neighbor, targetNode);
            neighbor.parent = currentNode;
            if (!isInOpenSet) {
              openSet.push(neighbor);
            }
          }
        }
      }
      return null;
    }
    function retracePath(startNode, endNode) {
      let path = [];
      let currentNode = endNode;
      while (currentNode !== startNode) {
        path.unshift(currentNode.position);
        currentNode = currentNode.parent;
      }
      return path;
    }
    function getDistance(pa, pb) {
      let dx = pa.position.x - pb.position.x;
      let dy = pa.position.y - pb.position.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    var PathFinder = {
      findPath,
      IGrid
    };
    module.exports = PathFinder;
  }
});

// ../Shaku/lib/utils/transform_modes.js
var require_transform_modes = __commonJS({
  "../Shaku/lib/utils/transform_modes.js"(exports, module) {
    "use strict";
    var TransformModes = {
      Relative: "relative",
      AxisAligned: "axis-aligned",
      Absolute: "absolute"
    };
    module.exports = TransformModes;
  }
});

// ../Shaku/lib/utils/transformation.js
var require_transformation = __commonJS({
  "../Shaku/lib/utils/transformation.js"(exports, module) {
    "use strict";
    var MathHelper = require_math_helper();
    var TransformModes = require_transform_modes();
    var Matrix = require_matrix();
    var Vector22 = require_vector2();
    var _defaults = {};
    _defaults.position = Vector22.zero;
    _defaults.positionMode = TransformModes.Relative;
    _defaults.scale = Vector22.one;
    _defaults.scaleMode = TransformModes.AxisAligned;
    _defaults.rotation = 0;
    _defaults.rotationMode = TransformModes.Relative;
    var Transformation = class {
      constructor(position, rotation, scale) {
        this._position = position || _defaults.position.clone();
        this._positionMode = _defaults.positionMode;
        this._scale = scale || _defaults.scale.clone();
        this._scaleMode = _defaults.scaleMode;
        this._rotation = rotation || _defaults.rotation;
        this._rotationMode = _defaults.rotationMode;
        this.onChange = null;
      }
      getPosition() {
        return this._position.clone();
      }
      getPositionMode() {
        return this._positionMode;
      }
      setPosition(value) {
        if (this._position.equals(value)) {
          return;
        }
        this._position.copy(value);
        this._markDirty(true, false);
        return this;
      }
      setPositionX(value) {
        if (this._position.x === value) {
          return;
        }
        this._position.x = value;
        this._markDirty(true, false);
        return this;
      }
      setPositionY(value) {
        if (this._position.y === value) {
          return;
        }
        this._position.y = value;
        this._markDirty(true, false);
        return this;
      }
      move(value) {
        this._position.addSelf(value);
        this._markDirty(true, false);
        return this;
      }
      setPositionMode(value) {
        if (this._positionMode === value) {
          return;
        }
        this._positionMode = value;
        this._markDirty(false, true);
        return this;
      }
      getScale() {
        return this._scale.clone();
      }
      getScaleMode() {
        return this._scaleMode;
      }
      setScale(value) {
        if (this._scale.equals(value)) {
          return;
        }
        this._scale.copy(value);
        this._markDirty(true, false);
        return this;
      }
      setScaleX(value) {
        if (this._scale.x === value) {
          return;
        }
        this._scale.x = value;
        this._markDirty(true, false);
        return this;
      }
      setScaleY(value) {
        if (this._scale.y === value) {
          return;
        }
        this._scale.y = value;
        this._markDirty(true, false);
        return this;
      }
      scale(value) {
        this._scale.mulSelf(value);
        this._markDirty(true, false);
        return this;
      }
      setScaleMode(value) {
        if (this._scaleMode === value) {
          return;
        }
        this._scaleMode = value;
        this._markDirty(false, true);
        return this;
      }
      getRotation() {
        return this._rotation;
      }
      getRotationDegrees() {
        return MathHelper.toDegrees(this._rotation);
      }
      getRotationDegreesWrapped() {
        let ret = this.getRotationDegrees();
        return MathHelper.wrapDegrees(ret);
      }
      getRotationMode() {
        return this._rotationMode;
      }
      setRotation(value, wrap) {
        if (this._rotation === value) {
          return;
        }
        this._rotation = value;
        if (wrap && (this._rotation < 0 || this._rotation > Math.PI * 2)) {
          this._rotation = Math.atan2(Math.sin(this._rotation), Math.cos(this._rotation));
        }
        this._markDirty(true, false);
        return this;
      }
      rotate(value, wrap) {
        this.setRotation(this._rotation + value, wrap);
        return this;
      }
      setRotationDegrees(value, wrap) {
        const rads = MathHelper.toRadians(value, wrap);
        return this.setRotation(rads);
      }
      rotateDegrees(value) {
        this._rotation += MathHelper.toRadians(value);
        this._markDirty(true, false);
        return this;
      }
      setRotationMode(value) {
        if (this._rotationMode === value) {
          return;
        }
        this._rotationMode = value;
        this._markDirty(false, true);
        return this;
      }
      _markDirty(localTransform, transformationModes) {
        this._matrix = null;
        if (this.onChange) {
          this.onChange(this, localTransform, transformationModes);
        }
      }
      equals(other) {
        return this._rotation === other._rotation && this._position.equals(other._position) && this._scale.equals(other._scale);
      }
      clone() {
        const ret = new Transformation(this._position.clone(), this._rotation, this._scale.clone());
        ret._rotationMode = this._rotationMode;
        ret._positionMode = this._positionMode;
        ret._scaleMode = this._scaleMode;
        ret._matrix = this._matrix;
        return ret;
      }
      serialize() {
        const ret = {};
        if (!this._position.equals(_defaults.position)) {
          ret.pos = this._position;
        }
        if (this._positionMode !== _defaults.positionMode) {
          ret.posm = this._positionMode;
        }
        if (!this._scale.equals(_defaults.scale)) {
          ret.scl = this._scale;
        }
        if (this._scaleMode !== _defaults.scaleMode) {
          ret.sclm = this._scaleMode;
        }
        if (this._rotation !== _defaults.rotation) {
          ret.rot = Math.floor(MathHelper.toDegrees(this._rotation));
        }
        if (this._rotationMode !== _defaults.rotationMode) {
          ret.rotm = this._rotationMode;
        }
        return ret;
      }
      deserialize(data) {
        this._position.copy(data.pos || _defaults.position);
        this._scale.copy(data.scl || _defaults.scale);
        this._rotation = MathHelper.toRadians(data.rot || _defaults.rotation);
        this._positionMode = data.posm || _defaults.positionMode;
        this._scaleMode = data.sclm || _defaults.scaleMode;
        this._rotationMode = data.rotm || _defaults.rotationMode;
        this._markDirty(true, true);
      }
      asMatrix() {
        if (this._matrix) {
          return this._matrix;
        }
        let matrices = [];
        if (this._position.x !== 0 || this._position.y !== 0) {
          matrices.push(Matrix.translate(this._position.x, this._position.y, 0));
        }
        if (this._rotation) {
          matrices.push(Matrix.rotateZ(-this._rotation));
        }
        if (this._scale.x !== 1 || this._scale.y !== 1) {
          matrices.push(Matrix.scale(this._scale.x, this._scale.y));
        }
        if (matrices.length === 0) {
          this._matrix = Matrix.identity;
        } else if (matrices.length === 1) {
          this._matrix = matrices[0];
        } else {
          this._matrix = Matrix.multiplyMany(matrices);
        }
        return this._matrix;
      }
      static combine(child, parent) {
        var position = combineVector(child._position, parent._position, parent, child._positionMode);
        var scale = combineVectorMul(child._scale, parent._scale, parent, child._scaleMode);
        var rotation = combineScalar(child._rotation, parent._rotation, parent, child._rotationMode);
        return new Transformation(position, rotation, scale);
      }
    };
    function combineScalar(childValue, parentValue, parent, mode) {
      switch (mode) {
        case TransformModes.Absolute:
          return childValue;
        case TransformModes.AxisAligned:
        case TransformModes.Relative:
          return parentValue + childValue;
        default:
          throw new Error("Unknown transform mode!");
      }
    }
    function combineVector(childValue, parentValue, parent, mode) {
      switch (mode) {
        case TransformModes.Absolute:
          return childValue.clone();
        case TransformModes.AxisAligned:
          return parentValue.add(childValue);
        case TransformModes.Relative:
          return parentValue.add(childValue.rotatedRadians(parent._rotation));
        default:
          throw new Error("Unknown transform mode!");
      }
    }
    function combineVectorMul(childValue, parentValue, parent, mode) {
      switch (mode) {
        case TransformModes.Absolute:
          return childValue.clone();
        case TransformModes.AxisAligned:
          return parentValue.mul(childValue);
        case TransformModes.Relative:
          return parentValue.mul(childValue.rotatedRadians(parent._rotation));
        default:
          throw new Error("Unknown transform mode!");
      }
    }
    module.exports = Transformation;
  }
});

// ../Shaku/lib/utils/index.js
var require_utils = __commonJS({
  "../Shaku/lib/utils/index.js"(exports, module) {
    "use strict";
    module.exports = {
      Vector2: require_vector2(),
      Vector3: require_vector3(),
      Rectangle: require_rectangle(),
      Circle: require_circle(),
      Line: require_line(),
      Color: require_color(),
      Animator: require_animator(),
      GameTime: require_game_time(),
      MathHelper: require_math_helper(),
      SeededRandom: require_seeded_random(),
      Perlin: require_perlin(),
      Storage: require_storage(),
      StorageAdapter: require_storage_adapter(),
      PathFinder: require_path_finder(),
      Transformation: require_transformation(),
      TransformationModes: require_transform_modes()
    };
  }
});

// ../Shaku/lib/gfx/vertex.js
var require_vertex = __commonJS({
  "../Shaku/lib/gfx/vertex.js"(exports, module) {
    "use strict";
    var { Vector2: Vector22, Color: Color2 } = require_utils();
    var Matrix = require_matrix();
    var Vertex = class {
      constructor(position, textureCoord, color) {
        this.position = position || Vector22.zero;
        this.textureCoord = textureCoord || Vector22.zero;
        this.color = color || Color2.white;
      }
      transform(matrix) {
        return this;
      }
      setPosition(position) {
        this.position = position.clone();
        return this;
      }
      setTextureCoords(textureCoord) {
        this.textureCoord = textureCoord.clone();
        return this;
      }
      setColor(color) {
        this.color = color.clone();
        return this;
      }
    };
    module.exports = Vertex;
  }
});

// ../Shaku/lib/gfx/matrix.js
var require_matrix = __commonJS({
  "../Shaku/lib/gfx/matrix.js"(exports, module) {
    "use strict";
    var Vector22 = require_vector2();
    var Vertex = require_vertex();
    var Matrix = class {
      constructor(values, cloneValues) {
        if (!values) {
          values = Matrix.identity.values;
        }
        if (cloneValues || cloneValues === void 0) {
          this.values = values.slice(0);
        } else {
          this.values = values;
        }
      }
      set(v11, v12, v13, v14, v21, v22, v23, v24, v31, v32, v33, v34, v41, v42, v43, v44) {
        this.values = new Float32Array([
          v11,
          v12,
          v13,
          v14,
          v21,
          v22,
          v23,
          v24,
          v31,
          v32,
          v33,
          v34,
          v41,
          v42,
          v43,
          v44
        ]);
      }
      clone() {
        let ret = new Matrix(this.values, true);
        return ret;
      }
      equals(other) {
        if (other === this) {
          return true;
        }
        if (!other) {
          return false;
        }
        for (let i = 0; i < this.values.length; ++i) {
          if (this.values[i] !== other.values[i]) {
            return false;
          }
        }
        return true;
      }
      static orthographic(left, right, bottom, top, near, far) {
        return new Matrix([
          2 / (right - left),
          0,
          0,
          0,
          0,
          2 / (top - bottom),
          0,
          0,
          0,
          0,
          2 / (near - far),
          0,
          (left + right) / (left - right),
          (bottom + top) / (bottom - top),
          (near + far) / (near - far),
          1
        ], false);
      }
      static perspective(fieldOfViewInRadians, aspectRatio, near, far) {
        var f = 1 / Math.tan(fieldOfViewInRadians / 2);
        var rangeInv = 1 / (near - far);
        return new Matrix([
          f / aspectRatio,
          0,
          0,
          0,
          0,
          f,
          0,
          0,
          0,
          0,
          (near + far) * rangeInv,
          -1,
          0,
          0,
          near * far * rangeInv * 2,
          0
        ], false);
      }
      static translate(x, y, z2) {
        return new Matrix([
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          x || 0,
          y || 0,
          z2 || 0,
          1
        ], false);
      }
      static scale(x, y, z2) {
        return new Matrix([
          x || 1,
          0,
          0,
          0,
          0,
          y || 1,
          0,
          0,
          0,
          0,
          z2 || 1,
          0,
          0,
          0,
          0,
          1
        ], false);
      }
      static rotateX(a) {
        let sin = Math.sin;
        let cos = Math.cos;
        return new Matrix([
          1,
          0,
          0,
          0,
          0,
          cos(a),
          -sin(a),
          0,
          0,
          sin(a),
          cos(a),
          0,
          0,
          0,
          0,
          1
        ], false);
      }
      static rotateY(a) {
        let sin = Math.sin;
        let cos = Math.cos;
        return new Matrix([
          cos(a),
          0,
          sin(a),
          0,
          0,
          1,
          0,
          0,
          -sin(a),
          0,
          cos(a),
          0,
          0,
          0,
          0,
          1
        ], false);
      }
      static rotateZ(a) {
        let sin = Math.sin;
        let cos = Math.cos;
        return new Matrix([
          cos(a),
          -sin(a),
          0,
          0,
          sin(a),
          cos(a),
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1
        ], false);
      }
      static multiply(matrixA, matrixB) {
        let row0 = [matrixB.values[0], matrixB.values[1], matrixB.values[2], matrixB.values[3]];
        let row1 = [matrixB.values[4], matrixB.values[5], matrixB.values[6], matrixB.values[7]];
        let row2 = [matrixB.values[8], matrixB.values[9], matrixB.values[10], matrixB.values[11]];
        let row3 = [matrixB.values[12], matrixB.values[13], matrixB.values[14], matrixB.values[15]];
        let result0 = multiplyMatrixAndPoint(matrixA.values, row0);
        let result1 = multiplyMatrixAndPoint(matrixA.values, row1);
        let result2 = multiplyMatrixAndPoint(matrixA.values, row2);
        let result3 = multiplyMatrixAndPoint(matrixA.values, row3);
        return new Matrix([
          result0[0],
          result0[1],
          result0[2],
          result0[3],
          result1[0],
          result1[1],
          result1[2],
          result1[3],
          result2[0],
          result2[1],
          result2[2],
          result2[3],
          result3[0],
          result3[1],
          result3[2],
          result3[3]
        ], false);
      }
      static multiplyMany(matrices) {
        let ret = matrices[0];
        for (let i = 1; i < matrices.length; i++) {
          ret = Matrix.multiply(ret, matrices[i]);
        }
        return ret;
      }
      static multiplyIntoFirst(matrixA, matrixB) {
        let row0 = [matrixB.values[0], matrixB.values[1], matrixB.values[2], matrixB.values[3]];
        let row1 = [matrixB.values[4], matrixB.values[5], matrixB.values[6], matrixB.values[7]];
        let row2 = [matrixB.values[8], matrixB.values[9], matrixB.values[10], matrixB.values[11]];
        let row3 = [matrixB.values[12], matrixB.values[13], matrixB.values[14], matrixB.values[15]];
        let result0 = multiplyMatrixAndPoint(matrixA.values, row0);
        let result1 = multiplyMatrixAndPoint(matrixA.values, row1);
        let result2 = multiplyMatrixAndPoint(matrixA.values, row2);
        let result3 = multiplyMatrixAndPoint(matrixA.values, row3);
        matrixA.set(
          result0[0],
          result0[1],
          result0[2],
          result0[3],
          result1[0],
          result1[1],
          result1[2],
          result1[3],
          result2[0],
          result2[1],
          result2[2],
          result2[3],
          result3[0],
          result3[1],
          result3[2],
          result3[3]
        );
        return matrixA;
      }
      static multiplyManyIntoFirst(matrices) {
        let ret = matrices[0];
        for (let i = 1; i < matrices.length; i++) {
          ret = Matrix.multiplyIntoFirst(ret, matrices[i]);
        }
        return ret;
      }
      static transformVertex(matrix, vertex) {
        return new Vertex(Matrix.transformVector2(matrix, vertex.position), vertex.textureCoord, vertex.color);
      }
      static transformVector2(matrix, vector) {
        const x = vector.x, y = vector.y, z2 = vector.z || 0;
        const e = matrix.values;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z2 + e[15]);
        const resx = (e[0] * x + e[4] * y + e[8] * z2 + e[12]) * w;
        const resy = (e[1] * x + e[5] * y + e[9] * z2 + e[13]) * w;
        return new Vector22(resx, resy);
      }
      static transformVector3(matrix, vector) {
        const x = vector.x, y = vector.y, z2 = vector.z || 0;
        const e = matrix.values;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z2 + e[15]);
        const resx = (e[0] * x + e[4] * y + e[8] * z2 + e[12]) * w;
        const resy = (e[1] * x + e[5] * y + e[9] * z2 + e[13]) * w;
        const resz = (e[2] * x + e[6] * y + e[10] * z2 + e[14]) * w;
        return new Vector3(resx, resy, resz);
      }
    };
    function multiplyMatrixAndPoint(matrix, point) {
      let c0r0 = matrix[0], c1r0 = matrix[1], c2r0 = matrix[2], c3r0 = matrix[3];
      let c0r1 = matrix[4], c1r1 = matrix[5], c2r1 = matrix[6], c3r1 = matrix[7];
      let c0r2 = matrix[8], c1r2 = matrix[9], c2r2 = matrix[10], c3r2 = matrix[11];
      let c0r3 = matrix[12], c1r3 = matrix[13], c2r3 = matrix[14], c3r3 = matrix[15];
      let x = point[0];
      let y = point[1];
      let z2 = point[2];
      let w = point[3];
      let resultX = x * c0r0 + y * c0r1 + z2 * c0r2 + w * c0r3;
      let resultY = x * c1r0 + y * c1r1 + z2 * c1r2 + w * c1r3;
      let resultZ = x * c2r0 + y * c2r1 + z2 * c2r2 + w * c2r3;
      let resultW = x * c3r0 + y * c3r1 + z2 * c3r2 + w * c3r3;
      return [resultX, resultY, resultZ, resultW];
    }
    Matrix.identity = new Matrix([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], false);
    Object.freeze(Matrix.identity);
    module.exports = Matrix;
  }
});

// ../Shaku/lib/gfx/effects/effect.js
var require_effect = __commonJS({
  "../Shaku/lib/gfx/effects/effect.js"(exports, module) {
    "use strict";
    var TextureAsset = require_texture_asset();
    var Color2 = require_color();
    var Rectangle2 = require_rectangle();
    var { TextureFilterMode, TextureFilterModes } = require_texture_filter_modes();
    var { TextureWrapMode, TextureWrapModes } = require_texture_wrap_modes();
    var Matrix = require_matrix();
    var _logger = require_logger().getLogger("gfx-effect");
    var Effect2 = class {
      _build(gl) {
        let program = gl.createProgram();
        {
          let shader = compileShader(gl, this.vertexCode, gl.VERTEX_SHADER);
          gl.attachShader(program, shader);
        }
        {
          let shader = compileShader(gl, this.fragmentCode, gl.FRAGMENT_SHADER);
          gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          _logger.error("Error linking shader program:");
          _logger.error(gl.getProgramInfoLog(program));
          throw new Error("Failed to link shader program.");
        }
        this._gl = gl;
        this._program = program;
        this.uniforms = {};
        this._uniformBinds = {};
        for (let uniform in this.uniformTypes) {
          let uniformLocation = this._gl.getUniformLocation(this._program, uniform);
          if (uniformLocation === -1) {
            _logger.error("Could not find uniform: " + uniform);
            throw new Error(`Uniform named '${uniform}' was not found in shader code!`);
          }
          let uniformData = this.uniformTypes[uniform];
          if (!UniformTypes._values.has(uniformData.type)) {
            _logger.error("Uniform has invalid type: " + uniformData.type);
            throw new Error(`Uniform '${uniform}' have illegal value type '${uniformData.type}'!`);
          }
          if (uniformData.type === UniformTypes.Matrix) {
            (function(_this, name, location, method) {
              _this.uniforms[name] = (mat) => {
                _this._gl[method](location, false, mat);
              };
            })(this, uniform, uniformLocation, uniformData.type);
          } else if (uniformData.type === UniformTypes.Texture) {
            (function(_this, name, location, method) {
              _this.uniforms[name] = (texture, index) => {
                index = index || 0;
                const glTexture = texture.texture || texture;
                const textureCode = _this._gl["TEXTURE" + (index || 0)];
                _this._gl.activeTexture(textureCode);
                _this._gl.bindTexture(_this._gl.TEXTURE_2D, glTexture);
                _this._gl.uniform1i(location, index || 0);
                if (texture.filter) {
                  _setTextureFilter(_this._gl, texture.filter);
                }
                if (texture.wrapMode) {
                  _setTextureWrapMode(_this._gl, texture.wrapMode);
                }
              };
            })(this, uniform, uniformLocation, uniformData.type);
          } else {
            (function(_this, name, location, method) {
              _this.uniforms[name] = (v1, v2, v3, v4) => {
                _this._gl[method](location, v1, v2, v3, v4);
              };
            })(this, uniform, uniformLocation, uniformData.type);
          }
          let bindTo = uniformData.bind;
          if (bindTo) {
            this._uniformBinds[bindTo] = uniform;
          }
        }
        this.attributes = {};
        this._attributeBinds = {};
        for (let attr in this.attributeTypes) {
          let attributeLocation = this._gl.getAttribLocation(this._program, attr);
          if (attributeLocation === -1) {
            _logger.error("Could not find attribute: " + attr);
            throw new Error(`Attribute named '${attr}' was not found in shader code!`);
          }
          let attributeData = this.attributeTypes[attr];
          (function(_this, name, location, data) {
            _this.attributes[name] = (buffer) => {
              if (buffer) {
                _this._gl.bindBuffer(_this._gl.ARRAY_BUFFER, buffer);
                _this._gl.vertexAttribPointer(location, data.size, _this._gl[data.type] || _this._gl.FLOAT, data.normalize || false, data.stride || 0, data.offset || 0);
                _this._gl.enableVertexAttribArray(location);
              } else {
                _this._gl.disableVertexAttribArray(location);
              }
            };
          })(this, attr, attributeLocation, attributeData);
          let bindTo = attributeData.bind;
          if (bindTo) {
            this._attributeBinds[bindTo] = attr;
          }
        }
        this._cachedValues = {};
      }
      get uniformTypes() {
        throw new Error("Not Implemented!");
      }
      get attributeTypes() {
        throw new Error("Not Implemented!");
      }
      setAsActive() {
        this._gl.useProgram(this._program);
        if (this.enableDepthTest) {
          this._gl.enable(this._gl.DEPTH_TEST);
        } else {
          this._gl.disable(this._gl.DEPTH_TEST);
        }
        if (this.enableFaceCulling) {
          this._gl.enable(this._gl.CULL_FACE);
        } else {
          this._gl.disable(this._gl.CULL_FACE);
        }
        if (this.enableStencilTest) {
          this._gl.enable(this._gl.STENCIL_TEST);
        } else {
          this._gl.disable(this._gl.STENCIL_TEST);
        }
        if (this.enableDithering) {
          this._gl.enable(this._gl.DITHER);
        } else {
          this._gl.disable(this._gl.DITHER);
        }
        this._cachedValues = {};
      }
      prepareToDrawBatch(mesh, world) {
        this._cachedValues = {};
        this.setPositionsAttribute(mesh.positions);
        this.setTextureCoordsAttribute(mesh.textureCoords);
        this.setColorsAttribute(mesh.colors);
        this.setWorldMatrix(world);
      }
      get vertexCode() {
        throw new Error("Not Implemented!");
      }
      get fragmentCode() {
        throw new Error("Not Implemented!");
      }
      get enableDepthTest() {
        return false;
      }
      get enableFaceCulling() {
        return false;
      }
      get enableStencilTest() {
        return false;
      }
      get enableDithering() {
        return false;
      }
      setTexture(texture) {
        if (texture === this._cachedValues.texture) {
          return false;
        }
        let uniform = this._uniformBinds[Effect2.UniformBinds.MainTexture];
        if (uniform) {
          this._cachedValues.texture = texture;
          let glTexture = texture.texture || texture;
          this._gl.activeTexture(this._gl.TEXTURE0);
          this._gl.bindTexture(this._gl.TEXTURE_2D, glTexture);
          this.uniforms[uniform](texture, 0);
          return true;
        }
        return false;
      }
      setColor(color) {
        let uniform = this._uniformBinds[Effect2.UniformBinds.Color];
        if (uniform) {
          if (color.equals(this._cachedValues.color)) {
            return;
          }
          this._cachedValues.color = color.clone();
          this.uniforms[uniform](color.floatArray);
        }
      }
      setUvOffsetAndScale(sourceRect, texture) {
        if (sourceRect) {
          if (sourceRect.equals(this._cachedValues.sourceRect)) {
            return;
          }
        } else {
          if (this._cachedValues.sourceRect === null) {
            return;
          }
        }
        this._cachedValues.sourceRect = sourceRect ? sourceRect.clone() : null;
        if (!sourceRect) {
          sourceRect = new Rectangle2(0, 0, texture.width, texture.height);
        }
        let uvOffset = this._uniformBinds[Effect2.UniformBinds.UvOffset];
        if (uvOffset) {
          this.uniforms[uvOffset](sourceRect.x / texture.width, sourceRect.y / texture.height);
        }
        let uvScale = this._uniformBinds[Effect2.UniformBinds.UvScale];
        if (uvScale) {
          this.uniforms[uvScale](sourceRect.width / texture.width, sourceRect.height / texture.height);
        }
      }
      setProjectionMatrix(matrix) {
        let uniform = this._uniformBinds[Effect2.UniformBinds.Projection];
        if (uniform) {
          if (matrix.equals(this._cachedValues.projection)) {
            return;
          }
          this._cachedValues.projection = matrix.clone();
          this.uniforms[uniform](matrix.values);
        }
      }
      setWorldMatrix(matrix) {
        let uniform = this._uniformBinds[Effect2.UniformBinds.World];
        if (uniform) {
          this.uniforms[uniform](matrix.values);
        }
      }
      setPositionsAttribute(buffer) {
        let attr = this._attributeBinds[Effect2.AttributeBinds.Position];
        if (attr) {
          if (buffer === this._cachedValues.positions) {
            return;
          }
          this._cachedValues.positions = buffer;
          this.attributes[attr](buffer);
        }
      }
      setTextureCoordsAttribute(buffer) {
        let attr = this._attributeBinds[Effect2.AttributeBinds.TextureCoords];
        if (attr) {
          if (buffer === this._cachedValues.coords) {
            return;
          }
          this._cachedValues.coords = buffer;
          this.attributes[attr](buffer);
        }
      }
      setColorsAttribute(buffer) {
        let attr = this._attributeBinds[Effect2.AttributeBinds.Colors];
        if (attr) {
          if (buffer === this._cachedValues.colors) {
            return;
          }
          this._cachedValues.colors = buffer;
          this.attributes[attr](buffer);
        }
      }
    };
    function compileShader(gl, code, type) {
      let shader = gl.createShader(type);
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        _logger.error(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
        _logger.error(gl.getShaderInfoLog(shader));
        throw new Error("Failed to compile a shader.");
      }
      return shader;
    }
    var UniformTypes = {
      Texture: "texture",
      Matrix: "uniformMatrix4fv",
      Color: "uniform4fv",
      Float: "uniform1f",
      FloatArray: "uniform1fv",
      Int: "uniform1i",
      IntArray: "uniform1iv",
      Float2: "uniform2f",
      Float2Array: "uniform2fv",
      Int2: "uniform2i",
      Int2Array: "uniform2iv",
      Float3: "uniform3f",
      Float3Array: "uniform3fv",
      Int3: "uniform3i",
      Int3Array: "uniform3iv",
      Float4: "uniform4f",
      Float4Array: "uniform4fv",
      Int4: "uniform4i",
      Int4Array: "uniform4iv"
    };
    Object.defineProperty(UniformTypes, "_values", {
      value: new Set(Object.values(UniformTypes)),
      writable: false
    });
    Object.freeze(UniformTypes);
    Effect2.UniformTypes = UniformTypes;
    Effect2.UniformBinds = {
      MainTexture: "texture",
      Color: "color",
      Projection: "projection",
      World: "world",
      UvOffset: "uvOffset",
      UvScale: "uvScale"
    };
    Object.freeze(Effect2.UniformBinds);
    Effect2.AttributeTypes = {
      Byte: "BYTE",
      Short: "SHORT",
      UByte: "UNSIGNED_BYTE",
      UShort: "UNSIGNED_SHORT",
      Float: "FLOAT",
      HalfFloat: "HALF_FLOAT"
    };
    Object.freeze(Effect2.AttributeTypes);
    Effect2.AttributeBinds = {
      Position: "position",
      TextureCoords: "uvs",
      Colors: "colors"
    };
    Object.freeze(Effect2.AttributeBinds);
    function _setTextureFilter(gl, filter) {
      if (!TextureFilterModes._values.has(filter)) {
        throw new Error("Invalid texture filter mode! Please pick a value from 'TextureFilterModes'.");
      }
      let glMode = gl[filter];
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, glMode);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, glMode);
    }
    function _setTextureWrapMode(gl, wrapX, wrapY) {
      if (wrapY === void 0) {
        wrapY = wrapX;
      }
      if (!TextureWrapModes._values.has(wrapX)) {
        throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");
      }
      if (!TextureWrapModes._values.has(wrapY)) {
        throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[wrapX]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[wrapY]);
    }
    module.exports = Effect2;
  }
});

// ../Shaku/lib/gfx/effects/basic.js
var require_basic = __commonJS({
  "../Shaku/lib/gfx/effects/basic.js"(exports, module) {
    "use strict";
    var Effect2 = require_effect();
    var vertexShader2 = `
attribute vec3 position;
attribute vec2 coord;
attribute vec4 color;

uniform mat4 projection;
uniform mat4 world;

varying vec2 v_texCoord;
varying vec4 v_color;

void main(void) {
    gl_Position = projection * world * vec4(position, 1.0);
    gl_PointSize = 1.0;
    v_texCoord = coord;
    v_color = color;
}
    `;
    var fragmentShader2 = `  
#ifdef GL_ES
    precision highp float;
#endif

uniform sampler2D texture;

varying vec2 v_texCoord;
varying vec4 v_color;

void main(void) {
    gl_FragColor = texture2D(texture, v_texCoord) * v_color;
    gl_FragColor.rgb *= gl_FragColor.a;
}
    `;
    var BasicEffect = class extends Effect2 {
      get vertexCode() {
        return vertexShader2;
      }
      get fragmentCode() {
        return fragmentShader2;
      }
      get uniformTypes() {
        return {
          "texture": { type: Effect2.UniformTypes.Texture, bind: Effect2.UniformBinds.MainTexture },
          "projection": { type: Effect2.UniformTypes.Matrix, bind: Effect2.UniformBinds.Projection },
          "world": { type: Effect2.UniformTypes.Matrix, bind: Effect2.UniformBinds.World }
        };
      }
      get attributeTypes() {
        return {
          "position": { size: 3, type: Effect2.AttributeTypes.Float, normalize: false, bind: Effect2.AttributeBinds.Position },
          "coord": { size: 2, type: Effect2.AttributeTypes.Float, normalize: false, bind: Effect2.AttributeBinds.TextureCoords },
          "color": { size: 4, type: Effect2.AttributeTypes.Float, normalize: false, bind: Effect2.AttributeBinds.Colors }
        };
      }
    };
    module.exports = BasicEffect;
  }
});

// ../Shaku/lib/gfx/effects/msdf_font.js
var require_msdf_font = __commonJS({
  "../Shaku/lib/gfx/effects/msdf_font.js"(exports, module) {
    "use strict";
    var Effect2 = require_effect();
    var vertexShader2 = `#version 300 es
in vec3 a_position;
in vec2 a_coord;
in vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_world;

out vec2 v_texCoord;
out vec4 v_color;

void main(void) {
    gl_Position = u_projection * u_world * vec4(a_position, 1.0);
    gl_PointSize = 1.0;
    v_texCoord = a_coord;
    v_color = a_color;
}`;
    var fragmentShader2 = `#version 300 es
precision highp float;

uniform sampler2D u_texture;

in vec2 v_texCoord;
in vec4 v_color;

out vec4 FragColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main(void) {
  vec3 _sample = texture(u_texture, v_texCoord).rgb;
  float sigDist = median(_sample.r, _sample.g, _sample.b) - 0.5;
  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
  // float alpha = clamp((sigDist / (fwidth(sigDist) * 1.5)) + 0.5, 0.0, 1.0);

  vec3 color = v_color.rgb * alpha;
  FragColor = vec4(color, alpha) * v_color.a;
}`;
    var MsdfFontEffect = class extends Effect2 {
      get vertexCode() {
        return vertexShader2;
      }
      get fragmentCode() {
        return fragmentShader2;
      }
      get uniformTypes() {
        return {
          "u_texture": { type: Effect2.UniformTypes.Texture, bind: Effect2.UniformBinds.MainTexture },
          "u_projection": { type: Effect2.UniformTypes.Matrix, bind: Effect2.UniformBinds.Projection },
          "u_world": { type: Effect2.UniformTypes.Matrix, bind: Effect2.UniformBinds.World }
        };
      }
      get attributeTypes() {
        return {
          "a_position": { size: 3, type: Effect2.AttributeTypes.Float, normalize: false, bind: Effect2.AttributeBinds.Position },
          "a_coord": { size: 2, type: Effect2.AttributeTypes.Float, normalize: false, bind: Effect2.AttributeBinds.TextureCoords },
          "a_color": { size: 4, type: Effect2.AttributeTypes.Float, normalize: false, bind: Effect2.AttributeBinds.Colors }
        };
      }
    };
    module.exports = MsdfFontEffect;
  }
});

// ../Shaku/lib/gfx/effects/index.js
var require_effects = __commonJS({
  "../Shaku/lib/gfx/effects/index.js"(exports, module) {
    "use strict";
    module.exports = {
      Effect: require_effect(),
      BasicEffect: require_basic(),
      MsdfFontEffect: require_msdf_font()
    };
  }
});

// ../Shaku/lib/gfx/mesh.js
var require_mesh = __commonJS({
  "../Shaku/lib/gfx/mesh.js"(exports, module) {
    "use strict";
    var { Color: Color2 } = require_utils();
    var Mesh = class {
      constructor(positions, textureCoords, colorsBuffer, indices, indicesCount) {
        this.positions = positions;
        this.textureCoords = textureCoords;
        this.colors = colorsBuffer;
        this.indices = indices;
        this.indicesCount = indicesCount;
        this.__color = new Color2(-1, -1, -1, -1);
        Object.freeze(this);
      }
      overrideColors(gl, color) {
        if (color.equals(this.__color)) {
          return;
        }
        this.__color.copy(color);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
        const colors = [];
        for (let i = 0; i < this.indicesCount; ++i) {
          colors.push(color.r);
          colors.push(color.g);
          colors.push(color.b);
          colors.push(color.a);
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      }
    };
    module.exports = Mesh;
  }
});

// ../Shaku/lib/gfx/mesh_generator.js
var require_mesh_generator = __commonJS({
  "../Shaku/lib/gfx/mesh_generator.js"(exports, module) {
    "use strict";
    var Mesh = require_mesh();
    var MeshGenerator = class {
      constructor(gl) {
        this._gl = gl;
      }
      quad() {
        const gl = this._gl;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        let x = 0.5;
        const positions = [
          -x,
          -x,
          0,
          x,
          -x,
          0,
          -x,
          x,
          0,
          x,
          x,
          0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = [
          0,
          0,
          1,
          0,
          0,
          1,
          1,
          1
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
        const colorsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        const colors = [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = [
          0,
          1,
          3,
          2
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return new Mesh(positionBuffer, textureCoordBuffer, colorsBuffer, indexBuffer, indices.length);
      }
    };
    module.exports = MeshGenerator;
  }
});

// ../Shaku/lib/gfx/camera.js
var require_camera = __commonJS({
  "../Shaku/lib/gfx/camera.js"(exports, module) {
    "use strict";
    var Rectangle2 = require_rectangle();
    var Vector22 = require_vector2();
    var Matrix = require_matrix();
    var Camera = class {
      constructor(gfx) {
        this.projection = null;
        this._region = null;
        this._gfx = gfx;
        this.orthographic();
        this._viewport = null;
      }
      get viewport() {
        return this._viewport;
      }
      set viewport(viewport) {
        this._viewport = viewport;
        return viewport;
      }
      getRegion() {
        return this._region.clone();
      }
      orthographicOffset(offset, ignoreViewportSize, near, far) {
        let renderingSize = ignoreViewportSize || !this.viewport ? this._gfx.getCanvasSize() : this.viewport.getSize();
        let region = new Rectangle2(offset.x, offset.y, renderingSize.x, renderingSize.y);
        this.orthographic(region, near, far);
      }
      orthographic(region, near, far) {
        if (region === void 0) {
          region = this._gfx.getRenderingRegion();
        }
        this._region = region;
        this.projection = Matrix.orthographic(region.left, region.right, region.bottom, region.top, near || -1, far || 400);
      }
      _perspective(fieldOfView, aspectRatio, near, far) {
        this.projection = Matrix.perspective(fieldOfView || Math.PI / 2, aspectRatio || 1, near || 0.1, far || 1e3);
      }
    };
    module.exports = Camera;
  }
});

// ../Shaku/lib/gfx/sprite.js
var require_sprite = __commonJS({
  "../Shaku/lib/gfx/sprite.js"(exports, module) {
    "use strict";
    var TextureAsset = require_texture_asset();
    var Color2 = require_color();
    var Rectangle2 = require_rectangle();
    var Vector22 = require_vector2();
    var Vector32 = require_vector3();
    var { BlendMode, BlendModes: BlendModes2 } = require_blend_modes();
    var Sprite2 = class {
      constructor(texture, sourceRect) {
        this.texture = texture;
        this.position = new Vector22(0, 0);
        if (sourceRect) {
          this.size = new Vector22(sourceRect.width, sourceRect.height);
        } else if (texture && texture.valid) {
          this.size = texture.size.clone();
        } else {
          this.size = new Vector22(100, 100);
        }
        this.sourceRect = sourceRect || null;
        this.blendMode = BlendModes2.AlphaBlend;
        this.rotation = 0;
        this.origin = new Vector22(0.5, 0.5);
        this.skew = new Vector22(0, 0);
        this.color = Color2.white;
        this.static = false;
      }
      setSourceFromSpritesheet(index, spritesCount, margin, setSize) {
        margin = margin || 0;
        let w = this.texture.width / spritesCount.x;
        let h = this.texture.height / spritesCount.y;
        let x = w * index.x + margin;
        let y = h * index.y + margin;
        w -= 2 * margin;
        h -= 2 * margin;
        if (setSize || setSize === void 0) {
          this.size.set(w, h);
        }
        if (this.sourceRect) {
          this.sourceRect.set(x, y, w, h);
        } else {
          this.sourceRect = new Rectangle2(x, y, w, h);
        }
      }
      clone() {
        let ret = new Sprite2(this.texture, this.sourceRect);
        ret.position = this.position.clone();
        ret.size = this.size.clone();
        ret.blendMode = this.blendMode;
        ret.rotation = this.rotation;
        ret.origin = this.origin.clone();
        ret.color = this.color.clone();
        ret.static = this.static;
        return ret;
      }
      updateStaticProperties() {
        this._cachedVertices = null;
      }
      get flipX() {
        return this.size.x < 0;
      }
      set flipX(flip) {
        if (flip === void 0)
          flip = !this.flipX;
        this.size.x = Math.abs(this.size.x) * (flip ? -1 : 1);
        return flip;
      }
      get flipY() {
        return this.size.y < 0;
      }
      set flipY(flip) {
        if (flip === void 0)
          flip = !this.flipY;
        this.size.y = Math.abs(this.size.y) * (flip ? -1 : 1);
        return flip;
      }
    };
    module.exports = Sprite2;
  }
});

// ../Shaku/lib/gfx/sprites_group.js
var require_sprites_group = __commonJS({
  "../Shaku/lib/gfx/sprites_group.js"(exports, module) {
    "use strict";
    var Color2 = require_color();
    var Vector22 = require_vector2();
    var Matrix = require_matrix();
    var Sprite2 = require_sprite();
    var SpritesGroup = class {
      constructor() {
        this._sprites = [];
        this.rotation = 0;
        this.position = new Vector22(0, 0);
        this.scale = new Vector22(1, 1);
      }
      forEach(callback) {
        this._sprites.forEach(callback);
      }
      setColor(color) {
        for (let i = 0; i < this._sprites.length; ++i) {
          this._sprites[i].color.copy(color);
        }
      }
      getTransform() {
        let matrices = [];
        if (this.position.x !== 0 || this.position.y !== 0) {
          matrices.push(Matrix.translate(this.position.x, this.position.y, 0));
        }
        if (this.rotation) {
          matrices.push(Matrix.rotateZ(-this.rotation));
        }
        if (this.scale.x !== 1 || this.scale.y !== 1) {
          matrices.push(Matrix.scale(this.scale.x, this.scale.y));
        }
        if (matrices.length === 0) {
          return null;
        }
        ;
        if (matrices.length === 1) {
          return matrices[0];
        }
        return Matrix.multiplyMany(matrices);
      }
      add(sprite) {
        this._sprites.push(sprite);
        return sprite;
      }
      remove(sprite) {
        for (let i = 0; i < this._sprites.length; ++i) {
          if (this._sprites[i] === sprite) {
            this._sprites.splice(i, 1);
            return;
          }
        }
      }
      shift() {
        return this._sprites.shift();
      }
      sort(compare) {
        this._sprites.sort(compare);
      }
      sortForBatching() {
        this._sprites.sort((a, b) => {
          let at = a.texture.url + a.blendMode;
          let bt = b.texture.url + b.blendMode;
          return at > bt ? 1 : bt > at ? -1 : 0;
        });
      }
      get count() {
        return this._sprites.length;
      }
    };
    module.exports = SpritesGroup;
  }
});

// ../Shaku/lib/assets/font_texture_asset.js
var require_font_texture_asset = __commonJS({
  "../Shaku/lib/assets/font_texture_asset.js"(exports, module) {
    "use strict";
    var Asset = require_asset();
    var Vector22 = require_vector2();
    var Rectangle2 = require_rectangle();
    var TextureAsset = require_texture_asset();
    var FontTextureAsset = class extends Asset {
      constructor(url) {
        super(url);
        this._fontName = null;
        this._fontSize = null;
        this._placeholderChar = null;
        this._sourceRects = null;
        this._texture = null;
        this._lineHeight = 0;
      }
      get lineHeight() {
        return this._lineHeight;
      }
      get fontName() {
        return this._fontName;
      }
      get fontSize() {
        return this._fontSize;
      }
      get placeholderCharacter() {
        return this._placeholderChar;
      }
      get texture() {
        return this._texture;
      }
      load(params) {
        return new Promise(async (resolve, reject2) => {
          if (!params || !params.fontName) {
            return reject2("When loading font texture you must provide params with a 'fontName' value!");
          }
          this._placeholderChar = (params.missingCharPlaceholder || "?")[0];
          let smooth = params.smoothFont === void 0 ? true : params.smoothFont;
          let extraPadding = params.extraPadding || { x: 0, y: 0 };
          let maxTextureWidth = params.maxTextureWidth || 1024;
          let charsSet = params.charactersSet || FontTextureAsset.defaultCharactersSet;
          if (charsSet.indexOf(this._placeholderChar) === -1) {
            charsSet += this._placeholderChar;
          }
          let fontFace = new FontFace(params.fontName, `url(${this.url})`);
          await fontFace.load();
          document.fonts.add(fontFace);
          this._fontName = params.fontName;
          this._fontSize = params.fontSize || 52;
          let margin = { x: 10, y: 5 };
          let fontFullName = this.fontSize.toString() + "px " + this.fontName;
          let fontHeight = measureTextHeight(this.fontName, this.fontSize, void 0, extraPadding.y);
          let fontWidth = measureTextWidth(this.fontName, this.fontSize, void 0, extraPadding.x);
          this._lineHeight = fontHeight;
          let estimatedCharSizeInTexture = new Vector22(fontWidth + margin.x * 2, fontHeight + margin.y * 2);
          let charsPerRow = Math.floor(maxTextureWidth / estimatedCharSizeInTexture.x);
          let textureWidth = Math.min(charsSet.length * estimatedCharSizeInTexture.x, maxTextureWidth);
          let textureHeight = Math.ceil(charsSet.length / charsPerRow) * estimatedCharSizeInTexture.y;
          if (params.enforceTexturePowerOfTwo || params.enforceTexturePowerOfTwo === void 0) {
            textureWidth = makePowerTwo(textureWidth);
            textureHeight = makePowerTwo(textureHeight);
          }
          this._sourceRects = {};
          let canvas = document.createElement("canvas");
          canvas.width = textureWidth;
          canvas.height = textureHeight;
          if (!smooth) {
            canvas.style.webkitFontSmoothing = "none";
            canvas.style.fontSmooth = "never";
            canvas.style.textRendering = "geometricPrecision";
          }
          let ctx = canvas.getContext("2d");
          ctx.textBaseline = "bottom";
          ctx.font = fontFullName;
          ctx.fillStyle = "#ffffffff";
          ctx.imageSmoothingEnabled = smooth;
          let x = 0;
          let y = 0;
          for (let i = 0; i < charsSet.length; ++i) {
            let currChar = charsSet[i];
            let currCharWidth = Math.ceil(ctx.measureText(currChar).width + extraPadding.x);
            if (x + currCharWidth > textureWidth) {
              y += Math.round(fontHeight + margin.y);
              x = 0;
            }
            const offsetAdjustment = params.sourceRectOffsetAdjustment || { x: 0, y: 0 };
            let sourceRect = new Rectangle2(x + offsetAdjustment.x, y + offsetAdjustment.y, currCharWidth, fontHeight);
            this._sourceRects[currChar] = sourceRect;
            ctx.fillText(currChar, x, y + fontHeight);
            x += Math.round(currCharWidth + margin.x);
          }
          if (!smooth) {
            let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            let data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0 && (data[i + 3] < 255 || data[i] < 255 || data[i + 1] < 255 || data[i + 2] < 255)) {
                data[i + 3] = 0;
              }
            }
            ctx.putImageData(imageData, 0, 0);
          }
          let img = new Image();
          img.src = canvas.toDataURL("image/png");
          img.onload = () => {
            let texture = new TextureAsset(this.url + "__font-texture");
            texture.fromImage(img);
            this._texture = texture;
            this._notifyReady();
            resolve();
          };
        });
      }
      get valid() {
        return Boolean(this._texture);
      }
      getSourceRect(character) {
        return this._sourceRects[character] || this._sourceRects[this.placeholderCharacter];
      }
      getPositionOffset(character) {
        return Vector22.zero;
      }
      getXAdvance(character) {
        return this.getSourceRect(character).width;
      }
      destroy() {
        if (this._texture)
          this._texture.destroy();
        this._fontName = null;
        this._fontSize = null;
        this._placeholderChar = null;
        this._sourceRects = null;
        this._texture = null;
        this._lineHeight = 0;
      }
    };
    FontTextureAsset.defaultCharactersSet = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE";
    function makePowerTwo(val) {
      let ret = 2;
      while (ret < val) {
        if (ret >= val) {
          return ret;
        }
        ret = ret * 2;
      }
      return ret;
    }
    function measureTextHeight(fontFamily, fontSize, char, extraHeight) {
      let text = document.createElement("pre");
      text.style.fontFamily = fontFamily;
      text.style.fontSize = fontSize + "px";
      text.style.paddingBottom = text.style.paddingLeft = text.style.paddingTop = text.style.paddingRight = "0px";
      text.style.marginBottom = text.style.marginLeft = text.style.marginTop = text.style.marginRight = "0px";
      text.textContent = char || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
      document.body.appendChild(text);
      let result = text.getBoundingClientRect().height + (extraHeight || 0);
      document.body.removeChild(text);
      return Math.ceil(result);
    }
    function measureTextWidth(fontFamily, fontSize, char, extraWidth) {
      if (char === "\n" || char === "\r") {
        return 0;
      }
      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      context.font = fontSize.toString() + "px " + fontFamily;
      let result = 0;
      let text = char || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
      for (let i = 0; i < text.length; ++i) {
        result = Math.max(result, context.measureText(text[i]).width + (extraWidth || 0));
      }
      return Math.ceil(result);
    }
    module.exports = FontTextureAsset;
  }
});

// ../Shaku/lib/assets/json_asset.js
var require_json_asset = __commonJS({
  "../Shaku/lib/assets/json_asset.js"(exports, module) {
    "use strict";
    var Asset = require_asset();
    var JsonAsset = class extends Asset {
      constructor(url) {
        super(url);
        this._data = null;
      }
      load() {
        return new Promise((resolve, reject2) => {
          var request = new XMLHttpRequest();
          request.open("GET", this.url, true);
          request.responseType = "json";
          request.onload = () => {
            if (request.readyState == 4) {
              if (request.response) {
                this._data = request.response;
                this._notifyReady();
                resolve();
              } else {
                if (request.status === 200) {
                  reject2("Response is not a valid JSON!");
                } else {
                  reject2(request.statusText);
                }
              }
            }
          };
          request.onerror = (e) => {
            reject2(e);
          };
          request.send();
        });
      }
      create(source) {
        return new Promise((resolve, reject2) => {
          try {
            if (source) {
              if (typeof source === "string") {
                source = JSON.parse(source);
              } else {
                source = JSON.parse(JSON.stringify(source));
              }
            } else {
              source = {};
            }
          } catch (e) {
            return reject2("Data is not a valid JSON serializable object!");
          }
          this._data = source;
          this._notifyReady();
          resolve();
        });
      }
      get data() {
        return this._data;
      }
      get valid() {
        return Boolean(this._data);
      }
      destroy() {
        this._data = null;
      }
    };
    module.exports = JsonAsset;
  }
});

// ../Shaku/lib/assets/msdf_font_texture_asset.js
var require_msdf_font_texture_asset = __commonJS({
  "../Shaku/lib/assets/msdf_font_texture_asset.js"(exports, module) {
    "use strict";
    var Vector22 = require_vector2();
    var Rectangle2 = require_rectangle();
    var TextureAsset = require_texture_asset();
    var FontTextureAsset = require_font_texture_asset();
    var JsonAsset = require_json_asset();
    var TextureFilterModes = require_texture_filter_modes();
    var MsdfFontTextureAsset = class extends FontTextureAsset {
      constructor(url) {
        super(url);
        this._positionOffsets = null;
        this._xAdvances = null;
      }
      load(params) {
        return new Promise(async (resolve, reject2) => {
          if (!params || !params.jsonUrl || !params.textureUrl) {
            return reject2("When loading an msdf font you must provide params with a 'jsonUrl' and a 'textureUrl'!");
          }
          let atlas_json = new JsonAsset(params.jsonUrl);
          let atlas_texture = new TextureAsset(params.textureUrl);
          await Promise.all([atlas_json.load(), atlas_texture.load()]);
          let atlas_metadata = atlas_json.data;
          atlas_texture.filter = "LINEAR";
          if (atlas_metadata.common.pages > 1) {
            throw new Error("Can't use MSDF font with several pages");
          }
          this._placeholderChar = (params.missingCharPlaceholder || "?")[0];
          if (!atlas_metadata.info.charset.includes(this._placeholderChar)) {
            throw new Error("The atlas' charset doesn't include the given placeholder character");
          }
          this._fontName = atlas_metadata.info.face;
          this._fontSize = atlas_metadata.info.size;
          this._lineHeight = atlas_metadata.common.lineHeight;
          this._sourceRects = {};
          this._positionOffsets = {};
          this._xAdvances = {};
          this._kernings = {};
          for (const charData of atlas_metadata.chars) {
            let currChar = charData.char;
            let sourceRect = new Rectangle2(charData.x, charData.y, charData.width, charData.height);
            this._sourceRects[currChar] = sourceRect;
            this._positionOffsets[currChar] = new Vector22(
              charData.xoffset,
              charData.yoffset
            );
            this._xAdvances[currChar] = charData.xadvance;
          }
          this._texture = atlas_texture;
          this._notifyReady();
          resolve();
        });
      }
      getPositionOffset(character) {
        return this._positionOffsets[character] || this._positionOffsets[this.placeholderCharacter];
      }
      getXAdvance(character) {
        return this._xAdvances[character] || this._xAdvances[this.placeholderCharacter];
      }
      destroy() {
        super.destroy();
        this._positionOffsets = null;
        this._xAdvances = null;
        this._kernings = null;
      }
    };
    module.exports = MsdfFontTextureAsset;
  }
});

// ../Shaku/lib/gfx/text_alignments.js
var require_text_alignments = __commonJS({
  "../Shaku/lib/gfx/text_alignments.js"(exports, module) {
    "use strict";
    var TextAlignments2 = {
      Left: "left",
      Right: "right",
      Center: "center"
    };
    Object.freeze(TextAlignments2);
    module.exports = { TextAlignments: TextAlignments2 };
  }
});

// ../Shaku/lib/gfx/sprite_batch.js
var require_sprite_batch = __commonJS({
  "../Shaku/lib/gfx/sprite_batch.js"(exports, module) {
    "use strict";
    var { Rectangle: Rectangle2, Color: Color2 } = require_utils();
    var Vector22 = require_vector2();
    var Vertex = require_vertex();
    var { BlendModes: BlendModes2 } = require_blend_modes();
    var Matrix = require_matrix();
    var Mesh = require_mesh();
    var _logger = require_logger().getLogger("gfx");
    var SpriteBatch = class {
      constructor(gfx) {
        this._gfx = gfx;
        this._gl = gfx._gl;
        this._positions = gfx._dynamicBuffers.positionArray;
        this._uvs = gfx._dynamicBuffers.textureArray;
        this._colors = gfx._dynamicBuffers.colorsArray;
        this._positionsBuff = gfx._dynamicBuffers.positionBuffer;
        this._uvsBuff = gfx._dynamicBuffers.textureCoordBuffer;
        this._colorsBuff = gfx._dynamicBuffers.colorsBuffer;
        this._indexBuff = gfx._dynamicBuffers.indexBuffer;
        this.snapPixels = true;
        this.applyAntiBleeding = true;
      }
      vertex(position, textureCoord, color) {
        return new Vertex(position, textureCoord, color);
      }
      get drawing() {
        return this._drawing;
      }
      begin(effect, transform) {
        if (this._drawing) {
          _logger.error("Start drawing a batch while already drawing a batch!");
        }
        if (effect) {
          this._gfx.useEffect(effect);
        }
        this._effect = this._gfx._activeEffect;
        this._currBlend = BlendModes2.AlphaBlend;
        this._currTexture = null;
        this._currBatchCount = 0;
        this._transform = transform;
        this._drawing = true;
      }
      end() {
        if (!this._drawing) {
          _logger.error("Stop drawing a batch without starting it first!");
        }
        if (this._currBatchCount) {
          this._drawCurrentBatch();
        }
        this._drawing = false;
      }
      setTexture(texture) {
        if (texture !== this._currTexture) {
          if (this._currBatchCount) {
            this._drawCurrentBatch();
          }
          this._currTexture = texture;
        }
      }
      draw(sprites, cullOutOfScreen) {
        if (sprites.length === void 0) {
          sprites = [sprites];
        }
        let region = cullOutOfScreen ? this._gfx.getRenderingRegion() : null;
        let positions = this._positions;
        let uvs = this._uvs;
        let colors = this._colors;
        for (let sprite of sprites) {
          if (this._currBatchCount) {
            if (this._currBatchCount >= this.batchSpritesCount || sprite.blendMode !== this._currBlend || sprite.texture !== this._currTexture) {
              this._drawCurrentBatch();
            }
          }
          this._currTexture = sprite.texture;
          this._currBlend = sprite.blendMode;
          let ci = this._currBatchCount * 4 * 4;
          if (sprite.color instanceof Array) {
            let lastColor = sprite.color[0];
            for (let x = 0; x < 4; ++x) {
              let curr = sprite.color[x] || lastColor;
              colors[ci + x * 4 + 0] = curr.r;
              colors[ci + x * 4 + 1] = curr.g;
              colors[ci + x * 4 + 2] = curr.b;
              colors[ci + x * 4 + 3] = curr.a;
              lastColor = curr;
            }
          } else {
            for (let x = 0; x < 4; ++x) {
              colors[ci + x * 4 + 0] = sprite.color.r;
              colors[ci + x * 4 + 1] = sprite.color.g;
              colors[ci + x * 4 + 2] = sprite.color.b;
              colors[ci + x * 4 + 3] = sprite.color.a;
            }
          }
          if (sprite.static && sprite._cachedVertices) {
            let topLeft2 = sprite._cachedVertices[0];
            let topRight2 = sprite._cachedVertices[1];
            let bottomLeft2 = sprite._cachedVertices[2];
            let bottomRight2 = sprite._cachedVertices[3];
            let pi2 = this._currBatchCount * 4 * 3;
            positions[pi2 + 0] = topLeft2.position.x;
            positions[pi2 + 1] = topLeft2.position.y;
            positions[pi2 + 2] = topLeft2.position.z || 0;
            positions[pi2 + 3] = topRight2.position.x;
            positions[pi2 + 4] = topRight2.position.y;
            positions[pi2 + 5] = topRight2.position.z || 0;
            positions[pi2 + 6] = bottomLeft2.position.x;
            positions[pi2 + 7] = bottomLeft2.position.y;
            positions[pi2 + 8] = bottomLeft2.position.z || 0;
            positions[pi2 + 9] = bottomRight2.position.x;
            positions[pi2 + 10] = bottomRight2.position.y;
            positions[pi2 + 11] = bottomRight2.position.z || 0;
            let uvi2 = this._currBatchCount * 4 * 2;
            uvs[uvi2 + 0] = topLeft2.uv.x;
            uvs[uvi2 + 1] = topLeft2.uv.y;
            uvs[uvi2 + 2] = bottomRight2.uv.x;
            uvs[uvi2 + 3] = topLeft2.uv.y;
            uvs[uvi2 + 4] = topLeft2.uv.x;
            uvs[uvi2 + 5] = bottomRight2.uv.y;
            uvs[uvi2 + 6] = bottomRight2.uv.x;
            uvs[uvi2 + 7] = bottomRight2.uv.y;
            this._currBatchCount++;
            continue;
          }
          let sizeX = sprite.size.x;
          let sizeY = sprite.size.y;
          let left = -sizeX * sprite.origin.x;
          let top = -sizeY * sprite.origin.y;
          let topLeft = new Vector22(left, top);
          let topRight = new Vector22(left + sizeX, top);
          let bottomLeft = new Vector22(left, top + sizeY);
          let bottomRight = new Vector22(left + sizeX, top + sizeY);
          if (sprite.skew) {
            if (sprite.skew.x) {
              topLeft.x += sprite.skew.x * sprite.origin.y;
              topRight.x += sprite.skew.x * sprite.origin.y;
              bottomLeft.x -= sprite.skew.x * (1 - sprite.origin.y);
              bottomRight.x -= sprite.skew.x * (1 - sprite.origin.y);
            }
            if (sprite.skew.y) {
              topLeft.y += sprite.skew.y * sprite.origin.x;
              bottomLeft.y += sprite.skew.y * sprite.origin.x;
              topRight.y -= sprite.skew.y * (1 - sprite.origin.x);
              bottomRight.y -= sprite.skew.y * (1 - sprite.origin.x);
            }
          }
          if (sprite.rotation) {
            let rotateVec = function(vector) {
              let x = vector.x * cos - vector.y * sin;
              let y = vector.x * sin + vector.y * cos;
              vector.set(x, y);
            };
            let cos = Math.cos(sprite.rotation);
            let sin = Math.sin(sprite.rotation);
            rotateVec(topLeft);
            rotateVec(topRight);
            rotateVec(bottomLeft);
            rotateVec(bottomRight);
          }
          topLeft.addSelf(sprite.position);
          topRight.addSelf(sprite.position);
          bottomLeft.addSelf(sprite.position);
          bottomRight.addSelf(sprite.position);
          if (this.snapPixels) {
            topLeft.floorSelf();
            topRight.floorSelf();
            bottomLeft.floorSelf();
            bottomRight.floorSelf();
          }
          let z2 = sprite.position.z || 0;
          let zDepth = sprite.size.z || 0;
          if (cullOutOfScreen) {
            let destRect = Rectangle2.fromPoints([topLeft, topRight, bottomLeft, bottomRight]);
            if (!region.collideRect(destRect)) {
              continue;
            }
          }
          let pi = this._currBatchCount * 4 * 3;
          positions[pi + 0] = topLeft.x;
          positions[pi + 1] = topLeft.y;
          positions[pi + 2] = z2;
          positions[pi + 3] = topRight.x;
          positions[pi + 4] = topRight.y;
          positions[pi + 5] = z2;
          positions[pi + 6] = bottomLeft.x;
          positions[pi + 7] = bottomLeft.y;
          positions[pi + 8] = z2 + zDepth;
          positions[pi + 9] = bottomRight.x;
          positions[pi + 10] = bottomRight.y;
          positions[pi + 11] = z2 + zDepth;
          let uvi = this._currBatchCount * 4 * 2;
          var uvTl;
          var uvBr;
          if (sprite.sourceRect) {
            uvTl = { x: sprite.sourceRect.x / this._currTexture.width, y: sprite.sourceRect.y / this._currTexture.height };
            uvBr = { x: uvTl.x + sprite.sourceRect.width / this._currTexture.width, y: uvTl.y + sprite.sourceRect.height / this._currTexture.height };
            if (sprite.rotation && this.applyAntiBleeding) {
              let marginX = 0.015 / this._currTexture.width;
              let marginY = 0.015 / this._currTexture.height;
              uvTl.x += marginX;
              uvBr.x -= marginX * 2;
              uvTl.y += marginY;
              uvBr.y -= marginY * 2;
            }
            uvs[uvi + 0] = uvTl.x;
            uvs[uvi + 1] = uvTl.y;
            uvs[uvi + 2] = uvBr.x;
            uvs[uvi + 3] = uvTl.y;
            uvs[uvi + 4] = uvTl.x;
            uvs[uvi + 5] = uvBr.y;
            uvs[uvi + 6] = uvBr.x;
            uvs[uvi + 7] = uvBr.y;
          } else {
            uvs[uvi + 0] = 0;
            uvs[uvi + 1] = 0;
            uvs[uvi + 2] = 1;
            uvs[uvi + 3] = 0;
            uvs[uvi + 4] = 0;
            uvs[uvi + 5] = 1;
            uvs[uvi + 6] = 1;
            uvs[uvi + 7] = 1;
          }
          if (sprite.static) {
            sprite._cachedVertices = [
              { position: topLeft, uv: uvTl || { x: 0, y: 0 } },
              { position: topRight },
              { position: bottomLeft },
              { position: bottomRight, uv: uvBr || { x: 1, y: 1 } }
            ];
          }
          this._currBatchCount++;
        }
      }
      pushVertices(vertices) {
        if (!vertices || vertices.length !== 4) {
          throw new Error("Vertices must be array of 4 values!");
        }
        let positions = this._positions;
        let uvs = this._uvs;
        let colors = this._colors;
        for (let i = 0; i < vertices.length; ++i) {
          let vertex = vertices[i];
          let ci = this._currBatchCount * (4 * 4) + i * 4;
          colors[ci + 0] = vertex.color.r;
          colors[ci + 1] = vertex.color.g;
          colors[ci + 2] = vertex.color.b;
          colors[ci + 3] = vertex.color.a;
        }
        let topLeft = vertices[0].position;
        let topRight = vertices[1].position;
        let bottomLeft = vertices[2].position;
        let bottomRight = vertices[3].position;
        let pi = this._currBatchCount * 4 * 3;
        positions[pi + 0] = topLeft.x;
        positions[pi + 1] = topLeft.y;
        positions[pi + 2] = topLeft.z || 0;
        positions[pi + 3] = topRight.x;
        positions[pi + 4] = topRight.y;
        positions[pi + 5] = topRight.z || 0;
        positions[pi + 6] = bottomLeft.x;
        positions[pi + 7] = bottomLeft.y;
        positions[pi + 8] = bottomLeft.z || 0;
        positions[pi + 9] = bottomRight.x;
        positions[pi + 10] = bottomRight.y;
        positions[pi + 11] = bottomRight.z || 0;
        let uvi = this._currBatchCount * (4 * 2);
        uvs[uvi++] = vertices[0].textureCoord.x / this._currTexture.width;
        uvs[uvi++] = vertices[0].textureCoord.y / this._currTexture.height;
        uvs[uvi++] = vertices[1].textureCoord.x / this._currTexture.width;
        uvs[uvi++] = vertices[1].textureCoord.y / this._currTexture.height;
        uvs[uvi++] = vertices[2].textureCoord.x / this._currTexture.width;
        uvs[uvi++] = vertices[2].textureCoord.y / this._currTexture.height;
        uvs[uvi++] = vertices[3].textureCoord.x / this._currTexture.width;
        uvs[uvi++] = vertices[3].textureCoord.y / this._currTexture.height;
        this._currBatchCount++;
      }
      get batchSpritesCount() {
        return this._gfx.batchSpritesCount;
      }
      _drawCurrentBatch() {
        let gl = this._gl;
        let transform = this._transform;
        let positionArray = this._positions;
        let textureArray = this._uvs;
        let colorsArray = this._colors;
        let positionBuffer = this._positionsBuff;
        let textureCoordBuffer = this._uvsBuff;
        let colorsBuffer = this._colorsBuff;
        let indexBuffer = this._indexBuff;
        if (this._effect !== this._gfx._activeEffect) {
          _logger.error("Effect changed while drawing batch!");
        }
        this._gfx._setBlendMode(this._currBlend);
        let mesh = new Mesh(positionBuffer, textureCoordBuffer, colorsBuffer, indexBuffer, this._currBatchCount * 6);
        this._gfx._activeEffect.prepareToDrawBatch(mesh, transform || Matrix.identity);
        this._gfx._setActiveTexture(this._currTexture);
        let shouldSliceArrays = this._currBatchCount < this.batchSpritesCount / 2;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          shouldSliceArrays ? positionArray.slice(0, this._currBatchCount * 4 * 3) : positionArray,
          gl.DYNAMIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          shouldSliceArrays ? textureArray.slice(0, this._currBatchCount * 4 * 2) : textureArray,
          gl.DYNAMIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          shouldSliceArrays ? colorsArray.slice(0, this._currBatchCount * 4 * 4) : colorsArray,
          gl.DYNAMIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this._currIndices = null;
        gl.drawElements(gl.TRIANGLES, this._currBatchCount * 6, gl.UNSIGNED_SHORT, 0);
        this._gfx._drawCallsCount++;
        this._gfx._drawQuadsCount += this._currBatchCount;
        this._currBatchCount = 0;
      }
    };
    module.exports = SpriteBatch;
  }
});

// ../Shaku/lib/gfx/gfx.js
var require_gfx = __commonJS({
  "../Shaku/lib/gfx/gfx.js"(exports, module) {
    "use strict";
    var IManager = require_manager();
    var Color2 = require_color();
    var { BlendMode, BlendModes: BlendModes2 } = require_blend_modes();
    var Rectangle2 = require_rectangle();
    var { Effect: Effect2, BasicEffect, MsdfFontEffect } = require_effects();
    var TextureAsset = require_texture_asset();
    var { TextureFilterMode, TextureFilterModes } = require_texture_filter_modes();
    var { TextureWrapMode, TextureWrapModes } = require_texture_wrap_modes();
    var MeshGenerator = require_mesh_generator();
    var Matrix = require_matrix();
    var Camera = require_camera();
    var Sprite2 = require_sprite();
    var SpritesGroup = require_sprites_group();
    var Vector22 = require_vector2();
    var FontTextureAsset = require_font_texture_asset();
    var MsdfFontTextureAsset = require_msdf_font_texture_asset();
    var { TextAlignment, TextAlignments: TextAlignments2 } = require_text_alignments();
    var Mesh = require_mesh();
    var Circle = require_circle();
    var SpriteBatch = require_sprite_batch();
    var Vector32 = require_vector3();
    var Vertex = require_vertex();
    var _whiteColor = Color2.white;
    var _logger = require_logger().getLogger("gfx");
    var Gfx = class extends IManager {
      constructor() {
        super();
        this._gl = null;
        this._initSettings = { antialias: true, alpha: true, depth: false, premultipliedAlpha: true, desynchronized: false };
        this._canvas = null;
        this._lastBlendMode = null;
        this._activeEffect = null;
        this._camera = null;
        this._projection = null;
        this._currIndices = null;
        this._dynamicBuffers = null;
        this._fb = null;
        this.builtinEffects = {};
        this.meshes = {};
        this.defaultTextureFilter = TextureFilterModes.Nearest;
        this.defaultTextureWrapMode = TextureWrapModes.Clamp;
        this.whiteTexture = null;
        this._renderTarget = null;
        this._viewport = null;
        this._drawCallsCount = 0;
        this._drawQuadsCount = 0;
        this.spritesBatch = null;
      }
      get batchSpritesCount() {
        return 2048;
      }
      get maxLineSegments() {
        return 512;
      }
      setContextAttributes(flags) {
        if (this._gl) {
          throw new Error("Can't call setContextAttributes() after gfx was initialized!");
        }
        this._initSettings = flags;
      }
      setCanvas(element) {
        if (this._gl) {
          throw new Error("Can't call setCanvas() after gfx was initialized!");
        }
        this._canvas = element;
      }
      get canvas() {
        return this._canvas;
      }
      get Effect() {
        return Effect2;
      }
      get BasicEffect() {
        return BasicEffect;
      }
      get MsdfFontEffect() {
        return MsdfFontEffect;
      }
      get Sprite() {
        return Sprite2;
      }
      get SpritesGroup() {
        return SpritesGroup;
      }
      get Matrix() {
        return Matrix;
      }
      get Vertex() {
        return Vertex;
      }
      get TextAlignments() {
        return TextAlignments2;
      }
      get TextAlignment() {
        if (!this._TextAlignment_dep) {
          console.warn(`'gfx.TextAlignment' is deprecated and will be removed in future versions. Please use 'gfx.TextAlignments' instead.`);
          this._TextAlignment_dep = true;
        }
        return TextAlignments2;
      }
      createCamera(withViewport) {
        let ret = new Camera(this);
        if (withViewport) {
          ret.viewport = this.getRenderingRegion();
        }
        return ret;
      }
      setCameraOrthographic(offset) {
        let camera = this.createCamera();
        camera.orthographicOffset(offset);
        this.applyCamera(camera);
        return camera;
      }
      createEffect(type) {
        if (!(type.prototype instanceof Effect2)) {
          throw new Error("'type' must be a class type that inherits from 'Effect'.");
        }
        let effect = new type();
        effect._build(this._gl);
        return effect;
      }
      maximizeCanvasSize(limitToParent, allowOddNumbers) {
        let width = 0;
        let height = 0;
        if (limitToParent) {
          let parent = this._canvas.parentElement;
          width = parent.clientWidth - this._canvas.offsetLeft;
          height = parent.clientHeight - this._canvas.offsetTop;
        } else {
          width = window.innerWidth;
          height = window.innerHeight;
          this._canvas.style.left = "0px";
          this._canvas.style.top = "0px";
        }
        if (!allowOddNumbers) {
          if (width % 2 !== 0) {
            width++;
          }
          if (height % 2 !== 0) {
            height++;
          }
        }
        if (this._canvas.width !== width || this._canvas.height !== height) {
          this.setResolution(width, height, true);
        }
      }
      setRenderTarget(texture, keepCamera) {
        this.presentBufferedData();
        if (texture === null) {
          this._renderTarget = null;
          this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
          this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
          if (!keepCamera) {
            this.resetCamera();
          }
          return;
        }
        if (!(texture instanceof Array)) {
          texture = [texture];
        }
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fb);
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
        var drawBuffers = [];
        for (let index = 0; index < texture.length; ++index) {
          const attachmentPoint = this._gl["COLOR_ATTACHMENT" + index];
          this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, attachmentPoint, this._gl.TEXTURE_2D, texture[index].texture, 0);
          if (index === 0) {
            this._renderTarget = texture[index];
          }
          drawBuffers.push(attachmentPoint);
        }
        this._gl.drawBuffers(drawBuffers);
        if (!keepCamera) {
          this.resetCamera();
        }
      }
      useEffect(effect) {
        this.presentBufferedData();
        if (effect === null) {
          this.useEffect(this.builtinEffects.Basic);
          return;
        }
        if (this._activeEffect === effect) {
          return;
        }
        effect.setAsActive();
        this._activeEffect = effect;
        if (this._projection) {
          this._activeEffect.setProjectionMatrix(this._projection);
        }
      }
      setResolution(width, height, updateCanvasStyle) {
        this.presentBufferedData();
        this._canvas.width = width;
        this._canvas.height = height;
        if (width % 2 !== 0 || height % 2 !== 0) {
          _logger.warn("Resolution to set is not even numbers; This might cause minor artefacts when using texture atlases. Consider using even numbers instead.");
        }
        if (updateCanvasStyle) {
          this._canvas.style.width = width + "px";
          this._canvas.style.height = height + "px";
        }
        this._gl.viewport(0, 0, width, height);
        this.resetCamera();
      }
      resetCamera() {
        this._camera = this.createCamera();
        let size = this.getRenderingSize();
        this._camera.orthographic(new Rectangle2(0, 0, size.x, size.y));
        this.applyCamera(this._camera);
      }
      applyCamera(camera) {
        this.presentBufferedData();
        this._viewport = camera.viewport;
        let viewport = this.getRenderingRegion(true);
        this._gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this._projection = camera.projection.clone();
        if (this._activeEffect) {
          this._activeEffect.setProjectionMatrix(this._projection);
        }
      }
      getRenderingRegion(includeOffset) {
        if (this._viewport) {
          let ret = this._viewport.clone();
          if (includeOffset === false) {
            ret.x = ret.y = 0;
          }
          return ret;
        }
        return new Rectangle2(0, 0, (this._renderTarget || this._canvas).width, (this._renderTarget || this._canvas).height);
      }
      getRenderingSize() {
        let region = this.getRenderingRegion();
        return region.getSize();
      }
      getCanvasSize() {
        return new Vector22(this._canvas.width, this._canvas.height);
      }
      setup() {
        return new Promise(async (resolve, reject2) => {
          _logger.info("Setup gfx manager..");
          if (!this._canvas) {
            this._canvas = document.createElement("canvas");
          }
          this._gl = this._canvas.getContext("webgl2", this._initSettings) || this._canvas.getContext("webgl", this._initSettings);
          if (!this._gl) {
            _logger.error("Can't get WebGL context!");
            return reject2("Failed to get WebGL context from canvas!");
          }
          this.builtinEffects.Basic = this.createEffect(BasicEffect);
          this.builtinEffects.MsdfFont = this.createEffect(MsdfFontEffect);
          TextureAsset._setWebGl(this._gl);
          this._fb = this._gl.createFramebuffer();
          let _meshGenerator = new MeshGenerator(this._gl);
          this.meshes = {
            quad: _meshGenerator.quad()
          };
          Object.freeze(this.meshes);
          let whitePixelImage = new Image();
          whitePixelImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
          await new Promise((resolve2, reject3) => {
            whitePixelImage.onload = resolve2;
          });
          this.whiteTexture = new TextureAsset("__runtime_white_pixel__");
          this.whiteTexture.fromImage(whitePixelImage);
          this._dynamicBuffers = {
            positionBuffer: this._gl.createBuffer(),
            positionArray: new Float32Array(3 * 4 * this.batchSpritesCount),
            textureCoordBuffer: this._gl.createBuffer(),
            textureArray: new Float32Array(2 * 4 * this.batchSpritesCount),
            colorsBuffer: this._gl.createBuffer(),
            colorsArray: new Float32Array(4 * 4 * this.batchSpritesCount),
            indexBuffer: this._gl.createBuffer(),
            linesIndexBuffer: this._gl.createBuffer()
          };
          let indices = new Uint16Array(this.batchSpritesCount * 6);
          let inc = 0;
          for (let i = 0; i < indices.length; i += 6) {
            indices[i] = inc;
            indices[i + 1] = inc + 1;
            indices[i + 2] = inc + 2;
            indices[i + 3] = inc + 1;
            indices[i + 4] = inc + 3;
            indices[i + 5] = inc + 2;
            inc += 4;
          }
          this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._dynamicBuffers.indexBuffer);
          this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, indices, this._gl.STATIC_DRAW);
          let lineIndices = new Uint16Array(this.maxLineSegments);
          for (let i = 0; i < lineIndices.length; i += 6) {
            lineIndices[i] = i;
          }
          this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._dynamicBuffers.linesIndexBuffer);
          this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, lineIndices, this._gl.STATIC_DRAW);
          this.spritesBatch = new SpriteBatch(this);
          this.useEffect(null);
          this._camera = this.createCamera();
          this.applyCamera(this._camera);
          resolve();
        });
      }
      buildText(fontTexture, text, fontSize, color, alignment, offset, marginFactor) {
        if (typeof text !== "string") {
          text = "" + text;
        }
        if (!fontTexture || !fontTexture.valid) {
          throw new Error("Font texture is invalid!");
        }
        alignment = alignment || TextAlignments2.Left;
        color = color || Color2.black;
        fontSize = fontSize || fontTexture.fontSize;
        marginFactor = marginFactor || Vector22.one;
        let scale = fontSize / fontTexture.fontSize;
        let position = new Vector22(0, 0);
        let currentLineSprites = [];
        let lineWidth = 0;
        function breakLine() {
          let offsetX = 0;
          switch (alignment) {
            case TextAlignments2.Right:
              offsetX = -lineWidth;
              break;
            case TextAlignments2.Center:
              offsetX = -lineWidth / 2;
              break;
          }
          if (offsetX != 0) {
            for (let i = 0; i < currentLineSprites.length; ++i) {
              currentLineSprites[i].position.x += offsetX;
            }
          }
          position.x = 0;
          position.y += fontTexture.lineHeight * scale * marginFactor.y;
          currentLineSprites = [];
          lineWidth = 0;
        }
        let ret = new SpritesGroup();
        for (let i = 0; i < text.length; ++i) {
          let character = text[i];
          let sourceRect = fontTexture.getSourceRect(character);
          if (character === "\n") {
            breakLine();
            continue;
          }
          let size = new Vector22(sourceRect.width * scale, sourceRect.height * scale);
          if (character !== " ") {
            let sprite = new Sprite2(fontTexture.texture, sourceRect);
            sprite.size = size;
            if (fontTexture instanceof MsdfFontTextureAsset) {
              sprite.origin.set(0, 0);
            } else {
              sprite.origin.set(0.5, 0.5);
            }
            sprite.position.copy(position).addSelf(fontTexture.getPositionOffset(character).mul(scale));
            if (color instanceof Color2) {
              sprite.color.copy(color);
            } else {
              sprite.color = [];
              for (let col of color) {
                sprite.color.push(col.clone());
              }
            }
            sprite.origin.x = 0;
            ret.add(sprite);
            currentLineSprites.push(sprite);
          }
          let moveCursorAmount = fontTexture.getXAdvance(character) * scale * marginFactor.x;
          lineWidth += moveCursorAmount;
          position.x += moveCursorAmount;
        }
        breakLine();
        if (offset) {
          ret.position.set(offset.x, offset.y);
        }
        return ret;
      }
      drawGroup(group, cullOutOfScreen) {
        this._drawBatch(group, Boolean(cullOutOfScreen));
      }
      drawSprite(sprite) {
        if (!sprite.texture || !sprite.texture.valid) {
          return;
        }
        this.__startDrawingSprites(this._activeEffect, null);
        this.spritesBatch.draw(sprite);
      }
      cover(texture, destRect, sourceRect, color, blendMode) {
        if (destRect instanceof Vector22 || destRect instanceof Vector32) {
          destRect = new Rectangle2(0, 0, destRect.x, destRect.y);
        }
        return this.draw(texture, destRect.getCenter(), destRect.getSize(), sourceRect, color, blendMode);
      }
      draw(texture, position, size, sourceRect, color, blendMode, rotation, origin, skew) {
        let sprite = new Sprite2(texture, sourceRect);
        sprite.position = position;
        sprite.size = typeof size === "number" ? new Vector22(size, size) : size;
        if (color) {
          sprite.color = color;
        }
        if (blendMode) {
          sprite.blendMode = blendMode;
        }
        if (rotation !== void 0) {
          sprite.rotation = rotation;
        }
        if (origin) {
          sprite.origin = origin;
        }
        if (skew) {
          sprite.skew = skew;
        }
        this.drawSprite(sprite);
      }
      drawQuadFromVertices(texture, vertices, blendMode) {
        if (!texture || !texture.valid) {
          return;
        }
        this.__startDrawingSprites(this._activeEffect, null);
        this._setBlendMode(blendMode || BlendModes2.AlphaBlend);
        this.spritesBatch.setTexture(texture);
        this.spritesBatch.pushVertices(vertices);
      }
      fillRect(destRect, color, blend, rotation) {
        this.draw(
          this.whiteTexture,
          new Vector22(destRect.x + destRect.width / 2, destRect.y + destRect.height / 2),
          new Vector22(destRect.width, destRect.height),
          null,
          color,
          blend || BlendModes2.Opaque,
          rotation,
          null,
          null
        );
      }
      fillRects(destRects, colors, blend, rotation) {
        if (rotation === void 0) {
          rotation = 0;
        }
        let group = new SpritesGroup();
        for (let i = 0; i < destRects.length; ++i) {
          let sprite = new Sprite2(this.whiteTexture);
          sprite.color = colors[i] || colors;
          sprite.rotation = rotation.length ? rotation[i] : rotation;
          sprite.blendMode = blend || BlendModes2.Opaque;
          let destRect = destRects[i];
          sprite.size.set(destRect.width, destRect.height);
          sprite.position.set(destRect.x + destRect.width / 2, destRect.y + destRect.width / 2);
          sprite.origin.set(0.5, 0.5);
          group.add(sprite);
        }
        this.drawGroup(group);
      }
      outlineRect(destRect, color, blend, rotation) {
        let topLeft = destRect.getTopLeft();
        let topRight = destRect.getTopRight();
        let bottomRight = destRect.getBottomRight();
        let bottomLeft = destRect.getBottomLeft();
        if (rotation) {
          let rotateVec = function(vector) {
            let x = vector.x * cos - vector.y * sin;
            let y = vector.x * sin + vector.y * cos;
            vector.set(x, y);
          };
          let center = destRect.getCenter();
          topLeft.subSelf(center);
          topRight.subSelf(center);
          bottomLeft.subSelf(center);
          bottomRight.subSelf(center);
          let cos = Math.cos(rotation);
          let sin = Math.sin(rotation);
          rotateVec(topLeft);
          rotateVec(topRight);
          rotateVec(bottomLeft);
          rotateVec(bottomRight);
          topLeft.addSelf(center);
          topRight.addSelf(center);
          bottomLeft.addSelf(center);
          bottomRight.addSelf(center);
        }
        this.drawLinesStrip([topLeft, topRight, bottomRight, bottomLeft], color, blend, true);
      }
      outlineCircle(circle, color, blend, lineAmount) {
        if (lineAmount === void 0) {
          lineAmount = 32;
        }
        let lines = [];
        const twicePi = 2 * Math.PI;
        for (let i = 0; i <= lineAmount; i++) {
          let point = new Vector22(
            circle.center.x + circle.radius * Math.cos(i * twicePi / lineAmount),
            circle.center.y + circle.radius * Math.sin(i * twicePi / lineAmount)
          );
          lines.push(point);
        }
        this.drawLinesStrip(lines, color, blend);
      }
      fillCircle(circle, color, blend, lineAmount) {
        if (lineAmount === void 0) {
          lineAmount = 32;
        }
        let lines = [circle.center];
        const twicePi = 2 * Math.PI;
        for (let i = 0; i <= lineAmount; i++) {
          let point = new Vector22(
            circle.center.x + circle.radius * Math.cos(i * twicePi / lineAmount),
            circle.center.y + circle.radius * Math.sin(i * twicePi / lineAmount)
          );
          lines.push(point);
        }
        let gl = this._gl;
        this._fillShapesBuffer(lines, color, blend, (verts) => {
          gl.drawArrays(gl.TRIANGLE_FAN, 0, verts.length);
          this._drawCallsCount++;
        }, true, 1);
      }
      fillCircles(circles, colors, blend, lineAmount) {
        if (lineAmount === void 0) {
          lineAmount = 32;
        }
        let vertsArr = [];
        let colorsArr = colors.length ? [] : null;
        for (let i = 0; i < circles.length; ++i) {
          let circle = circles[i];
          let color = colors[i] || colors;
          const twicePi = 2 * Math.PI;
          for (let i2 = 0; i2 <= lineAmount; i2++) {
            vertsArr.push(new Vector22(
              circle.center.x + circle.radius * Math.cos(i2 * twicePi / lineAmount),
              circle.center.y + circle.radius * Math.sin(i2 * twicePi / lineAmount)
            ));
            vertsArr.push(new Vector22(
              circle.center.x + circle.radius * Math.cos((i2 + 1) * twicePi / lineAmount),
              circle.center.y + circle.radius * Math.sin((i2 + 1) * twicePi / lineAmount)
            ));
            vertsArr.push(circle.center);
            if (colorsArr) {
              colorsArr.push(color);
              colorsArr.push(color);
              colorsArr.push(color);
            }
          }
        }
        let gl = this._gl;
        this._fillShapesBuffer(vertsArr, colorsArr || colors, blend, (verts) => {
          gl.drawArrays(gl.TRIANGLES, 0, verts.length);
          this._drawCallsCount++;
        }, false, 3);
      }
      drawLine(startPoint, endPoint, color, blendMode) {
        return this.drawLines([startPoint, endPoint], color, blendMode, false);
      }
      drawLinesStrip(points, colors, blendMode, looped) {
        let gl = this._gl;
        if (looped) {
          points = points.slice(0);
          points.push(points[0]);
          if (colors && colors.length) {
            colors = colors.slice(0);
            colors.push(colors[0]);
          }
        }
        this._fillShapesBuffer(points, colors, blendMode, (verts) => {
          gl.drawArrays(gl.LINE_STRIP, 0, verts.length);
          this._drawCallsCount++;
        }, true, 2);
      }
      drawLines(points, colors, blendMode) {
        let gl = this._gl;
        this._fillShapesBuffer(points, colors, blendMode, (verts) => {
          gl.drawArrays(gl.LINES, 0, verts.length);
          this._drawCallsCount++;
        }, true, 2);
      }
      drawPoint(point, color, blendMode) {
        return this.drawPoints([point], [color], blendMode);
      }
      drawPoints(points, colors, blendMode) {
        let gl = this._gl;
        this._fillShapesBuffer(points, colors, blendMode, (verts) => {
          gl.drawArrays(gl.POINTS, 0, verts.length);
          this._drawCallsCount++;
        }, false, 1);
      }
      centerCanvas() {
        let canvas = this._canvas;
        let parent = canvas.parentElement;
        let pwidth = Math.min(parent.clientWidth, window.innerWidth);
        let pheight = Math.min(parent.clientHeight, window.innerHeight);
        canvas.style.left = Math.round(pwidth / 2 - canvas.clientWidth / 2) + "px";
        canvas.style.top = Math.round(pheight / 2 - canvas.clientHeight / 2) + "px";
        canvas.style.display = "block";
        canvas.style.position = "relative";
      }
      inScreen(shape) {
        let region = this.getRenderingRegion();
        if (shape instanceof Circle) {
          return region.collideCircle(shape);
        } else if (shape instanceof Vector22) {
          return region.containsVector(shape);
        } else if (shape instanceof Rectangle2) {
          return region.collideRect(shape);
        } else if (shape instanceof Line) {
          return region.collideLine(shape);
        } else {
          throw new Error("Unknown shape type to check!");
        }
      }
      centerCamera(position, useCanvasSize) {
        let renderSize = useCanvasSize ? this.getCanvasSize() : this.getRenderingSize();
        let halfScreenSize = renderSize.mul(0.5);
        let centeredPos = position.sub(halfScreenSize);
        this.setCameraOrthographic(centeredPos);
      }
      _fillShapesBuffer(points, colors, blendMode, onReady, isStrip, groupsSize) {
        this.presentBufferedData();
        colors = colors || _whiteColor;
        blendMode = blendMode || BlendModes2.Opaque;
        if (colors.length !== void 0 && colors.length !== points.length) {
          _logger.error("When drawing shapes with colors array, the colors array and points array must have the same length!");
          return;
        }
        let maxWithMargin = isStrip ? this.maxLineSegments - 1 : this.maxLineSegments;
        if (groupsSize != 1) {
          while (maxWithMargin % groupsSize !== 0) {
            maxWithMargin--;
          }
        }
        if (points.length > maxWithMargin) {
          let sliceI = 0;
          while (true) {
            let start = sliceI * maxWithMargin;
            let end = start + maxWithMargin;
            if (isStrip && sliceI > 0) {
              start--;
            }
            let subpoints = points.slice(start, end);
            if (subpoints.length === 0) {
              break;
            }
            let subcolors = colors && colors.length ? colors.slice(start, end) : colors;
            this._fillShapesBuffer(subpoints, subcolors, blendMode, onReady, isStrip, groupsSize);
            sliceI++;
          }
          return;
        }
        let gl = this._gl;
        let positionsBuff = this._dynamicBuffers.positionArray;
        let colorsBuff = this._dynamicBuffers.colorsArray;
        for (let i = 0; i < points.length; ++i) {
          positionsBuff[i * 3 + 0] = points[i].x;
          positionsBuff[i * 3 + 1] = points[i].y;
          positionsBuff[i * 3 + 2] = points[i].z || 0;
          let color = colors[i] || colors;
          colorsBuff[i * 4 + 0] = color.r;
          colorsBuff[i * 4 + 1] = color.g;
          colorsBuff[i * 4 + 2] = color.b;
          colorsBuff[i * 4 + 3] = color.a;
        }
        this._setBlendMode(blendMode);
        let mesh = new Mesh(this._dynamicBuffers.positionBuffer, null, this._dynamicBuffers.colorsBuffer, this._dynamicBuffers.indexBuffer, points.length);
        this._activeEffect.prepareToDrawBatch(mesh, Matrix.identity);
        this._setActiveTexture(this.whiteTexture);
        let shouldSliceArrays = points.length <= 8;
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._dynamicBuffers.positionBuffer);
        this._gl.bufferData(
          this._gl.ARRAY_BUFFER,
          shouldSliceArrays ? this._dynamicBuffers.positionArray.slice(0, points.length * 3) : this._dynamicBuffers.positionArray,
          this._gl.DYNAMIC_DRAW
        );
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._dynamicBuffers.colorsBuffer);
        this._gl.bufferData(
          this._gl.ARRAY_BUFFER,
          shouldSliceArrays ? this._dynamicBuffers.colorsArray.slice(0, points.length * 4) : this._dynamicBuffers.colorsArray,
          this._gl.DYNAMIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._dynamicBuffers.linesIndexBuffer);
        this._currIndices = null;
        onReady(points);
      }
      _drawBatch(group, cullOutOfScreen) {
        if (group._sprites.length === 0) {
          return;
        }
        this.presentBufferedData();
        let transform = group.getTransform();
        this.spritesBatch.begin(this._activeEffect, transform);
        this.spritesBatch.draw(group._sprites, cullOutOfScreen);
        this.spritesBatch.end();
      }
      _setActiveTexture(texture) {
        if (this._activeEffect.setTexture(texture)) {
          this._setTextureFilter(texture.filter || this.defaultTextureFilter);
          this._setTextureWrapMode(texture.wrapMode || this.defaultTextureWrapMode);
        }
      }
      get BlendModes() {
        return BlendModes2;
      }
      get TextureWrapModes() {
        return TextureWrapModes;
      }
      get TextureFilterModes() {
        return TextureFilterModes;
      }
      get drawCallsCount() {
        return this._drawCallsCount;
      }
      get quadsDrawCount() {
        return this._drawQuadsCount;
      }
      clear(color) {
        this.presentBufferedData();
        color = color || Color2.black;
        this._gl.clearColor(color.r, color.g, color.b, color.a);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
      }
      _setTextureFilter(filter) {
        if (!TextureFilterModes._values.has(filter)) {
          throw new Error("Invalid texture filter mode! Please pick a value from 'TextureFilterModes'.");
        }
        let glMode = this._gl[filter];
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, glMode);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, glMode);
      }
      _setTextureWrapMode(wrapX, wrapY) {
        if (wrapY === void 0) {
          wrapY = wrapX;
        }
        if (!TextureWrapModes._values.has(wrapX)) {
          throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");
        }
        if (!TextureWrapModes._values.has(wrapY)) {
          throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");
        }
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl[wrapX]);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl[wrapY]);
      }
      _setBlendMode(blendMode) {
        if (this._lastBlendMode !== blendMode) {
          var gl = this._gl;
          switch (blendMode) {
            case BlendModes2.AlphaBlend:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              break;
            case BlendModes2.Opaque:
              gl.disable(gl.BLEND);
              break;
            case BlendModes2.Additive:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFunc(gl.ONE, gl.ONE);
              break;
            case BlendModes2.Multiply:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFuncSeparate(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              break;
            case BlendModes2.Screen:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              break;
            case BlendModes2.Subtract:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
              gl.blendEquationSeparate(gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD);
              break;
            case BlendModes2.Invert:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ZERO);
              gl.blendFuncSeparate(gl.ONE_MINUS_DST_COLOR, gl.ZERO, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              break;
            case BlendModes2.Overlay:
              gl.enable(gl.BLEND);
              if (gl.MAX) {
                gl.blendEquation(gl.MAX);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              } else {
                gl.blendEquation(gl.FUNC_ADD);
                gl.blendFunc(gl.ONE, gl.ONE);
              }
              break;
            case BlendModes2.Darken:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.MIN);
              gl.blendFuncSeparate(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              break;
            case BlendModes2.DestIn:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
              break;
            case BlendModes2.DestOut:
              gl.enable(gl.BLEND);
              gl.blendEquation(gl.FUNC_ADD);
              gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
              break;
            default:
              throw new Error(`Unknown blend mode '${blendMode}'!`);
          }
          this._lastBlendMode = blendMode;
        }
      }
      presentBufferedData() {
        this.__finishDrawingSprites();
      }
      __startDrawingSprites(activeEffect, transform) {
        if (this.spritesBatch.drawing) {
          if (this.spritesBatch._effect !== activeEffect || this.spritesBatch._transform !== transform) {
            this.spritesBatch.end();
          }
        }
        if (!this.spritesBatch.drawing) {
          this.spritesBatch.begin(activeEffect, transform);
        }
      }
      __finishDrawingSprites() {
        if (this.spritesBatch.drawing) {
          this.spritesBatch.end();
        }
      }
      startFrame() {
        this._lastBlendMode = null;
        this._drawCallsCount = 0;
        this._drawQuadsCount = 0;
      }
      endFrame() {
        this.presentBufferedData();
      }
      destroy() {
        _logger.warn("Cleaning up WebGL is not supported yet!");
      }
    };
    module.exports = new Gfx();
  }
});

// ../Shaku/lib/gfx/index.js
var require_gfx2 = __commonJS({
  "../Shaku/lib/gfx/index.js"(exports, module) {
    "use strict";
    module.exports = require_gfx();
  }
});

// ../Shaku/lib/input/key_codes.js
var require_key_codes = __commonJS({
  "../Shaku/lib/input/key_codes.js"(exports, module) {
    "use strict";
    var MouseButtons2 = {
      left: 0,
      middle: 1,
      right: 2
    };
    var KeyboardKeys2 = {
      backspace: 8,
      tab: 9,
      enter: 13,
      shift: 16,
      ctrl: 17,
      alt: 18,
      break: 19,
      caps_lock: 20,
      escape: 27,
      page_up: 33,
      page_down: 34,
      end: 35,
      home: 36,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      insert: 45,
      delete: 46,
      space: 32,
      n0: 48,
      n1: 49,
      n2: 50,
      n3: 51,
      n4: 52,
      n5: 53,
      n6: 54,
      n7: 55,
      n8: 56,
      n9: 57,
      a: 65,
      b: 66,
      c: 67,
      d: 68,
      e: 69,
      f: 70,
      g: 71,
      h: 72,
      i: 73,
      j: 74,
      k: 75,
      l: 76,
      m: 77,
      n: 78,
      o: 79,
      p: 80,
      q: 81,
      r: 82,
      s: 83,
      t: 84,
      u: 85,
      v: 86,
      w: 87,
      x: 88,
      y: 89,
      z: 90,
      left_window_key: 91,
      right_window_key: 92,
      select_key: 93,
      numpad_0: 96,
      numpad_1: 97,
      numpad_2: 98,
      numpad_3: 99,
      numpad_4: 100,
      numpad_5: 101,
      numpad_6: 102,
      numpad_7: 103,
      numpad_8: 104,
      numpad_9: 105,
      multiply: 106,
      add: 107,
      subtract: 109,
      decimal_point: 110,
      divide: 111,
      f1: 112,
      f2: 113,
      f3: 114,
      f4: 115,
      f5: 116,
      f6: 117,
      f7: 118,
      f8: 119,
      f9: 120,
      f10: 121,
      f11: 122,
      f12: 123,
      numlock: 144,
      scroll_lock: 145,
      semicolon: 186,
      equal_sign: 187,
      plus: 187,
      comma: 188,
      dash: 189,
      minus: 189,
      period: 190,
      forward_slash: 191,
      grave_accent: 192,
      open_bracket: 219,
      back_slash: 220,
      close_braket: 221,
      single_quote: 222
    };
    module.exports = { KeyboardKeys: KeyboardKeys2, MouseButtons: MouseButtons2 };
  }
});

// ../Shaku/lib/input/input.js
var require_input = __commonJS({
  "../Shaku/lib/input/input.js"(exports, module) {
    "use strict";
    var IManager = require_manager();
    var Vector22 = require_vector2();
    var { MouseButton, MouseButtons: MouseButtons2, KeyboardKey, KeyboardKeys: KeyboardKeys2 } = require_key_codes();
    var _logger = require_logger().getLogger("input");
    var Input = class extends IManager {
      constructor() {
        super();
        this._callbacks = null;
        this._targetElement = window;
        this.MouseButtons = MouseButtons2;
        this.KeyboardKeys = KeyboardKeys2;
        this.preventDefaults = false;
        this.enableMouseDeltaWhileMouseWheelDown = true;
        this.disableContextMenu = true;
        this.resetOnFocusLoss = true;
        this._resetAll();
      }
      setup() {
        return new Promise((resolve, reject2) => {
          _logger.info("Setup input manager..");
          if (typeof this._targetElement === "function") {
            this._targetElement = this._targetElement();
            if (!this._targetElement) {
              throw new Error("Input target element was set to be a method, but the returned value was invalid!");
            }
          }
          let element = this._targetElement;
          if (element.tabIndex === -1 || element.tabIndex === void 0) {
            element.tabIndex = 1e3;
          }
          window.setTimeout(() => element.focus(), 0);
          var _this = this;
          this._callbacks = {
            "mousedown": function(event2) {
              _this._onMouseDown(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "mouseup": function(event2) {
              _this._onMouseUp(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "mousemove": function(event2) {
              _this._onMouseMove(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "keydown": function(event2) {
              _this._onKeyDown(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "keyup": function(event2) {
              _this._onKeyUp(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "blur": function(event2) {
              _this._onBlur(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "wheel": function(event2) {
              _this._onMouseWheel(event2);
            },
            "touchstart": function(event2) {
              _this._onTouchStart(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "touchend": function(event2) {
              _this._onMouseUp(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "touchmove": function(event2) {
              _this._onTouchMove(event2);
              if (this.preventDefaults)
                event2.preventDefault();
            },
            "contextmenu": function(event2) {
              if (_this.disableContextMenu) {
                event2.preventDefault();
              }
            }
          };
          this._resetAll();
          for (var event in this._callbacks) {
            element.addEventListener(event, this._callbacks[event], false);
          }
          if (element !== window) {
            window.addEventListener("mouseup", this._callbacks["mouseup"], false);
            window.addEventListener("touchend", this._callbacks["touchend"], false);
          }
          resolve();
        });
      }
      startFrame() {
      }
      destroy() {
        if (this._callbacks) {
          let element = this._targetElement;
          for (var event in this._callbacks) {
            element.removeEventListener(event, this._callbacks[event]);
          }
          if (element !== window) {
            window.removeEventListener("mouseup", this._callbacks["mouseup"], false);
            window.removeEventListener("touchend", this._callbacks["touchend"], false);
          }
          this._callbacks = null;
        }
      }
      setTargetElement(element) {
        if (this._callbacks) {
          throw new Error("'setTargetElement() must be called before initializing the input manager!");
        }
        this._targetElement = element;
      }
      _resetAll() {
        this._mousePos = new Vector22();
        this._mousePrevPos = new Vector22();
        this._mouseState = {};
        this._mousePrevState = {};
        this._mouseWheel = 0;
        this._keyboardState = {};
        this._keyboardPrevState = {};
        this._touchStarted = false;
      }
      get mousePosition() {
        return this._mousePos.clone();
      }
      get prevMousePosition() {
        return (this._mousePrevPos || this._mousePos).clone();
      }
      get mouseDelta() {
        if (!this._mousePrevPos) {
          return Vector22.zero;
        }
        return new Vector22(this._mousePos.x - this._mousePrevPos.x, this._mousePos.y - this._mousePrevPos.y);
      }
      get mouseMoving() {
        return this._mousePrevPos && !this._mousePrevPos.equals(this._mousePos);
      }
      mousePressed(button = 0) {
        if (button === void 0)
          throw new Error("Invalid button code!");
        return Boolean(this._mouseState[button] && !this._mousePrevState[button]);
      }
      mouseDown(button = 0) {
        if (button === void 0)
          throw new Error("Invalid button code!");
        return Boolean(this._mouseState[button]);
      }
      mouseUp(button = 0) {
        if (button === void 0)
          throw new Error("Invalid button code!");
        return Boolean(!this.mouseDown(button));
      }
      mouseReleased(button = 0) {
        if (button === void 0)
          throw new Error("Invalid button code!");
        return Boolean(!this._mouseState[button] && this._mousePrevState[button]);
      }
      keyDown(key) {
        if (key === void 0)
          throw new Error("Invalid key code!");
        return Boolean(this._keyboardState[key]);
      }
      keyUp(key) {
        if (key === void 0)
          throw new Error("Invalid key code!");
        return Boolean(!this.keyDown(key));
      }
      keyReleased(key) {
        if (key === void 0)
          throw new Error("Invalid key code!");
        return Boolean(!this._keyboardState[key] && this._keyboardPrevState[key]);
      }
      keyPressed(key) {
        if (key === void 0)
          throw new Error("Invalid key code!");
        return Boolean(this._keyboardState[key] && !this._keyboardPrevState[key]);
      }
      get shiftDown() {
        return Boolean(this.keyDown(this.KeyboardKeys.shift));
      }
      get ctrlDown() {
        return Boolean(this.keyDown(this.KeyboardKeys.ctrl));
      }
      get altDown() {
        return Boolean(this.keyDown(this.KeyboardKeys.alt));
      }
      get anyKeyPressed() {
        for (var key in this._keyboardState) {
          if (this._keyboardState[key] && !this._keyboardPrevState[key]) {
            return true;
          }
        }
        return false;
      }
      get anyKeyDown() {
        for (var key in this._keyboardState) {
          if (this._keyboardState[key]) {
            return true;
          }
        }
        return false;
      }
      get anyMouseButtonPressed() {
        for (var key in this._mouseState) {
          if (this._mouseState[key] && !this._mousePrevState[key]) {
            return true;
          }
        }
        return false;
      }
      get anyMouseButtonDown() {
        for (var key in this._mouseState) {
          if (this._mouseState[key]) {
            return true;
          }
        }
        return false;
      }
      _getValueWithCode(code, mouseCheck, keyboardCheck) {
        code = String(code);
        if (code.indexOf("mouse_") === 0) {
          var codename = code.split("_")[1];
          return mouseCheck.call(this, this.MouseButtons[codename]);
        }
        if (!isNaN(parseInt(code)) && code.length === 1) {
          code = "n" + code;
        }
        return keyboardCheck.call(this, this.KeyboardKeys[code]);
      }
      down(code) {
        if (!(code instanceof Array)) {
          code = [code];
        }
        for (let c of code) {
          if (Boolean(this._getValueWithCode(c, this.mouseDown, this.keyDown))) {
            return true;
          }
        }
        return false;
      }
      released(code) {
        if (!(code instanceof Array)) {
          code = [code];
        }
        for (let c of code) {
          if (Boolean(this._getValueWithCode(c, this.mouseReleased, this.keyReleased))) {
            return true;
          }
        }
        return false;
      }
      pressed(code) {
        if (!(code instanceof Array)) {
          code = [code];
        }
        for (let c of code) {
          if (Boolean(this._getValueWithCode(c, this.mousePressed, this.keyPressed))) {
            return true;
          }
        }
        return false;
      }
      get mouseWheelSign() {
        return Math.sign(this._mouseWheel);
      }
      get mouseWheel() {
        return this._mouseWheel;
      }
      endFrame() {
        this._mousePrevPos = this._mousePos.clone();
        this._keyboardPrevState = {};
        for (var key in this._keyboardState) {
          this._keyboardPrevState[key] = this._keyboardState[key];
        }
        this._mousePrevState = {};
        for (var key in this._mouseState) {
          this._mousePrevState[key] = this._mouseState[key];
        }
        if (this._touchStarted) {
          this._mouseState[this.MouseButtons.left] = true;
          this._touchStarted = false;
        }
        this._mouseWheel = 0;
      }
      _getKeyboardKeyCode(event) {
        event = this._getEvent(event);
        return event.keyCode !== void 0 ? event.keyCode : event.key.charCodeAt(0);
      }
      _onBlur(event) {
        if (this.resetOnFocusLoss) {
          this._resetAll();
        }
      }
      _onMouseWheel(event) {
        this._mouseWheel = event.deltaY;
      }
      _onKeyDown(event) {
        var keycode = this._getKeyboardKeyCode(event);
        this._keyboardState[keycode] = true;
      }
      _onKeyUp(event) {
        var keycode = this._getKeyboardKeyCode(event);
        this._keyboardState[keycode || 0] = false;
      }
      _onTouchStart(event) {
        var touches = event.changedTouches;
        if (touches && touches.length) {
          var touch = touches[0];
          var x = touch.pageX || touch.offsetX || touch.clientX;
          var y = touch.pageY || touch.offsetY || touch.clientY;
          if (x !== void 0 && y !== void 0) {
            this._mousePos.x = x;
            this._mousePos.y = y;
            this._normalizeMousePos();
          }
        }
        this._touchStarted = true;
      }
      _onMouseDown(event) {
        event = this._getEvent(event);
        if (this.enableMouseDeltaWhileMouseWheelDown && event.button === this.MouseButtons.middle) {
          event.preventDefault();
        }
        this._mouseState[event.button || 0] = true;
      }
      _onMouseUp(event) {
        event = this._getEvent(event);
        this._mouseState[event.button || 0] = false;
      }
      _onTouchMove(event) {
        event = this._getEvent(event);
        this._mousePos.x = event.touches[0].pageX;
        this._mousePos.y = event.touches[0].pageY;
        this._normalizeMousePos();
      }
      _onMouseMove(event) {
        event = this._getEvent(event);
        var pageX = event.clientX;
        if (pageX === void 0) {
          pageX = event.x;
        }
        if (pageX === void 0) {
          pageX = event.offsetX;
        }
        if (pageX === void 0) {
          pageX = event.pageX;
        }
        var pageY = event.clientY;
        if (pageY === void 0) {
          pageY = event.y;
        }
        if (pageY === void 0) {
          pageY = event.offsetY;
        }
        if (pageY === void 0) {
          pageY = event.pageY;
        }
        if (pageX === void 0) {
          pageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          pageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        this._mousePos.x = pageX;
        this._mousePos.y = pageY;
        this._normalizeMousePos();
      }
      _normalizeMousePos() {
        if (this._targetElement && this._targetElement.getBoundingClientRect) {
          var rect = this._targetElement.getBoundingClientRect();
          this._mousePos.x -= rect.left;
          this._mousePos.y -= rect.top;
        }
      }
      _getEvent(event) {
        return event || window.event;
      }
    };
    module.exports = new Input();
  }
});

// ../Shaku/lib/input/index.js
var require_input2 = __commonJS({
  "../Shaku/lib/input/index.js"(exports, module) {
    "use strict";
    module.exports = require_input();
  }
});

// ../Shaku/lib/assets/binary_asset.js
var require_binary_asset = __commonJS({
  "../Shaku/lib/assets/binary_asset.js"(exports, module) {
    "use strict";
    var Asset = require_asset();
    var BinaryAsset = class extends Asset {
      constructor(url) {
        super(url);
        this._data = null;
      }
      load() {
        return new Promise((resolve, reject2) => {
          var request = new XMLHttpRequest();
          request.open("GET", this.url, true);
          request.responseType = "arraybuffer";
          request.onload = () => {
            if (request.readyState == 4) {
              if (request.response) {
                this._data = new Uint8Array(request.response);
                this._notifyReady();
                resolve();
              } else {
                reject2(request.statusText);
              }
            }
          };
          request.onerror = (e) => {
            reject2(e);
          };
          request.send();
        });
      }
      create(source) {
        return new Promise((resolve, reject2) => {
          if (source instanceof Array) {
            source = new Uint8Array(source);
          }
          if (!(source instanceof Uint8Array)) {
            return reject2("Binary asset source must be of type 'Uint8Array'!");
          }
          this._data = source;
          this._notifyReady();
          resolve();
        });
      }
      get valid() {
        return Boolean(this._data);
      }
      destroy() {
        this._data = null;
      }
      get data() {
        return this._data;
      }
      string() {
        return new TextDecoder().decode(this._data);
      }
    };
    module.exports = BinaryAsset;
  }
});

// ../Shaku/lib/assets/assets.js
var require_assets = __commonJS({
  "../Shaku/lib/assets/assets.js"(exports, module) {
    "use strict";
    var SoundAsset = require_sound_asset();
    var IManager = require_manager();
    var BinaryAsset = require_binary_asset();
    var JsonAsset = require_json_asset();
    var TextureAsset = require_texture_asset();
    var FontTextureAsset = require_font_texture_asset();
    var MsdfFontTextureAsset = require_msdf_font_texture_asset();
    var Asset = require_asset();
    var _logger = require_logger().getLogger("assets");
    var Assets = class extends IManager {
      constructor() {
        super();
        this._loaded = null;
        this._waitingAssets = /* @__PURE__ */ new Set();
        this._failedAssets = /* @__PURE__ */ new Set();
        this._successfulLoadedAssetsCount = 0;
        this.root = "";
        this.suffix = "";
      }
      _wrapUrl(url) {
        if (!url) {
          return url;
        }
        return this.root + url + this.suffix;
      }
      get pendingAssets() {
        return Array.from(this._waitingAssets);
      }
      get failedAssets() {
        return Array.from(this._failedAssets);
      }
      waitForAll() {
        return new Promise((resolve, reject2) => {
          _logger.debug("Waiting for all assets..");
          let checkAssets = () => {
            if (this._failedAssets.size !== 0) {
              _logger.warn("Done waiting for assets: had errors.");
              return reject2(this.failedAssets);
            }
            if (this._waitingAssets.size === 0) {
              _logger.debug("Done waiting for assets: everything loaded successfully.");
              return resolve();
            }
            setTimeout(checkAssets, 1);
          };
          checkAssets();
        });
      }
      setup() {
        return new Promise((resolve, reject2) => {
          _logger.info("Setup assets manager..");
          this._loaded = {};
          resolve();
        });
      }
      startFrame() {
      }
      endFrame() {
      }
      _getFromCache(url, type) {
        let cached = this._loaded[url] || null;
        if (cached && type) {
          if (!(cached instanceof type)) {
            throw new Error(`Asset with URL '${url}' is already loaded, but has unexpected type (expecting ${type})!`);
          }
        }
        return cached;
      }
      async _loadAndCacheAsset(newAsset, params) {
        let url = newAsset.url;
        let typeName = newAsset.constructor.name;
        this._loaded[url] = newAsset;
        this._waitingAssets.add(url);
        return new Promise(async (resolve, reject2) => {
          _logger.debug(`Load asset [${typeName}] from URL '${url}'.`);
          try {
            await newAsset.load(params);
          } catch (e) {
            _logger.warn(`Failed to load asset [${typeName}] from URL '${url}'.`);
            this._failedAssets.add(url);
            return reject2(e);
          }
          this._waitingAssets.delete(url);
          if (!newAsset.valid) {
            _logger.warn(`Failed to load asset [${typeName}] from URL '${url}'.`);
            this._failedAssets.add(url);
            return reject2("Loaded asset is not valid!");
          }
          _logger.debug(`Successfully loaded asset [${typeName}] from URL '${url}'.`);
          this._successfulLoadedAssetsCount++;
          resolve(newAsset);
        });
      }
      getCached(url) {
        url = this._wrapUrl(url);
        return this._loaded[url] || null;
      }
      _loadAssetType(url, typeClass, params) {
        url = this._wrapUrl(url);
        let _asset = this._getFromCache(url, typeClass);
        var needLoad = false;
        if (!_asset) {
          _asset = new typeClass(url);
          needLoad = true;
        }
        let promise = new Promise(async (resolve, reject2) => {
          if (needLoad) {
            await this._loadAndCacheAsset(_asset, params);
          }
          _asset.onReady(() => {
            resolve(_asset);
          });
        });
        promise.asset = _asset;
        return promise;
      }
      _createAsset(name, classType, initMethod) {
        name = this._wrapUrl(name);
        var _asset = new classType(name || generateRandomAssetName());
        let promise = new Promise(async (resolve, reject2) => {
          if (name && this._loaded[name]) {
            return reject2(`Asset of type '${classType.name}' to create with URL '${name}' already exist in cache!`);
          }
          initMethod(_asset);
          if (name) {
            this._loaded[name] = _asset;
          }
          resolve(_asset);
        });
        promise.asset = _asset;
        return promise;
      }
      loadSound(url) {
        return this._loadAssetType(url, SoundAsset, void 0);
      }
      loadTexture(url, params) {
        return this._loadAssetType(url, TextureAsset, params);
      }
      createRenderTarget(name, width, height, channels) {
        if (!width || !height) {
          throw new Error("Missing or invalid size!");
        }
        return this._createAsset(name, TextureAsset, (asset) => {
          asset.createRenderTarget(width, height, channels);
        });
      }
      loadFontTexture(url, params) {
        return this._loadAssetType(url, FontTextureAsset, params);
      }
      loadMsdfFontTexture(url, params) {
        return this._loadAssetType(url, MsdfFontTextureAsset, params);
      }
      loadJson(url) {
        return this._loadAssetType(url, JsonAsset);
      }
      createJson(name, data) {
        if (!data) {
          return reject("Missing or invalid data!");
        }
        return this._createAsset(name, JsonAsset, (asset) => {
          asset.create(data);
        });
      }
      loadBinary(url) {
        return this._loadAssetType(url, BinaryAsset);
      }
      createBinary(name, data) {
        if (!data) {
          return reject("Missing or invalid data!");
        }
        return this._createAsset(name, BinaryAsset, (asset) => {
          asset.create(data);
        });
      }
      free(url) {
        url = this._wrapUrl(url);
        let asset = this._loaded[url];
        if (asset) {
          asset.destroy();
          delete this._loaded[url];
        }
      }
      clearCache() {
        for (let key in this._loaded) {
          this._loaded[key].destroy();
        }
        this._loaded = {};
        this._waitingAssets = /* @__PURE__ */ new Set();
        this._failedAssets = /* @__PURE__ */ new Set();
      }
      destroy() {
        this.clearCache();
      }
    };
    var _nextRandomAssetId = 0;
    function generateRandomAssetName() {
      return "_runtime_asset_" + _nextRandomAssetId++ + "_";
    }
    module.exports = new Assets();
  }
});

// ../Shaku/lib/assets/index.js
var require_assets2 = __commonJS({
  "../Shaku/lib/assets/index.js"(exports, module) {
    "use strict";
    module.exports = require_assets();
  }
});

// ../Shaku/lib/collision/shapes/shape.js
var require_shape = __commonJS({
  "../Shaku/lib/collision/shapes/shape.js"(exports, module) {
    "use strict";
    var Color2 = require_color();
    var Rectangle2 = require_rectangle();
    var Vector22 = require_vector2();
    var CollisionWorld = require_collision_world();
    var CollisionShape = class {
      constructor() {
        this._world = null;
        this._worldRange = null;
        this._debugColor = null;
        this._forceDebugColor = null;
        this._collisionFlags = Number.MAX_SAFE_INTEGER;
      }
      get shapeId() {
        throw new Error("Not Implemented!");
      }
      get collisionFlags() {
        return this._collisionFlags;
      }
      set collisionFlags(value) {
        this._debugColor = null;
        this._collisionFlags = value;
        return this._collisionFlags;
      }
      setDebugColor(color) {
        this._forceDebugColor = color;
      }
      debugDraw(opacity) {
        throw new Error("Not Implemented!");
      }
      getCenter() {
        throw new Error("Not Implemented!");
      }
      remove() {
        if (this._world) {
          this._world.removeShape(this);
        }
      }
      _getDebugColor() {
        if (this._forceDebugColor) {
          return this._forceDebugColor.clone();
        }
        if (!this._debugColor) {
          this._debugColor = this._getDefaultDebugColorFor(this.collisionFlags);
        }
        return this._debugColor.clone();
      }
      _getDefaultDebugColorFor(flags) {
        return defaultDebugColors[flags % defaultDebugColors.length];
      }
      _getRadius() {
        throw new Error("Not Implemented!");
      }
      _getBoundingBox() {
        throw new Error("Not Implemented!");
      }
      _setParent(world) {
        if (world === this._world) {
          return;
        }
        if (this._world && world) {
          throw new Error("Cannot add collision shape to world while its already in another world!");
        }
        this._world = world;
        this._worldRange = null;
      }
      _shapeChanged() {
        if (this._world) {
          this._world._queueUpdate(this);
        }
      }
    };
    var defaultDebugColors = [Color2.red, Color2.blue, Color2.green, Color2.yellow, Color2.purple, Color2.teal, Color2.brown, Color2.orange, Color2.khaki, Color2.darkcyan, Color2.cornflowerblue, Color2.darkgray, Color2.chocolate, Color2.aquamarine, Color2.cadetblue, Color2.magenta, Color2.seagreen, Color2.pink, Color2.olive, Color2.violet];
    module.exports = CollisionShape;
  }
});

// ../Shaku/lib/collision/result.js
var require_result = __commonJS({
  "../Shaku/lib/collision/result.js"(exports, module) {
    "use strict";
    var Vector22 = require_vector2();
    var CollisionShape = require_shape();
    var CollisionTestResult = class {
      constructor(position, first, second) {
        this.position = position;
        this.first = first;
        this.second = second;
      }
    };
    module.exports = CollisionTestResult;
  }
});

// ../Shaku/lib/collision/resolver.js
var require_resolver = __commonJS({
  "../Shaku/lib/collision/resolver.js"(exports, module) {
    "use strict";
    var Vector22 = require_vector2();
    var CollisionTestResult = require_result();
    var CollisionShape = require_shape();
    var _logger = require_logger().getLogger("collision");
    var CollisionResolver = class {
      constructor() {
        this._handlers = {};
      }
      _init() {
      }
      setHandler(firstShapeId, secondShapeId, handler) {
        _logger.debug(`Register handler for shapes '${firstShapeId}' and '${secondShapeId}'.`);
        if (!this._handlers[firstShapeId]) {
          this._handlers[firstShapeId] = {};
        }
        this._handlers[firstShapeId][secondShapeId] = handler;
        if (firstShapeId !== secondShapeId) {
          if (!this._handlers[secondShapeId]) {
            this._handlers[secondShapeId] = {};
          }
          this._handlers[secondShapeId][firstShapeId] = (f, s) => {
            return handler(s, f);
          };
        }
      }
      test(first, second) {
        let handler = this._getCollisionMethod(first, second);
        return this.testWithHandler(first, second, handler);
      }
      testWithHandler(first, second, handler) {
        if (!handler) {
          _logger.warn(`Missing collision handler for shapes '${first.shapeId}' and '${second.shapeId}'.`);
          return null;
        }
        let result = handler(first, second);
        if (result) {
          let position = result instanceof Vector22 ? result : null;
          return new CollisionTestResult(position, first, second);
        }
        return null;
      }
      getHandlers(shape) {
        return this._handlers[shape.shapeId];
      }
      _getCollisionMethod(first, second) {
        let handlersFrom = this._handlers[first.shapeId];
        if (handlersFrom) {
          return handlersFrom[second.shapeId] || null;
        }
        return null;
      }
    };
    module.exports = CollisionResolver;
  }
});

// ../Shaku/lib/collision/shapes/point.js
var require_point = __commonJS({
  "../Shaku/lib/collision/shapes/point.js"(exports, module) {
    "use strict";
    var CollisionShape = require_shape();
    var gfx = require_gfx2();
    var Vector22 = require_vector2();
    var Rectangle2 = require_rectangle();
    var Circle = require_circle();
    var PointShape = class extends CollisionShape {
      constructor(position) {
        super();
        this.setPosition(position);
      }
      get shapeId() {
        return "point";
      }
      setPosition(position) {
        this._position = position.clone();
        this._boundingBox = new Rectangle2(position.x, position.y, 1, 1);
        this._shapeChanged();
      }
      getPosition() {
        return this._position.clone();
      }
      getCenter() {
        return this._position.clone();
      }
      _getRadius() {
        return 1;
      }
      _getBoundingBox() {
        return this._boundingBox;
      }
      debugDraw(opacity) {
        if (opacity === void 0)
          opacity = 1;
        let color = this._getDebugColor();
        color.a *= opacity;
        gfx.outlineCircle(new Circle(this.getPosition(), 3), color, gfx.BlendModes.AlphaBlend, 4);
      }
    };
    module.exports = PointShape;
  }
});

// ../Shaku/lib/collision/shapes/circle.js
var require_circle2 = __commonJS({
  "../Shaku/lib/collision/shapes/circle.js"(exports, module) {
    "use strict";
    var CollisionShape = require_shape();
    var gfx = require_gfx2();
    var Circle = require_circle();
    var Rectangle2 = require_rectangle();
    var CircleShape = class extends CollisionShape {
      constructor(circle) {
        super();
        this.setShape(circle);
      }
      get shapeId() {
        return "circle";
      }
      setShape(circle) {
        this._circle = circle;
        this._position = circle.center;
        this._boundingBox = new Rectangle2(circle.center.x - circle.radius, circle.center.y - circle.radius, circle.radius * 2, circle.radius * 2);
        this._shapeChanged();
      }
      _getRadius() {
        return this._circle.radius;
      }
      getCenter() {
        return this._position.clone();
      }
      _getBoundingBox() {
        return this._boundingBox;
      }
      debugDraw(opacity) {
        if (opacity === void 0)
          opacity = 1;
        let color = this._getDebugColor();
        color.a *= opacity;
        gfx.outlineCircle(this._circle, color, gfx.BlendModes.AlphaBlend, 14);
        color.a *= 0.25;
        gfx.fillCircle(this._circle, color, gfx.BlendModes.AlphaBlend, 14);
      }
    };
    module.exports = CircleShape;
  }
});

// ../Shaku/lib/collision/collision_world.js
var require_collision_world = __commonJS({
  "../Shaku/lib/collision/collision_world.js"(exports, module) {
    "use strict";
    var Color2 = require_color();
    var Vector22 = require_vector2();
    var Circle = require_circle();
    var CollisionTestResult = require_result();
    var CollisionShape = require_shape();
    var gfx = require_gfx2();
    var Rectangle2 = require_rectangle();
    var CollisionResolver = require_resolver();
    var PointShape = require_point();
    var CircleShape = require_circle2();
    var _logger = require_logger().getLogger("collision");
    var CollisionWorld = class {
      constructor(resolver, gridCellSize) {
        this.resolver = resolver;
        if (typeof gridCellSize === "undefined") {
          gridCellSize = new Vector22(512, 512);
        } else if (typeof gridCellSize === "number") {
          gridCellSize = new Vector22(gridCellSize, gridCellSize);
        } else {
          gridCellSize = gridCellSize.clone();
        }
        this._gridCellSize = gridCellSize;
        this._grid = {};
        this._shapesToUpdate = /* @__PURE__ */ new Set();
        this._cellsToDelete = /* @__PURE__ */ new Set();
      }
      _performUpdates() {
        if (this._cellsToDelete.size > 0) {
          for (let key of this._cellsToDelete) {
            if (this._grid[key] && this._grid[key].size === 0) {
              delete this._grid[key];
            }
          }
          this._cellsToDelete.clear();
        }
        if (this._shapesToUpdate.size > 0) {
          for (let shape of this._shapesToUpdate) {
            this._updateShape(shape);
          }
          this._shapesToUpdate.clear();
        }
      }
      _updateShape(shape) {
        if (shape._world !== this) {
          return;
        }
        let bb = shape._getBoundingBox();
        let minx = Math.floor(bb.left / this._gridCellSize.x);
        let miny = Math.floor(bb.top / this._gridCellSize.y);
        let maxx = Math.ceil(bb.right / this._gridCellSize.x);
        let maxy = Math.ceil(bb.bottom / this._gridCellSize.y);
        if (shape._worldRange) {
          if (shape._worldRange[0] === minx && shape._worldRange[1] === miny && shape._worldRange[2] === maxx && shape._worldRange[3] === maxy) {
            return;
          }
          let ominx = shape._worldRange[0];
          let ominy = shape._worldRange[1];
          let omaxx = shape._worldRange[2];
          let omaxy = shape._worldRange[3];
          for (let i = ominx; i < omaxx; ++i) {
            for (let j = ominy; j < omaxy; ++j) {
              if (i >= minx && i < maxx && j >= miny && j < maxy) {
                continue;
              }
              let key = i + "," + j;
              let currSet = this._grid[key];
              if (currSet) {
                currSet.delete(shape);
                if (currSet.size === 0) {
                  this._cellsToDelete.add(key);
                }
              }
            }
          }
          for (let i = minx; i < maxx; ++i) {
            for (let j = miny; j < maxy; ++j) {
              if (i >= ominx && i < omaxx && j >= ominy && j < omaxy) {
                continue;
              }
              let key = i + "," + j;
              let currSet = this._grid[key];
              if (!currSet) {
                this._grid[key] = currSet = /* @__PURE__ */ new Set();
              }
              currSet.add(shape);
            }
          }
        } else {
          for (let i = minx; i < maxx; ++i) {
            for (let j = miny; j < maxy; ++j) {
              let key = i + "," + j;
              let currSet = this._grid[key];
              if (!currSet) {
                this._grid[key] = currSet = /* @__PURE__ */ new Set();
              }
              currSet.add(shape);
            }
          }
        }
        shape._worldRange = [minx, miny, maxx, maxy];
      }
      _queueUpdate(shape) {
        this._shapesToUpdate.add(shape);
      }
      iterateShapes(callback) {
        for (let key in this._grid) {
          let cell = this._grid[key];
          if (cell) {
            for (let shape of cell) {
              if (callback(shape) === false) {
                return;
              }
            }
          }
        }
      }
      addShape(shape) {
        shape._setParent(this);
        this._updateShape(shape);
        this._performUpdates();
      }
      removeShape(shape) {
        if (shape._world !== this) {
          _logger.warn("Shape to remove is not in this collision world!");
          return;
        }
        if (shape._worldRange) {
          let minx = shape._worldRange[0];
          let miny = shape._worldRange[1];
          let maxx = shape._worldRange[2];
          let maxy = shape._worldRange[3];
          for (let i = minx; i < maxx; ++i) {
            for (let j = miny; j < maxy; ++j) {
              let key = i + "," + j;
              let currSet = this._grid[key];
              if (currSet) {
                currSet.delete(shape);
                if (currSet.size === 0) {
                  this._cellsToDelete.add(key);
                }
              }
            }
          }
        }
        this._shapesToUpdate.delete(shape);
        shape._setParent(null);
        this._performUpdates();
      }
      _iterateBroadPhase(shape, handler, mask, predicate) {
        let bb = shape._getBoundingBox();
        let minx = Math.floor(bb.left / this._gridCellSize.x);
        let miny = Math.floor(bb.top / this._gridCellSize.y);
        let maxx = Math.ceil(bb.right / this._gridCellSize.x);
        let maxy = Math.ceil(bb.bottom / this._gridCellSize.y);
        let checked = /* @__PURE__ */ new Set();
        for (let i = minx; i < maxx; ++i) {
          for (let j = miny; j < maxy; ++j) {
            let key = i + "," + j;
            let currSet = this._grid[key];
            if (currSet) {
              for (let other of currSet) {
                if (mask && (other.collisionFlags & mask) === 0) {
                  continue;
                }
                if (checked.has(other)) {
                  continue;
                }
                checked.add(other);
                if (other === shape) {
                  continue;
                }
                if (predicate && !predicate(other)) {
                  continue;
                }
                let proceedLoop = Boolean(handler(other));
                if (!proceedLoop) {
                  return;
                }
              }
            }
          }
        }
      }
      testCollision(sourceShape, sortByDistance, mask, predicate) {
        this._performUpdates();
        var result = null;
        if (sortByDistance) {
          var options = [];
          this._iterateBroadPhase(sourceShape, (other) => {
            options.push(other);
            return true;
          }, mask, predicate);
          sortByDistanceShapes(sourceShape, options);
          var handlers = this.resolver.getHandlers(sourceShape);
          for (let other of options) {
            result = this.resolver.testWithHandler(sourceShape, other, handlers[other.shapeId]);
            if (result) {
              break;
            }
          }
        } else {
          var handlers = this.resolver.getHandlers(sourceShape);
          this._iterateBroadPhase(sourceShape, (other) => {
            result = this.resolver.testWithHandler(sourceShape, other, handlers[other.shapeId]);
            return !result;
          }, mask, predicate);
        }
        return result;
      }
      testCollisionMany(sourceShape, sortByDistance, mask, predicate, intermediateProcessor) {
        this._performUpdates();
        var ret = [];
        var handlers = this.resolver.getHandlers(sourceShape);
        this._iterateBroadPhase(sourceShape, (other) => {
          let result = this.resolver.testWithHandler(sourceShape, other, handlers[other.shapeId]);
          if (result) {
            ret.push(result);
            if (intermediateProcessor && intermediateProcessor(result) === false) {
              return false;
            }
          }
          return true;
        }, mask, predicate);
        if (sortByDistance) {
          sortByDistanceResults(sourceShape, ret);
        }
        return ret;
      }
      pick(position, radius, sortByDistance, mask, predicate) {
        let shape = (radius || 0) <= 1 ? new PointShape(position) : new CircleShape(new Circle(position, radius));
        let ret = this.testCollisionMany(shape, sortByDistance, mask, predicate);
        return ret.map((x) => x.second);
      }
      debugDraw(gridColor, gridHighlitColor, opacity, camera) {
        this._performUpdates();
        if (!gridColor) {
          gridColor = Color2.black;
          gridColor.a *= 0.75;
        }
        if (!gridHighlitColor) {
          gridHighlitColor = Color2.red;
          gridHighlitColor.a *= 0.75;
        }
        if (opacity === void 0) {
          opacity = 0.5;
        }
        gridColor.a *= opacity;
        gridHighlitColor.a *= opacity;
        let renderedShapes = /* @__PURE__ */ new Set();
        let bb = camera ? camera.getRegion() : gfx.getRenderingRegion(false);
        let minx = Math.floor(bb.left / this._gridCellSize.x);
        let miny = Math.floor(bb.top / this._gridCellSize.y);
        let maxx = minx + Math.ceil(bb.width / this._gridCellSize.x);
        let maxy = miny + Math.ceil(bb.height / this._gridCellSize.y);
        for (let i = minx; i <= maxx; ++i) {
          for (let j = miny; j <= maxy; ++j) {
            let cell = this._grid[i + "," + j];
            let color = cell && cell.size ? gridHighlitColor : gridColor;
            let cellRect = new Rectangle2(i * this._gridCellSize.x, j * this._gridCellSize.y, this._gridCellSize.x - 1, this._gridCellSize.y - 1);
            gfx.outlineRect(cellRect, color, gfx.BlendModes.AlphaBlend, 0);
            if (cell) {
              for (let shape of cell) {
                if (renderedShapes.has(shape)) {
                  continue;
                }
                renderedShapes.add(shape);
                shape.debugDraw(opacity);
              }
            }
          }
        }
      }
    };
    function sortByDistanceShapes(sourceShape, options) {
      let sourceCenter = sourceShape.getCenter();
      options.sort((a, b) => a.getCenter().distanceTo(sourceCenter) - a._getRadius() - (b.getCenter().distanceTo(sourceCenter) - b._getRadius()));
    }
    function sortByDistanceResults(sourceShape, options) {
      let sourceCenter = sourceShape.getCenter();
      options.sort((a, b) => a.second.getCenter().distanceTo(sourceCenter) - a.second._getRadius() - (b.second.getCenter().distanceTo(sourceCenter) - b.second._getRadius()));
    }
    module.exports = CollisionWorld;
  }
});

// ../Shaku/lib/collision/shapes/rectangle.js
var require_rectangle2 = __commonJS({
  "../Shaku/lib/collision/shapes/rectangle.js"(exports, module) {
    "use strict";
    var Rectangle2 = require_rectangle();
    var CollisionShape = require_shape();
    var gfx = require_gfx2();
    var RectangleShape = class extends CollisionShape {
      constructor(rectangle) {
        super();
        this.setShape(rectangle);
      }
      get shapeId() {
        return "rect";
      }
      setShape(rectangle) {
        this._rect = rectangle;
        this._center = rectangle.getCenter();
        this._radius = this._rect.getBoundingCircle().radius;
        this._shapeChanged();
      }
      _getRadius() {
        return this._radius;
      }
      _getBoundingBox() {
        return this._rect;
      }
      getCenter() {
        return this._center.clone();
      }
      debugDraw(opacity) {
        if (opacity === void 0)
          opacity = 1;
        let color = this._getDebugColor();
        color.a *= opacity;
        gfx.outlineRect(this._rect, color, gfx.BlendModes.AlphaBlend);
        color.a *= 0.25;
        gfx.fillRect(this._rect, color, gfx.BlendModes.AlphaBlend);
      }
    };
    module.exports = RectangleShape;
  }
});

// ../Shaku/lib/collision/resolvers_imp.js
var require_resolvers_imp = __commonJS({
  "../Shaku/lib/collision/resolvers_imp.js"(exports, module) {
    "use strict";
    var CollisionsImp = {
      pointPoint: function(v1, v2) {
        return v1._position.approximate(v2._position) ? v1._position : false;
      },
      pointCircle: function(v1, c1) {
        return v1._position.distanceTo(c1._circle.center) <= c1._circle.radius ? v1._position : false;
      },
      pointRectangle: function(v1, r1) {
        return r1._rect.containsVector(v1._position) ? v1._position : false;
      },
      pointLine: function(v1, l1) {
        for (let i = 0; i < l1._lines.length; ++i) {
          if (l1._lines[i].containsVector(v1._position)) {
            return v1._position;
          }
        }
        return false;
      },
      pointTilemap: function(v1, tm) {
        if (tm._intBoundingRect.containsVector(v1._position)) {
          let tile = tm.getTileAt(v1._position);
          return tile ? CollisionsImp.pointRectangle(v1, tile) : false;
        }
        if (tm._borderThickness && tm._boundingRect.containsVector(v1._position)) {
          return v1._position;
        }
        return false;
      },
      circleCircle: function(c1, c2) {
        return c1._circle.center.distanceTo(c2._circle.center) <= c1._circle.radius + c2._circle.radius;
      },
      circleRectangle: function(c1, r1) {
        return r1._rect.collideCircle(c1._circle);
      },
      circleLine: function(c1, l1) {
        for (let i = 0; i < l1._lines.length; ++i) {
          if (l1._lines[i].distanceToVector(c1._circle.center) <= c1._circle.radius) {
            return true;
          }
        }
        return false;
      },
      circleTilemap: function(c1, tm) {
        let collide = false;
        tm.iterateTilesAtRegion(c1._getBoundingBox(), (tile) => {
          if (CollisionsImp.circleRectangle(c1, tile)) {
            collide = true;
            return false;
          }
        });
        return collide;
      },
      rectangleRectangle: function(r1, r2) {
        return r1._rect.collideRect(r2._rect);
      },
      rectangleLine: function(r1, l1) {
        for (let i = 0; i < l1._lines.length; ++i) {
          if (r1._rect.collideLine(l1._lines[i])) {
            return true;
          }
        }
        return false;
      },
      rectangleTilemap: function(r1, tm) {
        let collide = false;
        tm.iterateTilesAtRegion(r1._getBoundingBox(), (tile) => {
          collide = true;
          return false;
        });
        return collide;
      },
      lineLine: function(l1, l2) {
        for (let i = 0; i < l1._lines.length; ++i) {
          for (let j = 0; j < l2._lines.length; ++j) {
            if (l1._lines[i].collideLine(l2._lines[j])) {
              return true;
            }
          }
        }
        return false;
      },
      lineTilemap: function(l1, tm) {
        let collide = false;
        tm.iterateTilesAtRegion(l1._getBoundingBox(), (tile) => {
          if (CollisionsImp.rectangleLine(tile, l1)) {
            collide = true;
            return false;
          }
        });
        return collide;
      }
    };
    module.exports = CollisionsImp;
  }
});

// ../Shaku/lib/collision/shapes/lines.js
var require_lines = __commonJS({
  "../Shaku/lib/collision/shapes/lines.js"(exports, module) {
    "use strict";
    var CollisionShape = require_shape();
    var gfx = require_gfx2();
    var Line2 = require_line();
    var Rectangle2 = require_rectangle();
    var Circle = require_circle();
    var LinesShape = class extends CollisionShape {
      constructor(lines) {
        super();
        this._lines = [];
        this.addLines(lines);
      }
      get shapeId() {
        return "lines";
      }
      addLines(lines) {
        if (!Array.isArray(lines)) {
          lines = [lines];
        }
        for (let i = 0; i < lines.length; ++i) {
          this._lines.push(lines[i]);
        }
        let points = [];
        for (let i = 0; i < this._lines.length; ++i) {
          points.push(this._lines[i].from);
          points.push(this._lines[i].to);
        }
        this._boundingBox = Rectangle2.fromPoints(points);
        this._circle = new Circle(this._boundingBox.getCenter(), Math.max(this._boundingBox.width, this._boundingBox.height));
        this._shapeChanged();
      }
      setLines(lines) {
        this._lines = [];
        this.addLines(lines);
      }
      _getRadius() {
        return this._circle.radius;
      }
      getCenter() {
        return this._circle.center.clone();
      }
      _getBoundingBox() {
        return this._boundingBox;
      }
      debugDraw(opacity) {
        if (opacity === void 0)
          opacity = 1;
        let color = this._getDebugColor();
        color.a *= opacity;
        for (let i = 0; i < this._lines.length; ++i) {
          gfx.drawLine(this._lines[i].from, this._lines[i].to, color, gfx.BlendModes.AlphaBlend);
        }
      }
    };
    module.exports = LinesShape;
  }
});

// ../Shaku/lib/collision/shapes/tilemap.js
var require_tilemap = __commonJS({
  "../Shaku/lib/collision/shapes/tilemap.js"(exports, module) {
    "use strict";
    var CollisionShape = require_shape();
    var Rectangle2 = require_rectangle();
    var Vector22 = require_vector2();
    var gfx = require_gfx2();
    var RectangleShape = require_rectangle2();
    var TilemapShape = class extends CollisionShape {
      constructor(offset, gridSize, tileSize, borderThickness) {
        super();
        borderThickness = borderThickness || 0;
        this._offset = offset.clone();
        this._intBoundingRect = new Rectangle2(offset.x, offset.y, gridSize.x * tileSize.x, gridSize.y * tileSize.y);
        this._boundingRect = this._intBoundingRect.resize(borderThickness * 2);
        this._center = this._boundingRect.getCenter();
        this._radius = this._boundingRect.getBoundingCircle().radius;
        this._borderThickness = borderThickness;
        this._gridSize = gridSize.clone();
        this._tileSize = tileSize.clone();
        this._tiles = {};
      }
      get shapeId() {
        return "tilemap";
      }
      _indexToKey(index) {
        if (index.x < 0 || index.y < 0 || index.x >= this._gridSize.x || index.y >= this._gridSize.y) {
          throw new Error(`Collision tile with index ${index.x},${index.y} is out of bounds!`);
        }
        return index.x + "," + index.y;
      }
      setTile(index, haveCollision, collisionFlags) {
        let key = this._indexToKey(index);
        if (haveCollision) {
          let rect = this._tiles[key] || new RectangleShape(
            new Rectangle2(
              this._offset.x + index.x * this._tileSize.x,
              this._offset.y + index.y * this._tileSize.y,
              this._tileSize.x,
              this._tileSize.y
            )
          );
          if (collisionFlags !== void 0) {
            rect.collisionFlags = collisionFlags;
          }
          this._tiles[key] = rect;
        } else {
          delete this._tiles[key];
        }
      }
      getTileAt(position) {
        let index = new Vector22(Math.floor(position.x / this._tileSize.x), Math.floor(position.y / this._tileSize.y));
        let key = index.x + "," + index.y;
        return this._tiles[key] || null;
      }
      iterateTilesAtRegion(region, callback) {
        let topLeft = region.getTopLeft();
        let bottomRight = region.getBottomRight();
        let startIndex = new Vector22(Math.floor(topLeft.x / this._tileSize.x), Math.floor(topLeft.y / this._tileSize.y));
        let endIndex = new Vector22(Math.floor(bottomRight.x / this._tileSize.x), Math.floor(bottomRight.y / this._tileSize.y));
        for (let i = startIndex.x; i <= endIndex.x; ++i) {
          for (let j = startIndex.y; j <= endIndex.y; ++j) {
            let key = i + "," + j;
            let tile = this._tiles[key];
            if (tile && callback(tile) === false) {
              return;
            }
          }
        }
      }
      getTilesAtRegion(region) {
        let ret = [];
        this.iterateTilesAtRegion(region, (tile) => {
          ret.push(tile);
        });
        return ret;
      }
      _getRadius() {
        return this._radius;
      }
      _getBoundingBox() {
        return this._boundingRect;
      }
      getCenter() {
        return this._center.clone();
      }
      debugDraw(opacity) {
        if (opacity === void 0)
          opacity = 1;
        let color = this._getDebugColor();
        color.a *= opacity;
        if (this._haveBorders) {
          gfx.outlineRect(this._intBoundingRect, color, gfx.BlendModes.AlphaBlend);
          gfx.outlineRect(this._boundingRect, color, gfx.BlendModes.AlphaBlend);
        }
        for (let key in this._tiles) {
          let tile = this._tiles[key];
          tile.setDebugColor(this._forceDebugColor);
          tile.debugDraw(opacity);
        }
      }
    };
    module.exports = TilemapShape;
  }
});

// ../Shaku/lib/collision/collision.js
var require_collision = __commonJS({
  "../Shaku/lib/collision/collision.js"(exports, module) {
    "use strict";
    var IManager = require_manager();
    var Vector22 = require_vector2();
    var CollisionWorld = require_collision_world();
    var CollisionResolver = require_resolver();
    var CircleShape = require_circle2();
    var PointShape = require_point();
    var RectangleShape = require_rectangle2();
    var ResolverImp = require_resolvers_imp();
    var LinesShape = require_lines();
    var TilemapShape = require_tilemap();
    var _logger = require_logger().getLogger("collision");
    var Collision = class extends IManager {
      constructor() {
        super();
        this.resolver = new CollisionResolver();
      }
      setup() {
        return new Promise((resolve, reject2) => {
          _logger.info("Setup collision manager..");
          this.resolver._init();
          this.resolver.setHandler("point", "point", ResolverImp.pointPoint);
          this.resolver.setHandler("point", "circle", ResolverImp.pointCircle);
          this.resolver.setHandler("point", "rect", ResolverImp.pointRectangle);
          this.resolver.setHandler("point", "lines", ResolverImp.pointLine);
          this.resolver.setHandler("point", "tilemap", ResolverImp.pointTilemap);
          this.resolver.setHandler("circle", "circle", ResolverImp.circleCircle);
          this.resolver.setHandler("circle", "rect", ResolverImp.circleRectangle);
          this.resolver.setHandler("circle", "lines", ResolverImp.circleLine);
          this.resolver.setHandler("circle", "tilemap", ResolverImp.circleTilemap);
          this.resolver.setHandler("rect", "rect", ResolverImp.rectangleRectangle);
          this.resolver.setHandler("rect", "lines", ResolverImp.rectangleLine);
          this.resolver.setHandler("rect", "tilemap", ResolverImp.rectangleTilemap);
          this.resolver.setHandler("lines", "lines", ResolverImp.lineLine);
          this.resolver.setHandler("lines", "tilemap", ResolverImp.lineTilemap);
          resolve();
        });
      }
      createWorld(gridCellSize) {
        return new CollisionWorld(this.resolver, gridCellSize);
      }
      get RectangleShape() {
        return RectangleShape;
      }
      get PointShape() {
        return PointShape;
      }
      get CircleShape() {
        return CircleShape;
      }
      get LinesShape() {
        return LinesShape;
      }
      get TilemapShape() {
        return TilemapShape;
      }
      startFrame() {
      }
      endFrame() {
      }
      destroy() {
      }
    };
    module.exports = new Collision();
  }
});

// ../Shaku/lib/collision/index.js
var require_collision2 = __commonJS({
  "../Shaku/lib/collision/index.js"(exports, module) {
    "use strict";
    module.exports = require_collision();
  }
});

// ../Shaku/lib/shaku.js
var require_shaku = __commonJS({
  "../Shaku/lib/shaku.js"(exports, module) {
    "use strict";
    var isBrowser = typeof window !== "undefined";
    var IManager = require_manager();
    var logger = require_logger();
    var sfx = isBrowser ? require_sfx2() : null;
    var gfx = isBrowser ? require_gfx2() : null;
    var input = isBrowser ? require_input2() : null;
    var assets = require_assets2();
    var collision = require_collision2();
    var utils = require_utils();
    var GameTime = require_game_time();
    var _logger = logger.getLogger("shaku");
    var _usedManagers = null;
    var _prevUpdateTime = null;
    var _currFpsCounter = 0;
    var _countSecond = 0;
    var _currFps = 0;
    var _startFrameTime = 0;
    var _frameTimeMeasuresCount = 0;
    var _totalFrameTimes = 0;
    var version = "1.6.1";
    var Shaku2 = class {
      constructor() {
        this.utils = utils;
        this.sfx = sfx;
        this.gfx = gfx;
        this.input = input;
        this.assets = assets;
        this.collision = collision;
        this.pauseWhenNotFocused = false;
        this.paused = false;
        this.pauseTime = false;
        this._managersStarted = false;
        this._wasPaused = false;
      }
      async init(managers) {
        return new Promise(async (resolve, reject2) => {
          if (_usedManagers) {
            throw new Error("Already initialized!");
          }
          _logger.info(`Initialize Shaku v${version}.`);
          GameTime.reset();
          _usedManagers = managers || (isBrowser ? [assets, sfx, gfx, input, collision] : [assets, collision]);
          for (let i = 0; i < _usedManagers.length; ++i) {
            await _usedManagers[i].setup();
          }
          _prevUpdateTime = new GameTime();
          resolve();
        });
      }
      destroy() {
        if (!_usedManagers) {
          throw new Error("Not initialized!");
        }
        for (let i = 0; i < _usedManagers.length; ++i) {
          _usedManagers[i].destroy();
        }
      }
      get isPaused() {
        return this.paused || this.pauseWhenNotFocused && !document.hasFocus();
      }
      startFrame() {
        if (this.isPaused) {
          this._wasPaused = true;
          return;
        }
        if (this._wasPaused) {
          this._wasPaused = false;
          GameTime.resetDelta();
        }
        if (this.pauseTime) {
          GameTime.resetDelta();
        } else {
          GameTime.update();
        }
        _startFrameTime = GameTime.rawTimestamp();
        this._gameTime = new GameTime();
        utils.Animator.updateAutos(this._gameTime.delta);
        for (let i = 0; i < _usedManagers.length; ++i) {
          _usedManagers[i].startFrame();
        }
        this._managersStarted = true;
      }
      endFrame() {
        if (this._managersStarted) {
          for (let i = 0; i < _usedManagers.length; ++i) {
            _usedManagers[i].endFrame();
          }
          this._managersStarted = false;
        }
        if (this.isPaused) {
          return;
        }
        _prevUpdateTime = this._gameTime;
        if (this._gameTime) {
          this._updateFpsAndTimeStats();
        }
      }
      _updateFpsAndTimeStats() {
        _currFpsCounter++;
        _countSecond += this._gameTime.delta;
        if (_countSecond >= 1) {
          _countSecond = 0;
          _currFps = _currFpsCounter;
          _currFpsCounter = 0;
          _totalFrameTimes = this.getAverageFrameTime();
          _frameTimeMeasuresCount = 1;
        }
        let _endFrameTime = GameTime.rawTimestamp();
        _frameTimeMeasuresCount++;
        _totalFrameTimes += _endFrameTime - _startFrameTime;
      }
      silent() {
        logger.silent();
      }
      throwErrorOnWarnings(enable) {
        if (enable === void 0) {
          throw Error("Must provide a value!");
        }
        logger.throwErrorOnWarnings(enable);
      }
      get gameTime() {
        return this._gameTime;
      }
      get version() {
        return version;
      }
      getFpsCount() {
        return _currFps;
      }
      getAverageFrameTime() {
        if (_frameTimeMeasuresCount === 0) {
          return 0;
        }
        return _totalFrameTimes / _frameTimeMeasuresCount;
      }
      requestAnimationFrame(callback) {
        if (window.requestAnimationFrame)
          return window.requestAnimationFrame(callback);
        else if (window.mozRequestAnimationFrame)
          return window.mozRequestAnimationFrame(callback);
        else if (window.webkitRequestAnimationFrame)
          return window.webkitRequestAnimationFrame(callback);
        else if (window.msRequestAnimationFrame)
          return window.msRequestAnimationFrame(callback);
        else
          return setTimeout(callback, 1e3 / 60);
      }
      cancelAnimationFrame(id) {
        if (window.cancelAnimationFrame)
          return window.cancelAnimationFrame(id);
        else if (window.mozCancelAnimationFrame)
          return window.mozCancelAnimationFrame(id);
        else
          clearTimeout(id);
      }
      setLogger(loggerHandler) {
        logger.setDrivers(loggerHandler);
      }
      getLogger(name) {
        return logger.getLogger(name);
      }
    };
    module.exports = new Shaku2();
  }
});

// node_modules/lodash.memoize/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.memoize/index.js"(exports, module) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var splice = arrayProto.splice;
    var Map = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    function Hash(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function memoize2(func, resolver) {
      if (typeof func != "function" || resolver && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize2.Cache || MapCache)();
      return memoized;
    }
    memoize2.Cache = MapCache;
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    module.exports = memoize2;
  }
});

// src/main.ts
var import_shaku = __toESM(require_shaku());
var import_sprite = __toESM(require_sprite());
var import_vector2 = __toESM(require_vector2());
var import_color = __toESM(require_color());
var import_rectangle = __toESM(require_rectangle());
var import_key_codes = __toESM(require_key_codes());
var import_blend_modes = __toESM(require_blend_modes());
var import_text_alignments = __toESM(require_text_alignments());

// src/background_effect.ts
var import_effect = __toESM(require_effect());
var vertexShader = `#version 300 es
in vec3 a_position;
in vec2 a_coord;

uniform mat4 u_projection;
uniform mat4 u_world;
uniform float u_aspect_ratio;

out vec2 v_texCoord;

void main(void) {
    gl_Position = u_projection * u_world * vec4(a_position, 1.0);
    gl_PointSize = 1.0;
    v_texCoord = a_coord * vec2(u_aspect_ratio * 2.0, 2.0) - vec2(u_aspect_ratio, 1.0);
}`;
var fragmentShader = `#version 300 es
precision highp float;

uniform float u_time;

in vec2 v_texCoord;
out vec4 FragColor;

/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0)) + .25;
}


vec2 pong(vec2 value, float pong_value) {
    vec2 v = mod(value, pong_value * 2.0);
    return min(v, pong_value * 2.0 - v);
}

void main(void) {

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = v_texCoord;

    uv *= 1. + .05 * sin(u_time * .03 + .2);
    float a = .06 * sin(u_time * 0.08 + .32) + .43;
    float ca = cos(a);
    float sa = sin(a);
    uv = mat2(ca,sa,-sa,ca) * uv;

    uv = pong(uv, .3 + sin(u_time * .02) * .03);
    // uv.x += sin(u_time * .17 + .3) * .1;

    uv.x += u_time * 0.01 * cos(log(u_time) + .4);
    uv.y += u_time * 0.01 * sin(log(u_time) + .4);
    //float noise = texture(iChannel0, uv).x;
    float noise = simplex3d(vec3(uv * 10.0, u_time*0.21));

    // Output to screen
    FragColor = vec4(mix(vec3(.1843, .3098, .3098), vec3(.149, .2471, .2471), noise), 1.0);
}`;
var BackgroundEffect = class extends import_effect.default {
  get vertexCode() {
    return vertexShader;
  }
  get fragmentCode() {
    return fragmentShader;
  }
  get uniformTypes() {
    return {
      "u_projection": { type: import_effect.default.UniformTypes.Matrix, bind: import_effect.default.UniformBinds.Projection },
      "u_world": { type: import_effect.default.UniformTypes.Matrix, bind: import_effect.default.UniformBinds.World },
      "u_time": { type: import_effect.default.UniformTypes.Float, bind: "u_time" },
      "u_aspect_ratio": { type: import_effect.default.UniformTypes.Float, bind: "u_aspect_ratio" }
    };
  }
  get attributeTypes() {
    return {
      "a_position": { size: 3, type: import_effect.default.AttributeTypes.Float, normalize: false, bind: import_effect.default.AttributeBinds.Position },
      "a_coord": { size: 2, type: import_effect.default.AttributeTypes.Float, normalize: false, bind: import_effect.default.AttributeBinds.TextureCoords }
    };
  }
};

// src/kalbak.ts
var doOnceOnTrueList = [];
var doEveryFrameUntilTrueList = [];
function doEveryFrameUntilTrue(action) {
  doEveryFrameUntilTrueList.push(action);
}
function kalbakUpdate() {
  for (var i = doOnceOnTrueList.length - 1; i >= 0; i--) {
    let pending = doOnceOnTrueList[i];
    if (pending.condition()) {
      doOnceOnTrueList.splice(i, 1);
      pending.action();
    }
  }
  for (var i = doEveryFrameUntilTrueList.length - 1; i >= 0; i--) {
    if (doEveryFrameUntilTrueList[i]()) {
      doEveryFrameUntilTrueList.splice(i, 1);
    }
  }
}

// src/main.ts
var import_lodash = __toESM(require_lodash());
import_shaku.default.input.setTargetElement(() => import_shaku.default.gfx.canvas);
await import_shaku.default.init();
document.body.appendChild(import_shaku.default.gfx.canvas);
import_shaku.default.gfx.setResolution(800, 600, true);
import_shaku.default.gfx.centerCanvas();
var TILE_SIZE = 50;
var SYMBOL_SIZE = 50;
var instructions_font = await import_shaku.default.assets.loadMsdfFontTexture("fonts/Arial.ttf", { jsonUrl: "fonts/Arial.json", textureUrl: "fonts/Arial.png" });
var player_texture = await import_shaku.default.assets.loadTexture("imgs/player.png", { generateMipMaps: true });
var player_sprite = new import_sprite.default(player_texture);
player_sprite.size.set(TILE_SIZE, TILE_SIZE);
var crate_texture = await import_shaku.default.assets.loadTexture("imgs/crate.png", { generateMipMaps: true });
var crate_sprite = new import_sprite.default(crate_texture);
crate_sprite.size.set(TILE_SIZE, TILE_SIZE);
var target_texture = await import_shaku.default.assets.loadTexture("imgs/target.png", { generateMipMaps: true });
var target_sprite = new import_sprite.default(target_texture);
target_sprite.size.set(TILE_SIZE, TILE_SIZE);
var button_texture = await import_shaku.default.assets.loadTexture("imgs/button.png", { generateMipMaps: true });
var button_sprite = new import_sprite.default(button_texture);
button_sprite.size.set(TILE_SIZE, TILE_SIZE);
var two_state_wall_texture = await import_shaku.default.assets.loadTexture("imgs/two_state_wall.png", { generateMipMaps: true });
var spawner_texture = await import_shaku.default.assets.loadTexture("imgs/spawner.png", { generateMipMaps: true });
var spawner_sprite = new import_sprite.default(spawner_texture);
spawner_sprite.size.set(TILE_SIZE, TILE_SIZE);
var geo_texture = await import_shaku.default.assets.loadTexture("imgs/geo.png", { generateMipMaps: true });
var geo_sprite = new import_sprite.default(geo_texture, new import_rectangle.default(0, 0, TILE_SIZE, TILE_SIZE));
var floors_texture = await import_shaku.default.assets.loadTexture("imgs/floors.png", { generateMipMaps: true });
var left_arrow_texture = await import_shaku.default.assets.loadTexture("imgs/left_arrow.png", { generateMipMaps: true });
var left_arrow = new import_sprite.default(left_arrow_texture);
left_arrow.size.set(SYMBOL_SIZE, SYMBOL_SIZE);
var none_texture = await import_shaku.default.assets.loadTexture("imgs/wait.png", { generateMipMaps: true });
var none_sprite = new import_sprite.default(none_texture);
none_sprite.size.set(SYMBOL_SIZE, SYMBOL_SIZE);
var tape_borders_texture = await import_shaku.default.assets.loadTexture("imgs/tape_borders.png", { generateMipMaps: true });
var tape_border_left = new import_sprite.default(tape_borders_texture, new import_rectangle.default(0, 0, SYMBOL_SIZE / 2, SYMBOL_SIZE * 1.5));
tape_border_left.origin.set(0, 0);
tape_border_left.position.set(-SYMBOL_SIZE / 2, 0);
var tape_border = new import_sprite.default(tape_borders_texture, new import_rectangle.default(SYMBOL_SIZE / 2, 0, SYMBOL_SIZE, SYMBOL_SIZE * 1.5));
tape_border.origin.set(0, 0);
var tape_border_right = new import_sprite.default(tape_borders_texture, new import_rectangle.default(SYMBOL_SIZE * 1.5, 0, SYMBOL_SIZE / 2, SYMBOL_SIZE * 1.5));
tape_border_right.origin.set(0, 0);
var COLOR_TAPE = import_color.default.fromHex("#E5B35B");
var COLOR_HIGH = import_color.default.fromHex("#99F3ED");
var COLOR_LOW = import_color.default.fromHex("#6AC2BC");
var COLOR_SYMBOL = import_color.default.fromHex("#B84B4B");
var tape_high = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
tape_high.origin = new import_vector2.default(0, -8 / (SYMBOL_SIZE * 1.5));
tape_high.size.set(SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16);
tape_high.color = COLOR_HIGH;
var tape_low = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
tape_low.origin = new import_vector2.default(0, -8 / (SYMBOL_SIZE * 1.5));
tape_low.size.set(SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16);
tape_low.color = COLOR_LOW;
var Level = class {
  constructor(dev_name, n_moves, n_delay, initial_state2) {
    this.dev_name = dev_name;
    this.n_moves = n_moves;
    this.n_delay = n_delay;
    this.initial_state = initial_state2;
    initial_state2.wall.recalcFloors(initial_state2.spawner.pos);
  }
};
var GameState = class {
  constructor(major_turn, minor_turn, things) {
    this.major_turn = major_turn;
    this.minor_turn = minor_turn;
    this.things = things;
    this.spawned_player = false;
  }
  spawned_player;
  draw(turn_time) {
    this.things.forEach((x) => x.draw(turn_time));
    this.spawner.draw(turn_time);
  }
  get wall() {
    let res = this.things.filter((x) => x instanceof Walls);
    if (res.length === 0)
      throw new Error("no walls!");
    if (res.length > 1)
      throw new Error("too many walls!");
    return res[0];
  }
  get target() {
    let res = this.things.filter((x) => x instanceof Targets);
    if (res.length === 0)
      throw new Error("no Targets!");
    if (res.length > 1)
      throw new Error("too many Targets!");
    return res[0];
  }
  get spawner() {
    let res = this.things.filter((x) => x instanceof Spawner);
    if (res.length === 0)
      throw new Error("no Spawner!");
    if (res.length > 1)
      throw new Error("too many Spawner!");
    return res[0];
  }
  get players() {
    return this.things.filter((x) => x instanceof Player);
  }
  get crates() {
    return this.things.filter((x) => x instanceof Crate);
  }
  get buttons() {
    return this.things.filter((x) => x instanceof Button);
  }
  get buttonTargets() {
    return this.things.filter((x) => x instanceof ButtonTarget);
  }
  nextStates() {
    if (this.minor_turn !== 0)
      throw new Error("this method should only be called on main states");
    let result = [];
    let cur_state = this;
    for (let k = 0; k < cur_state.players.length; k++) {
      cur_state = new GameState(cur_state.major_turn, k + 1, cur_state.things.map((x) => x.clone()));
      let new_player = cur_state.players[k];
      if (new_player.index !== k) {
        console.log("cur_state.players:", cur_state.players);
        console.log("new_player.index:", new_player.index);
        console.log("this.minor_turn:", this.minor_turn);
        throw new Error("new_player index is wrong! time to use the other way");
      }
      let action = robot_tape[new_player.age];
      let direction = selectFromEnum([
        [TAPE_SYMBOL.LEFT, import_vector2.default.left],
        [TAPE_SYMBOL.RIGHT, import_vector2.default.right],
        [TAPE_SYMBOL.UP, import_vector2.default.up],
        [TAPE_SYMBOL.DOWN, import_vector2.default.down]
      ], action);
      if (direction !== null) {
        cur_state.move(new_player.pos, direction);
        new_player.dir = direction;
      }
      new_player.age += 1;
      result.push(cur_state);
    }
    if ((this.major_turn + 1) % robot_delay === 0) {
      cur_state = new GameState(cur_state.major_turn, cur_state.minor_turn + 1, cur_state.things.map((x) => x.clone()));
      let spawn_dir = cur_state.spawner.dir;
      let spawn_pos = cur_state.spawner.pos.add(spawn_dir);
      if (cur_state.move(spawn_pos, spawn_dir)) {
        cur_state.things.push(new Player(
          spawn_pos,
          spawn_dir.clone(),
          cur_state.minor_turn - 1,
          0,
          cur_state.spawner
        ));
      }
      result.push(cur_state);
    }
    for (let button_id = 0; button_id < cur_state.buttons.length; button_id++) {
      let cur_button = cur_state.buttons[button_id];
      let { value, prev_value } = cur_button.update(cur_state);
      for (const target_id of cur_button.target_ids) {
        result = result.concat(cur_state.buttonTargets[target_id].mainUpdate(cur_state, value, prev_value));
        cur_state = result.at(-1);
      }
    }
    result.push(new GameState(cur_state.major_turn + 1, 0, cur_state.things.map((x) => x.clone())));
    return result;
  }
  move(pos, dir) {
    return this.things.every((x) => x.move(this, pos, dir));
  }
  isWon() {
    let crates = this.crates;
    let target = this.target;
    return crates.every((c) => target.posAt(c.pos));
  }
};
var GameObject = class {
};
var _Walls = class extends GameObject {
  constructor(w, h) {
    super();
    this.w = w;
    this.h = h;
    this.data = makeRectArray(w, h, false);
    this.floor_data = makeRectArray(w, h, false);
    this.floor_spr_1 = new import_sprite.default(floors_texture, new import_rectangle.default(0, 0, TILE_SIZE, TILE_SIZE));
    this.floor_spr_2 = new import_sprite.default(floors_texture, new import_rectangle.default(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE));
  }
  previous = null;
  data;
  floor_data;
  floor_spr_1;
  floor_spr_2;
  static fromString(ascii) {
    let rows = ascii.trim().split("\n").map((x) => x.trim());
    let height = rows.length;
    let width = rows[0].length;
    let result = new _Walls(width, height);
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let val = rows[j][i];
        result.data[j][i] = val === "#";
      }
    }
    return result;
  }
  draw(turn_time) {
    for (let i = 0; i <= this.w; i++) {
      for (let j = 0; j <= this.h; j++) {
        let n = this.wallAt(i - 1, j - 1) + this.wallAt(i, j - 1) * 2 + this.wallAt(i - 1, j) * 4 + this.wallAt(i, j) * 8;
        if ((i + j) % 2 === 1) {
          n += 16;
        }
        if (this.floorAt(i - 1, j - 1) || this.floorAt(i, j - 1) || this.floorAt(i - 1, j) || this.floorAt(i, j)) {
          if ((i + j) % 2 === 1) {
            this.floor_spr_1.position.set((i + 0.5) * TILE_SIZE, (j + 0.5) * TILE_SIZE);
            import_shaku.default.gfx.drawSprite(this.floor_spr_1);
          } else {
            this.floor_spr_2.position.set((i + 0.5) * TILE_SIZE, (j + 0.5) * TILE_SIZE);
            import_shaku.default.gfx.drawSprite(this.floor_spr_2);
          }
        }
        geo_sprite.setSourceFromSpritesheet(new import_vector2.default(n % 4, Math.floor(n / 4)), new import_vector2.default(4, 8), 1, false);
        geo_sprite.position.set((i + 0.5) * TILE_SIZE, (j + 0.5) * TILE_SIZE);
        import_shaku.default.gfx.drawSprite(geo_sprite);
      }
    }
  }
  wallAtPos(pos) {
    if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h)
      return true;
    if (this.data[pos.y][pos.x])
      return true;
    return false;
  }
  wallAt(i, j) {
    if (i < 0 || i >= this.w || j < 0 || j >= this.h)
      return 0;
    return this.data[j][i] ? 1 : 0;
  }
  floorAt(i, j) {
    if (i < 0 || i >= this.w || j < 0 || j >= this.h)
      return false;
    return this.floor_data[j][i];
  }
  recalcFloors(pos) {
    this.floor_data = makeRectArray(this.w, this.h, false);
    let pending = [pos];
    while (pending.length > 0) {
      let cur = pending.pop();
      this.floor_data[cur.y][cur.x] = true;
      for (const dir of [import_vector2.default.up, import_vector2.default.down, import_vector2.default.right, import_vector2.default.left]) {
        let next = cur.add(dir);
        if (this.wallAtPos(next) || this.floorAt(next.x, next.y))
          continue;
        pending.push(next);
      }
    }
  }
  move(state2, pos, direction) {
    return !this.wallAtPos(pos);
  }
  clone() {
    return this;
  }
  setAt(pos, value) {
    if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h)
      return;
    this.data[pos.y][pos.x] = value;
  }
};
var Walls = _Walls;
__publicField(Walls, "n_to_x", []);
var Targets = class extends GameObject {
  constructor(positions) {
    super();
    this.positions = positions;
  }
  previous = null;
  draw(turn_time) {
    this.positions.forEach((pos) => {
      target_sprite.position.set((pos.x + 1) * TILE_SIZE, (pos.y + 1) * TILE_SIZE);
      import_shaku.default.gfx.drawSprite(target_sprite);
    });
  }
  move(state2, pos, direction) {
    return true;
  }
  clone() {
    return this;
  }
  toggleAt(pos) {
    let target_index = indexOfTrue(this.positions, (x) => x.equals(pos));
    if (target_index === -1) {
      this.positions.push(pos);
    } else {
      this.positions.splice(target_index, 1);
    }
  }
  posAt(pos) {
    return this.positions.some((p) => p.equals(pos));
  }
};
var _Button = class extends GameObject {
  constructor(pos, target_ids, active, previous) {
    super();
    this.pos = pos;
    this.target_ids = target_ids;
    this.active = active;
    this.previous = previous;
  }
  draw(turn_time) {
    button_sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
    if (turn_time !== 1 && this.previous && this.previous.active !== this.active) {
      button_sprite.color = import_color.default.lerp(_Button.ActiveColor, _Button.InactiveColor, this.active ? turn_time : 1 - turn_time);
    } else {
      button_sprite.color = this.active ? _Button.ActiveColor : _Button.InactiveColor;
    }
    import_shaku.default.gfx.drawSprite(button_sprite);
  }
  move(state2, pos, direction) {
    return true;
  }
  clone() {
    return new _Button(this.pos, this.target_ids, this.active, this);
  }
  update(state2) {
    let pressed = state2.crates.some((crate) => crate.pos.equals(this.pos)) || state2.players.some((player) => player.pos.equals(this.pos)) || state2.spawner.pos.equals(this.pos);
    let prev_active = this.active;
    this.active = pressed;
    return {
      value: this.active,
      prev_value: prev_active
    };
  }
};
var Button = _Button;
__publicField(Button, "ActiveColor", import_color.default.fromHex("#F0A863"));
__publicField(Button, "InactiveColor", import_color.default.fromHex("#4E3116"));
var ButtonTarget = class extends GameObject {
  remove(state2) {
    let this_index = state2.buttonTargets.indexOf(this);
    if (this_index === -1)
      throw new Error("removing a button target that doesn't exist");
    state2.buttons.forEach((button) => {
      button.target_ids = button.target_ids.filter((n) => n !== this_index).map((n) => {
        if (n < this_index)
          return n;
        return n - 1;
      });
    });
    state2.things = state2.things.filter((x) => x != this);
  }
};
var TwoStateWall = class extends ButtonTarget {
  constructor(pos, dir, extended, previous) {
    super();
    this.pos = pos;
    this.dir = dir;
    this.extended = extended;
    this.previous = previous;
    this.rail_sprite = new import_sprite.default(two_state_wall_texture, new import_rectangle.default(0, 0, TILE_SIZE * 2, TILE_SIZE));
    this.rail_sprite.position = pos.add(dir.mul(0.5)).add(1, 1).mul(TILE_SIZE);
    this.rail_sprite.rotation = this.dir.getRadians();
    this.wall_sprite = new import_sprite.default(two_state_wall_texture, new import_rectangle.default(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE));
    this.wall_sprite.rotation = this.dir.getRadians();
  }
  rail_sprite;
  wall_sprite;
  mainUpdate(state2, button_active, button_prev_active) {
    let new_state = new GameState(state2.major_turn, state2.minor_turn + 1, state2.things.map((x) => x.clone()));
    if (button_active) {
      if (new_state.move(this.pos.add(this.dir), this.dir)) {
        let new_this = new_state.things.find((x) => x instanceof TwoStateWall && x.pos.equals(this.pos));
        new_this.extended = true;
        return [new_state];
      }
    } else {
      if (new_state.move(this.pos, this.dir.mul(-1))) {
        let new_this = new_state.things.find((x) => x instanceof TwoStateWall && x.pos.equals(this.pos));
        new_this.extended = false;
        return [new_state];
      }
    }
    return [];
  }
  draw(turn_time) {
    import_shaku.default.gfx.drawSprite(this.rail_sprite);
    let pos = this.extended ? this.pos.add(this.dir) : this.pos;
    if (this.previous && this.previous.extended != this.extended) {
      pos = import_vector2.default.lerp(this.previous.extended ? this.pos.add(this.dir) : this.pos, pos, turn_time);
    }
    this.wall_sprite.position.copy(pos.add(1, 1).mul(TILE_SIZE));
    import_shaku.default.gfx.drawSprite(this.wall_sprite);
  }
  move(state2, pos, direction) {
    if (this.extended) {
      return !pos.equals(this.pos.add(this.dir));
    } else {
      return !pos.equals(this.pos);
    }
  }
  clone() {
    return new TwoStateWall(this.pos.clone(), this.dir.clone(), this.extended, this);
  }
};
var Pushable = class extends GameObject {
  constructor(pos, previous) {
    super();
    this.pos = pos;
    this.previous = previous;
  }
  draw(turn_time) {
    if (turn_time !== 1 && this.previous) {
      this.sprite.position.copy(import_vector2.default.lerp(this.previous.pos, this.pos, turn_time).add(1, 1).mul(TILE_SIZE));
    } else {
      this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
    }
    import_shaku.default.gfx.drawSprite(this.sprite);
  }
  move(state2, pos, dir) {
    if (!pos.equals(this.pos))
      return true;
    let new_pos = pos.add(dir);
    if (state2.move(new_pos, dir)) {
      this.pos.copy(new_pos);
      return true;
    }
    return false;
  }
};
var Spawner = class extends Pushable {
  constructor(pos, dir, previous) {
    super(pos, previous);
    this.pos = pos;
    this.dir = dir;
    this.previous = previous;
    this.sprite.rotation = this.dir.getRadians();
  }
  sprite = spawner_sprite;
  clone() {
    return new Spawner(this.pos.clone(), this.dir.clone(), this);
  }
};
var Crate = class extends Pushable {
  sprite = crate_sprite;
  clone() {
    return new Crate(this.pos.clone(), this);
  }
};
var _Player = class extends Pushable {
  constructor(pos, dir, index, age = 0, previous) {
    super(pos, previous);
    this.pos = pos;
    this.dir = dir;
    this.index = index;
    this.age = age;
    this.previous = previous;
  }
  sprite = player_sprite;
  draw(turn_time) {
    this.sprite.rotation = this.dir.getRadians() + Math.PI / 2;
    this.sprite.color = this.index === 0 ? _Player._brightColor : import_shaku.default.utils.Color.white;
    if (turn_time !== 1 && this.previous) {
      this.sprite.position.copy(import_vector2.default.lerp(this.previous.pos, this.pos, turn_time).add(1, 1).mul(TILE_SIZE));
      if (this.previous.age !== this.age && this.previous.pos.equals(this.pos)) {
        this.sprite.position.copy(this.pos.add(this.dir.mul(turn_time - turn_time * turn_time)).add(1, 1).mul(TILE_SIZE));
      }
    } else {
      this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
    }
    import_shaku.default.gfx.drawSprite(this.sprite);
  }
  clone() {
    return new _Player(this.pos.clone(), this.dir.clone(), this.index, this.age, this);
  }
};
var Player = _Player;
__publicField(Player, "_brightColor", new import_color.default(1.3, 1.3, 1.3, 1));
var level_editor = new Level("editor", 30, 5, new GameState(
  -1,
  0,
  [
    Walls.fromString(`
#...###########.
....#.........#.
....#.........#.
.####.........#.
.#............#.
.#............#.
.#............#.
.#............#.
.##############.
        `),
    new Targets([
      new import_vector2.default(6, 2)
    ]),
    new Button(new import_vector2.default(8, 4), [0], false, null),
    new TwoStateWall(new import_vector2.default(7, 3), import_vector2.default.up, false, null),
    new Spawner(new import_vector2.default(6, 6), import_vector2.default.right, null),
    new Crate(new import_vector2.default(5, 3), null),
    new Crate(new import_vector2.default(10, 2), null)
  ]
));
var levels = [
  new Level("first", 12, 4, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                #######
                #.....#
                #.###.#
                #.#...#
                #.#####
                #.....#
                #######
            `),
      new Targets([
        new import_vector2.default(5, 5)
      ]),
      new Spawner(new import_vector2.default(3, 3), import_vector2.default.right, null),
      new Crate(new import_vector2.default(2, 5), null)
    ]
  )),
  new Level("wait_tut", 11, 5, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ...###.....
                ####.######
                #.........#
                ######.####
                .....###...
            `),
      new Targets([
        new import_vector2.default(9, 2)
      ]),
      new Button(new import_vector2.default(4, 1), [0], false, null),
      new TwoStateWall(new import_vector2.default(6, 2), import_vector2.default.down, false, null),
      new Spawner(new import_vector2.default(1, 2), import_vector2.default.right, null),
      new Crate(new import_vector2.default(8, 2), null)
    ]
  )),
  new Level("basic", 10, 5, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ..###..
                ###.###
                #.....#
                #.#...#
                #.#..##
                ######.
            `),
      new Targets([
        new import_vector2.default(3, 4)
      ]),
      new Spawner(new import_vector2.default(1, 4), import_vector2.default.up, null),
      new Crate(new import_vector2.default(4, 2), null)
    ]
  )),
  new Level("move_spawner", 6, 4, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                .#########.
                .#.......#.
                ##.......##
                #.........#
                #.........#
                #.........#
                ###########
            `),
      new Targets([
        new import_vector2.default(2, 1),
        new import_vector2.default(3, 1),
        new import_vector2.default(4, 1),
        new import_vector2.default(5, 1),
        new import_vector2.default(6, 1),
        new import_vector2.default(7, 1),
        new import_vector2.default(8, 1)
      ]),
      new Spawner(new import_vector2.default(2, 5), import_vector2.default.up, null),
      new Crate(new import_vector2.default(2, 2), null),
      new Crate(new import_vector2.default(3, 2), null),
      new Crate(new import_vector2.default(4, 2), null),
      new Crate(new import_vector2.default(5, 2), null),
      new Crate(new import_vector2.default(6, 2), null),
      new Crate(new import_vector2.default(7, 2), null),
      new Crate(new import_vector2.default(8, 2), null)
    ]
  )),
  new Level("filler", 11, 2, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ###########
                #.........#
                #.........#
                #.........#
                #.........#
                #........##
                ##########.
            `),
      new Targets([
        new import_vector2.default(3, 1),
        new import_vector2.default(4, 1),
        new import_vector2.default(5, 1),
        new import_vector2.default(6, 1),
        new import_vector2.default(7, 1),
        new import_vector2.default(8, 1)
      ]),
      new Spawner(new import_vector2.default(1, 1), import_vector2.default.down, null),
      new Crate(new import_vector2.default(3, 4), null),
      new Crate(new import_vector2.default(4, 4), null),
      new Crate(new import_vector2.default(5, 4), null),
      new Crate(new import_vector2.default(6, 4), null),
      new Crate(new import_vector2.default(7, 4), null),
      new Crate(new import_vector2.default(8, 4), null)
    ]
  )),
  new Level("microban", 8, 5, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ####..
                #..#..
                #..###
                #....#
                #....#
                #..###
                ####..
            `),
      new Targets([
        new import_vector2.default(2, 1)
      ]),
      new Spawner(new import_vector2.default(1, 3), import_vector2.default.right, null),
      new Crate(new import_vector2.default(3, 4), null)
    ]
  )),
  new Level("gaps", 8, 3, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ...##########.
                ...#........#.
                ####........#.
                #...........#.
                #...........##
                #............#
                ##############
            `),
      new Targets([
        new import_vector2.default(4, 1),
        new import_vector2.default(5, 1),
        new import_vector2.default(6, 2),
        new import_vector2.default(7, 1),
        new import_vector2.default(8, 1),
        new import_vector2.default(9, 2),
        new import_vector2.default(10, 1),
        new import_vector2.default(11, 1)
      ]),
      new Spawner(new import_vector2.default(2, 5), import_vector2.default.up, null),
      new Crate(new import_vector2.default(4, 2), null),
      new Crate(new import_vector2.default(5, 2), null),
      new Crate(new import_vector2.default(6, 2), null),
      new Crate(new import_vector2.default(7, 2), null),
      new Crate(new import_vector2.default(8, 2), null),
      new Crate(new import_vector2.default(9, 2), null),
      new Crate(new import_vector2.default(10, 2), null),
      new Crate(new import_vector2.default(11, 2), null)
    ]
  )),
  new Level("u_chain", 16, 2, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ###########
                #.........#
                #.........#
                #.........#
                #.........#
                #........##
                ##########.
            `),
      new Targets([
        new import_vector2.default(3, 2),
        new import_vector2.default(4, 2),
        new import_vector2.default(5, 2),
        new import_vector2.default(6, 2),
        new import_vector2.default(7, 2),
        new import_vector2.default(8, 2)
      ]),
      new Spawner(new import_vector2.default(1, 1), import_vector2.default.down, null),
      new Crate(new import_vector2.default(3, 4), null),
      new Crate(new import_vector2.default(4, 4), null),
      new Crate(new import_vector2.default(5, 4), null),
      new Crate(new import_vector2.default(6, 4), null),
      new Crate(new import_vector2.default(7, 4), null),
      new Crate(new import_vector2.default(8, 4), null)
    ]
  )),
  new Level("bistable", 8, 3, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ..#########.
                ..#.......#.
                ###.#######.
                #....#......
                ####.#######
                ...#.......#
                ...#########
            `),
      new Targets([
        new import_vector2.default(9, 1),
        new import_vector2.default(10, 5)
      ]),
      new Spawner(new import_vector2.default(1, 3), import_vector2.default.right, null),
      new Crate(new import_vector2.default(5, 1), null),
      new Crate(new import_vector2.default(6, 5), null)
    ]
  )),
  new Level("twice", 19, 7, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ..###..
                ###.###
                #.....#
                #.#...#
                #....##
                ######.
            `),
      new Targets([
        new import_vector2.default(4, 4)
      ]),
      new Spawner(new import_vector2.default(1, 4), import_vector2.default.up, null),
      new Crate(new import_vector2.default(4, 2), null)
    ]
  )),
  new Level("basic_reversed", 17, 3, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                #######..
                #...#.###
                #...#...#
                #.......#
                #.#######
                ###......
            `),
      new Targets([
        new import_vector2.default(6, 3)
      ]),
      new Spawner(new import_vector2.default(1, 2), import_vector2.default.right, null),
      new Crate(new import_vector2.default(6, 2), null)
    ]
  )),
  new Level("sandbox", 30, 1, new GameState(
    -1,
    0,
    [
      Walls.fromString(`
                ###########
                #.........#
                #.........#
                #.........#
                #.........#
                #.........#
                ###########
            `),
      new Targets([]),
      new Spawner(new import_vector2.default(4, 3), import_vector2.default.right, null),
      new Crate(new import_vector2.default(3, 2), null),
      new Crate(new import_vector2.default(5, 4), null)
    ]
  ))
];
var state = 0 /* GAME */;
var TAPE_SYMBOL = /* @__PURE__ */ ((TAPE_SYMBOL2) => {
  TAPE_SYMBOL2[TAPE_SYMBOL2["LEFT"] = 0] = "LEFT";
  TAPE_SYMBOL2[TAPE_SYMBOL2["RIGHT"] = 1] = "RIGHT";
  TAPE_SYMBOL2[TAPE_SYMBOL2["UP"] = 2] = "UP";
  TAPE_SYMBOL2[TAPE_SYMBOL2["DOWN"] = 3] = "DOWN";
  TAPE_SYMBOL2[TAPE_SYMBOL2["NONE"] = 4] = "NONE";
  return TAPE_SYMBOL2;
})(TAPE_SYMBOL || {});
var miniturn_duration = 0.05;
var robot_delay = 5;
var robot_tape = [];
var selected_turn = 0;
var cur_turn = 0;
var time_offset = 0;
var initial_state;
var all_states;
var level_offset = import_vector2.default.zero;
var row_1 = 0;
var row_2 = 0;
var game_size = new import_vector2.default(800, 450);
var row_1_background = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
row_1_background.origin = import_vector2.default.zero;
row_1_background.color = COLOR_TAPE;
var row_2_background = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
row_2_background.origin = import_vector2.default.zero;
row_2_background.color = COLOR_TAPE;
var cur_level_n = 0;
load_level(levels[cur_level_n]);
function load_level(level) {
  robot_tape = Array(level.n_moves).fill(4 /* NONE */);
  robot_delay = level.n_delay;
  initial_state = level.initial_state.nextStates().at(-1);
  all_states = gameLogic(initial_state, robot_tape);
  if (level.n_moves < 13) {
    row_1 = level.n_moves;
    row_2 = 0;
  } else {
    row_1 = Math.ceil(level.n_moves / 2);
    row_2 = level.n_moves - row_1;
  }
  row_1_background.position.set(-SYMBOL_SIZE * 0.5 + 8, 8);
  row_1_background.size.set(SYMBOL_SIZE * (row_1 + 1) - 16, SYMBOL_SIZE * 1.5 - 16);
  if (row_2 > 0) {
    row_2_background.position.set(-SYMBOL_SIZE * 0.5 + 8, 8);
    row_2_background.size.set(SYMBOL_SIZE * (row_2 + 1) - 16, SYMBOL_SIZE * 1.5 - 16);
  }
  selected_turn = 0;
  cur_turn = 0;
  time_offset = 0;
  level_offset = new import_vector2.default(initial_state.wall.w, initial_state.wall.h).mul(TILE_SIZE).sub(game_size).add(TILE_SIZE, TILE_SIZE).mul(0.5);
}
function gameLogic(initial_state2, robot_tape2) {
  let res_all_states = [initial_state2];
  let cur_state = initial_state2;
  for (let k = 0; k <= selected_turn; k++) {
    while (true) {
      let new_states = cur_state.nextStates();
      res_all_states = res_all_states.concat(new_states);
      cur_state = new_states.at(-1);
      if (cur_state.major_turn !== k)
        break;
    }
  }
  if (cur_turn + 1 > res_all_states.length) {
    cur_turn = 0;
  }
  return res_all_states;
}
function drawSymbol(symbol, pos) {
  switch (symbol) {
    case 0 /* LEFT */:
      left_arrow.rotation = 0;
      left_arrow.position.copy(pos);
      import_shaku.default.gfx?.drawSprite(left_arrow);
      break;
    case 2 /* UP */:
      left_arrow.rotation = Math.PI * 0.5;
      left_arrow.position.copy(pos);
      import_shaku.default.gfx?.drawSprite(left_arrow);
      break;
    case 1 /* RIGHT */:
      left_arrow.rotation = Math.PI;
      left_arrow.position.copy(pos);
      import_shaku.default.gfx?.drawSprite(left_arrow);
      break;
    case 3 /* DOWN */:
      left_arrow.rotation = Math.PI * 1.5;
      left_arrow.position.copy(pos);
      import_shaku.default.gfx?.drawSprite(left_arrow);
      break;
    case 4 /* NONE */:
      none_sprite.position.copy(pos);
      import_shaku.default.gfx?.drawSprite(none_sprite);
      break;
    default:
      break;
  }
}
var MAIN_SCREEN_SPRITE = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
MAIN_SCREEN_SPRITE.origin = import_vector2.default.zero;
MAIN_SCREEN_SPRITE.size = game_size;
var background_effect = import_shaku.default.gfx.createEffect(BackgroundEffect);
import_shaku.default.gfx.useEffect(background_effect);
background_effect.uniforms["u_aspect_ratio"](MAIN_SCREEN_SPRITE.size.x / MAIN_SCREEN_SPRITE.size.y);
import_shaku.default.gfx.useEffect(null);
var LOWER_SCREEN_SPRITE = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
LOWER_SCREEN_SPRITE.origin = import_vector2.default.zero;
LOWER_SCREEN_SPRITE.size.set(800, 600 - game_size.y);
LOWER_SCREEN_SPRITE.position.set(0, game_size.y);
LOWER_SCREEN_SPRITE.color = import_color.default.fromHex("#2B849C");
var FULL_SCREEN_SPRITE = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
FULL_SCREEN_SPRITE.origin = import_vector2.default.zero;
FULL_SCREEN_SPRITE.size = import_shaku.default.gfx.getCanvasSize();
var changing_rects = [];
function setSymbolChanging(n) {
  const rect_spr = new import_sprite.default(import_shaku.default.gfx.whiteTexture);
  rect_spr.origin = new import_vector2.default(0, -8 / (SYMBOL_SIZE * 1.5));
  rect_spr.size.set(SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16);
  if (n < row_1) {
    rect_spr.position.set(n * SYMBOL_SIZE, 0);
  } else {
    rect_spr.position.set((n - row_1) * SYMBOL_SIZE, 0);
  }
  rect_spr.color = COLOR_SYMBOL;
  changing_rects.push([rect_spr, 0.15, n < row_1]);
}
function drawSymbolsChanging(dt, lower_row) {
  for (var i = changing_rects.length - 1; i >= 0; i--) {
    let [r, t, b] = changing_rects[i];
    if (b === lower_row)
      continue;
    import_shaku.default.gfx.drawSprite(r);
    t -= dt;
    if (t <= 0) {
      changing_rects.splice(i, 1);
    } else {
      changing_rects[i][1] = t;
    }
  }
}
var changing_level = false;
var EDITOR = false;
var menu_selected_level = 0;
var drawExtra = function() {
  let intro_text_left_1 = import_shaku.default.gfx.buildText(instructions_font, "WASD to\nmove", 32, import_color.default.white, import_text_alignments.TextAlignments.Center);
  intro_text_left_1.position.set(110, 90);
  let intro_text_right_1 = import_shaku.default.gfx.buildText(instructions_font, "Arrow keys\nto move", 32, import_color.default.white, import_text_alignments.TextAlignments.Center);
  intro_text_right_1.position.set(690, 90);
  let intro_text_left_3 = import_shaku.default.gfx.buildText(instructions_font, "Q/E to\nchange turn", 32, import_color.default.white, import_text_alignments.TextAlignments.Center);
  intro_text_left_3.position.set(110, 290);
  let intro_text_right_3 = import_shaku.default.gfx.buildText(instructions_font, "Z/X to\nchange turn", 32, import_color.default.white, import_text_alignments.TextAlignments.Center);
  intro_text_right_3.position.set(690, 290);
  let use_space_text = import_shaku.default.gfx.buildText(instructions_font, "Space to wait", 32, import_color.default.white, import_text_alignments.TextAlignments.Center);
  use_space_text.position.set(535, 110);
  return function() {
    if (EDITOR)
      return;
    if (cur_level_n === 0) {
      import_shaku.default.gfx.useEffect(import_shaku.default.gfx.builtinEffects.MsdfFont);
      import_shaku.default.gfx.drawGroup(intro_text_left_1, false);
      import_shaku.default.gfx.drawGroup(intro_text_right_1, false);
      import_shaku.default.gfx.drawGroup(intro_text_left_3, false);
      import_shaku.default.gfx.drawGroup(intro_text_right_3, false);
      import_shaku.default.gfx.useEffect(null);
    } else if (cur_level_n === 1) {
      import_shaku.default.gfx.useEffect(import_shaku.default.gfx.builtinEffects.MsdfFont);
      import_shaku.default.gfx.drawGroup(use_space_text, false);
      import_shaku.default.gfx.useEffect(null);
    }
  };
}();
var generateText = (0, import_lodash.default)((text, size = 32, color = import_color.default.white) => {
  return import_shaku.default.gfx.buildText(instructions_font, text, size, color, import_text_alignments.TextAlignments.Center);
});
var editor_button_looking_for_target = -1;
function update() {
  import_shaku.default.startFrame();
  import_shaku.default.gfx.clear(import_shaku.default.utils.Color.darkslategray);
  import_shaku.default.gfx.useEffect(background_effect);
  background_effect.uniforms["u_time"](import_shaku.default.gameTime.elapsed);
  import_shaku.default.gfx.drawSprite(MAIN_SCREEN_SPRITE);
  import_shaku.default.gfx.useEffect(null);
  import_shaku.default.gfx.drawSprite(LOWER_SCREEN_SPRITE);
  switch (state) {
    case 0 /* GAME */:
      if (time_offset === 0 && !changing_level && import_shaku.default.input.pressed("escape")) {
        menu_selected_level = cur_level_n;
        state = 1 /* MENU */;
      }
      break;
    case 1 /* MENU */:
      if (import_shaku.default.input.pressed("escape")) {
        state = 0 /* GAME */;
      } else if (import_shaku.default.input.pressed(["enter", "space"])) {
        initTransitionToLevel(menu_selected_level);
      }
      break;
    default:
      break;
  }
  if (state === 0 /* GAME */) {
    if (pressed_throttled(["q", "z"], import_shaku.default.gameTime.delta) && selected_turn > 0) {
      selected_turn -= 1;
    } else if (pressed_throttled(["e", "x"], import_shaku.default.gameTime.delta)) {
      selected_turn += 1;
      if (selected_turn >= all_states.at(-1).major_turn) {
        all_states = gameLogic(initial_state, robot_tape);
      }
    }
    if (!changing_level && import_shaku.default.input?.pressed(["r"])) {
      selected_turn = 0;
    }
    if ((all_states[cur_turn].major_turn !== selected_turn || all_states[cur_turn].minor_turn !== 0) && time_offset === 0) {
      let dir = Math.sign(selected_turn - all_states[cur_turn].major_turn - 0.5);
      cur_turn += dir;
      time_offset -= dir * 0.99;
    }
    if (import_shaku.default.input?.pressed(["t"])) {
      console.log("cur_turn: ", cur_turn);
      console.log("selected_turn: ", selected_turn);
      console.log("cur_state: ", all_states[cur_turn]);
      console.log("all states: ", all_states);
    }
    let input_symbol = selectFromInput([
      [["w", "up"], 2 /* UP */],
      [["s", "down"], 3 /* DOWN */],
      [["d", "right"], 1 /* RIGHT */],
      [["a", "left"], 0 /* LEFT */],
      ["space", 4 /* NONE */]
    ], import_shaku.default.gameTime.delta);
    if (input_symbol !== null) {
      if (selected_turn < robot_tape.length) {
        robot_tape[selected_turn] = input_symbol;
        setSymbolChanging(selected_turn);
        selected_turn += 1;
        all_states = gameLogic(initial_state, robot_tape);
      } else {
        let time_left = 0.1;
        row_1_background.color = COLOR_SYMBOL;
        row_2_background.color = COLOR_SYMBOL;
        doEveryFrameUntilTrue(() => {
          import_shaku.default.gfx.setCameraOrthographic(new import_vector2.default(-400 + 0.5 * row_1 * SYMBOL_SIZE, -450));
          import_shaku.default.gfx.drawSprite(row_1_background);
          if (row_2 > 0) {
            import_shaku.default.gfx.setCameraOrthographic(new import_vector2.default(-400 + 0.5 * row_2 * SYMBOL_SIZE, -525));
            import_shaku.default.gfx.drawSprite(row_2_background);
          }
          import_shaku.default.gfx.resetCamera();
          time_left -= import_shaku.default.gameTime.delta;
          if (time_left < 0) {
            row_1_background.color = COLOR_TAPE;
            row_2_background.color = COLOR_TAPE;
            return true;
          }
          return false;
        });
      }
    }
  }
  import_shaku.default.gfx.setCameraOrthographic(level_offset);
  if (time_offset < 0) {
    all_states[cur_turn].draw(time_offset + 1);
  } else if (time_offset > 0) {
    all_states[cur_turn + 1].draw(time_offset);
  } else {
    all_states[cur_turn].draw(1);
  }
  if (state === 0 /* GAME */ && EDITOR) {
    let mouse_tile = import_shaku.default.input.mousePosition.add(level_offset).div(TILE_SIZE).round().sub(1, 1);
    import_shaku.default.gfx.outlineRect(
      new import_rectangle.default(
        (mouse_tile.x + 0.5) * TILE_SIZE,
        (mouse_tile.y + 0.5) * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      ),
      import_shaku.default.utils.Color.white
    );
    if (import_shaku.default.input?.mouseDown(import_key_codes.MouseButtons.left)) {
      initial_state.wall.setAt(mouse_tile, true);
      initial_state.wall.recalcFloors(initial_state.spawner.pos);
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input?.mouseDown(import_key_codes.MouseButtons.right)) {
      initial_state.wall.setAt(mouse_tile, false);
      initial_state.wall.recalcFloors(initial_state.spawner.pos);
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input?.mouseWheelSign !== 0) {
      robot_delay += import_shaku.default.input?.mouseWheelSign;
      robot_delay = Math.max(1, robot_delay);
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input.keyPressed(import_key_codes.KeyboardKeys.n1)) {
      let crate_index = indexOfTrue(initial_state.things, (c) => c instanceof Crate && c.pos.equals(mouse_tile));
      if (crate_index === -1) {
        initial_state.things.push(new Crate(mouse_tile, null));
      } else {
        initial_state.things.splice(crate_index, 1);
      }
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input.keyPressed(import_key_codes.KeyboardKeys.n2)) {
      initial_state.target.toggleAt(mouse_tile);
    }
    if (import_shaku.default.input.keyPressed(import_key_codes.KeyboardKeys.n3)) {
      initial_state.spawner.pos = mouse_tile;
      initial_state.spawner.dir = mainDir(import_shaku.default.input.mousePosition.add(level_offset).div(TILE_SIZE).sub(1, 1).sub(mouse_tile));
      initial_state.spawner.sprite.rotation = initial_state.spawner.dir.getRadians();
      initial_state.players[0].pos = initial_state.spawner.pos.add(initial_state.spawner.dir);
      initial_state.players[0].dir = initial_state.spawner.dir.clone();
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input.keyPressed(import_key_codes.KeyboardKeys.n4)) {
      let two_state_wall_index = indexOfTrue(initial_state.things, (x) => x instanceof TwoStateWall && x.pos.equals(mouse_tile));
      if (two_state_wall_index === -1) {
        initial_state.things.push(new TwoStateWall(
          mouse_tile,
          mainDir(import_shaku.default.input.mousePosition.add(level_offset).div(TILE_SIZE).sub(1, 1).sub(mouse_tile)),
          false,
          null
        ));
      } else {
        console.log(two_state_wall_index);
        initial_state.things[two_state_wall_index].remove(initial_state);
        console.log(initial_state);
      }
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input.keyPressed(import_key_codes.KeyboardKeys.n5)) {
      let button_index = indexOfTrue(initial_state.things, (b) => b instanceof Button && b.pos.equals(mouse_tile));
      if (button_index === -1) {
        initial_state.things.push(new Button(mouse_tile, [], false, null));
      } else {
        initial_state.things.splice(button_index, 1);
      }
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (import_shaku.default.input.keyPressed(import_key_codes.KeyboardKeys.n6)) {
      if (editor_button_looking_for_target === -1) {
        editor_button_looking_for_target = indexOfTrue(initial_state.things, (b) => b instanceof Button && b.pos.equals(mouse_tile));
      } else {
        let button_target_index = initial_state.buttonTargets.findIndex((x) => x instanceof TwoStateWall && x.pos.equals(mouse_tile));
        if (button_target_index !== -1) {
          let button = initial_state.things[editor_button_looking_for_target];
          if (button.target_ids.includes(button_target_index)) {
            button.target_ids = button.target_ids.filter((x) => x != button_target_index);
          } else {
            button.target_ids.push(button_target_index);
          }
        }
        editor_button_looking_for_target = -1;
      }
      all_states = gameLogic(initial_state, robot_tape);
    }
    if (editor_button_looking_for_target !== -1) {
      let button = initial_state.things[editor_button_looking_for_target];
      import_shaku.default.gfx.fillRect(
        new import_rectangle.default(
          (button.pos.x + 0.5) * TILE_SIZE,
          (button.pos.y + 0.5) * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        ),
        button.active ? import_shaku.default.utils.Color.red : import_shaku.default.utils.Color.green
      );
    }
  }
  import_shaku.default.gfx.setCameraOrthographic(new import_vector2.default(-400 + 0.5 * row_1 * SYMBOL_SIZE, -450));
  import_shaku.default.gfx.drawSprite(row_1_background);
  for (let k = selected_turn; k >= 0; k -= robot_delay) {
    if (k >= row_1)
      continue;
    if (k === selected_turn) {
      if (changing_rects.length === 0) {
        tape_high.position.set(k * SYMBOL_SIZE, 0);
        import_shaku.default.gfx.drawSprite(tape_high);
      }
    } else {
      tape_low.position.set(k * SYMBOL_SIZE, 0);
      import_shaku.default.gfx.drawSprite(tape_low);
    }
  }
  drawSymbolsChanging(import_shaku.default.gameTime.delta, false);
  import_shaku.default.gfx.drawSprite(tape_border_left);
  tape_border_right.position.set(row_1 * SYMBOL_SIZE, 0);
  import_shaku.default.gfx.drawSprite(tape_border_right);
  for (let k = 0; k < row_1; k++) {
    tape_border.position.set(k * SYMBOL_SIZE, 0);
    import_shaku.default.gfx.drawSprite(tape_border);
    let cur_symbol = robot_tape[k];
    drawSymbol(cur_symbol, new import_vector2.default((k + 0.5) * SYMBOL_SIZE, SYMBOL_SIZE * 0.75));
  }
  if (row_2 > 0) {
    import_shaku.default.gfx.setCameraOrthographic(new import_vector2.default(-400 + 0.5 * row_2 * SYMBOL_SIZE, -525));
    import_shaku.default.gfx?.fillRect(
      new import_rectangle.default(-SYMBOL_SIZE * 0.5 + 8, 8, SYMBOL_SIZE * (row_2 + 1) - 16, SYMBOL_SIZE * 1.5 - 16),
      COLOR_TAPE
    );
    for (let k = selected_turn; k >= row_1; k -= robot_delay) {
      if (k >= row_1 + row_2)
        continue;
      if (k === selected_turn) {
        if (changing_rects.length === 0) {
          tape_high.position.set((k - row_1) * SYMBOL_SIZE, 0);
          import_shaku.default.gfx.drawSprite(tape_high);
        }
      } else {
        tape_low.position.set((k - row_1) * SYMBOL_SIZE, 0);
        import_shaku.default.gfx.drawSprite(tape_low);
      }
    }
    drawSymbolsChanging(import_shaku.default.gameTime.delta, true);
    import_shaku.default.gfx.drawSprite(tape_border_left);
    tape_border_right.position.set(row_2 * SYMBOL_SIZE, 0);
    import_shaku.default.gfx.drawSprite(tape_border_right);
    for (let k = 0; k < row_2; k++) {
      tape_border.position.set(k * SYMBOL_SIZE, 0);
      import_shaku.default.gfx.drawSprite(tape_border);
      let cur_symbol = robot_tape[k + row_1];
      drawSymbol(cur_symbol, new import_vector2.default((k + 0.5) * SYMBOL_SIZE, SYMBOL_SIZE * 0.75));
    }
  }
  import_shaku.default.gfx.resetCamera();
  if (state === 0 /* GAME */) {
    time_offset = moveTowards(time_offset, 0, import_shaku.default.gameTime.delta * (Math.abs(all_states[cur_turn].major_turn - selected_turn) + 1) / miniturn_duration);
    if (!changing_level && !EDITOR && import_shaku.default.input.pressed("dash")) {
      EDITOR = true;
    }
    if (!changing_level && EDITOR && import_shaku.default.input.pressed("period")) {
      load_level(level_editor);
    }
    if (!EDITOR && !changing_level && time_offset === 0 && all_states[cur_turn].isWon()) {
      if (cur_level_n < levels.length - 1) {
        initTransitionToLevel(cur_level_n + 1);
      }
    }
  }
  drawExtra();
  if (state === 1 /* MENU */) {
    FULL_SCREEN_SPRITE.color = new import_color.default(0, 0, 0, 0.7);
    import_shaku.default.gfx.drawSprite(FULL_SCREEN_SPRITE);
    let menu_row_size = 6;
    let delta_level = selectFromInput([
      [["w", "up"], -menu_row_size],
      [["s", "down"], menu_row_size],
      [["d", "right"], 1],
      [["a", "left"], -1]
    ], import_shaku.default.gameTime.delta);
    if (delta_level !== null) {
      let new_menu_selected_level = menu_selected_level + delta_level;
      if (new_menu_selected_level >= 0 && new_menu_selected_level < levels.length) {
        menu_selected_level = new_menu_selected_level;
      }
    }
    let menu_button_spacing = 100;
    let menu_button_size = 75;
    for (let k = 0; k < levels.length; k++) {
      import_shaku.default.gfx.fillRect(
        new import_rectangle.default(
          k % menu_row_size * menu_button_spacing + menu_button_spacing / 3,
          Math.floor(k / menu_row_size) * menu_button_spacing + menu_button_spacing / 3,
          menu_button_size,
          menu_button_size
        ),
        k === menu_selected_level ? import_color.default.cyan : import_color.default.darkcyan
      );
    }
    import_shaku.default.gfx.useEffect(import_shaku.default.gfx.builtinEffects.MsdfFont);
    for (let k = 0; k < levels.length; k++) {
      let text_spr = generateText((k + 1).toString(), 42);
      text_spr.position.set(
        k % menu_row_size * menu_button_spacing + menu_button_spacing / 3 + menu_button_size / 2,
        Math.floor(k / menu_row_size) * menu_button_spacing + menu_button_spacing / 3 + menu_button_size / 5
      );
      import_shaku.default.gfx.drawGroup(text_spr, false);
    }
    import_shaku.default.gfx.useEffect(null);
  }
  kalbakUpdate();
  import_shaku.default.endFrame();
  import_shaku.default.requestAnimationFrame(update);
}
function initTransitionToLevel(n) {
  let changing_level_time = -1;
  changing_level = true;
  doEveryFrameUntilTrue(() => {
    FULL_SCREEN_SPRITE.color = new import_color.default(0, 0, 0, 1 - Math.abs(changing_level_time));
    import_shaku.default.gfx.drawSprite(FULL_SCREEN_SPRITE);
    let prev = changing_level_time;
    changing_level_time = moveTowards(prev, 1, import_shaku.default.gameTime.delta * 3);
    if (prev < 0 && changing_level_time >= 0) {
      state = 0 /* GAME */;
      changing_level = false;
      cur_level_n = n;
      load_level(levels[n]);
    }
    return changing_level_time >= 1;
  });
}
var _cooling_time_left = {};
var _press_count = {};
function pressed_throttled(code, dt) {
  if (changing_level)
    return false;
  let key = Array.isArray(code) ? code.join("") : code;
  if (!(key in _cooling_time_left)) {
    _cooling_time_left[key] = 0;
    _press_count[key] = 0;
  }
  _cooling_time_left[key] = Math.max(0, _cooling_time_left[key] - dt);
  if (!import_shaku.default.input.down(code)) {
    _press_count[key] = 0;
    _cooling_time_left[key] = 0;
    return false;
  } else if (_cooling_time_left[key] == 0) {
    _press_count[key] += 1;
    _cooling_time_left[key] = _press_count[key] == 1 ? 0.22 : 0.08;
    return true;
  }
  return false;
}
function moveTowards(cur_val, target_val, max_delta) {
  if (target_val > cur_val) {
    return Math.min(cur_val + max_delta, target_val);
  } else if (target_val < cur_val) {
    return Math.max(cur_val - max_delta, target_val);
  } else {
    return target_val;
  }
}
function makeRectArray(width, height, fill) {
  let result = [];
  for (let j = 0; j < height; j++) {
    let cur_row = [];
    for (let i = 0; i < width; i++) {
      cur_row.push(fill);
    }
    result.push(cur_row);
  }
  return result;
}
function selectFromEnum(options, value) {
  for (const [option, result] of options) {
    if (option === value) {
      return result;
    }
  }
  return null;
}
function selectFromInput(options, dt) {
  for (const [key, result] of options) {
    if (pressed_throttled(key, dt)) {
      return result;
    }
  }
  return null;
}
function indexOfTrue(array, fn) {
  for (let k = 0; k < array.length; k++) {
    if (fn(array[k])) {
      return k;
    }
  }
  return -1;
}
function mainDir(dir) {
  if (Math.abs(dir.x) > Math.abs(dir.y)) {
    return dir.x >= 0 ? import_vector2.default.right : import_vector2.default.left;
  } else {
    return dir.y >= 0 ? import_vector2.default.down : import_vector2.default.up;
  }
}
update();
/**
 * A utility to hold gametime.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\game_time.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * All default collision detection implementations.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\resolvers_imp.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * An object to store collision detection result.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\result.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Assets base class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Camera class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\camera.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define a color object.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\color.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define a mesh object.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\mesh.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define a sprite object.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\sprite.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define a sprites group.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\sprites_group.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define keyboard and mouse key codes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\input\key_codes.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define possible text alignments.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\text_alignment.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define possible texture filter modes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\texture_filter_modes.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define possible texture wrap modes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\texture_wrap_modes.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define supported blend modes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\blend_modes.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define the managers interface.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\manager.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Define utility to generate meshes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\mesh_generator.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Effect base class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\effects\effect.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a 3d vector.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\vector3.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a MSDF font texture asset type.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\msdf_font_texture_asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a basic effect to draw sprites.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\effects\basic.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a font texture asset type.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\font_texture_asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a math utilities class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\math_helper.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a seeded random generator.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\seeded_random.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a simple 2d circle.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\circle.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a simple 2d line.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\line.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a simple 2d rectangle.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\rectangle.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a simple 2d vector.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\vector2.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a sound effect instance.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\sfx\sound_instance.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a sound mixer class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\sfx\sound_mixer.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a storage adapter.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\storage_adapter.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement a storage wrapper.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\storage.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement an animator helper class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\animator.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement an effect to draw MSDF font textures.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\effects\msdf_font.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement basic logger.
 * By default, uses console for logging, but it can be replaced with setDrivers().
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\logger.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement binary data asset type.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\binary_asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement collision circle.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\shapes\circle.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement collision lines.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\shapes\lines.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement collision point.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\shapes\point.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement collision rectangle.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\shapes\rectangle.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement collision shape base class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\shapes\shape.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement collision tilemap.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\shapes\tilemap.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement json asset type.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\json_asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement sound asset type.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\sound_asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement texture asset type.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\texture_asset.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the assets manager.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\assets.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the collision manager.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\collision.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the collision manager.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\collision_world.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the collision resolver class.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\resolver.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the gfx manager.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\gfx.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the gfx sprite batch renderer.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\sprite_batch.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the gfx vertex container.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\vertex.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the input manager.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\input\input.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implement the sfx manager.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\sfx\sfx.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Implements 2d perlin noise generator.
 * Based on code from noisejs by Stefan Gustavson.
 * https://github.com/josephg/noisejs/blob/master/perlin.js
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\perlin.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Include all built-in effects.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\effects\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Include all util classes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Just an alias to main manager so we can require() this folder as a package.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\assets\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Just an alias to main manager so we can require() this folder as a package.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\collision\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Just an alias to main manager so we can require() this folder as a package.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Just an alias to main manager so we can require() this folder as a package.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\input\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Just an alias to main manager so we can require() this folder as a package.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\sfx\index.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Matrix class.
 * Based on code from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\gfx\matrix.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Provide a pathfinding algorithm.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\path_finder.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
*/
/**
 * Shaku Main.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\shaku.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Transformation modes.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\transform_modes.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
/**
 * Transformations object to store position, rotation and scale, that also support transformations inheritance.
 * 
 * |-- copyright and license --|
 * @package    Shaku
 * @file       shaku\lib\utils\transformation.js
 * @author     Ronen Ness (ronenness@gmail.com | http://ronenness.com)
 * @copyright  (c) 2021 Ronen Ness
 * @license    MIT
 * |-- end copyright and license --|
 * 
 */
//# sourceMappingURL=main.js.map
