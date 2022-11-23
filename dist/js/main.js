var nu=Object.create;var Fr=Object.defineProperty;var ou=Object.getOwnPropertyDescriptor;var au=Object.getOwnPropertyNames;var lu=Object.getPrototypeOf,uu=Object.prototype.hasOwnProperty;var hu=(r,e,t)=>e in r?Fr(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var y=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var du=(r,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of au(e))!uu.call(r,s)&&s!==t&&Fr(r,s,{get:()=>e[s],enumerable:!(i=ou(e,s))||i.enumerable});return r};var xe=(r,e,t)=>(t=r!=null?nu(lu(r)):{},du(e||!r||!r.__esModule?Fr(t,"default",{value:r,enumerable:!0}):t,r));var zi=(r,e,t)=>(hu(r,typeof e!="symbol"?e+"":e,t),t);var pt=y((uf,Dn)=>{"use strict";var Dr=class{setup(){throw new Error("Not Implemented!")}startFrame(){throw new Error("Not Implemented!")}endFrame(){throw new Error("Not Implemented!")}destroy(){throw new Error("Not Implemented!")}};Dn.exports=Dr});var ye=y((hf,On)=>{"use strict";var gt=console,Pn="Shaku",Pr=class{constructor(e){this._nameHeader="["+Pn+"]["+e+"]",this._throwErrors=!1}trace(e){gt.trace(this._nameHeader,e)}debug(e){gt.debug(this._nameHeader,e)}info(e){gt.info(this._nameHeader,e)}warn(e){if(gt.warn(this._nameHeader,e),this._throwErrors)throw new Error(e)}error(e){if(gt.error(this._nameHeader,e),this._throwErrors)throw new Error(e)}throwErrorOnWarnings(e){this._throwErrors=Boolean(e)}},Or=class{constructor(){}trace(e){}debug(e){}info(e){}warn(e){}error(e){}};On.exports={getLogger:function(r){return new Pr(r)},silent:function(){gt=new Or},setDrivers:function(r){gt=r},setApplicationName:function(r){return Pn=r,this}}});var mt=y((df,zn)=>{"use strict";var zr=class{constructor(e){this._url=e,this._waitingCallbacks=[]}onReady(e){if(this.valid||this._waitingCallbacks===null){e(this);return}this._waitingCallbacks.push(e)}waitForReady(){return new Promise((e,t)=>{this.onReady(e)})}_notifyReady(){if(this._waitingCallbacks){for(let e=0;e<this._waitingCallbacks.length;++e)this._waitingCallbacks[e](this);this._waitingCallbacks=null}}get url(){return this._url}get valid(){throw new Error("Not Implemented!")}load(e){throw new Error("Not Implemented!")}create(e,t){throw new Error("Not Supported for this asset type.")}destroy(){throw new Error("Not Implemented!")}};zn.exports=zr});var Ir=y((cf,Ln)=>{"use strict";var cu=mt(),Lr=class extends cu{constructor(e){super(e),this._valid=!1}load(){return new Promise((e,t)=>{let i=new(window.AudioContext||window.webkitAudioContext);var s=new XMLHttpRequest;s.open("GET",this.url,!0),s.responseType="arraybuffer",s.onload=()=>{var n=s.response;this._valid=!0,this._notifyReady(),i.decodeAudioData(n,function(o){e()},o=>{t(o.err)})},s.onerror=n=>{t(n)},s.send()})}get valid(){return this._valid}destroy(){this._valid=!1}};Ln.exports=Lr});var qr=y((ff,In)=>{"use strict";var Nr=ye().getLogger("sfx"),Nt=class{constructor(e,t){if(!t)throw Nr.error("Sound type can't be null or invalid!"),new Error("Invalid sound type to play in SoundInstance!");this._sfx=e,this._audio=new Audio(t),this._volume=1}disposeWhenDone(){this._audio.onended=()=>{this.dispose()}}dispose(){this._audio.src="",this._audio.srcObject=null,this._audio.remove(),this._audio=null}play(){if(this.playing)return;let e=this._audio.play();return this._sfx._playingSounds.add(this),e}get playbackRate(){return this._audio.playbackRate}set playbackRate(e){e<.1&&Nr.error("playbackRate value set is too low, value was capped to 0.1."),e>10&&Nr.error("playbackRate value set is too high, value was capped to 10."),this._audio.playbackRate=e}get preservesPitch(){return Boolean(this._audio.preservesPitch||this._audio.mozPreservesPitch)}set preservesPitch(e){return this._audio.preservesPitch=this._audio.mozPreservesPitch=Boolean(e)}pause(){this._audio.pause()}replay(){return this.stop(),this.play()}stop(){try{return this.pause(),this.currentTime=0,!0}catch{return!1}}get loop(){return this._audio.loop}set loop(e){return this._audio.loop=e,this._audio.loop}get volume(){return this._volume}set volume(e){this._volume=e;var t=e*Nt._masterVolume;return t<0&&(t=0),t>1&&(t=1),this._audio.volume=t,this._volume}get currentTime(){return this._audio.currentTime}set currentTime(e){return this._audio.currentTime=e}get duration(){return this._audio.duration}get paused(){return this._audio.paused}get playing(){return!this.paused&&!this.finished}get finished(){return this._audio.ended}};Nt._masterVolume=1;In.exports=Nt});var qn=y((pf,Nn)=>{"use strict";var _f=qr(),Ur=class{constructor(e,t,i){this._sound1=e,this._sound2=t,this.fromSoundVolume=this._sound1?this._sound1.volume:0,this.toSoundVolume=this._sound2?this._sound2.volume:0,this.allowOverlapping=i,this.update(0)}stop(){this._sound1&&this._sound1.stop(),this._sound2&&this._sound2.stop()}get fromSound(){return this._sound1}get toSound(){return this._sound2}get progress(){return this._progress}updateDelta(e){this.update(this._progress+e)}update(e){e<=0&&(this._sound1&&(this._sound1.volume=this.fromSoundVolume),this._sound2&&(this._sound2.volume=0,this._sound2.stop()),this._progress=0),e>=1?(this._sound2&&(this._sound2.volume=this.toSoundVolume),this._sound1&&(this._sound1.volume=0,this._sound1.stop()),this._progress=1):(this._progress=e,this._sound1&&this._sound1.play(),this._sound2&&this._sound2.play(),this.allowOverlapping?(this._sound1&&(this._sound1.volume=this.fromSoundVolume*(1-e)),this._sound2&&(this._sound2.volume=this.toSoundVolume*e)):(e*=2,this._sound1&&(this._sound1.volume=Math.max(this.fromSoundVolume*(1-e),0)),this._sound2&&(this._sound2.volume=Math.max(this.toSoundVolume*(e-1),0))))}};Nn.exports=Ur});var Hn=y((gf,Un)=>{"use strict";var fu=Ir(),_u=pt(),pu=ye().getLogger("sfx"),Hr=qr(),gu=qn(),jr=class extends _u{constructor(){super(),this._playingSounds=null}setup(){return new Promise((e,t)=>{pu.info("Setup sfx manager.."),this._playingSounds=new Set,e()})}startFrame(){for(var e=Array.from(this._playingSounds),t=0;t<e.length;++t){var i=e[t];i.isPlaying||this._playingSounds.delete(i)}}endFrame(){for(var e=Array.from(this._playingSounds),t=0;t<e.length;++t){var i=e[t];i.isPlaying||this._playingSounds.delete(i)}}destroy(){this.stopAll(),this._playingSounds=new Set}get SoundMixer(){return gu}play(n,t,i,s){var n=this.createSound(n);n.volume=t!==void 0?t:1,i!==void 0&&(n.playbackRate=i),s!==void 0&&(n.preservesPitch=s);let o=n.play();return n.disposeWhenDone(),o}stopAll(){for(var e=Array.from(this._playingSounds),t=0;t<e.length;++t){var i=e[t];i.stop()}this._playingSounds=new Set}get playingSoundsCount(){return this._playingSounds.size}createSound(e){if(!(e instanceof fu))throw new Error("Sound type must be an instance of SoundAsset!");var t=new Hr(this,e.url);return t}get masterVolume(){return Hr._masterVolume}set masterVolume(e){return Hr._masterVolume=e,e}};Un.exports=new jr});var Vn=y((mf,jn)=>{"use strict";jn.exports=Hn()});var We=y((wf,Gn)=>{"use strict";var oi=Math.PI/180,Vr=180/Math.PI,Li=class{static lerp(e,t,i){return e===t?t:(1-i)*e+i*t}static dot(e,t,i,s){return e*i+t*s}static toRadians(e){return e*oi}static toDegrees(e){return e*Vr}static radiansDistanceSigned(e,t){var i=Math.PI*2,s=(t-e)%i;return 2*s%i-s}static radiansDistance(e,t){return Math.abs(this.radiansDistanceSigned(e,t))}static degreesDistanceSigned(e,t){let i=e*oi,s=t*oi;return this.radiansDistanceSigned(i,s)*Vr}static degreesDistance(e,t){let i=e*oi,s=t*oi;return this.radiansDistance(i,s)*Vr}static lerpRadians(e,t,i){return e===t?t:e+this.radiansDistanceSigned(e,t)*i}static lerpDegrees(e,t,i){if(e===t)return t;e=this.toRadians(e),t=this.toRadians(t);var s=this.lerpRadians(e,t,i);return this.toDegrees(s)}static round10(e){return Math.round(e*1e8)/1e8}static wrapDegrees(e){return e=e%360,e<0&&(e+=360),e}};Li.PI2=Math.PI*2;Gn.exports=Li});var qe=y((xf,$n)=>{"use strict";var mu=We(),J=class{constructor(e,t,i,s){this.set(e,t,i,s)}set(e,t,i,s){return this._r=e,this._g=t,this._b=i,this._a=s===void 0?1:s,this._asHex=null,this}setByte(e,t,i,s){return this._r=e/255,this._g=t/255,this._b=i/255,this._a=s===void 0?1:s/255,this._asHex=null,this}copy(e){return this.set(e.r,e.g,e.b,e.a),this}get r(){return this._r}get g(){return this._g}get b(){return this._b}get a(){return this._a}set r(e){return this._r=e,this._asHex=null,this._r}set g(e){return this._g=e,this._asHex=null,this._g}set b(e){return this._b=e,this._asHex=null,this._b}set a(e){return this._a=e,this._asHex=null,this._a}static componentToHex(e){var t=Math.round(e).toString(16);return t.length==1?"0"+t:t}get asHex(){return this._asHex||(this._asHex="#"+J.componentToHex(this.r*255)+J.componentToHex(this.g*255)+J.componentToHex(this.b*255)+J.componentToHex(this.a*255)),this._asHex}static fromHex(e){if(typeof e!="string"&&e[0]!="#")throw new PintarJS.Error("Invalid color format!");var t=Yn(e);if(!t)throw new Error("Invalid hex value to parse!");return new J(t.r,t.g,t.b,1)}static fromDecimal(e,t){let i=new J(1,1,1,1);t&&(i.a=(e&255)/255,e=e>>8),i.b=(e&255)/255,e=e>>8,i.g=(e&255)/255,e=e>>8,i.r=(e&255)/255}static fromDict(e){return new J(e.r!==void 0?e.r:1,e.g!==void 0?e.g:1,e.b!==void 0?e.b:1,e.a!==void 0?e.a:1)}toDict(e){if(e){let t={};return this.r!==1&&(t.r=this.r),this.g!==1&&(t.g=this.g),this.b!==1&&(t.b=this.b),this.a!==1&&(t.a=this.a),t}return{r:this.r,g:this.g,b:this.b,a:this.a}}get asDecimalRGBA(){return(Math.round(this.r*255)<<8*3|Math.round(this.g*255)<<8*2|Math.round(this.b*255)<<8*1|Math.round(this.a*255))>>>0}get asDecimalABGR(){return(Math.round(this.a*255)<<8*3|Math.round(this.b*255)<<8*2|Math.round(this.g*255)<<8*1|Math.round(this.r*255))>>>0}get floatArray(){return[this.r,this.g,this.b,this.a]}clone(){return new J(this.r,this.g,this.b,this.a)}string(){return this.r+","+this.g+","+this.b+","+this.a}get isBlack(){return this.r==0&&this.g==0&&this.b==0}static random(e){return new J(Math.random(),Math.random(),Math.random(),e?Math.random():1)}static fromBytesArray(e){return new J(e[0]/255,e[1]/255,e[2]/255,e[3]!==void 0?e[3]/255:1)}get isTransparentBlack(){return this._r==this._g&&this._g==this._b&&this._b==this._a&&this._a==0}static get webColorNames(){return Xn}equals(e){return this===e||e&&e.constructor===this.constructor&&this._r==e._r&&this._g==e._g&&this._b==e._b&&this._a==e._a}static lerp(e,t,i){let s=mu.lerp;return new J(s(e.r,t.r,i),s(e.g,t.g,i),s(e.b,t.b,i),s(e.a,t.a,i))}},Ni={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4","indianred ":"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};for(Ii in Ni)Ni.hasOwnProperty(Ii)&&(Wn=Yn(Ni[Ii]),function(r){Object.defineProperty(J,Ii,{get:function(){return r.clone()}})}(Wn));var Wn,Ii,Xn=Object.keys(Ni);Object.freeze(Xn);Object.defineProperty(J,"transparent",{get:function(){return new J(0,0,0,0)}});Object.defineProperty(J,"transwhite",{get:function(){return new J(1,1,1,0)}});function Yn(r){var e=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;r=r.replace(e,function(s,n,o,a){return n+n+o+o+a+a});var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(r),i=t?{r:parseInt(t[1],16)/255,g:parseInt(t[2],16)/255,b:parseInt(t[3],16)/255}:null;if(!i)throw new Error("Invalid hex value to parse!");return new J(i.r,i.g,i.b,1)}$n.exports=J});var Ui=y((yf,Kn)=>{"use strict";var qi={AlphaBlend:"alpha",Opaque:"opaque",Additive:"additive",Multiply:"multiply",Subtract:"subtract",Screen:"screen",Overlay:"overlay",Invert:"invert",Darken:"darken",DestIn:"dest-in",DestOut:"dest-out"};Object.defineProperty(qi,"_values",{value:new Set(Object.values(qi)),writable:!1});Object.freeze(qi);Kn.exports={BlendModes:qi}});var G=y((bf,Jn)=>{"use strict";var Gr=We(),C=class{constructor(e=0,t=0){this.x=e,this.y=t}clone(){return new C(this.x,this.y)}set(e,t){return this.x=e,this.y=t,this}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return typeof e=="number"?new C(this.x+e,this.y+(arguments[1]===void 0?e:arguments[1])):new C(this.x+e.x,this.y+e.y)}sub(e){return typeof e=="number"?new C(this.x-e,this.y-(arguments[1]===void 0?e:arguments[1])):new C(this.x-e.x,this.y-e.y)}div(e){return typeof e=="number"?new C(this.x/e,this.y/(arguments[1]===void 0?e:arguments[1])):new C(this.x/e.x,this.y/e.y)}mul(e){return typeof e=="number"?new C(this.x*e,this.y*(arguments[1]===void 0?e:arguments[1])):new C(this.x*e.x,this.y*e.y)}round(){return new C(Math.round(this.x),Math.round(this.y))}floor(){return new C(Math.floor(this.x),Math.floor(this.y))}ceil(){return new C(Math.ceil(this.x),Math.ceil(this.y))}normalized(){if(this.x==0&&this.y==0)return C.zero;let e=this.length;return new C(this.x/e,this.y/e)}rotatedRadians(e){return C.fromRadians(this.getRadians()+e).mulSelf(this.length)}rotatedDegrees(e){return C.fromDegree(this.getDegrees()+e).mulSelf(this.length)}addSelf(e){return typeof e=="number"?(this.x+=e,this.y+=arguments[1]===void 0?e:arguments[1]):(this.x+=e.x,this.y+=e.y),this}subSelf(e){return typeof e=="number"?(this.x-=e,this.y-=arguments[1]===void 0?e:arguments[1]):(this.x-=e.x,this.y-=e.y),this}divSelf(e){return typeof e=="number"?(this.x/=e,this.y/=arguments[1]===void 0?e:arguments[1]):(this.x/=e.x,this.y/=e.y),this}mulSelf(e){return typeof e=="number"?(this.x*=e,this.y*=arguments[1]===void 0?e:arguments[1]):(this.x*=e.x,this.y*=e.y),this}roundSelf(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}floorSelf(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceilSelf(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}normalizeSelf(){if(this.x==0&&this.y==0)return this;let e=this.length;return this.x/=e,this.y/=e,this}equals(e){return this===e||e.constructor===this.constructor&&this.x===e.x&&this.y===e.y}approximate(e,t){return t=t||1,this===e||Math.abs(this.x-e.x)<=t&&Math.abs(this.y-e.y)<=t}get length(){return Math.sqrt(this.x*this.x+this.y*this.y)}scaled(e){return new C(this.x*e,this.y*e)}static get zero(){return new C}static get one(){return new C(1,1)}static get half(){return new C(.5,.5)}static get left(){return new C(-1,0)}static get right(){return new C(1,0)}static get up(){return new C(0,-1)}static get down(){return new C(0,1)}static get random(){return C.fromDegree(Math.random()*360)}degreesTo(e){return C.degreesBetween(this,e)}radiansTo(e){return C.radiansBetween(this,e)}degreesToFull(e){return C.degreesBetweenFull(this,e)}radiansToFull(e){return C.radiansBetweenFull(this,e)}distanceTo(e){return C.distance(this,e)}static fromDegree(e){let t=e*(Math.PI/180);return new C(Math.cos(t),Math.sin(t))}static fromRadians(e){return new C(Math.cos(e),Math.sin(e))}static lerp(e,t,i){let s=Gr.lerp;return new C(s(e.x,t.x,i),s(e.y,t.y,i))}static degreesBetween(e,t){let i=t.y-e.y,s=t.x-e.x;return Math.atan2(i,s)*(180/Math.PI)}static radiansBetween(e,t){return Gr.toRadians(C.degreesBetween(e,t))}static degreesBetweenFull(e,t){return t.sub(e).getDegrees()}getDegrees(){var e=Math.atan2(this.y,this.x),t=180*e/Math.PI;return(360+Math.round(t))%360}getRadians(){var e=Math.atan2(this.y,this.x);return e}static radiansBetweenFull(e,t){return Gr.toRadians(C.degreesBetweenFull(e,t))}static distance(e,t){let i=e.x-t.x,s=e.y-t.y;return Math.sqrt(i*i+s*s)}static cross(e,t){return e.x*t.y-e.y*t.x}static dot(e,t){return e.x*t.x+e.y*t.y}string(){return this.x+","+this.y}static parse(e){let t=e.split(",");return new C(parseFloat(t[0].trim()),parseFloat(t[1].trim()))}toArray(){return[this.x,this.y]}static fromArray(e){return new C(e[0],e[1])}static fromDict(e){return new C(e.x||0,e.y||0)}toDict(e){if(e){let t={};return this.x&&(t.x=this.x),this.y&&(t.y=this.y),t}return{x:this.x,y:this.y}}};Jn.exports=C});var et=y((vf,Zn)=>{"use strict";var wu=We(),Qn=G(),wt=class{constructor(e,t){this.center=e.clone(),this.radius=t}clone(){return new wt(this.center,this.radius)}containsVector(e){return this.center.distanceTo(e)<=this.radius}equals(e){return e===this||e&&e.constructor===this.constructor&&this.center.equals(e.center)&&this.radius==e.radius}static fromDict(e){return new wt(Qn.fromDict(e.center||{}),e.radius||0)}toDict(e){if(e){let t={};return this.radius&&(t.radius=this.radius),(this.center.x||this.center.y)&&(t.center=this.center.toDict(!0)),t}return{center:this.center.toDict(),radius:this.radius}}static lerp(e,t,i){let s=wu.lerp;return new wt(Qn.lerp(e.center,t.center,i),s(e.radius,t.radius,i))}};Zn.exports=wt});var Hi=y((Ef,eo)=>{"use strict";var ai=G(),xt=class{constructor(e,t){this.from=e.clone(),this.to=t.clone()}clone(){return new xt(this.from,this.to)}static fromDict(e){return new xt(ai.fromDict(e.from||{}),ai.fromDict(e.to||{}))}toDict(e){if(e){let t={};return(this.from.x||this.from.y)&&(t.from=this.from.toDict(!0)),(this.to.x||this.to.y)&&(t.to=this.to.toDict(!0)),t}return{from:this.from.toDict(),to:this.to.toDict()}}containsVector(e,t){let i=this.from,s=this.to,n=ai.distance;return t===void 0&&(t=.5),Math.abs(n(i,e)+n(s,e)-n(i,s))<=t}collideLine(e){let t=this.from,i=this.to,s=e.from,n=e.to;if(t.equals(s)||t.equals(n)||i.equals(s)||i.equals(n))return!0;let o,a,l,h;o=i.x-t.x,a=i.y-t.y,l=n.x-s.x,h=n.y-s.y;let c,_;return c=(-a*(t.x-s.x)+o*(t.y-s.y))/(-l*a+o*h),_=(l*(t.y-s.y)-h*(t.x-s.x))/(-l*a+o*h),c>=0&&c<=1&&_>=0&&_<=1}distanceToVector(e){let t=this.from.x,i=this.to.x,s=this.from.y,n=this.to.y;var o=e.x-t,a=e.y-s,l=i-t,h=n-s,c=o*l+a*h,_=l*l+h*h,m=-1;_!=0&&(m=c/_);var w,x;m<0?(w=t,x=s):m>1?(w=i,x=n):(w=t+m*l,x=s+m*h);var p=e.x-w,v=e.y-x;return Math.sqrt(p*p+v*v)}equals(e){return this===e||e&&e.constructor===this.constructor&&this.from.equals(e.from)&&this.to.equals(e.to)}static lerp(e,t,i){return new xt(ai.lerp(e.from,t.from,i),ai.lerp(e.to,t.to,i))}};eo.exports=xt});var le=y((Tf,to)=>{"use strict";var xu=et(),ji=Hi(),yu=We(),tt=G(),Xe=class{constructor(e,t,i,s){this.x=e||0,this.y=t||0,this.width=i,this.height=s}set(e,t,i,s){return this.x=e,this.y=t,this.width=i,this.height=s,this}copy(e){return this.x=e.x,this.y=e.y,this.width=e.width,this.height=e.height,this}getPosition(){return new tt(this.x,this.y)}getSize(){return new tt(this.width,this.height)}getCenter(){return new tt(Math.round(this.x+this.width/2),Math.round(this.y+this.height/2))}get left(){return this.x}get right(){return this.x+this.width}get top(){return this.y}get bottom(){return this.y+this.height}clone(){return new Xe(this.x,this.y,this.width,this.height)}getTopLeft(){return new tt(this.x,this.y)}getTopRight(){return new tt(this.x+this.width,this.y)}getBottomLeft(){return new tt(this.x,this.y+this.height)}getBottomRight(){return new tt(this.x+this.width,this.y+this.height)}string(){return this.x+","+this.y+","+this.width+","+this.height}containsVector(e){return e.x>=this.x&&e.x<=this.x+this.width&&e.y>=this.y&&e.y<=this.y+this.height}collideRect(e){let t=this,i=e;return!(i.left>=t.right||i.right<=t.left||i.top>=t.bottom||i.bottom<=t.top)}collideLine(e){if(this.containsVector(e.from)||this.containsVector(e.to))return!0;let t=this.getTopLeft(),i=this.getTopRight(),s=this.getBottomLeft(),n=this.getBottomRight();return!!(e.collideLine(new ji(t,i))||e.collideLine(new ji(t,s))||e.collideLine(new ji(i,n))||e.collideLine(new ji(s,n)))}collideCircle(e){let t=e.center,i=e.radius,s=this;if(s.containsVector(t))return!0;let n=s.getCenter(),o=s.getTopLeft(),a=s.getTopRight(),l=s.getBottomRight(),h=s.getBottomLeft(),c=[];n.x>t.x?c.push([o,h]):c.push([a,l]),n.y>t.y?c.push([o,a]):c.push([h,l]);for(let _=0;_<c.length;++_)if(bu(t,c[_][0],c[_][1])<=i)return!0;return!1}getBoundingCircle(){let e=this.getCenter(),t=e.distanceTo(this.getTopLeft());return new xu(e,t)}static fromPoints(e){let t=e[0].x,i=e[0].y,s=t,n=i;for(let o=1;o<e.length;++o)t=Math.min(t,e[o].x),i=Math.min(i,e[o].y),s=Math.max(s,e[o].x),n=Math.max(n,e[o].y);return new Xe(t,i,s-t,n-i)}resize(e){return typeof e=="number"&&(e=new tt(e,e)),new Xe(this.x-e.x/2,this.y-e.y/2,this.width+e.x,this.height+e.y)}equals(e){return this===e||e&&e.constructor===this.constructor&&this.x==e.x&&this.y==e.y&&this.width==e.width&&this.height==e.height}static lerp(e,t,i){let s=yu.lerp;return new Xe(s(e.x,t.x,i),s(e.y,t.y,i),s(e.width,t.width,i),s(e.height,t.height,i))}static fromDict(e){return new Xe(e.x||0,e.y||0,e.width||0,e.height||0)}toDict(e){if(e){let t={};return this.x&&(t.x=this.x),this.y&&(t.y=this.y),this.width&&(t.width=this.width),this.height&&(t.height=this.height),t}return{x:this.x,y:this.y,width:this.width,height:this.height}}};function bu(r,e,t){let i=r.x,s=r.y,n=e.x,o=e.y,a=t.x,l=t.y;var h=i-n,c=s-o,_=a-n,m=l-o,w=h*_+c*m,x=_*_+m*m,p=-1;x!=0&&(p=w/x);var v,M;p<0?(v=n,M=o):p>1?(v=a,M=l):(v=n+p*_,M=o+p*m);var k=i-v,F=s-M;return Math.sqrt(k*k+F*F)}to.exports=Xe});var li=y((Sf,io)=>{"use strict";var Vi={Nearest:"NEAREST",Linear:"LINEAR",NearestMipmapNearest:"NEAREST_MIPMAP_NEAREST",LinearMipmapNearest:"LINEAR_MIPMAP_NEAREST",NearestMipmapLinear:"NEAREST_MIPMAP_LINEAR",LinearMipmapLinear:"LINEAR_MIPMAP_LINEAR"};Object.defineProperty(Vi,"_values",{value:new Set(Object.values(Vi)),writable:!1});Object.freeze(Vi);io.exports={TextureFilterModes:Vi}});var Wi=y((Af,ro)=>{"use strict";var Gi={Clamp:"CLAMP_TO_EDGE",Repeat:"REPEAT",RepeatMirrored:"MIRRORED_REPEAT"};Object.defineProperty(Gi,"_values",{value:new Set(Object.values(Gi)),writable:!1});Object.freeze(Gi);ro.exports={TextureWrapModes:Gi}});var yt=y((kf,no)=>{"use strict";var vu=mt(),{TextureFilterMode:Cf,TextureFilterModes:Rf}=li(),{TextureWrapMode:Mf,TextureWrapModes:Bf}=Wi(),Eu=qe(),Tu=G(),Su=ye().getLogger("assets"),A=null,Wr=class extends vu{constructor(e){super(e),this._image=null,this._width=0,this._height=0,this._texture=null,this._filter=null,this._wrapMode=null,this._ctxForPixelData=null}static _setWebGl(e){A=e}get filter(){return this._filter}set filter(e){this._filter=e}get wrapMode(){return this._wrapMode}set wrapMode(e){this._wrapMode=e}load(e){return e=e||{},new Promise((t,i)=>{if(!A)return i("Can't load textures before initializing gfx manager!");let s=new Image;e.crossOrigin!==void 0&&(s.crossOrigin=e.crossOrigin),s.onload=async()=>{try{await this.create(s,e),this._notifyReady(),t()}catch(n){i(n)}},s.onerror=()=>{i("Failed to load texture image!")},s.src=this.url})}createRenderTarget(e,t,i){let s=e,n=t,o=A.createTexture();A.bindTexture(A.TEXTURE_2D,o);var a=A.RGBA;if(i!==void 0)switch(i){case 1:a=A.LUMINANCE;break;case 3:a=A.RGB;break;case 4:a=A.RGBA;break;default:throw new Error("Unknown render target format!")}{let h=a,c=0,_=a,m=A.UNSIGNED_BYTE,w=null;A.texImage2D(A.TEXTURE_2D,0,h,s,n,c,_,m,w),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_MIN_FILTER,A.LINEAR),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_WRAP_S,A.CLAMP_TO_EDGE),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_WRAP_T,A.CLAMP_TO_EDGE)}this._width=e,this._height=t,this._texture=o,this._notifyReady()}fromImage(e,t){if(e.width===0)throw new Error("Image to build texture from must be loaded and have valid size!");if(this.valid)throw new Error("Texture asset is already initialized!");t=t||{},this._image=e,this._width=e.width,this._height=e.height;let i=A.createTexture();A.bindTexture(A.TEXTURE_2D,i);let s=0,n=A.RGBA,o=A.RGBA,a=A.UNSIGNED_BYTE;A.bindTexture(A.TEXTURE_2D,i),A.texImage2D(A.TEXTURE_2D,s,n,o,a,e),t.generateMipMaps&&(so(e.width)&&so(e.height)&&Su.warn("Tried to generate MipMaps for a texture with size that is *not* a power of two. This might not work as expected."),A.generateMipmap(A.TEXTURE_2D)),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_WRAP_S,A.CLAMP_TO_EDGE),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_WRAP_T,A.CLAMP_TO_EDGE),A.texParameteri(A.TEXTURE_2D,A.TEXTURE_MIN_FILTER,A.LINEAR),this._texture=i,this._notifyReady()}create(e,t){return new Promise(async(i,s)=>{if(typeof e=="string"){let n=new Image;n.onload=()=>{this.fromImage(e,t),this._notifyReady(),i()},t.crossOrigin!==void 0&&(n.crossOrigin=t.crossOrigin),n.src=e}else this.fromImage(e,t),i()})}get image(){return this._image}get width(){return this._width}get height(){return this._height}get size(){return new Tu(this.width,this.height)}get texture(){return this._texture}getPixel(e,t){if(!this._image)throw new Error("'getPixel()' only works on textures loaded from image!");if(!this._ctxForPixelData){let n=document.createElement("canvas");n.width=1,n.height=1,this._ctxForPixelData=n.getContext("2d")}let i=this._ctxForPixelData;i.drawImage(this._image,e,t,1,1,0,0,1,1);let s=i.getImageData(0,0,1,1).data;return Eu.fromBytesArray(s)}get valid(){return Boolean(this._texture)}destroy(){A.deleteTexture(this._texture),this._image=null,this._width=this._height=0,this._ctxForPixelData=null,this._texture=null}};function so(r){return(r&r-1)==0}no.exports=Wr});var Xi=y((Ff,oo)=>{"use strict";var Au=We(),O=class{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}clone(){return new O(this.x,this.y,this.z)}set(e,t){return this.x=e,this.y=t,this.z=z,this}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return typeof e=="number"?new O(this.x+e,this.y+(arguments[1]===void 0?e:arguments[1]),this.z+(arguments[2]===void 0?e:arguments[2])):new O(this.x+e.x,this.y+e.y,this.z+e.z)}sub(e){return typeof e=="number"?new O(this.x-e,this.y-(arguments[1]===void 0?e:arguments[1]),this.z-(arguments[2]===void 0?e:arguments[2])):new O(this.x-e.x,this.y-e.y,this.z-e.z)}div(e){return typeof e=="number"?new O(this.x/e,this.y/(arguments[1]===void 0?e:arguments[1]),this.z/(arguments[2]===void 0?e:arguments[2])):new O(this.x/e.x,this.y/e.y,this.z/e.z)}mul(e){return typeof e=="number"?new O(this.x*e,this.y*(arguments[1]===void 0?e:arguments[1]),this.z*(arguments[2]===void 0?e:arguments[2])):new O(this.x*e.x,this.y*e.y,this.z*e.z)}round(){return new O(Math.round(this.x),Math.round(this.y),Math.round(this.z))}floor(){return new O(Math.floor(this.x),Math.floor(this.y),Math.floor(this.z))}ceil(){return new O(Math.ceil(this.x),Math.ceil(this.y),Math.ceil(this.z))}normalized(){if(this.x==0&&this.y==0&&this.z==0)return O.zero;let e=this.length;return new O(this.x/e,this.y/e,this.z/e)}addSelf(e){return typeof e=="number"?(this.x+=e,this.y+=arguments[1]===void 0?e:arguments[1],this.z+=arguments[2]===void 0?e:arguments[2]):(this.x+=e.x,this.y+=e.y,this.z+=e.z),this}subSelf(e){return typeof e=="number"?(this.x-=e,this.y-=arguments[1]===void 0?e:arguments[1],this.z-=arguments[2]===void 0?e:arguments[2]):(this.x-=e.x,this.y-=e.y,this.z-=e.z),this}divSelf(e){return typeof e=="number"?(this.x/=e,this.y/=arguments[1]===void 0?e:arguments[1],this.z/=arguments[2]===void 0?e:arguments[2]):(this.x/=e.x,this.y/=e.y,this.z/=e.z),this}mulSelf(e){return typeof e=="number"?(this.x*=e,this.y*=arguments[1]===void 0?e:arguments[1],this.z*=arguments[2]===void 0?e:arguments[2]):(this.x*=e.x,this.y*=e.y,this.z*=e.z),this}roundSelf(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}floorSelf(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceilSelf(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}normalizeSelf(){if(this.x==0&&this.y==0&&this.z==0)return this;let e=this.length;return this.x/=e,this.y/=e,this.z/=e,this}equals(e){return this===e||e.constructor===this.constructor&&this.x===e.x&&this.y===e.y&&this.z===e.z}approximate(e,t){return t=t||1,this===e||Math.abs(this.x-e.x)<=t&&Math.abs(this.y-e.y)<=t&&Math.abs(this.z-e.z)<=t}get length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}scaled(e){return new O(this.x*e,this.y*e,this.z*e)}static get zero(){return new O}static get one(){return new O(1,1,1)}static get half(){return new O(.5,.5,.5)}static get left(){return new O(-1,0,0)}static get right(){return new O(1,0,0)}static get up(){return new O(0,-1,0)}static get down(){return new O(0,1,0)}static get front(){return new O(0,0,-1)}static get back(){return new O(0,0,1)}distanceTo(e){return O.distance(this,e)}static lerp(e,t,i){let s=Au.lerp;return new O(s(e.x,t.x,i),s(e.y,t.y,i),s(e.z,t.z,i))}static distance(e,t){let i=e.x-t.x,s=e.y-t.y,n=e.z-t.z;return Math.sqrt(i*i+s*s+n*n)}static crossVector(e,t){let i=e.x,s=e.y,n=e.z,o=t.x,a=t.y,l=t.z,h=s*l-n*a,c=n*o-i*l,_=i*a-s*o;return new O(h,c,_)}string(){return this.x+","+this.y+","+this.z}static parse(e){let t=e.split(",");return new O(parseFloat(t[0].trim()),parseFloat(t[1].trim()),parseFloat(t[2].trim()))}toArray(){return[this.x,this.y,this.z]}static fromArray(e){return new O(e[0],e[1],e[2])}static fromDict(e){return new O(e.x||0,e.y||0,e.z||0)}toDict(e){if(e){let t={};return this.x&&(t.x=this.x),this.y&&(t.y=this.y),this.z&&(t.z=this.z),t}return{x:this.x,y:this.y,z:this.z}}};oo.exports=O});var Yr=y((Df,ao)=>{"use strict";var qt=[],Xr=class{constructor(e){this._target=e,this._fromValues={},this._toValues={},this._progress=0,this._onFinish=null,this._smoothDamp=!1,this._repeats=!1,this._repeatsWithReverseAnimation=!1,this._isInAutoUpdate=!1,this._originalFrom=null,this._originalTo=null,this._originalRepeats=null,this.speedFactor=1}update(e){if(!(this._progress>=1)){e*=this.speedFactor,this._progress+=e,this._progress>=1&&(this._progress=1,this._onFinish&&this._onFinish());for(let t in this._toValues){let i=this._toValues[t].keyParts,s=this._toValues[t].value,n=this._fromValues[t];if(n===void 0&&(this._fromValues[t]=n=this._getValueFromTarget(i),n===void 0))throw new Error(`Animator issue: missing origin value for key '${t}' and property not found in target object.`);typeof s=="function"&&(s=s()),typeof n=="function"&&(n=s());let o=this._smoothDamp&&this._progress<1?this._progress*(1+1-this._progress):this._progress,a=null;if(typeof n=="number")a=Cu(n,s,o);else if(n.constructor.lerp)a=n.constructor.lerp(n,s,o);else throw new Error(`Animator issue: from-value for key '${t}' is not a number, and its class type don't implement a 'lerp()' method!`);this._setValueToTarget(i,a)}this._repeats&&this._progress>=1&&(typeof this._repeats=="number"&&this._repeats--,this._progress=0,this._repeatsWithReverseAnimation&&this.flipFromAndTo())}}_getValueFromTarget(e){if(e.length===1)return this._target[e[0]];function t(i,s){return i[s]}return e.reduce(t,this._target)}_setValueToTarget(e,t){if(e.length===1){this._target[e[0]]=t;return}function i(n,o){return n[o]}let s=e.slice(0,e.length-1).reduce(i,this._target);s[e[e.length-1]]=t}_validateValueType(e){return typeof e=="number"||typeof e=="function"||e&&e.constructor&&e.constructor.lerp}then(e){return this._onFinish=e,this}smoothDamp(e){return this._smoothDamp=e,this}repeats(e,t){return this._originalRepeats=this._repeats=e,this._repeatsWithReverseAnimation=Boolean(t),this}from(e){for(let t in e){if(!this._validateValueType(e[t]))throw new Error("Illegal value type to use with Animator! All values must be either numbers, methods, or a class instance that has a static lerp() method.");this._fromValues[t]=e[t]}return this._originalFrom=null,this}to(e){for(let t in e){if(!this._validateValueType(e[t]))throw new Error("Illegal value type to use with Animator! All values must be either numbers, methods, or a class instance that has a static lerp() method.");this._toValues[t]={keyParts:t.split("."),value:e[t]}}return this._originalTo=null,this}flipFromAndTo(){let e={},t={};this._originalFrom||(this._originalFrom=this._fromValues),this._originalTo||(this._originalTo=this._toValues);for(let i in this._toValues)e[i]=this._toValues[i].value,t[i]={keyParts:i.split("."),value:this._fromValues[i]};this._fromValues=e,this._toValues=t}duration(e){return this.speedFactor=1/e,this}reset(){return this._originalFrom&&(this._fromValues=this._originalFrom),this._originalTo&&(this._toValues=this._originalTo),this._originalRepeats!==null&&(this._repeats=this._originalRepeats),this._progress=0,this}play(){if(!this._isInAutoUpdate)return qt.push(this),this._isInAutoUpdate=!0,this}get ended(){return this._progress>=1}static updateAutos(e){for(let t=qt.length-1;t>=0;--t)qt[t].update(e),qt[t].ended&&(qt[t]._isInAutoUpdate=!1,qt.splice(t,1))}};function Cu(r,e,t){return(1-t)*r+t*e}ao.exports=Xr});var Yi=y((Pf,uo)=>{"use strict";var $r=class{constructor(){this.timestamp=di,this.deltaTime={milliseconds:hi,seconds:hi/1e3},this.elapsedTime={milliseconds:di,seconds:di/1e3},this.delta=this.deltaTime?this.deltaTime.seconds:null,this.elapsed=this.elapsedTime.seconds,Object.freeze(this)}static update(){let e=lo(),t=0;ui&&(t=e-ui),ui=e,hi=t,di+=t}static rawTimestamp(){return lo()}static reset(){ui=null,hi=0,di=0}static resetDelta(){ui=null,hi=0}},Ru=typeof performance<"u"&&performance.now;function lo(){return Ru?performance.now():Date.now()}var ui=null,hi=0,di=0;uo.exports=$r});var co=y((Of,ho)=>{"use strict";var Kr=class{constructor(e){e===void 0&&(e=0),this.seed=e}random(e,t){this.seed=(this.seed*9301+49297)%233280;let i=this.seed/233280;return e&&t?e+i*(t-e):e?i*e:i}pick(e){return e[Math.floor(this.random(e.length))]}};ho.exports=Kr});var go=y((zf,po)=>{"use strict";var Mu=We(),Jr=Mu.lerp;function fo(r){return r*r*r*(r*(r*6-15)+10)}function be(r,e,t){this.x=r,this.y=e,this.z=t}be.prototype.dot2=function(r,e){return this.x*r+this.y*e};var _o=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],Qr=class{constructor(e){e===void 0&&(e=Math.random()),this.seed(e)}seed(e){e>0&&e<1&&(e*=65536),e=Math.floor(e),e<256&&(e|=e<<8);for(var t=new Array(512),i=new Array(512),s=[new be(1,1,0),new be(-1,1,0),new be(1,-1,0),new be(-1,-1,0),new be(1,0,1),new be(-1,0,1),new be(1,0,-1),new be(-1,0,-1),new be(0,1,1),new be(0,-1,1),new be(0,1,-1),new be(0,-1,-1)],n=0;n<256;n++){var o;n&1?o=_o[n]^e&255:o=_o[n]^e>>8&255,t[n]=t[n+256]=o,i[n]=i[n+256]=s[o%12]}this._perm=t,this._gradP=i}generateSmooth(e,t,i,s){i===void 0&&(i=.25);let n=this.generate(e-i,t-i,s),o=this.generate(e+i,t+i,s),a=this.generate(e-i,t+i,s),l=this.generate(e+i,t-i,s);return(n+o+a+l)/4}generate(e,t,i){i===void 0&&(i=1);let s=this._perm,n=this._gradP;var o=Math.floor(e),a=Math.floor(t);e=e-o,t=t-a,o=o&255,a=a&255;var l=n[o+s[a]].dot2(e,t)*i,h=n[o+s[a+1]].dot2(e,t-1)*i,c=n[o+1+s[a]].dot2(e-1,t)*i,_=n[o+1+s[a+1]].dot2(e-1,t-1)*i,m=fo(e);return Math.min(Jr(Jr(l,c,m),Jr(h,_,m),fo(t))+.5,1)}};po.exports=Qr});var is=y((Lf,mo)=>{"use strict";var Ut=class{get persistent(){throw new Error("Not Implemented.")}isValid(){throw new Error("Not Implemented.")}exists(e){throw new Error("Not Implemented.")}setItem(e,t){throw new Error("Not Implemented.")}getItem(e){throw new Error("Not Implemented.")}deleteItem(e){throw new Error("Not Implemented.")}clear(e){throw new Error("Not Implemented.")}},Zr=class{constructor(){this._data={}}get persistent(){return!1}isValid(){return!0}exists(e){return Boolean(this._data[e])}setItem(e,t){this._data[e]=t}getItem(e){return this._data[e]}deleteItem(e){delete this._data[e]}clear(e){for(let t in this._data)t.indexOf(e)===0&&delete this._data[t]}};Ut.memory=Zr;var es=class{get persistent(){return!0}isValid(){try{return typeof localStorage<"u"&&localStorage!==null}catch{return!1}}exists(e){return localStorage.getItem(e)!==null}setItem(e,t){localStorage.setItem(e,t)}getItem(e){return localStorage.getItem(e)}deleteItem(e){localStorage.deleteItem(e)}clear(e){for(let t=0;t<localStorage.length;t++){let i=localStorage.key(t);i.indexOf(e)===0&&delete localStorage.deleteItem(i)}}};Ut.localStorage=es;var ts=class{get persistent(){return!1}isValid(){try{return typeof sessionStorage<"u"&&sessionStorage!==null}catch{return!1}}exists(e){return sessionStorage.getItem(e)!==null}setItem(e,t){sessionStorage.setItem(e,t)}getItem(e){return sessionStorage.getItem(e)}deleteItem(e){sessionStorage.deleteItem(e)}clear(e){for(let t=0;t<sessionStorage.length;t++){let i=sessionStorage.key(t);i.indexOf(e)===0&&delete sessionStorage.deleteItem(i)}}};Ut.sessionStorage=ts;mo.exports=Ut});var xo=y((If,wo)=>{"use strict";var rs=is(),Ht=class{constructor(e,t,i,s){e=e||Ht.defaultAdapters,e instanceof Array||(e=[e]),this._adapter=null;for(let n of e)if(n.isValid()){this._adapter=n;break}this.valuesAsBase64=Boolean(i),this.keysAsBase64=Boolean(s),this._keysPrefix="shaku_storage_"+(t||"")+"_"}get persistent(){return this.isValid&&this._adapter.persistent}get isValid(){return Boolean(this._adapter)}normalizeKey(e){return e=this._keysPrefix+e.toString(),this.keysAsBase64&&(e=btoa(e)),e}exists(e){if(typeof e!="string")throw new Error("Key must be a string!");return e=this.normalizeKey(e),this._adapter.exists(e)}_set(e,t){t=JSON.stringify({data:t,timestamp:new Date().getTime(),src:"Shaku",sver:1}),this.valuesAsBase64&&(t=btoa(t)),this._adapter.setItem(e,t)}_get(e){var t=this._adapter.getItem(e);if(t===null)return null;if(this.valuesAsBase64)try{t=atob(t)}catch{throw new Error("Failed to parse Base64 string while reading data. Did you try to read a value as Base64 that wasn't encoded as Base64 when written to storage?")}try{t=JSON.parse(t)}catch{throw new Error("Failed to JSON-parse data from storage. Did you try to read something that wasn't written with the Storage utility?")}return t.data}setItem(e,t){if(typeof e!="string")throw new Error("Key must be a string!");e=this.normalizeKey(e),this._set(e,t)}getItem(e){if(typeof e!="string")throw new Error("Key must be a string!");return e=this.normalizeKey(e),this._get(e)}getJson(e){return this.getItem(e)||null}setJson(e,t){e=this.normalizeKey(e),this._set(e,t)}deleteItem(e){if(typeof e!="string")throw new Error("Key must be a string!");e=this.normalizeKey(e),this._adapter.deleteItem(e)}clear(){this._adapter.clear(this._keysPrefix)}};Ht.defaultAdapters=[new rs.localStorage,new rs.sessionStorage,new rs.memory];wo.exports=Ht});var vo=y((qf,bo)=>{"use strict";var Nf=G(),ss=class{isBlocked(e,t){throw new Error("Not Implemented")}getPrice(e){throw new Error("Not Implemented")}},ns=class{constructor(e){this.position=e,this.gCost=0,this.hCost=0,this.parent=null,this.price=1}get fCost(){return this.gCost+this.hCost}};function Bu(r,e,t,i){return ku(r,e,t,i||{})}function ku(r,e,t,i){let s=i.allowDiagonal,n={};function o(w){let x=w.x+","+w.y;if(n[x])return n[x];let p=new ns(w);return n[x]=p,p}let a=o(e),l=o(t),h=[];h.push(a);let c=new Set;function _(w,x){let p=w.indexOf(x);p!==-1&&w.splice(p,1)}let m=-1;for(;h.length>0&&!(i.maxIterations&&m++>i.maxIterations);){let w=h[0];for(let p=1;p<h.length;p++)h[p].fCost<=w.fCost&&h[p].hCost<w.hCost&&(w=h[p]);if(_(h,w),c.add(w),w==l)return Fu(a,l);let x=[];for(let p=-1;p<=1;p++)for(let v=-1;v<=1;v++)p===0&&v===0||!s&&p!==0&&v!==0||x.push(o({x:w.position.x+p,y:w.position.y+v,z:w.position.z}));for(let p of x){if(c.has(p)||r.isBlocked(w.position,p.position))continue;let v=i.ignorePrices?1:r.getPrice(p.position),M=w.gCost+yo(w,p)*v,k=h.indexOf(p)!==-1;(!k||M<p.gCost)&&(p.gCost=M,p.hCost=yo(p,l),p.parent=w,k||h.push(p))}}return null}function Fu(r,e){let t=[],i=e;for(;i!==r;)t.unshift(i.position),i=i.parent;return t}function yo(r,e){let t=r.position.x-e.position.x,i=r.position.y-e.position.y;return Math.sqrt(t*t+i*i)}var Du={findPath:Bu,IGrid:ss};bo.exports=Du});var os=y((Uf,Eo)=>{"use strict";var Pu={Relative:"relative",AxisAligned:"axis-aligned",Absolute:"absolute"};Eo.exports=Pu});var Ao=y((Hf,So)=>{"use strict";var jt=We(),Me=os(),ci=it(),To=G(),X={};X.position=To.zero;X.positionMode=Me.Relative;X.scale=To.one;X.scaleMode=Me.AxisAligned;X.rotation=0;X.rotationMode=Me.Relative;var Vt=class{constructor(e,t,i){this._position=e||X.position.clone(),this._positionMode=X.positionMode,this._scale=i||X.scale.clone(),this._scaleMode=X.scaleMode,this._rotation=t||X.rotation,this._rotationMode=X.rotationMode,this.onChange=null}getPosition(){return this._position.clone()}getPositionMode(){return this._positionMode}setPosition(e){if(!this._position.equals(e))return this._position.copy(e),this._markDirty(!0,!1),this}setPositionX(e){if(this._position.x!==e)return this._position.x=e,this._markDirty(!0,!1),this}setPositionY(e){if(this._position.y!==e)return this._position.y=e,this._markDirty(!0,!1),this}move(e){return this._position.addSelf(e),this._markDirty(!0,!1),this}setPositionMode(e){if(this._positionMode!==e)return this._positionMode=e,this._markDirty(!1,!0),this}getScale(){return this._scale.clone()}getScaleMode(){return this._scaleMode}setScale(e){if(!this._scale.equals(e))return this._scale.copy(e),this._markDirty(!0,!1),this}setScaleX(e){if(this._scale.x!==e)return this._scale.x=e,this._markDirty(!0,!1),this}setScaleY(e){if(this._scale.y!==e)return this._scale.y=e,this._markDirty(!0,!1),this}scale(e){return this._scale.mulSelf(e),this._markDirty(!0,!1),this}setScaleMode(e){if(this._scaleMode!==e)return this._scaleMode=e,this._markDirty(!1,!0),this}getRotation(){return this._rotation}getRotationDegrees(){return jt.toDegrees(this._rotation)}getRotationDegreesWrapped(){let e=this.getRotationDegrees();return jt.wrapDegrees(e)}getRotationMode(){return this._rotationMode}setRotation(e,t){if(this._rotation!==e)return this._rotation=e,t&&(this._rotation<0||this._rotation>Math.PI*2)&&(this._rotation=Math.atan2(Math.sin(this._rotation),Math.cos(this._rotation))),this._markDirty(!0,!1),this}rotate(e,t){return this.setRotation(this._rotation+e,t),this}setRotationDegrees(e,t){let i=jt.toRadians(e,t);return this.setRotation(i)}rotateDegrees(e){return this._rotation+=jt.toRadians(e),this._markDirty(!0,!1),this}setRotationMode(e){if(this._rotationMode!==e)return this._rotationMode=e,this._markDirty(!1,!0),this}_markDirty(e,t){this._matrix=null,this.onChange&&this.onChange(this,e,t)}equals(e){return this._rotation===e._rotation&&this._position.equals(e._position)&&this._scale.equals(e._scale)}clone(){let e=new Vt(this._position.clone(),this._rotation,this._scale.clone());return e._rotationMode=this._rotationMode,e._positionMode=this._positionMode,e._scaleMode=this._scaleMode,e._matrix=this._matrix,e}serialize(){let e={};return this._position.equals(X.position)||(e.pos=this._position),this._positionMode!==X.positionMode&&(e.posm=this._positionMode),this._scale.equals(X.scale)||(e.scl=this._scale),this._scaleMode!==X.scaleMode&&(e.sclm=this._scaleMode),this._rotation!==X.rotation&&(e.rot=Math.floor(jt.toDegrees(this._rotation))),this._rotationMode!==X.rotationMode&&(e.rotm=this._rotationMode),e}deserialize(e){this._position.copy(e.pos||X.position),this._scale.copy(e.scl||X.scale),this._rotation=jt.toRadians(e.rot||X.rotation),this._positionMode=e.posm||X.positionMode,this._scaleMode=e.sclm||X.scaleMode,this._rotationMode=e.rotm||X.rotationMode,this._markDirty(!0,!0)}asMatrix(){if(this._matrix)return this._matrix;let e=[];return(this._position.x!==0||this._position.y!==0)&&e.push(ci.translate(this._position.x,this._position.y,0)),this._rotation&&e.push(ci.rotateZ(-this._rotation)),(this._scale.x!==1||this._scale.y!==1)&&e.push(ci.scale(this._scale.x,this._scale.y)),e.length===0?this._matrix=ci.identity:e.length===1?this._matrix=e[0]:this._matrix=ci.multiplyMany(e),this._matrix}static combine(e,t){var i=zu(e._position,t._position,t,e._positionMode),s=Lu(e._scale,t._scale,t,e._scaleMode),n=Ou(e._rotation,t._rotation,t,e._rotationMode);return new Vt(i,n,s)}};function Ou(r,e,t,i){switch(i){case Me.Absolute:return r;case Me.AxisAligned:case Me.Relative:return e+r;default:throw new Error("Unknown transform mode!")}}function zu(r,e,t,i){switch(i){case Me.Absolute:return r.clone();case Me.AxisAligned:return e.add(r);case Me.Relative:return e.add(r.rotatedRadians(t._rotation));default:throw new Error("Unknown transform mode!")}}function Lu(r,e,t,i){switch(i){case Me.Absolute:return r.clone();case Me.AxisAligned:return e.mul(r);case Me.Relative:return e.mul(r.rotatedRadians(t._rotation));default:throw new Error("Unknown transform mode!")}}So.exports=Vt});var fi=y((jf,Co)=>{"use strict";Co.exports={Vector2:G(),Vector3:Xi(),Rectangle:le(),Circle:et(),Line:Hi(),Color:qe(),Animator:Yr(),GameTime:Yi(),MathHelper:We(),SeededRandom:co(),Perlin:go(),Storage:xo(),StorageAdapter:is(),PathFinder:vo(),Transformation:Ao(),TransformationModes:os()}});var $i=y((Gf,Mo)=>{"use strict";var{Vector2:Ro,Color:Iu}=fi(),Vf=it(),as=class{constructor(e,t,i){this.position=e||Ro.zero,this.textureCoord=t||Ro.zero,this.color=i||Iu.white}transform(e){return this}setPosition(e){return this.position=e.clone(),this}setTextureCoords(e){return this.textureCoord=e.clone(),this}setColor(e){return this.color=e.clone(),this}};Mo.exports=as});var it=y((Wf,Bo)=>{"use strict";var Nu=G(),qu=$i(),Q=class{constructor(e,t){e||(e=Q.identity.values),t||t===void 0?this.values=e.slice(0):this.values=e}set(e,t,i,s,n,o,a,l,h,c,_,m,w,x,p,v){this.values=new Float32Array([e,t,i,s,n,o,a,l,h,c,_,m,w,x,p,v])}clone(){return new Q(this.values,!0)}equals(e){if(e===this)return!0;if(!e)return!1;for(let t=0;t<this.values.length;++t)if(this.values[t]!==e.values[t])return!1;return!0}static orthographic(e,t,i,s,n,o){return new Q([2/(t-e),0,0,0,0,2/(s-i),0,0,0,0,2/(n-o),0,(e+t)/(e-t),(i+s)/(i-s),(n+o)/(n-o),1],!1)}static perspective(e,t,i,s){var n=1/Math.tan(e/2),o=1/(i-s);return new Q([n/t,0,0,0,0,n,0,0,0,0,(i+s)*o,-1,0,0,i*s*o*2,0],!1)}static translate(e,t,i){return new Q([1,0,0,0,0,1,0,0,0,0,1,0,e||0,t||0,i||0,1],!1)}static scale(e,t,i){return new Q([e||1,0,0,0,0,t||1,0,0,0,0,i||1,0,0,0,0,1],!1)}static rotateX(e){let t=Math.sin,i=Math.cos;return new Q([1,0,0,0,0,i(e),-t(e),0,0,t(e),i(e),0,0,0,0,1],!1)}static rotateY(e){let t=Math.sin,i=Math.cos;return new Q([i(e),0,t(e),0,0,1,0,0,-t(e),0,i(e),0,0,0,0,1],!1)}static rotateZ(e){let t=Math.sin,i=Math.cos;return new Q([i(e),-t(e),0,0,t(e),i(e),0,0,0,0,1,0,0,0,0,1],!1)}static multiply(e,t){let i=[t.values[0],t.values[1],t.values[2],t.values[3]],s=[t.values[4],t.values[5],t.values[6],t.values[7]],n=[t.values[8],t.values[9],t.values[10],t.values[11]],o=[t.values[12],t.values[13],t.values[14],t.values[15]],a=rt(e.values,i),l=rt(e.values,s),h=rt(e.values,n),c=rt(e.values,o);return new Q([a[0],a[1],a[2],a[3],l[0],l[1],l[2],l[3],h[0],h[1],h[2],h[3],c[0],c[1],c[2],c[3]],!1)}static multiplyMany(e){let t=e[0];for(let i=1;i<e.length;i++)t=Q.multiply(t,e[i]);return t}static multiplyIntoFirst(e,t){let i=[t.values[0],t.values[1],t.values[2],t.values[3]],s=[t.values[4],t.values[5],t.values[6],t.values[7]],n=[t.values[8],t.values[9],t.values[10],t.values[11]],o=[t.values[12],t.values[13],t.values[14],t.values[15]],a=rt(e.values,i),l=rt(e.values,s),h=rt(e.values,n),c=rt(e.values,o);return e.set(a[0],a[1],a[2],a[3],l[0],l[1],l[2],l[3],h[0],h[1],h[2],h[3],c[0],c[1],c[2],c[3]),e}static multiplyManyIntoFirst(e){let t=e[0];for(let i=1;i<e.length;i++)t=Q.multiplyIntoFirst(t,e[i]);return t}static transformVertex(e,t){return new qu(Q.transformVector2(e,t.position),t.textureCoord,t.color)}static transformVector2(e,t){let i=t.x,s=t.y,n=t.z||0,o=e.values,a=1/(o[3]*i+o[7]*s+o[11]*n+o[15]),l=(o[0]*i+o[4]*s+o[8]*n+o[12])*a,h=(o[1]*i+o[5]*s+o[9]*n+o[13])*a;return new Nu(l,h)}static transformVector3(e,t){let i=t.x,s=t.y,n=t.z||0,o=e.values,a=1/(o[3]*i+o[7]*s+o[11]*n+o[15]),l=(o[0]*i+o[4]*s+o[8]*n+o[12])*a,h=(o[1]*i+o[5]*s+o[9]*n+o[13])*a,c=(o[2]*i+o[6]*s+o[10]*n+o[14])*a;return new Vector3(l,h,c)}};function rt(r,e){let t=r[0],i=r[1],s=r[2],n=r[3],o=r[4],a=r[5],l=r[6],h=r[7],c=r[8],_=r[9],m=r[10],w=r[11],x=r[12],p=r[13],v=r[14],M=r[15],k=e[0],F=e[1],re=e[2],j=e[3],H=k*t+F*o+re*c+j*x,B=k*i+F*a+re*_+j*p,I=k*s+F*l+re*m+j*v,se=k*n+F*h+re*w+j*M;return[H,B,I,se]}Q.identity=new Q([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],!1);Object.freeze(Q.identity);Bo.exports=Q});var Et=y((Qf,Do)=>{"use strict";var Xf=yt(),Yf=qe(),Uu=le(),{TextureFilterMode:$f,TextureFilterModes:Hu}=li(),{TextureWrapMode:Kf,TextureWrapModes:ko}=Wi(),Jf=it(),bt=ye().getLogger("gfx-effect"),Z=class{_build(e){let t=e.createProgram();{let i=Fo(e,this.vertexCode,e.VERTEX_SHADER);e.attachShader(t,i)}{let i=Fo(e,this.fragmentCode,e.FRAGMENT_SHADER);e.attachShader(t,i)}if(e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw bt.error("Error linking shader program:"),bt.error(e.getProgramInfoLog(t)),new Error("Failed to link shader program.");this._gl=e,this._program=t,this.uniforms={},this._uniformBinds={};for(let i in this.uniformTypes){let s=this._gl.getUniformLocation(this._program,i);if(s===-1)throw bt.error("Could not find uniform: "+i),new Error(`Uniform named '${i}' was not found in shader code!`);let n=this.uniformTypes[i];if(!vt._values.has(n.type))throw bt.error("Uniform has invalid type: "+n.type),new Error(`Uniform '${i}' have illegal value type '${n.type}'!`);n.type===vt.Matrix?function(a,l,h,c){a.uniforms[l]=_=>{a._gl[c](h,!1,_)}}(this,i,s,n.type):n.type===vt.Texture?function(a,l,h,c){a.uniforms[l]=(_,m)=>{m=m||0;let w=_.texture||_,x=a._gl["TEXTURE"+(m||0)];a._gl.activeTexture(x),a._gl.bindTexture(a._gl.TEXTURE_2D,w),a._gl.uniform1i(h,m||0),_.filter&&ju(a._gl,_.filter),_.wrapMode&&Vu(a._gl,_.wrapMode)}}(this,i,s,n.type):function(a,l,h,c){a.uniforms[l]=(_,m,w,x)=>{a._gl[c](h,_,m,w,x)}}(this,i,s,n.type);let o=n.bind;o&&(this._uniformBinds[o]=i)}this.attributes={},this._attributeBinds={};for(let i in this.attributeTypes){let s=this._gl.getAttribLocation(this._program,i);if(s===-1)throw bt.error("Could not find attribute: "+i),new Error(`Attribute named '${i}' was not found in shader code!`);let n=this.attributeTypes[i];(function(a,l,h,c){a.attributes[l]=_=>{_?(a._gl.bindBuffer(a._gl.ARRAY_BUFFER,_),a._gl.vertexAttribPointer(h,c.size,a._gl[c.type]||a._gl.FLOAT,c.normalize||!1,c.stride||0,c.offset||0),a._gl.enableVertexAttribArray(h)):a._gl.disableVertexAttribArray(h)}})(this,i,s,n);let o=n.bind;o&&(this._attributeBinds[o]=i)}this._cachedValues={}}get uniformTypes(){throw new Error("Not Implemented!")}get attributeTypes(){throw new Error("Not Implemented!")}setAsActive(){this._gl.useProgram(this._program),this.enableDepthTest?this._gl.enable(this._gl.DEPTH_TEST):this._gl.disable(this._gl.DEPTH_TEST),this.enableFaceCulling?this._gl.enable(this._gl.CULL_FACE):this._gl.disable(this._gl.CULL_FACE),this.enableStencilTest?this._gl.enable(this._gl.STENCIL_TEST):this._gl.disable(this._gl.STENCIL_TEST),this.enableDithering?this._gl.enable(this._gl.DITHER):this._gl.disable(this._gl.DITHER),this._cachedValues={}}prepareToDrawBatch(e,t){this._cachedValues={},this.setPositionsAttribute(e.positions),this.setTextureCoordsAttribute(e.textureCoords),this.setColorsAttribute(e.colors),this.setWorldMatrix(t)}get vertexCode(){throw new Error("Not Implemented!")}get fragmentCode(){throw new Error("Not Implemented!")}get enableDepthTest(){return!1}get enableFaceCulling(){return!1}get enableStencilTest(){return!1}get enableDithering(){return!1}setTexture(e){if(e===this._cachedValues.texture)return!1;let t=this._uniformBinds[Z.UniformBinds.MainTexture];if(t){this._cachedValues.texture=e;let i=e.texture||e;return this._gl.activeTexture(this._gl.TEXTURE0),this._gl.bindTexture(this._gl.TEXTURE_2D,i),this.uniforms[t](e,0),!0}return!1}setColor(e){let t=this._uniformBinds[Z.UniformBinds.Color];if(t){if(e.equals(this._cachedValues.color))return;this._cachedValues.color=e.clone(),this.uniforms[t](e.floatArray)}}setUvOffsetAndScale(e,t){if(e){if(e.equals(this._cachedValues.sourceRect))return}else if(this._cachedValues.sourceRect===null)return;this._cachedValues.sourceRect=e?e.clone():null,e||(e=new Uu(0,0,t.width,t.height));let i=this._uniformBinds[Z.UniformBinds.UvOffset];i&&this.uniforms[i](e.x/t.width,e.y/t.height);let s=this._uniformBinds[Z.UniformBinds.UvScale];s&&this.uniforms[s](e.width/t.width,e.height/t.height)}setProjectionMatrix(e){let t=this._uniformBinds[Z.UniformBinds.Projection];if(t){if(e.equals(this._cachedValues.projection))return;this._cachedValues.projection=e.clone(),this.uniforms[t](e.values)}}setWorldMatrix(e){let t=this._uniformBinds[Z.UniformBinds.World];t&&this.uniforms[t](e.values)}setPositionsAttribute(e){let t=this._attributeBinds[Z.AttributeBinds.Position];if(t){if(e===this._cachedValues.positions)return;this._cachedValues.positions=e,this.attributes[t](e)}}setTextureCoordsAttribute(e){let t=this._attributeBinds[Z.AttributeBinds.TextureCoords];if(t){if(e===this._cachedValues.coords)return;this._cachedValues.coords=e,this.attributes[t](e)}}setColorsAttribute(e){let t=this._attributeBinds[Z.AttributeBinds.Colors];if(t){if(e===this._cachedValues.colors)return;this._cachedValues.colors=e,this.attributes[t](e)}}};function Fo(r,e,t){let i=r.createShader(t);if(r.shaderSource(i,e),r.compileShader(i),!r.getShaderParameter(i,r.COMPILE_STATUS))throw bt.error(`Error compiling ${t===r.VERTEX_SHADER?"vertex":"fragment"} shader:`),bt.error(r.getShaderInfoLog(i)),new Error("Failed to compile a shader.");return i}var vt={Texture:"texture",Matrix:"uniformMatrix4fv",Color:"uniform4fv",Float:"uniform1f",FloatArray:"uniform1fv",Int:"uniform1i",IntArray:"uniform1iv",Float2:"uniform2f",Float2Array:"uniform2fv",Int2:"uniform2i",Int2Array:"uniform2iv",Float3:"uniform3f",Float3Array:"uniform3fv",Int3:"uniform3i",Int3Array:"uniform3iv",Float4:"uniform4f",Float4Array:"uniform4fv",Int4:"uniform4i",Int4Array:"uniform4iv"};Object.defineProperty(vt,"_values",{value:new Set(Object.values(vt)),writable:!1});Object.freeze(vt);Z.UniformTypes=vt;Z.UniformBinds={MainTexture:"texture",Color:"color",Projection:"projection",World:"world",UvOffset:"uvOffset",UvScale:"uvScale"};Object.freeze(Z.UniformBinds);Z.AttributeTypes={Byte:"BYTE",Short:"SHORT",UByte:"UNSIGNED_BYTE",UShort:"UNSIGNED_SHORT",Float:"FLOAT",HalfFloat:"HALF_FLOAT"};Object.freeze(Z.AttributeTypes);Z.AttributeBinds={Position:"position",TextureCoords:"uvs",Colors:"colors"};Object.freeze(Z.AttributeBinds);function ju(r,e){if(!Hu._values.has(e))throw new Error("Invalid texture filter mode! Please pick a value from 'TextureFilterModes'.");let t=r[e];r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,t),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,t)}function Vu(r,e,t){if(t===void 0&&(t=e),!ko._values.has(e))throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");if(!ko._values.has(t))throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r[e]),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r[t])}Do.exports=Z});var Oo=y((Zf,Po)=>{"use strict";var ve=Et(),Gu=`
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
    `,Wu=`  
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
    `,ls=class extends ve{get vertexCode(){return Gu}get fragmentCode(){return Wu}get uniformTypes(){return{texture:{type:ve.UniformTypes.Texture,bind:ve.UniformBinds.MainTexture},projection:{type:ve.UniformTypes.Matrix,bind:ve.UniformBinds.Projection},world:{type:ve.UniformTypes.Matrix,bind:ve.UniformBinds.World}}}get attributeTypes(){return{position:{size:3,type:ve.AttributeTypes.Float,normalize:!1,bind:ve.AttributeBinds.Position},coord:{size:2,type:ve.AttributeTypes.Float,normalize:!1,bind:ve.AttributeBinds.TextureCoords},color:{size:4,type:ve.AttributeTypes.Float,normalize:!1,bind:ve.AttributeBinds.Colors}}}};Po.exports=ls});var Lo=y((e_,zo)=>{"use strict";var Ee=Et(),Xu=`#version 300 es
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
}`,Yu=`#version 300 es
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
}`,us=class extends Ee{get vertexCode(){return Xu}get fragmentCode(){return Yu}get uniformTypes(){return{u_texture:{type:Ee.UniformTypes.Texture,bind:Ee.UniformBinds.MainTexture},u_projection:{type:Ee.UniformTypes.Matrix,bind:Ee.UniformBinds.Projection},u_world:{type:Ee.UniformTypes.Matrix,bind:Ee.UniformBinds.World}}}get attributeTypes(){return{a_position:{size:3,type:Ee.AttributeTypes.Float,normalize:!1,bind:Ee.AttributeBinds.Position},a_coord:{size:2,type:Ee.AttributeTypes.Float,normalize:!1,bind:Ee.AttributeBinds.TextureCoords},a_color:{size:4,type:Ee.AttributeTypes.Float,normalize:!1,bind:Ee.AttributeBinds.Colors}}}};zo.exports=us});var No=y((t_,Io)=>{"use strict";Io.exports={Effect:Et(),BasicEffect:Oo(),MsdfFontEffect:Lo()}});var Ki=y((i_,qo)=>{"use strict";var{Color:$u}=fi(),hs=class{constructor(e,t,i,s,n){this.positions=e,this.textureCoords=t,this.colors=i,this.indices=s,this.indicesCount=n,this.__color=new $u(-1,-1,-1,-1),Object.freeze(this)}overrideColors(e,t){if(t.equals(this.__color))return;this.__color.copy(t),e.bindBuffer(e.ARRAY_BUFFER,this.colors);let i=[];for(let s=0;s<this.indicesCount;++s)i.push(t.r),i.push(t.g),i.push(t.b),i.push(t.a);e.bufferData(e.ARRAY_BUFFER,new Float32Array(i),e.DYNAMIC_DRAW)}};qo.exports=hs});var Ho=y((r_,Uo)=>{"use strict";var Ku=Ki(),ds=class{constructor(e){this._gl=e}quad(){let e=this._gl,t=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,t);let i=.5,s=[-i,-i,0,i,-i,0,-i,i,0,i,i,0];e.bufferData(e.ARRAY_BUFFER,new Float32Array(s),e.STATIC_DRAW);let n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n);let o=[0,0,1,0,0,1,1,1];e.bufferData(e.ARRAY_BUFFER,new Float32Array(o),e.STATIC_DRAW);let a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a);let l=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];e.bufferData(e.ARRAY_BUFFER,new Float32Array(l),e.DYNAMIC_DRAW);let h=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,h);let c=[0,1,3,2];return e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(c),e.STATIC_DRAW),new Ku(t,n,a,h,c.length)}};Uo.exports=ds});var Go=y((n_,Vo)=>{"use strict";var Ju=le(),s_=G(),jo=it(),cs=class{constructor(e){this.projection=null,this._region=null,this._gfx=e,this.orthographic(),this._viewport=null}get viewport(){return this._viewport}set viewport(e){return this._viewport=e,e}getRegion(){return this._region.clone()}orthographicOffset(e,t,i,s){let n=t||!this.viewport?this._gfx.getCanvasSize():this.viewport.getSize(),o=new Ju(e.x,e.y,n.x,n.y);this.orthographic(o,i,s)}orthographic(e,t,i){e===void 0&&(e=this._gfx.getRenderingRegion()),this._region=e,this.projection=jo.orthographic(e.left,e.right,e.bottom,e.top,t||-1,i||400)}_perspective(e,t,i,s){this.projection=jo.perspective(e||Math.PI/2,t||1,i||.1,s||1e3)}};Vo.exports=cs});var Ji=y((u_,Wo)=>{"use strict";var o_=yt(),Qu=qe(),Zu=le(),_i=G(),a_=Xi(),{BlendMode:l_,BlendModes:eh}=Ui(),pi=class{constructor(e,t){this.texture=e,this.position=new _i(0,0),t?this.size=new _i(t.width,t.height):e&&e.valid?this.size=e.size.clone():this.size=new _i(100,100),this.sourceRect=t||null,this.blendMode=eh.AlphaBlend,this.rotation=0,this.origin=new _i(.5,.5),this.skew=new _i(0,0),this.color=Qu.white,this.static=!1}setSourceFromSpritesheet(e,t,i,s){i=i||0;let n=this.texture.width/t.x,o=this.texture.height/t.y,a=n*e.x+i,l=o*e.y+i;n-=2*i,o-=2*i,(s||s===void 0)&&this.size.set(n,o),this.sourceRect?this.sourceRect.set(a,l,n,o):this.sourceRect=new Zu(a,l,n,o)}clone(){let e=new pi(this.texture,this.sourceRect);return e.position=this.position.clone(),e.size=this.size.clone(),e.blendMode=this.blendMode,e.rotation=this.rotation,e.origin=this.origin.clone(),e.color=this.color.clone(),e.static=this.static,e}updateStaticProperties(){this._cachedVertices=null}get flipX(){return this.size.x<0}set flipX(e){return e===void 0&&(e=!this.flipX),this.size.x=Math.abs(this.size.x)*(e?-1:1),e}get flipY(){return this.size.y<0}set flipY(e){return e===void 0&&(e=!this.flipY),this.size.y=Math.abs(this.size.y)*(e?-1:1),e}};Wo.exports=pi});var $o=y((c_,Yo)=>{"use strict";var h_=qe(),Xo=G(),Qi=it(),d_=Ji(),fs=class{constructor(){this._sprites=[],this.rotation=0,this.position=new Xo(0,0),this.scale=new Xo(1,1)}forEach(e){this._sprites.forEach(e)}setColor(e){for(let t=0;t<this._sprites.length;++t)this._sprites[t].color.copy(e)}getTransform(){let e=[];return(this.position.x!==0||this.position.y!==0)&&e.push(Qi.translate(this.position.x,this.position.y,0)),this.rotation&&e.push(Qi.rotateZ(-this.rotation)),(this.scale.x!==1||this.scale.y!==1)&&e.push(Qi.scale(this.scale.x,this.scale.y)),e.length===0?null:e.length===1?e[0]:Qi.multiplyMany(e)}add(e){return this._sprites.push(e),e}remove(e){for(let t=0;t<this._sprites.length;++t)if(this._sprites[t]===e){this._sprites.splice(t,1);return}}shift(){return this._sprites.shift()}sort(e){this._sprites.sort(e)}sortForBatching(){this._sprites.sort((e,t)=>{let i=e.texture.url+e.blendMode,s=t.texture.url+t.blendMode;return i>s?1:s>i?-1:0})}get count(){return this._sprites.length}};Yo.exports=fs});var Zi=y((f_,Qo)=>{"use strict";var th=mt(),Ko=G(),ih=le(),rh=yt(),Gt=class extends th{constructor(e){super(e),this._fontName=null,this._fontSize=null,this._placeholderChar=null,this._sourceRects=null,this._texture=null,this._lineHeight=0}get lineHeight(){return this._lineHeight}get fontName(){return this._fontName}get fontSize(){return this._fontSize}get placeholderCharacter(){return this._placeholderChar}get texture(){return this._texture}load(e){return new Promise(async(t,i)=>{if(!e||!e.fontName)return i("When loading font texture you must provide params with a 'fontName' value!");this._placeholderChar=(e.missingCharPlaceholder||"?")[0];let s=e.smoothFont===void 0?!0:e.smoothFont,n=e.extraPadding||{x:0,y:0},o=e.maxTextureWidth||1024,a=e.charactersSet||Gt.defaultCharactersSet;a.indexOf(this._placeholderChar)===-1&&(a+=this._placeholderChar);let l=new FontFace(e.fontName,`url(${this.url})`);await l.load(),document.fonts.add(l),this._fontName=e.fontName,this._fontSize=e.fontSize||52;let h={x:10,y:5},c=this.fontSize.toString()+"px "+this.fontName,_=sh(this.fontName,this.fontSize,void 0,n.y),m=nh(this.fontName,this.fontSize,void 0,n.x);this._lineHeight=_;let w=new Ko(m+h.x*2,_+h.y*2),x=Math.floor(o/w.x),p=Math.min(a.length*w.x,o),v=Math.ceil(a.length/x)*w.y;(e.enforceTexturePowerOfTwo||e.enforceTexturePowerOfTwo===void 0)&&(p=Jo(p),v=Jo(v)),this._sourceRects={};let M=document.createElement("canvas");M.width=p,M.height=v,s||(M.style.webkitFontSmoothing="none",M.style.fontSmooth="never",M.style.textRendering="geometricPrecision");let k=M.getContext("2d");k.textBaseline="bottom",k.font=c,k.fillStyle="#ffffffff",k.imageSmoothingEnabled=s;let F=0,re=0;for(let H=0;H<a.length;++H){let B=a[H],I=Math.ceil(k.measureText(B).width+n.x);F+I>p&&(re+=Math.round(_+h.y),F=0);let se=e.sourceRectOffsetAdjustment||{x:0,y:0},fe=new ih(F+se.x,re+se.y,I,_);this._sourceRects[B]=fe,k.fillText(B,F,re+_),F+=Math.round(I+h.x)}if(!s){let H=k.getImageData(0,0,k.canvas.width,k.canvas.height),B=H.data;for(let I=0;I<B.length;I+=4)B[I+3]>0&&(B[I+3]<255||B[I]<255||B[I+1]<255||B[I+2]<255)&&(B[I+3]=0);k.putImageData(H,0,0)}let j=new Image;j.src=M.toDataURL("image/png"),j.onload=()=>{let H=new rh(this.url+"__font-texture");H.fromImage(j),this._texture=H,this._notifyReady(),t()}})}get valid(){return Boolean(this._texture)}getSourceRect(e){return this._sourceRects[e]||this._sourceRects[this.placeholderCharacter]}getPositionOffset(e){return Ko.zero}getXAdvance(e){return this.getSourceRect(e).width}destroy(){this._texture&&this._texture.destroy(),this._fontName=null,this._fontSize=null,this._placeholderChar=null,this._sourceRects=null,this._texture=null,this._lineHeight=0}};Gt.defaultCharactersSet=" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE";function Jo(r){let e=2;for(;e<r;){if(e>=r)return e;e=e*2}return e}function sh(r,e,t,i){let s=document.createElement("pre");s.style.fontFamily=r,s.style.fontSize=e+"px",s.style.paddingBottom=s.style.paddingLeft=s.style.paddingTop=s.style.paddingRight="0px",s.style.marginBottom=s.style.marginLeft=s.style.marginTop=s.style.marginRight="0px",s.textContent=t||"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",document.body.appendChild(s);let n=s.getBoundingClientRect().height+(i||0);return document.body.removeChild(s),Math.ceil(n)}function nh(r,e,t,i){if(t===`
`||t==="\r")return 0;let n=document.createElement("canvas").getContext("2d");n.font=e.toString()+"px "+r;let o=0,a=t||"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";for(let l=0;l<a.length;++l)o=Math.max(o,n.measureText(a[l]).width+(i||0));return Math.ceil(o)}Qo.exports=Gt});var ps=y((__,Zo)=>{"use strict";var oh=mt(),_s=class extends oh{constructor(e){super(e),this._data=null}load(){return new Promise((e,t)=>{var i=new XMLHttpRequest;i.open("GET",this.url,!0),i.responseType="json",i.onload=()=>{i.readyState==4&&(i.response?(this._data=i.response,this._notifyReady(),e()):i.status===200?t("Response is not a valid JSON!"):t(i.statusText))},i.onerror=s=>{t(s)},i.send()})}create(e){return new Promise((t,i)=>{try{e?typeof e=="string"?e=JSON.parse(e):e=JSON.parse(JSON.stringify(e)):e={}}catch{return i("Data is not a valid JSON serializable object!")}this._data=e,this._notifyReady(),t()})}get data(){return this._data}get valid(){return Boolean(this._data)}destroy(){this._data=null}};Zo.exports=_s});var ms=y((g_,ea)=>{"use strict";var ah=G(),lh=le(),uh=yt(),hh=Zi(),dh=ps(),p_=li(),gs=class extends hh{constructor(e){super(e),this._positionOffsets=null,this._xAdvances=null}load(e){return new Promise(async(t,i)=>{if(!e||!e.jsonUrl||!e.textureUrl)return i("When loading an msdf font you must provide params with a 'jsonUrl' and a 'textureUrl'!");let s=new dh(e.jsonUrl),n=new uh(e.textureUrl);await Promise.all([s.load(),n.load()]);let o=s.data;if(n.filter="LINEAR",o.common.pages>1)throw new Error("Can't use MSDF font with several pages");if(this._placeholderChar=(e.missingCharPlaceholder||"?")[0],!o.info.charset.includes(this._placeholderChar))throw new Error("The atlas' charset doesn't include the given placeholder character");this._fontName=o.info.face,this._fontSize=o.info.size,this._lineHeight=o.common.lineHeight,this._sourceRects={},this._positionOffsets={},this._xAdvances={},this._kernings={};for(let a of o.chars){let l=a.char,h=new lh(a.x,a.y,a.width,a.height);this._sourceRects[l]=h,this._positionOffsets[l]=new ah(a.xoffset,a.yoffset),this._xAdvances[l]=a.xadvance}this._texture=n,this._notifyReady(),t()})}getPositionOffset(e){return this._positionOffsets[e]||this._positionOffsets[this.placeholderCharacter]}getXAdvance(e){return this._xAdvances[e]||this._xAdvances[this.placeholderCharacter]}destroy(){super.destroy(),this._positionOffsets=null,this._xAdvances=null,this._kernings=null}};ea.exports=gs});var ws=y((m_,ia)=>{"use strict";var ta={Left:"left",Right:"right",Center:"center"};Object.freeze(ta);ia.exports={TextAlignments:ta}});var sa=y((x_,ra)=>{"use strict";var{Rectangle:ch,Color:w_}=fi(),er=G(),fh=$i(),{BlendModes:_h}=Ui(),ph=it(),gh=Ki(),xs=ye().getLogger("gfx"),ys=class{constructor(e){this._gfx=e,this._gl=e._gl,this._positions=e._dynamicBuffers.positionArray,this._uvs=e._dynamicBuffers.textureArray,this._colors=e._dynamicBuffers.colorsArray,this._positionsBuff=e._dynamicBuffers.positionBuffer,this._uvsBuff=e._dynamicBuffers.textureCoordBuffer,this._colorsBuff=e._dynamicBuffers.colorsBuffer,this._indexBuff=e._dynamicBuffers.indexBuffer,this.snapPixels=!0,this.applyAntiBleeding=!0}vertex(e,t,i){return new fh(e,t,i)}get drawing(){return this._drawing}begin(e,t){this._drawing&&xs.error("Start drawing a batch while already drawing a batch!"),e&&this._gfx.useEffect(e),this._effect=this._gfx._activeEffect,this._currBlend=_h.AlphaBlend,this._currTexture=null,this._currBatchCount=0,this._transform=t,this._drawing=!0}end(){this._drawing||xs.error("Stop drawing a batch without starting it first!"),this._currBatchCount&&this._drawCurrentBatch(),this._drawing=!1}setTexture(e){e!==this._currTexture&&(this._currBatchCount&&this._drawCurrentBatch(),this._currTexture=e)}draw(e,t){e.length===void 0&&(e=[e]);let i=t?this._gfx.getRenderingRegion():null,s=this._positions,n=this._uvs,o=this._colors;for(let h of e){this._currBatchCount&&(this._currBatchCount>=this.batchSpritesCount||h.blendMode!==this._currBlend||h.texture!==this._currTexture)&&this._drawCurrentBatch(),this._currTexture=h.texture,this._currBlend=h.blendMode;let c=this._currBatchCount*4*4;if(h.color instanceof Array){let B=h.color[0];for(let I=0;I<4;++I){let se=h.color[I]||B;o[c+I*4+0]=se.r,o[c+I*4+1]=se.g,o[c+I*4+2]=se.b,o[c+I*4+3]=se.a,B=se}}else for(let B=0;B<4;++B)o[c+B*4+0]=h.color.r,o[c+B*4+1]=h.color.g,o[c+B*4+2]=h.color.b,o[c+B*4+3]=h.color.a;if(h.static&&h._cachedVertices){let B=h._cachedVertices[0],I=h._cachedVertices[1],se=h._cachedVertices[2],fe=h._cachedVertices[3],ge=this._currBatchCount*4*3;s[ge+0]=B.position.x,s[ge+1]=B.position.y,s[ge+2]=B.position.z||0,s[ge+3]=I.position.x,s[ge+4]=I.position.y,s[ge+5]=I.position.z||0,s[ge+6]=se.position.x,s[ge+7]=se.position.y,s[ge+8]=se.position.z||0,s[ge+9]=fe.position.x,s[ge+10]=fe.position.y,s[ge+11]=fe.position.z||0;let Ne=this._currBatchCount*4*2;n[Ne+0]=B.textureCoord.x,n[Ne+1]=B.textureCoord.y,n[Ne+2]=fe.textureCoord.x,n[Ne+3]=B.textureCoord.y,n[Ne+4]=B.textureCoord.x,n[Ne+5]=fe.textureCoord.y,n[Ne+6]=fe.textureCoord.x,n[Ne+7]=fe.textureCoord.y,this._currBatchCount++;continue}let _=h.size.x,m=h.size.y,w=-_*h.origin.x,x=-m*h.origin.y,p=new er(w,x),v=new er(w+_,x),M=new er(w,x+m),k=new er(w+_,x+m);if(h.skew&&(h.skew.x&&(p.x+=h.skew.x*h.origin.y,v.x+=h.skew.x*h.origin.y,M.x-=h.skew.x*(1-h.origin.y),k.x-=h.skew.x*(1-h.origin.y)),h.skew.y&&(p.y+=h.skew.y*h.origin.x,M.y+=h.skew.y*h.origin.x,v.y-=h.skew.y*(1-h.origin.x),k.y-=h.skew.y*(1-h.origin.x))),h.rotation){let se=function(fe){let ge=fe.x*B-fe.y*I,Ne=fe.x*I+fe.y*B;fe.set(ge,Ne)},B=Math.cos(h.rotation),I=Math.sin(h.rotation);se(p),se(v),se(M),se(k)}p.addSelf(h.position),v.addSelf(h.position),M.addSelf(h.position),k.addSelf(h.position),this.snapPixels&&(p.floorSelf(),v.floorSelf(),M.floorSelf(),k.floorSelf());let F=h.position.z||0,re=h.size.z||0;if(t){let B=ch.fromPoints([p,v,M,k]);if(!i.collideRect(B))continue}let j=this._currBatchCount*4*3;s[j+0]=p.x,s[j+1]=p.y,s[j+2]=F,s[j+3]=v.x,s[j+4]=v.y,s[j+5]=F,s[j+6]=M.x,s[j+7]=M.y,s[j+8]=F+re,s[j+9]=k.x,s[j+10]=k.y,s[j+11]=F+re;let H=this._currBatchCount*4*2;var a,l;if(h.sourceRect){if(a={x:h.sourceRect.x/this._currTexture.width,y:h.sourceRect.y/this._currTexture.height},l={x:a.x+h.sourceRect.width/this._currTexture.width,y:a.y+h.sourceRect.height/this._currTexture.height},h.rotation&&this.applyAntiBleeding){let B=.015/this._currTexture.width,I=.015/this._currTexture.height;a.x+=B,l.x-=B*2,a.y+=I,l.y-=I*2}n[H+0]=a.x,n[H+1]=a.y,n[H+2]=l.x,n[H+3]=a.y,n[H+4]=a.x,n[H+5]=l.y,n[H+6]=l.x,n[H+7]=l.y}else n[H+0]=0,n[H+1]=0,n[H+2]=1,n[H+3]=0,n[H+4]=0,n[H+5]=1,n[H+6]=1,n[H+7]=1;h.static&&(h._cachedVertices=[{position:p,textureCoord:a||{x:0,y:0}},{position:v},{position:M},{position:k,textureCoord:l||{x:1,y:1}}]),this._currBatchCount++}}pushVertices(e){if(!e||e.length!==4)throw new Error("Vertices must be array of 4 values!");let t=this._positions,i=this._uvs,s=this._colors;for(let _=0;_<e.length;++_){let m=e[_],w=this._currBatchCount*(4*4)+_*4;s[w+0]=m.color.r,s[w+1]=m.color.g,s[w+2]=m.color.b,s[w+3]=m.color.a}let n=e[0].position,o=e[1].position,a=e[2].position,l=e[3].position,h=this._currBatchCount*4*3;t[h+0]=n.x,t[h+1]=n.y,t[h+2]=n.z||0,t[h+3]=o.x,t[h+4]=o.y,t[h+5]=o.z||0,t[h+6]=a.x,t[h+7]=a.y,t[h+8]=a.z||0,t[h+9]=l.x,t[h+10]=l.y,t[h+11]=l.z||0;let c=this._currBatchCount*(4*2);i[c++]=e[0].textureCoord.x/this._currTexture.width,i[c++]=e[0].textureCoord.y/this._currTexture.height,i[c++]=e[1].textureCoord.x/this._currTexture.width,i[c++]=e[1].textureCoord.y/this._currTexture.height,i[c++]=e[2].textureCoord.x/this._currTexture.width,i[c++]=e[2].textureCoord.y/this._currTexture.height,i[c++]=e[3].textureCoord.x/this._currTexture.width,i[c++]=e[3].textureCoord.y/this._currTexture.height,this._currBatchCount++}get batchSpritesCount(){return this._gfx.batchSpritesCount}_drawCurrentBatch(){let e=this._gl,t=this._transform,i=this._positions,s=this._uvs,n=this._colors,o=this._positionsBuff,a=this._uvsBuff,l=this._colorsBuff,h=this._indexBuff;this._effect!==this._gfx._activeEffect&&xs.error("Effect changed while drawing batch!"),this._gfx._setBlendMode(this._currBlend);let c=new gh(o,a,l,h,this._currBatchCount*6);this._gfx._activeEffect.prepareToDrawBatch(c,t||ph.identity),this._gfx._setActiveTexture(this._currTexture);let _=this._currBatchCount<this.batchSpritesCount/2;e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,_?i.slice(0,this._currBatchCount*4*3):i,e.DYNAMIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,_?s.slice(0,this._currBatchCount*4*2):s,e.DYNAMIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,_?n.slice(0,this._currBatchCount*4*4):n,e.DYNAMIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,h),this._currIndices=null,e.drawElements(e.TRIANGLES,this._currBatchCount*6,e.UNSIGNED_SHORT,0),this._gfx._drawCallsCount++,this._gfx._drawQuadsCount+=this._currBatchCount,this._currBatchCount=0}};ra.exports=ys});var da=y((S_,ha)=>{"use strict";var mh=pt(),sr=qe(),{BlendMode:y_,BlendModes:ue}=Ui(),tr=le(),{Effect:na,BasicEffect:oa,MsdfFontEffect:aa}=No(),la=yt(),{TextureFilterMode:b_,TextureFilterModes:bs}=li(),{TextureWrapMode:v_,TextureWrapModes:ir}=Wi(),wh=Ho(),ua=it(),xh=Go(),rr=Ji(),vs=$o(),Te=G(),E_=Zi(),yh=ms(),{TextAlignment:T_,TextAlignments:gi}=ws(),bh=Ki(),vh=et(),Eh=sa(),Th=Xi(),Sh=$i(),Ah=sr.white,mi=ye().getLogger("gfx"),Es=class extends mh{constructor(){super(),this._gl=null,this._initSettings={antialias:!0,alpha:!0,depth:!1,premultipliedAlpha:!0,desynchronized:!1},this._canvas=null,this._lastBlendMode=null,this._activeEffect=null,this._camera=null,this._projection=null,this._currIndices=null,this._dynamicBuffers=null,this._fb=null,this.builtinEffects={},this.meshes={},this.defaultTextureFilter=bs.Nearest,this.defaultTextureWrapMode=ir.Clamp,this.whiteTexture=null,this._renderTarget=null,this._viewport=null,this._drawCallsCount=0,this._drawQuadsCount=0,this.spritesBatch=null}get batchSpritesCount(){return 2048}get maxLineSegments(){return 512}setContextAttributes(e){if(this._gl)throw new Error("Can't call setContextAttributes() after gfx was initialized!");this._initSettings=e}setCanvas(e){if(this._gl)throw new Error("Can't call setCanvas() after gfx was initialized!");this._canvas=e}get canvas(){return this._canvas}get Effect(){return na}get BasicEffect(){return oa}get MsdfFontEffect(){return aa}get Sprite(){return rr}get SpritesGroup(){return vs}get Matrix(){return ua}get Vertex(){return Sh}get TextAlignments(){return gi}get TextAlignment(){return this._TextAlignment_dep||(console.warn("'gfx.TextAlignment' is deprecated and will be removed in future versions. Please use 'gfx.TextAlignments' instead."),this._TextAlignment_dep=!0),gi}createCamera(e){let t=new xh(this);return e&&(t.viewport=this.getRenderingRegion()),t}setCameraOrthographic(e){let t=this.createCamera();return t.orthographicOffset(e),this.applyCamera(t),t}createEffect(e){if(!(e.prototype instanceof na))throw new Error("'type' must be a class type that inherits from 'Effect'.");let t=new e;return t._build(this._gl),t}maximizeCanvasSize(e,t){let i=0,s=0;if(e){let n=this._canvas.parentElement;i=n.clientWidth-this._canvas.offsetLeft,s=n.clientHeight-this._canvas.offsetTop}else i=window.innerWidth,s=window.innerHeight,this._canvas.style.left="0px",this._canvas.style.top="0px";t||(i%2!==0&&i++,s%2!==0&&s++),(this._canvas.width!==i||this._canvas.height!==s)&&this.setResolution(i,s,!0)}setRenderTarget(e,t){if(this.presentBufferedData(),e===null){this._renderTarget=null,this._gl.bindFramebuffer(this._gl.FRAMEBUFFER,null),this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL,!1),t||this.resetCamera();return}e instanceof Array||(e=[e]),this._gl.bindFramebuffer(this._gl.FRAMEBUFFER,this._fb),this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL,!1);var i=[];for(let s=0;s<e.length;++s){let n=this._gl["COLOR_ATTACHMENT"+s];this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER,n,this._gl.TEXTURE_2D,e[s].texture,0),s===0&&(this._renderTarget=e[s]),i.push(n)}this._gl.drawBuffers(i),t||this.resetCamera()}useEffect(e){if(this.presentBufferedData(),e===null){this.useEffect(this.builtinEffects.Basic);return}this._activeEffect!==e&&(e.setAsActive(),this._activeEffect=e,this._projection&&this._activeEffect.setProjectionMatrix(this._projection))}setResolution(e,t,i){this.presentBufferedData(),this._canvas.width=e,this._canvas.height=t,(e%2!==0||t%2!==0)&&mi.warn("Resolution to set is not even numbers; This might cause minor artefacts when using texture atlases. Consider using even numbers instead."),i&&(this._canvas.style.width=e+"px",this._canvas.style.height=t+"px"),this._gl.viewport(0,0,e,t),this.resetCamera()}resetCamera(){this._camera=this.createCamera();let e=this.getRenderingSize();this._camera.orthographic(new tr(0,0,e.x,e.y)),this.applyCamera(this._camera)}applyCamera(e){this.presentBufferedData(),this._viewport=e.viewport;let t=this.getRenderingRegion(!0);this._gl.viewport(t.x,t.y,t.width,t.height),this._projection=e.projection.clone(),this._activeEffect&&this._activeEffect.setProjectionMatrix(this._projection)}getRenderingRegion(e){if(this._viewport){let t=this._viewport.clone();return e===!1&&(t.x=t.y=0),t}return new tr(0,0,(this._renderTarget||this._canvas).width,(this._renderTarget||this._canvas).height)}getRenderingSize(){return this.getRenderingRegion().getSize()}getCanvasSize(){return new Te(this._canvas.width,this._canvas.height)}setup(){return new Promise(async(e,t)=>{if(mi.info("Setup gfx manager.."),this._canvas||(this._canvas=document.createElement("canvas")),this._gl=this._canvas.getContext("webgl2",this._initSettings)||this._canvas.getContext("webgl",this._initSettings),!this._gl)return mi.error("Can't get WebGL context!"),t("Failed to get WebGL context from canvas!");this.builtinEffects.Basic=this.createEffect(oa),this.builtinEffects.MsdfFont=this.createEffect(aa),la._setWebGl(this._gl),this._fb=this._gl.createFramebuffer();let i=new wh(this._gl);this.meshes={quad:i.quad()},Object.freeze(this.meshes);let s=new Image;s.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",await new Promise((l,h)=>{s.onload=l}),this.whiteTexture=new la("__runtime_white_pixel__"),this.whiteTexture.fromImage(s),this._dynamicBuffers={positionBuffer:this._gl.createBuffer(),positionArray:new Float32Array(3*4*this.batchSpritesCount),textureCoordBuffer:this._gl.createBuffer(),textureArray:new Float32Array(2*4*this.batchSpritesCount),colorsBuffer:this._gl.createBuffer(),colorsArray:new Float32Array(4*4*this.batchSpritesCount),indexBuffer:this._gl.createBuffer(),linesIndexBuffer:this._gl.createBuffer()};let n=new Uint16Array(this.batchSpritesCount*6),o=0;for(let l=0;l<n.length;l+=6)n[l]=o,n[l+1]=o+1,n[l+2]=o+2,n[l+3]=o+1,n[l+4]=o+3,n[l+5]=o+2,o+=4;this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER,this._dynamicBuffers.indexBuffer),this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER,n,this._gl.STATIC_DRAW);let a=new Uint16Array(this.maxLineSegments);for(let l=0;l<a.length;l+=6)a[l]=l;this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER,this._dynamicBuffers.linesIndexBuffer),this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER,a,this._gl.STATIC_DRAW),this.spritesBatch=new Eh(this),this.useEffect(null),this._camera=this.createCamera(),this.applyCamera(this._camera),e()})}buildText(e,t,i,s,n,o,a){if(typeof t!="string"&&(t=""+t),!e||!e.valid)throw new Error("Font texture is invalid!");n=n||gi.Left,s=s||sr.black,i=i||e.fontSize,a=a||Te.one;let l=i/e.fontSize,h=new Te(0,0),c=[],_=0;function m(){let x=0;switch(n){case gi.Right:x=-_;break;case gi.Center:x=-_/2;break}if(x!=0)for(let p=0;p<c.length;++p)c[p].position.x+=x;h.x=0,h.y+=e.lineHeight*l*a.y,c=[],_=0}let w=new vs;for(let x=0;x<t.length;++x){let p=t[x],v=e.getSourceRect(p);if(p===`
`){m();continue}let M=new Te(v.width*l,v.height*l);if(p!==" "){let F=new rr(e.texture,v);if(F.size=M,e instanceof yh?F.origin.set(0,0):F.origin.set(.5,.5),F.position.copy(h).addSelf(e.getPositionOffset(p).mul(l)),s instanceof sr)F.color.copy(s);else{F.color=[];for(let re of s)F.color.push(re.clone())}F.origin.x=0,w.add(F),c.push(F)}let k=e.getXAdvance(p)*l*a.x;_+=k,h.x+=k}return m(),o&&w.position.set(o.x,o.y),w}drawGroup(e,t){this._drawBatch(e,Boolean(t))}drawSprite(e){!e.texture||!e.texture.valid||(this.__startDrawingSprites(this._activeEffect,null),this.spritesBatch.draw(e))}cover(e,t,i,s,n){return(t instanceof Te||t instanceof Th)&&(t=new tr(0,0,t.x,t.y)),this.draw(e,t.getCenter(),t.getSize(),i,s,n)}draw(e,t,i,s,n,o,a,l,h){let c=new rr(e,s);c.position=t,c.size=typeof i=="number"?new Te(i,i):i,n&&(c.color=n),o&&(c.blendMode=o),a!==void 0&&(c.rotation=a),l&&(c.origin=l),h&&(c.skew=h),this.drawSprite(c)}drawQuadFromVertices(e,t,i){!e||!e.valid||(this.__startDrawingSprites(this._activeEffect,null),this._setBlendMode(i||ue.AlphaBlend),this.spritesBatch.setTexture(e),this.spritesBatch.pushVertices(t))}fillRect(e,t,i,s){this.draw(this.whiteTexture,new Te(e.x+e.width/2,e.y+e.height/2),new Te(e.width,e.height),null,t,i||ue.Opaque,s,null,null)}fillRects(e,t,i,s){s===void 0&&(s=0);let n=new vs;for(let o=0;o<e.length;++o){let a=new rr(this.whiteTexture);a.color=t[o]||t,a.rotation=s.length?s[o]:s,a.blendMode=i||ue.Opaque;let l=e[o];a.size.set(l.width,l.height),a.position.set(l.x+l.width/2,l.y+l.width/2),a.origin.set(.5,.5),n.add(a)}this.drawGroup(n)}outlineRect(e,t,i,s){let n=e.getTopLeft(),o=e.getTopRight(),a=e.getBottomRight(),l=e.getBottomLeft();if(s){let m=function(w){let x=w.x*c-w.y*_,p=w.x*_+w.y*c;w.set(x,p)},h=e.getCenter();n.subSelf(h),o.subSelf(h),l.subSelf(h),a.subSelf(h);let c=Math.cos(s),_=Math.sin(s);m(n),m(o),m(l),m(a),n.addSelf(h),o.addSelf(h),l.addSelf(h),a.addSelf(h)}this.drawLinesStrip([n,o,a,l],t,i,!0)}outlineCircle(e,t,i,s){s===void 0&&(s=32);let n=[],o=2*Math.PI;for(let a=0;a<=s;a++){let l=new Te(e.center.x+e.radius*Math.cos(a*o/s),e.center.y+e.radius*Math.sin(a*o/s));n.push(l)}this.drawLinesStrip(n,t,i)}fillCircle(e,t,i,s){s===void 0&&(s=32);let n=[e.center],o=2*Math.PI;for(let l=0;l<=s;l++){let h=new Te(e.center.x+e.radius*Math.cos(l*o/s),e.center.y+e.radius*Math.sin(l*o/s));n.push(h)}let a=this._gl;this._fillShapesBuffer(n,t,i,l=>{a.drawArrays(a.TRIANGLE_FAN,0,l.length),this._drawCallsCount++},!0,1)}fillCircles(e,t,i,s){s===void 0&&(s=32);let n=[],o=t.length?[]:null;for(let l=0;l<e.length;++l){let h=e[l],c=t[l]||t,_=2*Math.PI;for(let m=0;m<=s;m++)n.push(new Te(h.center.x+h.radius*Math.cos(m*_/s),h.center.y+h.radius*Math.sin(m*_/s))),n.push(new Te(h.center.x+h.radius*Math.cos((m+1)*_/s),h.center.y+h.radius*Math.sin((m+1)*_/s))),n.push(h.center),o&&(o.push(c),o.push(c),o.push(c))}let a=this._gl;this._fillShapesBuffer(n,o||t,i,l=>{a.drawArrays(a.TRIANGLES,0,l.length),this._drawCallsCount++},!1,3)}drawLine(e,t,i,s){return this.drawLines([e,t],i,s,!1)}drawLinesStrip(e,t,i,s){let n=this._gl;s&&(e=e.slice(0),e.push(e[0]),t&&t.length&&(t=t.slice(0),t.push(t[0]))),this._fillShapesBuffer(e,t,i,o=>{n.drawArrays(n.LINE_STRIP,0,o.length),this._drawCallsCount++},!0,2)}drawLines(e,t,i){let s=this._gl;this._fillShapesBuffer(e,t,i,n=>{s.drawArrays(s.LINES,0,n.length),this._drawCallsCount++},!0,2)}drawPoint(e,t,i){return this.drawPoints([e],[t],i)}drawPoints(e,t,i){let s=this._gl;this._fillShapesBuffer(e,t,i,n=>{s.drawArrays(s.POINTS,0,n.length),this._drawCallsCount++},!1,1)}centerCanvas(){let e=this._canvas,t=e.parentElement,i=Math.min(t.clientWidth,window.innerWidth),s=Math.min(t.clientHeight,window.innerHeight);e.style.left=Math.round(i/2-e.clientWidth/2)+"px",e.style.top=Math.round(s/2-e.clientHeight/2)+"px",e.style.display="block",e.style.position="relative"}inScreen(e){let t=this.getRenderingRegion();if(e instanceof vh)return t.collideCircle(e);if(e instanceof Te)return t.containsVector(e);if(e instanceof tr)return t.collideRect(e);if(e instanceof Line)return t.collideLine(e);throw new Error("Unknown shape type to check!")}centerCamera(e,t){let s=(t?this.getCanvasSize():this.getRenderingSize()).mul(.5),n=e.sub(s);this.setCameraOrthographic(n)}_fillShapesBuffer(e,t,i,s,n,o){if(this.presentBufferedData(),t=t||Ah,i=i||ue.Opaque,t.length!==void 0&&t.length!==e.length){mi.error("When drawing shapes with colors array, the colors array and points array must have the same length!");return}let a=n?this.maxLineSegments-1:this.maxLineSegments;if(o!=1)for(;a%o!==0;)a--;if(e.length>a){let w=0;for(;;){let x=w*a,p=x+a;n&&w>0&&x--;let v=e.slice(x,p);if(v.length===0)break;let M=t&&t.length?t.slice(x,p):t;this._fillShapesBuffer(v,M,i,s,n,o),w++}return}let l=this._gl,h=this._dynamicBuffers.positionArray,c=this._dynamicBuffers.colorsArray;for(let w=0;w<e.length;++w){h[w*3+0]=e[w].x,h[w*3+1]=e[w].y,h[w*3+2]=e[w].z||0;let x=t[w]||t;c[w*4+0]=x.r,c[w*4+1]=x.g,c[w*4+2]=x.b,c[w*4+3]=x.a}this._setBlendMode(i);let _=new bh(this._dynamicBuffers.positionBuffer,null,this._dynamicBuffers.colorsBuffer,this._dynamicBuffers.indexBuffer,e.length);this._activeEffect.prepareToDrawBatch(_,ua.identity),this._setActiveTexture(this.whiteTexture);let m=e.length<=8;this._gl.bindBuffer(this._gl.ARRAY_BUFFER,this._dynamicBuffers.positionBuffer),this._gl.bufferData(this._gl.ARRAY_BUFFER,m?this._dynamicBuffers.positionArray.slice(0,e.length*3):this._dynamicBuffers.positionArray,this._gl.DYNAMIC_DRAW),this._gl.bindBuffer(this._gl.ARRAY_BUFFER,this._dynamicBuffers.colorsBuffer),this._gl.bufferData(this._gl.ARRAY_BUFFER,m?this._dynamicBuffers.colorsArray.slice(0,e.length*4):this._dynamicBuffers.colorsArray,this._gl.DYNAMIC_DRAW),l.bindBuffer(l.ELEMENT_ARRAY_BUFFER,this._dynamicBuffers.linesIndexBuffer),this._currIndices=null,s(e)}_drawBatch(e,t){if(e._sprites.length===0)return;this.presentBufferedData();let i=e.getTransform();this.spritesBatch.begin(this._activeEffect,i),this.spritesBatch.draw(e._sprites,t),this.spritesBatch.end()}_setActiveTexture(e){this._activeEffect.setTexture(e)&&(this._setTextureFilter(e.filter||this.defaultTextureFilter),this._setTextureWrapMode(e.wrapMode||this.defaultTextureWrapMode))}get BlendModes(){return ue}get TextureWrapModes(){return ir}get TextureFilterModes(){return bs}get drawCallsCount(){return this._drawCallsCount}get quadsDrawCount(){return this._drawQuadsCount}clear(e){this.presentBufferedData(),e=e||sr.black,this._gl.clearColor(e.r,e.g,e.b,e.a),this._gl.clear(this._gl.COLOR_BUFFER_BIT|this._gl.DEPTH_BUFFER_BIT)}_setTextureFilter(e){if(!bs._values.has(e))throw new Error("Invalid texture filter mode! Please pick a value from 'TextureFilterModes'.");let t=this._gl[e];this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_MIN_FILTER,t),this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_MAG_FILTER,t)}_setTextureWrapMode(e,t){if(t===void 0&&(t=e),!ir._values.has(e))throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");if(!ir._values.has(t))throw new Error("Invalid texture wrap mode! Please pick a value from 'TextureWrapModes'.");this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_WRAP_S,this._gl[e]),this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_WRAP_T,this._gl[t])}_setBlendMode(e){if(this._lastBlendMode!==e){var t=this._gl;switch(e){case ue.AlphaBlend:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ue.Opaque:t.disable(t.BLEND);break;case ue.Additive:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE);break;case ue.Multiply:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ue.Screen:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_COLOR,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ue.Subtract:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFuncSeparate(t.ONE,t.ONE,t.ONE,t.ONE),t.blendEquationSeparate(t.FUNC_REVERSE_SUBTRACT,t.FUNC_ADD);break;case ue.Invert:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE_MINUS_DST_COLOR,t.ZERO),t.blendFuncSeparate(t.ONE_MINUS_DST_COLOR,t.ZERO,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ue.Overlay:t.enable(t.BLEND),t.MAX?(t.blendEquation(t.MAX),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA)):(t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ONE));break;case ue.Darken:t.enable(t.BLEND),t.blendEquation(t.MIN),t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case ue.DestIn:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ZERO,t.SRC_ALPHA);break;case ue.DestOut:t.enable(t.BLEND),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ZERO,t.ONE_MINUS_SRC_ALPHA);break;default:throw new Error(`Unknown blend mode '${e}'!`)}this._lastBlendMode=e}}presentBufferedData(){this.__finishDrawingSprites()}__startDrawingSprites(e,t){this.spritesBatch.drawing&&(this.spritesBatch._effect!==e||this.spritesBatch._transform!==t)&&this.spritesBatch.end(),this.spritesBatch.drawing||this.spritesBatch.begin(e,t)}__finishDrawingSprites(){this.spritesBatch.drawing&&this.spritesBatch.end()}startFrame(){this._lastBlendMode=null,this._drawCallsCount=0,this._drawQuadsCount=0}endFrame(){this.presentBufferedData()}destroy(){mi.warn("Cleaning up WebGL is not supported yet!")}};ha.exports=new Es});var st=y((A_,ca)=>{"use strict";ca.exports=da()});var Ts=y((C_,fa)=>{"use strict";var Ch={left:0,middle:1,right:2},Rh={backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,break:19,caps_lock:20,escape:27,page_up:33,page_down:34,end:35,home:36,left:37,up:38,right:39,down:40,insert:45,delete:46,space:32,n0:48,n1:49,n2:50,n3:51,n4:52,n5:53,n6:54,n7:55,n8:56,n9:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,left_window_key:91,right_window_key:92,select_key:93,numpad_0:96,numpad_1:97,numpad_2:98,numpad_3:99,numpad_4:100,numpad_5:101,numpad_6:102,numpad_7:103,numpad_8:104,numpad_9:105,multiply:106,add:107,subtract:109,decimal_point:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,numlock:144,scroll_lock:145,semicolon:186,equal_sign:187,plus:187,comma:188,dash:189,minus:189,period:190,forward_slash:191,grave_accent:192,open_bracket:219,back_slash:220,close_braket:221,single_quote:222};fa.exports={KeyboardKeys:Rh,MouseButtons:Ch}});var pa=y((B_,_a)=>{"use strict";var Mh=pt(),nr=G(),{MouseButton:R_,MouseButtons:Bh,KeyboardKey:M_,KeyboardKeys:kh}=Ts(),Fh=ye().getLogger("input"),Ss=class extends Mh{constructor(){super(),this._callbacks=null,this._targetElement=window,this.MouseButtons=Bh,this.KeyboardKeys=kh,this.preventDefaults=!1,this.enableMouseDeltaWhileMouseWheelDown=!0,this.disableContextMenu=!0,this.resetOnFocusLoss=!0,this._resetAll()}setup(){return new Promise((e,t)=>{if(Fh.info("Setup input manager.."),typeof this._targetElement=="function"&&(this._targetElement=this._targetElement(),!this._targetElement))throw new Error("Input target element was set to be a method, but the returned value was invalid!");let i=this._targetElement;(i.tabIndex===-1||i.tabIndex===void 0)&&(i.tabIndex=1e3),window.setTimeout(()=>i.focus(),0);var s=this;this._callbacks={mousedown:function(o){s._onMouseDown(o),this.preventDefaults&&o.preventDefault()},mouseup:function(o){s._onMouseUp(o),this.preventDefaults&&o.preventDefault()},mousemove:function(o){s._onMouseMove(o),this.preventDefaults&&o.preventDefault()},keydown:function(o){s._onKeyDown(o),this.preventDefaults&&o.preventDefault()},keyup:function(o){s._onKeyUp(o),this.preventDefaults&&o.preventDefault()},blur:function(o){s._onBlur(o),this.preventDefaults&&o.preventDefault()},wheel:function(o){s._onMouseWheel(o)},touchstart:function(o){s._onTouchStart(o),this.preventDefaults&&o.preventDefault()},touchend:function(o){s._onMouseUp(o),this.preventDefaults&&o.preventDefault()},touchmove:function(o){s._onTouchMove(o),this.preventDefaults&&o.preventDefault()},contextmenu:function(o){s.disableContextMenu&&o.preventDefault()}},this._resetAll();for(var n in this._callbacks)i.addEventListener(n,this._callbacks[n],!1);i!==window&&(window.addEventListener("mouseup",this._callbacks.mouseup,!1),window.addEventListener("touchend",this._callbacks.touchend,!1)),e()})}startFrame(){}destroy(){if(this._callbacks){let t=this._targetElement;for(var e in this._callbacks)t.removeEventListener(e,this._callbacks[e]);t!==window&&(window.removeEventListener("mouseup",this._callbacks.mouseup,!1),window.removeEventListener("touchend",this._callbacks.touchend,!1)),this._callbacks=null}}setTargetElement(e){if(this._callbacks)throw new Error("'setTargetElement() must be called before initializing the input manager!");this._targetElement=e}_resetAll(){this._mousePos=new nr,this._mousePrevPos=new nr,this._mouseState={},this._mousePrevState={},this._mouseWheel=0,this._keyboardState={},this._keyboardPrevState={},this._touchStarted=!1}get mousePosition(){return this._mousePos.clone()}get prevMousePosition(){return(this._mousePrevPos||this._mousePos).clone()}get mouseDelta(){return this._mousePrevPos?new nr(this._mousePos.x-this._mousePrevPos.x,this._mousePos.y-this._mousePrevPos.y):nr.zero}get mouseMoving(){return this._mousePrevPos&&!this._mousePrevPos.equals(this._mousePos)}mousePressed(e=0){if(e===void 0)throw new Error("Invalid button code!");return Boolean(this._mouseState[e]&&!this._mousePrevState[e])}mouseDown(e=0){if(e===void 0)throw new Error("Invalid button code!");return Boolean(this._mouseState[e])}mouseUp(e=0){if(e===void 0)throw new Error("Invalid button code!");return Boolean(!this.mouseDown(e))}mouseReleased(e=0){if(e===void 0)throw new Error("Invalid button code!");return Boolean(!this._mouseState[e]&&this._mousePrevState[e])}keyDown(e){if(e===void 0)throw new Error("Invalid key code!");return Boolean(this._keyboardState[e])}keyUp(e){if(e===void 0)throw new Error("Invalid key code!");return Boolean(!this.keyDown(e))}keyReleased(e){if(e===void 0)throw new Error("Invalid key code!");return Boolean(!this._keyboardState[e]&&this._keyboardPrevState[e])}keyPressed(e){if(e===void 0)throw new Error("Invalid key code!");return Boolean(this._keyboardState[e]&&!this._keyboardPrevState[e])}get shiftDown(){return Boolean(this.keyDown(this.KeyboardKeys.shift))}get ctrlDown(){return Boolean(this.keyDown(this.KeyboardKeys.ctrl))}get altDown(){return Boolean(this.keyDown(this.KeyboardKeys.alt))}get anyKeyPressed(){for(var e in this._keyboardState)if(this._keyboardState[e]&&!this._keyboardPrevState[e])return!0;return!1}get anyKeyDown(){for(var e in this._keyboardState)if(this._keyboardState[e])return!0;return!1}get anyMouseButtonPressed(){for(var e in this._mouseState)if(this._mouseState[e]&&!this._mousePrevState[e])return!0;return!1}get anyMouseButtonDown(){for(var e in this._mouseState)if(this._mouseState[e])return!0;return!1}_getValueWithCode(e,t,i){if(e=String(e),e.indexOf("mouse_")===0){var s=e.split("_")[1];return t.call(this,this.MouseButtons[s])}return!isNaN(parseInt(e))&&e.length===1&&(e="n"+e),i.call(this,this.KeyboardKeys[e])}down(e){e instanceof Array||(e=[e]);for(let t of e)if(Boolean(this._getValueWithCode(t,this.mouseDown,this.keyDown)))return!0;return!1}released(e){e instanceof Array||(e=[e]);for(let t of e)if(Boolean(this._getValueWithCode(t,this.mouseReleased,this.keyReleased)))return!0;return!1}pressed(e){e instanceof Array||(e=[e]);for(let t of e)if(Boolean(this._getValueWithCode(t,this.mousePressed,this.keyPressed)))return!0;return!1}get mouseWheelSign(){return Math.sign(this._mouseWheel)}get mouseWheel(){return this._mouseWheel}endFrame(){this._mousePrevPos=this._mousePos.clone(),this._keyboardPrevState={};for(var e in this._keyboardState)this._keyboardPrevState[e]=this._keyboardState[e];this._mousePrevState={};for(var e in this._mouseState)this._mousePrevState[e]=this._mouseState[e];this._touchStarted&&(this._mouseState[this.MouseButtons.left]=!0,this._touchStarted=!1),this._mouseWheel=0}_getKeyboardKeyCode(e){return e=this._getEvent(e),e.keyCode!==void 0?e.keyCode:e.key.charCodeAt(0)}_onBlur(e){this.resetOnFocusLoss&&this._resetAll()}_onMouseWheel(e){this._mouseWheel=e.deltaY}_onKeyDown(e){var t=this._getKeyboardKeyCode(e);this._keyboardState[t]=!0}_onKeyUp(e){var t=this._getKeyboardKeyCode(e);this._keyboardState[t||0]=!1}_onTouchStart(e){var t=e.changedTouches;if(t&&t.length){var i=t[0],s=i.pageX||i.offsetX||i.clientX,n=i.pageY||i.offsetY||i.clientY;s!==void 0&&n!==void 0&&(this._mousePos.x=s,this._mousePos.y=n,this._normalizeMousePos())}this._touchStarted=!0}_onMouseDown(e){e=this._getEvent(e),this.enableMouseDeltaWhileMouseWheelDown&&e.button===this.MouseButtons.middle&&e.preventDefault(),this._mouseState[e.button||0]=!0}_onMouseUp(e){e=this._getEvent(e),this._mouseState[e.button||0]=!1}_onTouchMove(e){e=this._getEvent(e),this._mousePos.x=e.touches[0].pageX,this._mousePos.y=e.touches[0].pageY,this._normalizeMousePos()}_onMouseMove(e){e=this._getEvent(e);var t=e.clientX;t===void 0&&(t=e.x),t===void 0&&(t=e.offsetX),t===void 0&&(t=e.pageX);var i=e.clientY;i===void 0&&(i=e.y),i===void 0&&(i=e.offsetY),i===void 0&&(i=e.pageY),t===void 0&&(t=e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,i=e.clientY+document.body.scrollTop+document.documentElement.scrollTop),this._mousePos.x=t,this._mousePos.y=i,this._normalizeMousePos()}_normalizeMousePos(){if(this._targetElement&&this._targetElement.getBoundingClientRect){var e=this._targetElement.getBoundingClientRect();this._mousePos.x-=e.left,this._mousePos.y-=e.top}}_getEvent(e){return e||window.event}};_a.exports=new Ss});var ma=y((k_,ga)=>{"use strict";ga.exports=pa()});var xa=y((F_,wa)=>{"use strict";var Dh=mt(),As=class extends Dh{constructor(e){super(e),this._data=null}load(){return new Promise((e,t)=>{var i=new XMLHttpRequest;i.open("GET",this.url,!0),i.responseType="arraybuffer",i.onload=()=>{i.readyState==4&&(i.response?(this._data=new Uint8Array(i.response),this._notifyReady(),e()):t(i.statusText))},i.onerror=s=>{t(s)},i.send()})}create(e){return new Promise((t,i)=>{if(e instanceof Array&&(e=new Uint8Array(e)),!(e instanceof Uint8Array))return i("Binary asset source must be of type 'Uint8Array'!");this._data=e,this._notifyReady(),t()})}get valid(){return Boolean(this._data)}destroy(){this._data=null}get data(){return this._data}string(){return new TextDecoder().decode(this._data)}};wa.exports=As});var Ta=y((P_,Ea)=>{"use strict";var Ph=Ir(),Oh=pt(),ya=xa(),ba=ps(),va=yt(),zh=Zi(),Lh=ms(),D_=mt(),nt=ye().getLogger("assets"),Cs=class extends Oh{constructor(){super(),this._loaded=null,this._waitingAssets=new Set,this._failedAssets=new Set,this._successfulLoadedAssetsCount=0,this.root="",this.suffix=""}_wrapUrl(e){return e&&this.root+e+this.suffix}get pendingAssets(){return Array.from(this._waitingAssets)}get failedAssets(){return Array.from(this._failedAssets)}waitForAll(){return new Promise((e,t)=>{nt.debug("Waiting for all assets..");let i=()=>{if(this._failedAssets.size!==0)return nt.warn("Done waiting for assets: had errors."),t(this.failedAssets);if(this._waitingAssets.size===0)return nt.debug("Done waiting for assets: everything loaded successfully."),e();setTimeout(i,1)};i()})}setup(){return new Promise((e,t)=>{nt.info("Setup assets manager.."),this._loaded={},e()})}startFrame(){}endFrame(){}_getFromCache(e,t){let i=this._loaded[e]||null;if(i&&t&&!(i instanceof t))throw new Error(`Asset with URL '${e}' is already loaded, but has unexpected type (expecting ${t})!`);return i}async _loadAndCacheAsset(e,t){let i=e.url,s=e.constructor.name;return this._loaded[i]=e,this._waitingAssets.add(i),new Promise(async(n,o)=>{nt.debug(`Load asset [${s}] from URL '${i}'.`);try{await e.load(t)}catch(a){return nt.warn(`Failed to load asset [${s}] from URL '${i}'.`),this._failedAssets.add(i),o(a)}if(this._waitingAssets.delete(i),!e.valid)return nt.warn(`Failed to load asset [${s}] from URL '${i}'.`),this._failedAssets.add(i),o("Loaded asset is not valid!");nt.debug(`Successfully loaded asset [${s}] from URL '${i}'.`),this._successfulLoadedAssetsCount++,n(e)})}getCached(e){return e=this._wrapUrl(e),this._loaded[e]||null}_loadAssetType(e,t,i){e=this._wrapUrl(e);let s=this._getFromCache(e,t);var n=!1;s||(s=new t(e),n=!0);let o=new Promise(async(a,l)=>{n&&await this._loadAndCacheAsset(s,i),s.onReady(()=>{a(s)})});return o.asset=s,o}_createAsset(e,t,i){e=this._wrapUrl(e);var s=new t(e||Nh());let n=new Promise(async(o,a)=>{if(e&&this._loaded[e])return a(`Asset of type '${t.name}' to create with URL '${e}' already exist in cache!`);i(s),e&&(this._loaded[e]=s),o(s)});return n.asset=s,n}loadSound(e){return this._loadAssetType(e,Ph,void 0)}loadTexture(e,t){return this._loadAssetType(e,va,t)}createRenderTarget(e,t,i,s){if(!t||!i)throw new Error("Missing or invalid size!");return this._createAsset(e,va,n=>{n.createRenderTarget(t,i,s)})}loadFontTexture(e,t){return this._loadAssetType(e,zh,t)}loadMsdfFontTexture(e,t){return this._loadAssetType(e,Lh,t)}loadJson(e){return this._loadAssetType(e,ba)}createJson(e,t){return t?this._createAsset(e,ba,i=>{i.create(t)}):reject("Missing or invalid data!")}loadBinary(e){return this._loadAssetType(e,ya)}createBinary(e,t){return t?this._createAsset(e,ya,i=>{i.create(t)}):reject("Missing or invalid data!")}free(e){e=this._wrapUrl(e);let t=this._loaded[e];t&&(t.destroy(),delete this._loaded[e])}clearCache(){for(let e in this._loaded)this._loaded[e].destroy();this._loaded={},this._waitingAssets=new Set,this._failedAssets=new Set}destroy(){this.clearCache()}},Ih=0;function Nh(){return"_runtime_asset_"+Ih+++"_"}Ea.exports=new Cs});var Aa=y((O_,Sa)=>{"use strict";Sa.exports=Ta()});var Ye=y((N_,Ra)=>{"use strict";var ee=qe(),z_=le(),L_=G(),I_=Ms(),Rs=class{constructor(){this._world=null,this._worldRange=null,this._debugColor=null,this._forceDebugColor=null,this._collisionFlags=Number.MAX_SAFE_INTEGER}get shapeId(){throw new Error("Not Implemented!")}get collisionFlags(){return this._collisionFlags}set collisionFlags(e){return this._debugColor=null,this._collisionFlags=e,this._collisionFlags}setDebugColor(e){this._forceDebugColor=e}debugDraw(e){throw new Error("Not Implemented!")}getCenter(){throw new Error("Not Implemented!")}remove(){this._world&&this._world.removeShape(this)}_getDebugColor(){return this._forceDebugColor?this._forceDebugColor.clone():(this._debugColor||(this._debugColor=this._getDefaultDebugColorFor(this.collisionFlags)),this._debugColor.clone())}_getDefaultDebugColorFor(e){return Ca[e%Ca.length]}_getRadius(){throw new Error("Not Implemented!")}_getBoundingBox(){throw new Error("Not Implemented!")}_setParent(e){if(e!==this._world){if(this._world&&e)throw new Error("Cannot add collision shape to world while its already in another world!");this._world=e,this._worldRange=null}}_shapeChanged(){this._world&&this._world._queueUpdate(this)}},Ca=[ee.red,ee.blue,ee.green,ee.yellow,ee.purple,ee.teal,ee.brown,ee.orange,ee.khaki,ee.darkcyan,ee.cornflowerblue,ee.darkgray,ee.chocolate,ee.aquamarine,ee.cadetblue,ee.magenta,ee.seagreen,ee.pink,ee.olive,ee.violet];Ra.exports=Rs});var ks=y((H_,Ma)=>{"use strict";var q_=G(),U_=Ye(),Bs=class{constructor(e,t,i){this.position=e,this.first=t,this.second=i}};Ma.exports=Bs});var Ds=y((V_,ka)=>{"use strict";var qh=G(),Uh=ks(),j_=Ye(),Ba=ye().getLogger("collision"),Fs=class{constructor(){this._handlers={}}_init(){}setHandler(e,t,i){Ba.debug(`Register handler for shapes '${e}' and '${t}'.`),this._handlers[e]||(this._handlers[e]={}),this._handlers[e][t]=i,e!==t&&(this._handlers[t]||(this._handlers[t]={}),this._handlers[t][e]=(s,n)=>i(n,s))}test(e,t){let i=this._getCollisionMethod(e,t);return this.testWithHandler(e,t,i)}testWithHandler(e,t,i){if(!i)return Ba.warn(`Missing collision handler for shapes '${e.shapeId}' and '${t.shapeId}'.`),null;let s=i(e,t);if(s){let n=s instanceof qh?s:null;return new Uh(n,e,t)}return null}getHandlers(e){return this._handlers[e.shapeId]}_getCollisionMethod(e,t){let i=this._handlers[e.shapeId];return i&&i[t.shapeId]||null}};ka.exports=Fs});var Os=y((W_,Da)=>{"use strict";var Hh=Ye(),Fa=st(),G_=G(),jh=le(),Vh=et(),Ps=class extends Hh{constructor(e){super(),this.setPosition(e)}get shapeId(){return"point"}setPosition(e){this._position=e.clone(),this._boundingBox=new jh(e.x,e.y,1,1),this._shapeChanged()}getPosition(){return this._position.clone()}getCenter(){return this._position.clone()}_getRadius(){return 1}_getBoundingBox(){return this._boundingBox}debugDraw(e){e===void 0&&(e=1);let t=this._getDebugColor();t.a*=e,Fa.outlineCircle(new Vh(this.getPosition(),3),t,Fa.BlendModes.AlphaBlend,4)}};Da.exports=Ps});var Ls=y((Y_,Pa)=>{"use strict";var Gh=Ye(),or=st(),X_=et(),Wh=le(),zs=class extends Gh{constructor(e){super(),this.setShape(e)}get shapeId(){return"circle"}setShape(e){this._circle=e,this._position=e.center,this._boundingBox=new Wh(e.center.x-e.radius,e.center.y-e.radius,e.radius*2,e.radius*2),this._shapeChanged()}_getRadius(){return this._circle.radius}getCenter(){return this._position.clone()}_getBoundingBox(){return this._boundingBox}debugDraw(e){e===void 0&&(e=1);let t=this._getDebugColor();t.a*=e,or.outlineCircle(this._circle,t,or.BlendModes.AlphaBlend,14),t.a*=.25,or.fillCircle(this._circle,t,or.BlendModes.AlphaBlend,14)}};Pa.exports=zs});var Ms=y((Q_,La)=>{"use strict";var Oa=qe(),za=G(),Xh=et(),$_=ks(),K_=Ye(),Is=st(),Yh=le(),J_=Ds(),$h=Os(),Kh=Ls(),Jh=ye().getLogger("collision"),Ns=class{constructor(e,t){this.resolver=e,typeof t>"u"?t=new za(512,512):typeof t=="number"?t=new za(t,t):t=t.clone(),this._gridCellSize=t,this._grid={},this._shapesToUpdate=new Set,this._cellsToDelete=new Set}_performUpdates(){if(this._cellsToDelete.size>0){for(let e of this._cellsToDelete)this._grid[e]&&this._grid[e].size===0&&delete this._grid[e];this._cellsToDelete.clear()}if(this._shapesToUpdate.size>0){for(let e of this._shapesToUpdate)this._updateShape(e);this._shapesToUpdate.clear()}}_updateShape(e){if(e._world!==this)return;let t=e._getBoundingBox(),i=Math.floor(t.left/this._gridCellSize.x),s=Math.floor(t.top/this._gridCellSize.y),n=Math.ceil(t.right/this._gridCellSize.x),o=Math.ceil(t.bottom/this._gridCellSize.y);if(e._worldRange){if(e._worldRange[0]===i&&e._worldRange[1]===s&&e._worldRange[2]===n&&e._worldRange[3]===o)return;let a=e._worldRange[0],l=e._worldRange[1],h=e._worldRange[2],c=e._worldRange[3];for(let _=a;_<h;++_)for(let m=l;m<c;++m){if(_>=i&&_<n&&m>=s&&m<o)continue;let w=_+","+m,x=this._grid[w];x&&(x.delete(e),x.size===0&&this._cellsToDelete.add(w))}for(let _=i;_<n;++_)for(let m=s;m<o;++m){if(_>=a&&_<h&&m>=l&&m<c)continue;let w=_+","+m,x=this._grid[w];x||(this._grid[w]=x=new Set),x.add(e)}}else for(let a=i;a<n;++a)for(let l=s;l<o;++l){let h=a+","+l,c=this._grid[h];c||(this._grid[h]=c=new Set),c.add(e)}e._worldRange=[i,s,n,o]}_queueUpdate(e){this._shapesToUpdate.add(e)}iterateShapes(e){for(let t in this._grid){let i=this._grid[t];if(i){for(let s of i)if(e(s)===!1)return}}}addShape(e){e._setParent(this),this._updateShape(e),this._performUpdates()}removeShape(e){if(e._world!==this){Jh.warn("Shape to remove is not in this collision world!");return}if(e._worldRange){let t=e._worldRange[0],i=e._worldRange[1],s=e._worldRange[2],n=e._worldRange[3];for(let o=t;o<s;++o)for(let a=i;a<n;++a){let l=o+","+a,h=this._grid[l];h&&(h.delete(e),h.size===0&&this._cellsToDelete.add(l))}}this._shapesToUpdate.delete(e),e._setParent(null),this._performUpdates()}_iterateBroadPhase(e,t,i,s){let n=e._getBoundingBox(),o=Math.floor(n.left/this._gridCellSize.x),a=Math.floor(n.top/this._gridCellSize.y),l=Math.ceil(n.right/this._gridCellSize.x),h=Math.ceil(n.bottom/this._gridCellSize.y),c=new Set;for(let _=o;_<l;++_)for(let m=a;m<h;++m){let w=_+","+m,x=this._grid[w];if(x)for(let p of x){if(i&&(p.collisionFlags&i)===0||c.has(p)||(c.add(p),p===e)||s&&!s(p))continue;if(!Boolean(t(p)))return}}}testCollision(e,t,i,s){this._performUpdates();var n=null;if(t){var o=[];this._iterateBroadPhase(e,l=>(o.push(l),!0),i,s),Qh(e,o);var a=this.resolver.getHandlers(e);for(let l of o)if(n=this.resolver.testWithHandler(e,l,a[l.shapeId]),n)break}else{var a=this.resolver.getHandlers(e);this._iterateBroadPhase(e,h=>(n=this.resolver.testWithHandler(e,h,a[h.shapeId]),!n),i,s)}return n}testCollisionMany(e,t,i,s,n){this._performUpdates();var o=[],a=this.resolver.getHandlers(e);return this._iterateBroadPhase(e,l=>{let h=this.resolver.testWithHandler(e,l,a[l.shapeId]);return!(h&&(o.push(h),n&&n(h)===!1))},i,s),t&&Zh(e,o),o}pick(e,t,i,s,n){let o=(t||0)<=1?new $h(e):new Kh(new Xh(e,t));return this.testCollisionMany(o,i,s,n).map(l=>l.second)}debugDraw(e,t,i,s){this._performUpdates(),e||(e=Oa.black,e.a*=.75),t||(t=Oa.red,t.a*=.75),i===void 0&&(i=.5),e.a*=i,t.a*=i;let n=new Set,o=s?s.getRegion():Is.getRenderingRegion(!1),a=Math.floor(o.left/this._gridCellSize.x),l=Math.floor(o.top/this._gridCellSize.y),h=a+Math.ceil(o.width/this._gridCellSize.x),c=l+Math.ceil(o.height/this._gridCellSize.y);for(let _=a;_<=h;++_)for(let m=l;m<=c;++m){let w=this._grid[_+","+m],x=w&&w.size?t:e,p=new Yh(_*this._gridCellSize.x,m*this._gridCellSize.y,this._gridCellSize.x-1,this._gridCellSize.y-1);if(Is.outlineRect(p,x,Is.BlendModes.AlphaBlend,0),w)for(let v of w)n.has(v)||(n.add(v),v.debugDraw(i))}}};function Qh(r,e){let t=r.getCenter();e.sort((i,s)=>i.getCenter().distanceTo(t)-i._getRadius()-(s.getCenter().distanceTo(t)-s._getRadius()))}function Zh(r,e){let t=r.getCenter();e.sort((i,s)=>i.second.getCenter().distanceTo(t)-i.second._getRadius()-(s.second.getCenter().distanceTo(t)-s.second._getRadius()))}La.exports=Ns});var Us=y((ep,Ia)=>{"use strict";var Z_=le(),ed=Ye(),ar=st(),qs=class extends ed{constructor(e){super(),this.setShape(e)}get shapeId(){return"rect"}setShape(e){this._rect=e,this._center=e.getCenter(),this._radius=this._rect.getBoundingCircle().radius,this._shapeChanged()}_getRadius(){return this._radius}_getBoundingBox(){return this._rect}getCenter(){return this._center.clone()}debugDraw(e){e===void 0&&(e=1);let t=this._getDebugColor();t.a*=e,ar.outlineRect(this._rect,t,ar.BlendModes.AlphaBlend),t.a*=.25,ar.fillRect(this._rect,t,ar.BlendModes.AlphaBlend)}};Ia.exports=qs});var qa=y((tp,Na)=>{"use strict";var lr={pointPoint:function(r,e){return r._position.approximate(e._position)?r._position:!1},pointCircle:function(r,e){return r._position.distanceTo(e._circle.center)<=e._circle.radius?r._position:!1},pointRectangle:function(r,e){return e._rect.containsVector(r._position)?r._position:!1},pointLine:function(r,e){for(let t=0;t<e._lines.length;++t)if(e._lines[t].containsVector(r._position))return r._position;return!1},pointTilemap:function(r,e){if(e._intBoundingRect.containsVector(r._position)){let t=e.getTileAt(r._position);return t?lr.pointRectangle(r,t):!1}return e._borderThickness&&e._boundingRect.containsVector(r._position)?r._position:!1},circleCircle:function(r,e){return r._circle.center.distanceTo(e._circle.center)<=r._circle.radius+e._circle.radius},circleRectangle:function(r,e){return e._rect.collideCircle(r._circle)},circleLine:function(r,e){for(let t=0;t<e._lines.length;++t)if(e._lines[t].distanceToVector(r._circle.center)<=r._circle.radius)return!0;return!1},circleTilemap:function(r,e){let t=!1;return e.iterateTilesAtRegion(r._getBoundingBox(),i=>{if(lr.circleRectangle(r,i))return t=!0,!1}),t},rectangleRectangle:function(r,e){return r._rect.collideRect(e._rect)},rectangleLine:function(r,e){for(let t=0;t<e._lines.length;++t)if(r._rect.collideLine(e._lines[t]))return!0;return!1},rectangleTilemap:function(r,e){let t=!1;return e.iterateTilesAtRegion(r._getBoundingBox(),i=>(t=!0,!1)),t},lineLine:function(r,e){for(let t=0;t<r._lines.length;++t)for(let i=0;i<e._lines.length;++i)if(r._lines[t].collideLine(e._lines[i]))return!0;return!1},lineTilemap:function(r,e){let t=!1;return e.iterateTilesAtRegion(r._getBoundingBox(),i=>{if(lr.rectangleLine(i,r))return t=!0,!1}),t}};Na.exports=lr});var ja=y((rp,Ha)=>{"use strict";var td=Ye(),Ua=st(),ip=Hi(),id=le(),rd=et(),Hs=class extends td{constructor(e){super(),this._lines=[],this.addLines(e)}get shapeId(){return"lines"}addLines(e){Array.isArray(e)||(e=[e]);for(let i=0;i<e.length;++i)this._lines.push(e[i]);let t=[];for(let i=0;i<this._lines.length;++i)t.push(this._lines[i].from),t.push(this._lines[i].to);this._boundingBox=id.fromPoints(t),this._circle=new rd(this._boundingBox.getCenter(),Math.max(this._boundingBox.width,this._boundingBox.height)),this._shapeChanged()}setLines(e){this._lines=[],this.addLines(e)}_getRadius(){return this._circle.radius}getCenter(){return this._circle.center.clone()}_getBoundingBox(){return this._boundingBox}debugDraw(e){e===void 0&&(e=1);let t=this._getDebugColor();t.a*=e;for(let i=0;i<this._lines.length;++i)Ua.drawLine(this._lines[i].from,this._lines[i].to,t,Ua.BlendModes.AlphaBlend)}};Ha.exports=Hs});var Wa=y((sp,Ga)=>{"use strict";var sd=Ye(),Va=le(),js=G(),ur=st(),nd=Us(),Vs=class extends sd{constructor(e,t,i,s){super(),s=s||0,this._offset=e.clone(),this._intBoundingRect=new Va(e.x,e.y,t.x*i.x,t.y*i.y),this._boundingRect=this._intBoundingRect.resize(s*2),this._center=this._boundingRect.getCenter(),this._radius=this._boundingRect.getBoundingCircle().radius,this._borderThickness=s,this._gridSize=t.clone(),this._tileSize=i.clone(),this._tiles={}}get shapeId(){return"tilemap"}_indexToKey(e){if(e.x<0||e.y<0||e.x>=this._gridSize.x||e.y>=this._gridSize.y)throw new Error(`Collision tile with index ${e.x},${e.y} is out of bounds!`);return e.x+","+e.y}setTile(e,t,i){let s=this._indexToKey(e);if(t){let n=this._tiles[s]||new nd(new Va(this._offset.x+e.x*this._tileSize.x,this._offset.y+e.y*this._tileSize.y,this._tileSize.x,this._tileSize.y));i!==void 0&&(n.collisionFlags=i),this._tiles[s]=n}else delete this._tiles[s]}getTileAt(e){let t=new js(Math.floor(e.x/this._tileSize.x),Math.floor(e.y/this._tileSize.y)),i=t.x+","+t.y;return this._tiles[i]||null}iterateTilesAtRegion(e,t){let i=e.getTopLeft(),s=e.getBottomRight(),n=new js(Math.floor(i.x/this._tileSize.x),Math.floor(i.y/this._tileSize.y)),o=new js(Math.floor(s.x/this._tileSize.x),Math.floor(s.y/this._tileSize.y));for(let a=n.x;a<=o.x;++a)for(let l=n.y;l<=o.y;++l){let h=a+","+l,c=this._tiles[h];if(c&&t(c)===!1)return}}getTilesAtRegion(e){let t=[];return this.iterateTilesAtRegion(e,i=>{t.push(i)}),t}_getRadius(){return this._radius}_getBoundingBox(){return this._boundingRect}getCenter(){return this._center.clone()}debugDraw(e){e===void 0&&(e=1);let t=this._getDebugColor();t.a*=e,this._haveBorders&&(ur.outlineRect(this._intBoundingRect,t,ur.BlendModes.AlphaBlend),ur.outlineRect(this._boundingRect,t,ur.BlendModes.AlphaBlend));for(let i in this._tiles){let s=this._tiles[i];s.setDebugColor(this._forceDebugColor),s.debugDraw(e)}}};Ga.exports=Vs});var Ya=y((op,Xa)=>{"use strict";var od=pt(),np=G(),ad=Ms(),ld=Ds(),ud=Ls(),hd=Os(),dd=Us(),me=qa(),cd=ja(),fd=Wa(),_d=ye().getLogger("collision"),Gs=class extends od{constructor(){super(),this.resolver=new ld}setup(){return new Promise((e,t)=>{_d.info("Setup collision manager.."),this.resolver._init(),this.resolver.setHandler("point","point",me.pointPoint),this.resolver.setHandler("point","circle",me.pointCircle),this.resolver.setHandler("point","rect",me.pointRectangle),this.resolver.setHandler("point","lines",me.pointLine),this.resolver.setHandler("point","tilemap",me.pointTilemap),this.resolver.setHandler("circle","circle",me.circleCircle),this.resolver.setHandler("circle","rect",me.circleRectangle),this.resolver.setHandler("circle","lines",me.circleLine),this.resolver.setHandler("circle","tilemap",me.circleTilemap),this.resolver.setHandler("rect","rect",me.rectangleRectangle),this.resolver.setHandler("rect","lines",me.rectangleLine),this.resolver.setHandler("rect","tilemap",me.rectangleTilemap),this.resolver.setHandler("lines","lines",me.lineLine),this.resolver.setHandler("lines","tilemap",me.lineTilemap),e()})}createWorld(e){return new ad(this.resolver,e)}get RectangleShape(){return dd}get PointShape(){return hd}get CircleShape(){return ud}get LinesShape(){return cd}get TilemapShape(){return fd}startFrame(){}endFrame(){}destroy(){}};Xa.exports=new Gs});var Ka=y((ap,$a)=>{"use strict";$a.exports=Ya()});var ol=y((up,nl)=>{"use strict";var dr=typeof window<"u",lp=pt(),wi=ye(),Ja=dr?Vn():null,Qa=dr?st():null,Za=dr?ma():null,Ws=Aa(),Xs=Ka(),el=fi(),ot=Yi(),pd=wi.getLogger("shaku"),Fe=null,tl=null,Ys=0,$s=0,il=0,rl=0,hr=0,Ks=0,sl="1.6.1",Js=class{constructor(){this.utils=el,this.sfx=Ja,this.gfx=Qa,this.input=Za,this.assets=Ws,this.collision=Xs,this.pauseWhenNotFocused=!1,this.paused=!1,this.pauseTime=!1,this._managersStarted=!1,this._wasPaused=!1}async init(e){return new Promise(async(t,i)=>{if(Fe)throw new Error("Already initialized!");pd.info(`Initialize Shaku v${sl}.`),ot.reset(),Fe=e||(dr?[Ws,Ja,Qa,Za,Xs]:[Ws,Xs]);for(let s=0;s<Fe.length;++s)await Fe[s].setup();tl=new ot,t()})}destroy(){if(!Fe)throw new Error("Not initialized!");for(let e=0;e<Fe.length;++e)Fe[e].destroy()}get isPaused(){return this.paused||this.pauseWhenNotFocused&&!document.hasFocus()}startFrame(){if(this.isPaused){this._wasPaused=!0;return}this._wasPaused&&(this._wasPaused=!1,ot.resetDelta()),this.pauseTime?ot.resetDelta():ot.update(),rl=ot.rawTimestamp(),this._gameTime=new ot,el.Animator.updateAutos(this._gameTime.delta);for(let e=0;e<Fe.length;++e)Fe[e].startFrame();this._managersStarted=!0}endFrame(){if(this._managersStarted){for(let e=0;e<Fe.length;++e)Fe[e].endFrame();this._managersStarted=!1}this.isPaused||(tl=this._gameTime,this._gameTime&&this._updateFpsAndTimeStats())}_updateFpsAndTimeStats(){Ys++,$s+=this._gameTime.delta,$s>=1&&($s=0,il=Ys,Ys=0,Ks=this.getAverageFrameTime(),hr=1);let e=ot.rawTimestamp();hr++,Ks+=e-rl}silent(){wi.silent()}throwErrorOnWarnings(e){if(e===void 0)throw Error("Must provide a value!");wi.throwErrorOnWarnings(e)}get gameTime(){return this._gameTime}get version(){return sl}getFpsCount(){return il}getAverageFrameTime(){return hr===0?0:Ks/hr}requestAnimationFrame(e){return window.requestAnimationFrame?window.requestAnimationFrame(e):window.mozRequestAnimationFrame?window.mozRequestAnimationFrame(e):window.webkitRequestAnimationFrame?window.webkitRequestAnimationFrame(e):window.msRequestAnimationFrame?window.msRequestAnimationFrame(e):setTimeout(e,1e3/60)}cancelAnimationFrame(e){if(window.cancelAnimationFrame)return window.cancelAnimationFrame(e);if(window.mozCancelAnimationFrame)return window.mozCancelAnimationFrame(e);clearTimeout(e)}setLogger(e){wi.setDrivers(e)}getLogger(e){return wi.getLogger(e)}};nl.exports=new Js});var gl=y((cp,pl)=>{var wd="Expected a function",ul="__lodash_hash_undefined__",xd="[object Function]",yd="[object GeneratorFunction]",bd=/[\\^$.*+?()[\]{}|]/g,vd=/^\[object .+?Constructor\]$/,Ed=typeof global=="object"&&global&&global.Object===Object&&global,Td=typeof self=="object"&&self&&self.Object===Object&&self,hl=Ed||Td||Function("return this")();function Sd(r,e){return r?.[e]}function Ad(r){var e=!1;if(r!=null&&typeof r.toString!="function")try{e=!!(r+"")}catch{}return e}var Cd=Array.prototype,Rd=Function.prototype,dl=Object.prototype,Zs=hl["__core-js_shared__"],ll=function(){var r=/[^.]+$/.exec(Zs&&Zs.keys&&Zs.keys.IE_PROTO||"");return r?"Symbol(src)_1."+r:""}(),cl=Rd.toString,en=dl.hasOwnProperty,Md=dl.toString,Bd=RegExp("^"+cl.call(en).replace(bd,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),kd=Cd.splice,Fd=fl(hl,"Map"),yi=fl(Object,"create");function Tt(r){var e=-1,t=r?r.length:0;for(this.clear();++e<t;){var i=r[e];this.set(i[0],i[1])}}function Dd(){this.__data__=yi?yi(null):{}}function Pd(r){return this.has(r)&&delete this.__data__[r]}function Od(r){var e=this.__data__;if(yi){var t=e[r];return t===ul?void 0:t}return en.call(e,r)?e[r]:void 0}function zd(r){var e=this.__data__;return yi?e[r]!==void 0:en.call(e,r)}function Ld(r,e){var t=this.__data__;return t[r]=yi&&e===void 0?ul:e,this}Tt.prototype.clear=Dd;Tt.prototype.delete=Pd;Tt.prototype.get=Od;Tt.prototype.has=zd;Tt.prototype.set=Ld;function Wt(r){var e=-1,t=r?r.length:0;for(this.clear();++e<t;){var i=r[e];this.set(i[0],i[1])}}function Id(){this.__data__=[]}function Nd(r){var e=this.__data__,t=_r(e,r);if(t<0)return!1;var i=e.length-1;return t==i?e.pop():kd.call(e,t,1),!0}function qd(r){var e=this.__data__,t=_r(e,r);return t<0?void 0:e[t][1]}function Ud(r){return _r(this.__data__,r)>-1}function Hd(r,e){var t=this.__data__,i=_r(t,r);return i<0?t.push([r,e]):t[i][1]=e,this}Wt.prototype.clear=Id;Wt.prototype.delete=Nd;Wt.prototype.get=qd;Wt.prototype.has=Ud;Wt.prototype.set=Hd;function St(r){var e=-1,t=r?r.length:0;for(this.clear();++e<t;){var i=r[e];this.set(i[0],i[1])}}function jd(){this.__data__={hash:new Tt,map:new(Fd||Wt),string:new Tt}}function Vd(r){return pr(this,r).delete(r)}function Gd(r){return pr(this,r).get(r)}function Wd(r){return pr(this,r).has(r)}function Xd(r,e){return pr(this,r).set(r,e),this}St.prototype.clear=jd;St.prototype.delete=Vd;St.prototype.get=Gd;St.prototype.has=Wd;St.prototype.set=Xd;function _r(r,e){for(var t=r.length;t--;)if(Qd(r[t][0],e))return t;return-1}function Yd(r){if(!_l(r)||Kd(r))return!1;var e=Zd(r)||Ad(r)?Bd:vd;return e.test(Jd(r))}function pr(r,e){var t=r.__data__;return $d(e)?t[typeof e=="string"?"string":"hash"]:t.map}function fl(r,e){var t=Sd(r,e);return Yd(t)?t:void 0}function $d(r){var e=typeof r;return e=="string"||e=="number"||e=="symbol"||e=="boolean"?r!=="__proto__":r===null}function Kd(r){return!!ll&&ll in r}function Jd(r){if(r!=null){try{return cl.call(r)}catch{}try{return r+""}catch{}}return""}function tn(r,e){if(typeof r!="function"||e&&typeof e!="function")throw new TypeError(wd);var t=function(){var i=arguments,s=e?e.apply(this,i):i[0],n=t.cache;if(n.has(s))return n.get(s);var o=r.apply(this,i);return t.cache=n.set(s,o),o};return t.cache=new(tn.Cache||St),t}tn.Cache=St;function Qd(r,e){return r===e||r!==r&&e!==e}function Zd(r){var e=_l(r)?Md.call(r):"";return e==xd||e==yd}function _l(r){var e=typeof r;return!!r&&(e=="object"||e=="function")}pl.exports=tn});var u=xe(ol()),L=xe(Ji()),d=xe(G()),P=xe(qe()),oe=xe(le()),je=xe(Ts()),ae=xe(ws());var Se=xe(Et()),gd=`#version 300 es
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
}`,md=`#version 300 es
precision highp float;

uniform float u_time;
uniform float u_alpha;

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
    float noise = simplex3d(vec3(uv * 10.0, u_time*0.21)) * clamp(u_time - .3, 0.0, 1.0);

    // Output to screen
    FragColor = vec4(u_alpha * mix(vec3(.1843, .3098, .3098), vec3(.149, .2471, .2471), noise), u_alpha);
}`,cr=class extends Se.default{get vertexCode(){return gd}get fragmentCode(){return md}get uniformTypes(){return{u_projection:{type:Se.default.UniformTypes.Matrix,bind:Se.default.UniformBinds.Projection},u_world:{type:Se.default.UniformTypes.Matrix,bind:Se.default.UniformBinds.World},u_time:{type:Se.default.UniformTypes.Float,bind:"u_time"},u_aspect_ratio:{type:Se.default.UniformTypes.Float,bind:"u_aspect_ratio"},u_alpha:{type:Se.default.UniformTypes.Float,bind:"u_alpha"}}}get attributeTypes(){return{a_position:{size:3,type:Se.default.AttributeTypes.Float,normalize:!1,bind:Se.default.AttributeBinds.Position},a_coord:{size:2,type:Se.default.AttributeTypes.Float,normalize:!1,bind:Se.default.AttributeBinds.TextureCoords}}}};var Qs=[];var fr=[];function xi(r){fr.push(r)}function al(){for(var r=Qs.length-1;r>=0;r--){let e=Qs[r];e.condition()&&(Qs.splice(r,1),e.action())}for(var r=fr.length-1;r>=0;r--)fr[r]()&&fr.splice(r,1)}var Gl=xe(gl());function ec(r){if(!!r&&!(typeof window>"u")){var e=document.createElement("style");return e.setAttribute("type","text/css"),e.innerHTML=r,document.head.appendChild(e),r}}function $t(r,e){var t=r.__state.conversionName.toString(),i=Math.round(r.r),s=Math.round(r.g),n=Math.round(r.b),o=r.a,a=Math.round(r.h),l=r.s.toFixed(1),h=r.v.toFixed(1);if(e||t==="THREE_CHAR_HEX"||t==="SIX_CHAR_HEX"){for(var c=r.hex.toString(16);c.length<6;)c="0"+c;return"#"+c}else{if(t==="CSS_RGB")return"rgb("+i+","+s+","+n+")";if(t==="CSS_RGBA")return"rgba("+i+","+s+","+n+","+o+")";if(t==="HEX")return"0x"+r.hex.toString(16);if(t==="RGB_ARRAY")return"["+i+","+s+","+n+"]";if(t==="RGBA_ARRAY")return"["+i+","+s+","+n+","+o+"]";if(t==="RGB_OBJ")return"{r:"+i+",g:"+s+",b:"+n+"}";if(t==="RGBA_OBJ")return"{r:"+i+",g:"+s+",b:"+n+",a:"+o+"}";if(t==="HSV_OBJ")return"{h:"+a+",s:"+l+",v:"+h+"}";if(t==="HSVA_OBJ")return"{h:"+a+",s:"+l+",v:"+h+",a:"+o+"}"}return"unknown format"}var ml=Array.prototype.forEach,bi=Array.prototype.slice,g={BREAK:{},extend:function(e){return this.each(bi.call(arguments,1),function(t){var i=this.isObject(t)?Object.keys(t):[];i.forEach(function(s){this.isUndefined(t[s])||(e[s]=t[s])}.bind(this))},this),e},defaults:function(e){return this.each(bi.call(arguments,1),function(t){var i=this.isObject(t)?Object.keys(t):[];i.forEach(function(s){this.isUndefined(e[s])&&(e[s]=t[s])}.bind(this))},this),e},compose:function(){var e=bi.call(arguments);return function(){for(var t=bi.call(arguments),i=e.length-1;i>=0;i--)t=[e[i].apply(this,t)];return t[0]}},each:function(e,t,i){if(!!e){if(ml&&e.forEach&&e.forEach===ml)e.forEach(t,i);else if(e.length===e.length+0){var s=void 0,n=void 0;for(s=0,n=e.length;s<n;s++)if(s in e&&t.call(i,e[s],s)===this.BREAK)return}else for(var o in e)if(t.call(i,e[o],o)===this.BREAK)return}},defer:function(e){setTimeout(e,0)},debounce:function(e,t,i){var s=void 0;return function(){var n=this,o=arguments;function a(){s=null,i||e.apply(n,o)}var l=i||!s;clearTimeout(s),s=setTimeout(a,t),l&&e.apply(n,o)}},toArray:function(e){return e.toArray?e.toArray():bi.call(e)},isUndefined:function(e){return e===void 0},isNull:function(e){return e===null},isNaN:function(r){function e(t){return r.apply(this,arguments)}return e.toString=function(){return r.toString()},e}(function(r){return isNaN(r)}),isArray:Array.isArray||function(r){return r.constructor===Array},isObject:function(e){return e===Object(e)},isNumber:function(e){return e===e+0},isString:function(e){return e===e+""},isBoolean:function(e){return e===!1||e===!0},isFunction:function(e){return e instanceof Function}},tc=[{litmus:g.isString,conversions:{THREE_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return t===null?!1:{space:"HEX",hex:parseInt("0x"+t[1].toString()+t[1].toString()+t[2].toString()+t[2].toString()+t[3].toString()+t[3].toString(),0)}},write:$t},SIX_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9]{6})$/i);return t===null?!1:{space:"HEX",hex:parseInt("0x"+t[1].toString(),0)}},write:$t},CSS_RGB:{read:function(e){var t=e.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);return t===null?!1:{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3])}},write:$t},CSS_RGBA:{read:function(e){var t=e.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);return t===null?!1:{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3]),a:parseFloat(t[4])}},write:$t}}},{litmus:g.isNumber,conversions:{HEX:{read:function(e){return{space:"HEX",hex:e,conversionName:"HEX"}},write:function(e){return e.hex}}}},{litmus:g.isArray,conversions:{RGB_ARRAY:{read:function(e){return e.length!==3?!1:{space:"RGB",r:e[0],g:e[1],b:e[2]}},write:function(e){return[e.r,e.g,e.b]}},RGBA_ARRAY:{read:function(e){return e.length!==4?!1:{space:"RGB",r:e[0],g:e[1],b:e[2],a:e[3]}},write:function(e){return[e.r,e.g,e.b,e.a]}}}},{litmus:g.isObject,conversions:{RGBA_OBJ:{read:function(e){return g.isNumber(e.r)&&g.isNumber(e.g)&&g.isNumber(e.b)&&g.isNumber(e.a)?{space:"RGB",r:e.r,g:e.g,b:e.b,a:e.a}:!1},write:function(e){return{r:e.r,g:e.g,b:e.b,a:e.a}}},RGB_OBJ:{read:function(e){return g.isNumber(e.r)&&g.isNumber(e.g)&&g.isNumber(e.b)?{space:"RGB",r:e.r,g:e.g,b:e.b}:!1},write:function(e){return{r:e.r,g:e.g,b:e.b}}},HSVA_OBJ:{read:function(e){return g.isNumber(e.h)&&g.isNumber(e.s)&&g.isNumber(e.v)&&g.isNumber(e.a)?{space:"HSV",h:e.h,s:e.s,v:e.v,a:e.a}:!1},write:function(e){return{h:e.h,s:e.s,v:e.v,a:e.a}}},HSV_OBJ:{read:function(e){return g.isNumber(e.h)&&g.isNumber(e.s)&&g.isNumber(e.v)?{space:"HSV",h:e.h,s:e.s,v:e.v}:!1},write:function(e){return{h:e.h,s:e.s,v:e.v}}}}}],vi=void 0,gr=void 0,sn=function(){gr=!1;var e=arguments.length>1?g.toArray(arguments):arguments[0];return g.each(tc,function(t){if(t.litmus(e))return g.each(t.conversions,function(i,s){if(vi=i.read(e),gr===!1&&vi!==!1)return gr=vi,vi.conversionName=s,vi.conversion=i,g.BREAK}),g.BREAK}),gr},wl=void 0,wr={hsv_to_rgb:function(e,t,i){var s=Math.floor(e/60)%6,n=e/60-Math.floor(e/60),o=i*(1-t),a=i*(1-n*t),l=i*(1-(1-n)*t),h=[[i,l,o],[a,i,o],[o,i,l],[o,a,i],[l,o,i],[i,o,a]][s];return{r:h[0]*255,g:h[1]*255,b:h[2]*255}},rgb_to_hsv:function(e,t,i){var s=Math.min(e,t,i),n=Math.max(e,t,i),o=n-s,a=void 0,l=void 0;if(n!==0)l=o/n;else return{h:NaN,s:0,v:0};return e===n?a=(t-i)/o:t===n?a=2+(i-e)/o:a=4+(e-t)/o,a/=6,a<0&&(a+=1),{h:a*360,s:l,v:n/255}},rgb_to_hex:function(e,t,i){var s=this.hex_with_component(0,2,e);return s=this.hex_with_component(s,1,t),s=this.hex_with_component(s,0,i),s},component_from_hex:function(e,t){return e>>t*8&255},hex_with_component:function(e,t,i){return i<<(wl=t*8)|e&~(255<<wl)}},ic=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(r){return typeof r}:function(r){return r&&typeof Symbol=="function"&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r},De=function(r,e){if(!(r instanceof e))throw new TypeError("Cannot call a class as a function")},Pe=function(){function r(e,t){for(var i=0;i<t.length;i++){var s=t[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(e,t,i){return t&&r(e.prototype,t),i&&r(e,i),e}}(),at=function r(e,t,i){e===null&&(e=Function.prototype);var s=Object.getOwnPropertyDescriptor(e,t);if(s===void 0){var n=Object.getPrototypeOf(e);return n===null?void 0:r(n,t,i)}else{if("value"in s)return s.value;var o=s.get;return o===void 0?void 0:o.call(i)}},lt=function(r,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);r.prototype=Object.create(e&&e.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(r,e):r.__proto__=e)},ut=function(r,e){if(!r)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:r},ne=function(){function r(){if(De(this,r),this.__state=sn.apply(this,arguments),this.__state===!1)throw new Error("Failed to interpret color arguments");this.__state.a=this.__state.a||1}return Pe(r,[{key:"toString",value:function(){return $t(this)}},{key:"toHexString",value:function(){return $t(this,!0)}},{key:"toOriginal",value:function(){return this.__state.conversion.write(this)}}]),r}();function hn(r,e,t){Object.defineProperty(r,e,{get:function(){return this.__state.space==="RGB"?this.__state[e]:(ne.recalculateRGB(this,e,t),this.__state[e])},set:function(s){this.__state.space!=="RGB"&&(ne.recalculateRGB(this,e,t),this.__state.space="RGB"),this.__state[e]=s}})}function dn(r,e){Object.defineProperty(r,e,{get:function(){return this.__state.space==="HSV"?this.__state[e]:(ne.recalculateHSV(this),this.__state[e])},set:function(i){this.__state.space!=="HSV"&&(ne.recalculateHSV(this),this.__state.space="HSV"),this.__state[e]=i}})}ne.recalculateRGB=function(r,e,t){if(r.__state.space==="HEX")r.__state[e]=wr.component_from_hex(r.__state.hex,t);else if(r.__state.space==="HSV")g.extend(r.__state,wr.hsv_to_rgb(r.__state.h,r.__state.s,r.__state.v));else throw new Error("Corrupted color state")};ne.recalculateHSV=function(r){var e=wr.rgb_to_hsv(r.r,r.g,r.b);g.extend(r.__state,{s:e.s,v:e.v}),g.isNaN(e.h)?g.isUndefined(r.__state.h)&&(r.__state.h=0):r.__state.h=e.h};ne.COMPONENTS=["r","g","b","h","s","v","hex","a"];hn(ne.prototype,"r",2);hn(ne.prototype,"g",1);hn(ne.prototype,"b",0);dn(ne.prototype,"h");dn(ne.prototype,"s");dn(ne.prototype,"v");Object.defineProperty(ne.prototype,"a",{get:function(){return this.__state.a},set:function(e){this.__state.a=e}});Object.defineProperty(ne.prototype,"hex",{get:function(){return this.__state.space!=="HEX"&&(this.__state.hex=wr.rgb_to_hex(this.r,this.g,this.b),this.__state.space="HEX"),this.__state.hex},set:function(e){this.__state.space="HEX",this.__state.hex=e}});var At=function(){function r(e,t){De(this,r),this.initialValue=e[t],this.domElement=document.createElement("div"),this.object=e,this.property=t,this.__onChange=void 0,this.__onFinishChange=void 0}return Pe(r,[{key:"onChange",value:function(t){return this.__onChange=t,this}},{key:"onFinishChange",value:function(t){return this.__onFinishChange=t,this}},{key:"setValue",value:function(t){return this.object[this.property]=t,this.__onChange&&this.__onChange.call(this,t),this.updateDisplay(),this}},{key:"getValue",value:function(){return this.object[this.property]}},{key:"updateDisplay",value:function(){return this}},{key:"isModified",value:function(){return this.initialValue!==this.getValue()}}]),r}(),rc={HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},Rl={};g.each(rc,function(r,e){g.each(r,function(t){Rl[t]=e})});var sc=/(\d+(\.\d+)?)px/;function Ue(r){if(r==="0"||g.isUndefined(r))return 0;var e=r.match(sc);return g.isNull(e)?0:parseFloat(e[1])}var f={makeSelectable:function(e,t){e===void 0||e.style===void 0||(e.onselectstart=t?function(){return!1}:function(){},e.style.MozUserSelect=t?"auto":"none",e.style.KhtmlUserSelect=t?"auto":"none",e.unselectable=t?"on":"off")},makeFullscreen:function(e,t,i){var s=i,n=t;g.isUndefined(n)&&(n=!0),g.isUndefined(s)&&(s=!0),e.style.position="absolute",n&&(e.style.left=0,e.style.right=0),s&&(e.style.top=0,e.style.bottom=0)},fakeEvent:function(e,t,i,s){var n=i||{},o=Rl[t];if(!o)throw new Error("Event type "+t+" not supported.");var a=document.createEvent(o);switch(o){case"MouseEvents":{var l=n.x||n.clientX||0,h=n.y||n.clientY||0;a.initMouseEvent(t,n.bubbles||!1,n.cancelable||!0,window,n.clickCount||1,0,0,l,h,!1,!1,!1,!1,0,null);break}case"KeyboardEvents":{var c=a.initKeyboardEvent||a.initKeyEvent;g.defaults(n,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0}),c(t,n.bubbles||!1,n.cancelable,window,n.ctrlKey,n.altKey,n.shiftKey,n.metaKey,n.keyCode,n.charCode);break}default:{a.initEvent(t,n.bubbles||!1,n.cancelable||!0);break}}g.defaults(a,s),e.dispatchEvent(a)},bind:function(e,t,i,s){var n=s||!1;return e.addEventListener?e.addEventListener(t,i,n):e.attachEvent&&e.attachEvent("on"+t,i),f},unbind:function(e,t,i,s){var n=s||!1;return e.removeEventListener?e.removeEventListener(t,i,n):e.detachEvent&&e.detachEvent("on"+t,i),f},addClass:function(e,t){if(e.className===void 0)e.className=t;else if(e.className!==t){var i=e.className.split(/ +/);i.indexOf(t)===-1&&(i.push(t),e.className=i.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return f},removeClass:function(e,t){if(t)if(e.className===t)e.removeAttribute("class");else{var i=e.className.split(/ +/),s=i.indexOf(t);s!==-1&&(i.splice(s,1),e.className=i.join(" "))}else e.className=void 0;return f},hasClass:function(e,t){return new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)||!1},getWidth:function(e){var t=getComputedStyle(e);return Ue(t["border-left-width"])+Ue(t["border-right-width"])+Ue(t["padding-left"])+Ue(t["padding-right"])+Ue(t.width)},getHeight:function(e){var t=getComputedStyle(e);return Ue(t["border-top-width"])+Ue(t["border-bottom-width"])+Ue(t["padding-top"])+Ue(t["padding-bottom"])+Ue(t.height)},getOffset:function(e){var t=e,i={left:0,top:0};if(t.offsetParent)do i.left+=t.offsetLeft,i.top+=t.offsetTop,t=t.offsetParent;while(t);return i},isActive:function(e){return e===document.activeElement&&(e.type||e.href)}},Ml=function(r){lt(e,r);function e(t,i){De(this,e);var s=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),n=s;s.__prev=s.getValue(),s.__checkbox=document.createElement("input"),s.__checkbox.setAttribute("type","checkbox");function o(){n.setValue(!n.__prev)}return f.bind(s.__checkbox,"change",o,!1),s.domElement.appendChild(s.__checkbox),s.updateDisplay(),s}return Pe(e,[{key:"setValue",value:function(i){var s=at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,i);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),this.__prev=this.getValue(),s}},{key:"updateDisplay",value:function(){return this.getValue()===!0?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0,this.__prev=!0):(this.__checkbox.checked=!1,this.__prev=!1),at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(At),nc=function(r){lt(e,r);function e(t,i,s){De(this,e);var n=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),o=s,a=n;if(n.__select=document.createElement("select"),g.isArray(o)){var l={};g.each(o,function(h){l[h]=h}),o=l}return g.each(o,function(h,c){var _=document.createElement("option");_.innerHTML=c,_.setAttribute("value",h),a.__select.appendChild(_)}),n.updateDisplay(),f.bind(n.__select,"change",function(){var h=this.options[this.selectedIndex].value;a.setValue(h)}),n.domElement.appendChild(n.__select),n}return Pe(e,[{key:"setValue",value:function(i){var s=at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,i);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),s}},{key:"updateDisplay",value:function(){return f.isActive(this.__select)?this:(this.__select.value=this.getValue(),at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this))}}]),e}(At),oc=function(r){lt(e,r);function e(t,i){De(this,e);var s=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),n=s;function o(){n.setValue(n.__input.value)}function a(){n.__onFinishChange&&n.__onFinishChange.call(n,n.getValue())}return s.__input=document.createElement("input"),s.__input.setAttribute("type","text"),f.bind(s.__input,"keyup",o),f.bind(s.__input,"change",o),f.bind(s.__input,"blur",a),f.bind(s.__input,"keydown",function(l){l.keyCode===13&&this.blur()}),s.updateDisplay(),s.domElement.appendChild(s.__input),s}return Pe(e,[{key:"updateDisplay",value:function(){return f.isActive(this.__input)||(this.__input.value=this.getValue()),at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(At);function xl(r){var e=r.toString();return e.indexOf(".")>-1?e.length-e.indexOf(".")-1:0}var Bl=function(r){lt(e,r);function e(t,i,s){De(this,e);var n=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),o=s||{};return n.__min=o.min,n.__max=o.max,n.__step=o.step,g.isUndefined(n.__step)?n.initialValue===0?n.__impliedStep=1:n.__impliedStep=Math.pow(10,Math.floor(Math.log(Math.abs(n.initialValue))/Math.LN10))/10:n.__impliedStep=n.__step,n.__precision=xl(n.__impliedStep),n}return Pe(e,[{key:"setValue",value:function(i){var s=i;return this.__min!==void 0&&s<this.__min?s=this.__min:this.__max!==void 0&&s>this.__max&&(s=this.__max),this.__step!==void 0&&s%this.__step!==0&&(s=Math.round(s/this.__step)*this.__step),at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,s)}},{key:"min",value:function(i){return this.__min=i,this}},{key:"max",value:function(i){return this.__max=i,this}},{key:"step",value:function(i){return this.__step=i,this.__impliedStep=i,this.__precision=xl(i),this}}]),e}(At);function ac(r,e){var t=Math.pow(10,e);return Math.round(r*t)/t}var xr=function(r){lt(e,r);function e(t,i,s){De(this,e);var n=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i,s));n.__truncationSuspended=!1;var o=n,a=void 0;function l(){var x=parseFloat(o.__input.value);g.isNaN(x)||o.setValue(x)}function h(){o.__onFinishChange&&o.__onFinishChange.call(o,o.getValue())}function c(){h()}function _(x){var p=a-x.clientY;o.setValue(o.getValue()+p*o.__impliedStep),a=x.clientY}function m(){f.unbind(window,"mousemove",_),f.unbind(window,"mouseup",m),h()}function w(x){f.bind(window,"mousemove",_),f.bind(window,"mouseup",m),a=x.clientY}return n.__input=document.createElement("input"),n.__input.setAttribute("type","text"),f.bind(n.__input,"change",l),f.bind(n.__input,"blur",c),f.bind(n.__input,"mousedown",w),f.bind(n.__input,"keydown",function(x){x.keyCode===13&&(o.__truncationSuspended=!0,this.blur(),o.__truncationSuspended=!1,h())}),n.updateDisplay(),n.domElement.appendChild(n.__input),n}return Pe(e,[{key:"updateDisplay",value:function(){return this.__input.value=this.__truncationSuspended?this.getValue():ac(this.getValue(),this.__precision),at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(Bl);function yl(r,e,t,i,s){return i+(s-i)*((r-e)/(t-e))}var nn=function(r){lt(e,r);function e(t,i,s,n,o){De(this,e);var a=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i,{min:s,max:n,step:o})),l=a;a.__background=document.createElement("div"),a.__foreground=document.createElement("div"),f.bind(a.__background,"mousedown",h),f.bind(a.__background,"touchstart",m),f.addClass(a.__background,"slider"),f.addClass(a.__foreground,"slider-fg");function h(p){document.activeElement.blur(),f.bind(window,"mousemove",c),f.bind(window,"mouseup",_),c(p)}function c(p){p.preventDefault();var v=l.__background.getBoundingClientRect();return l.setValue(yl(p.clientX,v.left,v.right,l.__min,l.__max)),!1}function _(){f.unbind(window,"mousemove",c),f.unbind(window,"mouseup",_),l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())}function m(p){p.touches.length===1&&(f.bind(window,"touchmove",w),f.bind(window,"touchend",x),w(p))}function w(p){var v=p.touches[0].clientX,M=l.__background.getBoundingClientRect();l.setValue(yl(v,M.left,M.right,l.__min,l.__max))}function x(){f.unbind(window,"touchmove",w),f.unbind(window,"touchend",x),l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())}return a.updateDisplay(),a.__background.appendChild(a.__foreground),a.domElement.appendChild(a.__background),a}return Pe(e,[{key:"updateDisplay",value:function(){var i=(this.getValue()-this.__min)/(this.__max-this.__min);return this.__foreground.style.width=i*100+"%",at(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(Bl),kl=function(r){lt(e,r);function e(t,i,s){De(this,e);var n=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i)),o=n;return n.__button=document.createElement("div"),n.__button.innerHTML=s===void 0?"Fire":s,f.bind(n.__button,"click",function(a){return a.preventDefault(),o.fire(),!1}),f.addClass(n.__button,"button"),n.domElement.appendChild(n.__button),n}return Pe(e,[{key:"fire",value:function(){this.__onChange&&this.__onChange.call(this),this.getValue().call(this.object),this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}}]),e}(At),on=function(r){lt(e,r);function e(t,i){De(this,e);var s=ut(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i));s.__color=new ne(s.getValue()),s.__temp=new ne(0);var n=s;s.domElement=document.createElement("div"),f.makeSelectable(s.domElement,!1),s.__selector=document.createElement("div"),s.__selector.className="selector",s.__saturation_field=document.createElement("div"),s.__saturation_field.className="saturation-field",s.__field_knob=document.createElement("div"),s.__field_knob.className="field-knob",s.__field_knob_border="2px solid ",s.__hue_knob=document.createElement("div"),s.__hue_knob.className="hue-knob",s.__hue_field=document.createElement("div"),s.__hue_field.className="hue-field",s.__input=document.createElement("input"),s.__input.type="text",s.__input_textShadow="0 1px 1px ",f.bind(s.__input,"keydown",function(p){p.keyCode===13&&_.call(this)}),f.bind(s.__input,"blur",_),f.bind(s.__selector,"mousedown",function(){f.addClass(this,"drag").bind(window,"mouseup",function(){f.removeClass(n.__selector,"drag")})}),f.bind(s.__selector,"touchstart",function(){f.addClass(this,"drag").bind(window,"touchend",function(){f.removeClass(n.__selector,"drag")})});var o=document.createElement("div");g.extend(s.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"}),g.extend(s.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:s.__field_knob_border+(s.__color.v<.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1}),g.extend(s.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1}),g.extend(s.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"}),g.extend(o.style,{width:"100%",height:"100%",background:"none"}),bl(o,"top","rgba(0,0,0,0)","#000"),g.extend(s.__hue_field.style,{width:"15px",height:"100px",border:"1px solid #555",cursor:"ns-resize",position:"absolute",top:"3px",right:"3px"}),uc(s.__hue_field),g.extend(s.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:s.__input_textShadow+"rgba(0,0,0,0.7)"}),f.bind(s.__saturation_field,"mousedown",a),f.bind(s.__saturation_field,"touchstart",a),f.bind(s.__field_knob,"mousedown",a),f.bind(s.__field_knob,"touchstart",a),f.bind(s.__hue_field,"mousedown",l),f.bind(s.__hue_field,"touchstart",l);function a(p){w(p),f.bind(window,"mousemove",w),f.bind(window,"touchmove",w),f.bind(window,"mouseup",h),f.bind(window,"touchend",h)}function l(p){x(p),f.bind(window,"mousemove",x),f.bind(window,"touchmove",x),f.bind(window,"mouseup",c),f.bind(window,"touchend",c)}function h(){f.unbind(window,"mousemove",w),f.unbind(window,"touchmove",w),f.unbind(window,"mouseup",h),f.unbind(window,"touchend",h),m()}function c(){f.unbind(window,"mousemove",x),f.unbind(window,"touchmove",x),f.unbind(window,"mouseup",c),f.unbind(window,"touchend",c),m()}function _(){var p=sn(this.value);p!==!1?(n.__color.__state=p,n.setValue(n.__color.toOriginal())):this.value=n.__color.toString()}function m(){n.__onFinishChange&&n.__onFinishChange.call(n,n.__color.toOriginal())}s.__saturation_field.appendChild(o),s.__selector.appendChild(s.__field_knob),s.__selector.appendChild(s.__saturation_field),s.__selector.appendChild(s.__hue_field),s.__hue_field.appendChild(s.__hue_knob),s.domElement.appendChild(s.__input),s.domElement.appendChild(s.__selector),s.updateDisplay();function w(p){p.type.indexOf("touch")===-1&&p.preventDefault();var v=n.__saturation_field.getBoundingClientRect(),M=p.touches&&p.touches[0]||p,k=M.clientX,F=M.clientY,re=(k-v.left)/(v.right-v.left),j=1-(F-v.top)/(v.bottom-v.top);return j>1?j=1:j<0&&(j=0),re>1?re=1:re<0&&(re=0),n.__color.v=j,n.__color.s=re,n.setValue(n.__color.toOriginal()),!1}function x(p){p.type.indexOf("touch")===-1&&p.preventDefault();var v=n.__hue_field.getBoundingClientRect(),M=p.touches&&p.touches[0]||p,k=M.clientY,F=1-(k-v.top)/(v.bottom-v.top);return F>1?F=1:F<0&&(F=0),n.__color.h=F*360,n.setValue(n.__color.toOriginal()),!1}return s}return Pe(e,[{key:"updateDisplay",value:function(){var i=sn(this.getValue());if(i!==!1){var s=!1;g.each(ne.COMPONENTS,function(a){if(!g.isUndefined(i[a])&&!g.isUndefined(this.__color.__state[a])&&i[a]!==this.__color.__state[a])return s=!0,{}},this),s&&g.extend(this.__color.__state,i)}g.extend(this.__temp.__state,this.__color.__state),this.__temp.a=1;var n=this.__color.v<.5||this.__color.s>.5?255:0,o=255-n;g.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toHexString(),border:this.__field_knob_border+"rgb("+n+","+n+","+n+")"}),this.__hue_knob.style.marginTop=(1-this.__color.h/360)*100+"px",this.__temp.s=1,this.__temp.v=1,bl(this.__saturation_field,"left","#fff",this.__temp.toHexString()),this.__input.value=this.__color.toString(),g.extend(this.__input.style,{backgroundColor:this.__color.toHexString(),color:"rgb("+n+","+n+","+n+")",textShadow:this.__input_textShadow+"rgba("+o+","+o+","+o+",.7)"})}}]),e}(At),lc=["-moz-","-o-","-webkit-","-ms-",""];function bl(r,e,t,i){r.style.background="",g.each(lc,function(s){r.style.cssText+="background: "+s+"linear-gradient("+e+", "+t+" 0%, "+i+" 100%); "})}function uc(r){r.style.background="",r.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);",r.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",r.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",r.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",r.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var hc={load:function(e,t){var i=t||document,s=i.createElement("link");s.type="text/css",s.rel="stylesheet",s.href=e,i.getElementsByTagName("head")[0].appendChild(s)},inject:function(e,t){var i=t||document,s=document.createElement("style");s.type="text/css",s.innerHTML=e;var n=i.getElementsByTagName("head")[0];try{n.appendChild(s)}catch{}}},dc=`<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`,cc=function(e,t){var i=e[t];return g.isArray(arguments[2])||g.isObject(arguments[2])?new nc(e,t,arguments[2]):g.isNumber(i)?g.isNumber(arguments[2])&&g.isNumber(arguments[3])?g.isNumber(arguments[4])?new nn(e,t,arguments[2],arguments[3],arguments[4]):new nn(e,t,arguments[2],arguments[3]):g.isNumber(arguments[4])?new xr(e,t,{min:arguments[2],max:arguments[3],step:arguments[4]}):new xr(e,t,{min:arguments[2],max:arguments[3]}):g.isString(i)?new oc(e,t):g.isFunction(i)?new kl(e,t,""):g.isBoolean(i)?new Ml(e,t):null};function fc(r){setTimeout(r,1e3/60)}var _c=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||fc,pc=function(){function r(){De(this,r),this.backgroundElement=document.createElement("div"),g.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"}),f.makeFullscreen(this.backgroundElement),this.backgroundElement.style.position="fixed",this.domElement=document.createElement("div"),g.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"}),document.body.appendChild(this.backgroundElement),document.body.appendChild(this.domElement);var e=this;f.bind(this.backgroundElement,"click",function(){e.hide()})}return Pe(r,[{key:"show",value:function(){var t=this;this.backgroundElement.style.display="block",this.domElement.style.display="block",this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)",this.layout(),g.defer(function(){t.backgroundElement.style.opacity=1,t.domElement.style.opacity=1,t.domElement.style.webkitTransform="scale(1)"})}},{key:"hide",value:function(){var t=this,i=function s(){t.domElement.style.display="none",t.backgroundElement.style.display="none",f.unbind(t.domElement,"webkitTransitionEnd",s),f.unbind(t.domElement,"transitionend",s),f.unbind(t.domElement,"oTransitionEnd",s)};f.bind(this.domElement,"webkitTransitionEnd",i),f.bind(this.domElement,"transitionend",i),f.bind(this.domElement,"oTransitionEnd",i),this.backgroundElement.style.opacity=0,this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)"}},{key:"layout",value:function(){this.domElement.style.left=window.innerWidth/2-f.getWidth(this.domElement)/2+"px",this.domElement.style.top=window.innerHeight/2-f.getHeight(this.domElement)/2+"px"}}]),r}(),gc=ec(`.dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .cr.function .property-name{width:100%}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}
`);hc.inject(gc);var vl="dg",El=72,Tl=20,Ai="Default",Ei=function(){try{return!!window.localStorage}catch{return!1}}(),Ti=void 0,Sl=!0,Xt=void 0,rn=!1,Fl=[],V=function r(e){var t=this,i=e||{};this.domElement=document.createElement("div"),this.__ul=document.createElement("ul"),this.domElement.appendChild(this.__ul),f.addClass(this.domElement,vl),this.__folders={},this.__controllers=[],this.__rememberedObjects=[],this.__rememberedObjectIndecesToControllers=[],this.__listening=[],i=g.defaults(i,{closeOnTop:!1,autoPlace:!0,width:r.DEFAULT_WIDTH}),i=g.defaults(i,{resizable:i.autoPlace,hideable:i.autoPlace}),g.isUndefined(i.load)?i.load={preset:Ai}:i.preset&&(i.load.preset=i.preset),g.isUndefined(i.parent)&&i.hideable&&Fl.push(this),i.resizable=g.isUndefined(i.parent)&&i.resizable,i.autoPlace&&g.isUndefined(i.scrollable)&&(i.scrollable=!0);var s=Ei&&localStorage.getItem(Yt(this,"isLocal"))==="true",n=void 0,o=void 0;if(Object.defineProperties(this,{parent:{get:function(){return i.parent}},scrollable:{get:function(){return i.scrollable}},autoPlace:{get:function(){return i.autoPlace}},closeOnTop:{get:function(){return i.closeOnTop}},preset:{get:function(){return t.parent?t.getRoot().preset:i.load.preset},set:function(m){t.parent?t.getRoot().preset=m:i.load.preset=m,yc(this),t.revert()}},width:{get:function(){return i.width},set:function(m){i.width=m,un(t,m)}},name:{get:function(){return i.name},set:function(m){i.name=m,o&&(o.innerHTML=i.name)}},closed:{get:function(){return i.closed},set:function(m){i.closed=m,i.closed?f.addClass(t.__ul,r.CLASS_CLOSED):f.removeClass(t.__ul,r.CLASS_CLOSED),this.onResize(),t.__closeButton&&(t.__closeButton.innerHTML=m?r.TEXT_OPEN:r.TEXT_CLOSED)}},load:{get:function(){return i.load}},useLocalStorage:{get:function(){return s},set:function(m){Ei&&(s=m,m?f.bind(window,"unload",n):f.unbind(window,"unload",n),localStorage.setItem(Yt(t,"isLocal"),m))}}}),g.isUndefined(i.parent)){if(this.closed=i.closed||!1,f.addClass(this.domElement,r.CLASS_MAIN),f.makeSelectable(this.domElement,!1),Ei&&s){t.useLocalStorage=!0;var a=localStorage.getItem(Yt(this,"gui"));a&&(i.load=JSON.parse(a))}this.__closeButton=document.createElement("div"),this.__closeButton.innerHTML=r.TEXT_CLOSED,f.addClass(this.__closeButton,r.CLASS_CLOSE_BUTTON),i.closeOnTop?(f.addClass(this.__closeButton,r.CLASS_CLOSE_TOP),this.domElement.insertBefore(this.__closeButton,this.domElement.childNodes[0])):(f.addClass(this.__closeButton,r.CLASS_CLOSE_BOTTOM),this.domElement.appendChild(this.__closeButton)),f.bind(this.__closeButton,"click",function(){t.closed=!t.closed})}else{i.closed===void 0&&(i.closed=!0);var l=document.createTextNode(i.name);f.addClass(l,"controller-name"),o=cn(t,l);var h=function(m){return m.preventDefault(),t.closed=!t.closed,!1};f.addClass(this.__ul,r.CLASS_CLOSED),f.addClass(o,"title"),f.bind(o,"click",h),i.closed||(this.closed=!1)}i.autoPlace&&(g.isUndefined(i.parent)&&(Sl&&(Xt=document.createElement("div"),f.addClass(Xt,vl),f.addClass(Xt,r.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(Xt),Sl=!1),Xt.appendChild(this.domElement),f.addClass(this.domElement,r.CLASS_AUTO_PLACE)),this.parent||un(t,i.width)),this.__resizeHandler=function(){t.onResizeDebounced()},f.bind(window,"resize",this.__resizeHandler),f.bind(this.__ul,"webkitTransitionEnd",this.__resizeHandler),f.bind(this.__ul,"transitionend",this.__resizeHandler),f.bind(this.__ul,"oTransitionEnd",this.__resizeHandler),this.onResize(),i.resizable&&xc(this),n=function(){Ei&&localStorage.getItem(Yt(t,"isLocal"))==="true"&&localStorage.setItem(Yt(t,"gui"),JSON.stringify(t.getSaveObject()))},this.saveToLocalStorageIfPossible=n;function c(){var _=t.getRoot();_.width+=1,g.defer(function(){_.width-=1})}i.parent||c()};V.toggleHide=function(){rn=!rn,g.each(Fl,function(r){r.domElement.style.display=rn?"none":""})};V.CLASS_AUTO_PLACE="a";V.CLASS_AUTO_PLACE_CONTAINER="ac";V.CLASS_MAIN="main";V.CLASS_CONTROLLER_ROW="cr";V.CLASS_TOO_TALL="taller-than-window";V.CLASS_CLOSED="closed";V.CLASS_CLOSE_BUTTON="close-button";V.CLASS_CLOSE_TOP="close-top";V.CLASS_CLOSE_BOTTOM="close-bottom";V.CLASS_DRAG="drag";V.DEFAULT_WIDTH=245;V.TEXT_CLOSED="Close Controls";V.TEXT_OPEN="Open Controls";V._keydownHandler=function(r){document.activeElement.type!=="text"&&(r.which===El||r.keyCode===El)&&V.toggleHide()};f.bind(window,"keydown",V._keydownHandler,!1);g.extend(V.prototype,{add:function(e,t){return Si(this,e,t,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(e,t){return Si(this,e,t,{color:!0})},remove:function(e){this.__ul.removeChild(e.__li),this.__controllers.splice(this.__controllers.indexOf(e),1);var t=this;g.defer(function(){t.onResize()})},destroy:function(){if(this.parent)throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");this.autoPlace&&Xt.removeChild(this.domElement);var e=this;g.each(this.__folders,function(t){e.removeFolder(t)}),f.unbind(window,"keydown",V._keydownHandler,!1),Al(this)},addFolder:function(e){if(this.__folders[e]!==void 0)throw new Error('You already have a folder in this GUI by the name "'+e+'"');var t={name:e,parent:this};t.autoPlace=this.autoPlace,this.load&&this.load.folders&&this.load.folders[e]&&(t.closed=this.load.folders[e].closed,t.load=this.load.folders[e]);var i=new V(t);this.__folders[e]=i;var s=cn(this,i.domElement);return f.addClass(s,"folder"),i},removeFolder:function(e){this.__ul.removeChild(e.domElement.parentElement),delete this.__folders[e.name],this.load&&this.load.folders&&this.load.folders[e.name]&&delete this.load.folders[e.name],Al(e);var t=this;g.each(e.__folders,function(i){e.removeFolder(i)}),g.defer(function(){t.onResize()})},open:function(){this.closed=!1},close:function(){this.closed=!0},hide:function(){this.domElement.style.display="none"},show:function(){this.domElement.style.display=""},onResize:function(){var e=this.getRoot();if(e.scrollable){var t=f.getOffset(e.__ul).top,i=0;g.each(e.__ul.childNodes,function(s){e.autoPlace&&s===e.__save_row||(i+=f.getHeight(s))}),window.innerHeight-t-Tl<i?(f.addClass(e.domElement,V.CLASS_TOO_TALL),e.__ul.style.height=window.innerHeight-t-Tl+"px"):(f.removeClass(e.domElement,V.CLASS_TOO_TALL),e.__ul.style.height="auto")}e.__resize_handle&&g.defer(function(){e.__resize_handle.style.height=e.__ul.offsetHeight+"px"}),e.__closeButton&&(e.__closeButton.style.width=e.width+"px")},onResizeDebounced:g.debounce(function(){this.onResize()},50),remember:function(){if(g.isUndefined(Ti)&&(Ti=new pc,Ti.domElement.innerHTML=dc),this.parent)throw new Error("You can only call remember on a top level GUI.");var e=this;g.each(Array.prototype.slice.call(arguments),function(t){e.__rememberedObjects.length===0&&wc(e),e.__rememberedObjects.indexOf(t)===-1&&e.__rememberedObjects.push(t)}),this.autoPlace&&un(this,this.width)},getRoot:function(){for(var e=this;e.parent;)e=e.parent;return e},getSaveObject:function(){var e=this.load;return e.closed=this.closed,this.__rememberedObjects.length>0&&(e.preset=this.preset,e.remembered||(e.remembered={}),e.remembered[this.preset]=mr(this)),e.folders={},g.each(this.__folders,function(t,i){e.folders[i]=t.getSaveObject()}),e},save:function(){this.load.remembered||(this.load.remembered={}),this.load.remembered[this.preset]=mr(this),an(this,!1),this.saveToLocalStorageIfPossible()},saveAs:function(e){this.load.remembered||(this.load.remembered={},this.load.remembered[Ai]=mr(this,!0)),this.load.remembered[e]=mr(this),this.preset=e,ln(this,e,!0),this.saveToLocalStorageIfPossible()},revert:function(e){g.each(this.__controllers,function(t){this.getRoot().load.remembered?Dl(e||this.getRoot(),t):t.setValue(t.initialValue),t.__onFinishChange&&t.__onFinishChange.call(t,t.getValue())},this),g.each(this.__folders,function(t){t.revert(t)}),e||an(this.getRoot(),!1)},listen:function(e){var t=this.__listening.length===0;this.__listening.push(e),t&&Pl(this.__listening)},updateDisplay:function(){g.each(this.__controllers,function(e){e.updateDisplay()}),g.each(this.__folders,function(e){e.updateDisplay()})}});function cn(r,e,t){var i=document.createElement("li");return e&&i.appendChild(e),t?r.__ul.insertBefore(i,t):r.__ul.appendChild(i),r.onResize(),i}function Al(r){f.unbind(window,"resize",r.__resizeHandler),r.saveToLocalStorageIfPossible&&f.unbind(window,"unload",r.saveToLocalStorageIfPossible)}function an(r,e){var t=r.__preset_select[r.__preset_select.selectedIndex];e?t.innerHTML=t.value+"*":t.innerHTML=t.value}function mc(r,e,t){if(t.__li=e,t.__gui=r,g.extend(t,{options:function(o){if(arguments.length>1){var a=t.__li.nextElementSibling;return t.remove(),Si(r,t.object,t.property,{before:a,factoryArgs:[g.toArray(arguments)]})}if(g.isArray(o)||g.isObject(o)){var l=t.__li.nextElementSibling;return t.remove(),Si(r,t.object,t.property,{before:l,factoryArgs:[o]})}},name:function(o){return t.__li.firstElementChild.firstElementChild.innerHTML=o,t},listen:function(){return t.__gui.listen(t),t},remove:function(){return t.__gui.remove(t),t}}),t instanceof nn){var i=new xr(t.object,t.property,{min:t.__min,max:t.__max,step:t.__step});g.each(["updateDisplay","onChange","onFinishChange","step","min","max"],function(n){var o=t[n],a=i[n];t[n]=i[n]=function(){var l=Array.prototype.slice.call(arguments);return a.apply(i,l),o.apply(t,l)}}),f.addClass(e,"has-slider"),t.domElement.insertBefore(i.domElement,t.domElement.firstElementChild)}else if(t instanceof xr){var s=function(o){if(g.isNumber(t.__min)&&g.isNumber(t.__max)){var a=t.__li.firstElementChild.firstElementChild.innerHTML,l=t.__gui.__listening.indexOf(t)>-1;t.remove();var h=Si(r,t.object,t.property,{before:t.__li.nextElementSibling,factoryArgs:[t.__min,t.__max,t.__step]});return h.name(a),l&&h.listen(),h}return o};t.min=g.compose(s,t.min),t.max=g.compose(s,t.max)}else t instanceof Ml?(f.bind(e,"click",function(){f.fakeEvent(t.__checkbox,"click")}),f.bind(t.__checkbox,"click",function(n){n.stopPropagation()})):t instanceof kl?(f.bind(e,"click",function(){f.fakeEvent(t.__button,"click")}),f.bind(e,"mouseover",function(){f.addClass(t.__button,"hover")}),f.bind(e,"mouseout",function(){f.removeClass(t.__button,"hover")})):t instanceof on&&(f.addClass(e,"color"),t.updateDisplay=g.compose(function(n){return e.style.borderLeftColor=t.__color.toString(),n},t.updateDisplay),t.updateDisplay());t.setValue=g.compose(function(n){return r.getRoot().__preset_select&&t.isModified()&&an(r.getRoot(),!0),n},t.setValue)}function Dl(r,e){var t=r.getRoot(),i=t.__rememberedObjects.indexOf(e.object);if(i!==-1){var s=t.__rememberedObjectIndecesToControllers[i];if(s===void 0&&(s={},t.__rememberedObjectIndecesToControllers[i]=s),s[e.property]=e,t.load&&t.load.remembered){var n=t.load.remembered,o=void 0;if(n[r.preset])o=n[r.preset];else if(n[Ai])o=n[Ai];else return;if(o[i]&&o[i][e.property]!==void 0){var a=o[i][e.property];e.initialValue=a,e.setValue(a)}}}}function Si(r,e,t,i){if(e[t]===void 0)throw new Error('Object "'+e+'" has no property "'+t+'"');var s=void 0;if(i.color)s=new on(e,t);else{var n=[e,t].concat(i.factoryArgs);s=cc.apply(r,n)}i.before instanceof At&&(i.before=i.before.__li),Dl(r,s),f.addClass(s.domElement,"c");var o=document.createElement("span");f.addClass(o,"property-name"),o.innerHTML=s.property;var a=document.createElement("div");a.appendChild(o),a.appendChild(s.domElement);var l=cn(r,a,i.before);return f.addClass(l,V.CLASS_CONTROLLER_ROW),s instanceof on?f.addClass(l,"color"):f.addClass(l,ic(s.getValue())),mc(r,l,s),r.__controllers.push(s),s}function Yt(r,e){return document.location.href+"."+e}function ln(r,e,t){var i=document.createElement("option");i.innerHTML=e,i.value=e,r.__preset_select.appendChild(i),t&&(r.__preset_select.selectedIndex=r.__preset_select.length-1)}function Cl(r,e){e.style.display=r.useLocalStorage?"block":"none"}function wc(r){var e=r.__save_row=document.createElement("li");f.addClass(r.domElement,"has-save"),r.__ul.insertBefore(e,r.__ul.firstChild),f.addClass(e,"save-row");var t=document.createElement("span");t.innerHTML="&nbsp;",f.addClass(t,"button gears");var i=document.createElement("span");i.innerHTML="Save",f.addClass(i,"button"),f.addClass(i,"save");var s=document.createElement("span");s.innerHTML="New",f.addClass(s,"button"),f.addClass(s,"save-as");var n=document.createElement("span");n.innerHTML="Revert",f.addClass(n,"button"),f.addClass(n,"revert");var o=r.__preset_select=document.createElement("select");if(r.load&&r.load.remembered?g.each(r.load.remembered,function(_,m){ln(r,m,m===r.preset)}):ln(r,Ai,!1),f.bind(o,"change",function(){for(var _=0;_<r.__preset_select.length;_++)r.__preset_select[_].innerHTML=r.__preset_select[_].value;r.preset=this.value}),e.appendChild(o),e.appendChild(t),e.appendChild(i),e.appendChild(s),e.appendChild(n),Ei){var a=document.getElementById("dg-local-explain"),l=document.getElementById("dg-local-storage"),h=document.getElementById("dg-save-locally");h.style.display="block",localStorage.getItem(Yt(r,"isLocal"))==="true"&&l.setAttribute("checked","checked"),Cl(r,a),f.bind(l,"change",function(){r.useLocalStorage=!r.useLocalStorage,Cl(r,a)})}var c=document.getElementById("dg-new-constructor");f.bind(c,"keydown",function(_){_.metaKey&&(_.which===67||_.keyCode===67)&&Ti.hide()}),f.bind(t,"click",function(){c.innerHTML=JSON.stringify(r.getSaveObject(),void 0,2),Ti.show(),c.focus(),c.select()}),f.bind(i,"click",function(){r.save()}),f.bind(s,"click",function(){var _=prompt("Enter a new preset name.");_&&r.saveAs(_)}),f.bind(n,"click",function(){r.revert()})}function xc(r){var e=void 0;r.__resize_handle=document.createElement("div"),g.extend(r.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});function t(n){return n.preventDefault(),r.width+=e-n.clientX,r.onResize(),e=n.clientX,!1}function i(){f.removeClass(r.__closeButton,V.CLASS_DRAG),f.unbind(window,"mousemove",t),f.unbind(window,"mouseup",i)}function s(n){return n.preventDefault(),e=n.clientX,f.addClass(r.__closeButton,V.CLASS_DRAG),f.bind(window,"mousemove",t),f.bind(window,"mouseup",i),!1}f.bind(r.__resize_handle,"mousedown",s),f.bind(r.__closeButton,"mousedown",s),r.domElement.insertBefore(r.__resize_handle,r.domElement.firstElementChild)}function un(r,e){r.domElement.style.width=e+"px",r.__save_row&&r.autoPlace&&(r.__save_row.style.width=e+"px"),r.__closeButton&&(r.__closeButton.style.width=e+"px")}function mr(r,e){var t={};return g.each(r.__rememberedObjects,function(i,s){var n={},o=r.__rememberedObjectIndecesToControllers[s];g.each(o,function(a,l){n[l]=e?a.initialValue:a.getValue()}),t[s]=n}),t}function yc(r){for(var e=0;e<r.__preset_select.length;e++)r.__preset_select[e].value===r.preset&&(r.__preset_select.selectedIndex=e)}function Pl(r){r.length!==0&&_c.call(window,function(){Pl(r)}),g.each(r,function(e){e.updateDisplay()})}var Ol=V;var Wl=xe(Yi()),Xl=xe(Yr());var we=xe(Et()),vc=`#version 300 es
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
}`,Ec=`#version 300 es
precision highp float;

uniform float u_time;
uniform float u_alpha;
uniform float u_dark;

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

    float noise = simplex3d(vec3(uv * .5, u_time*0.21)) * clamp(u_time - .3, 0.0, 1.0);
    vec3 color = vec3(0.071,0.404,0.608);
    if (uv.y > -0.89) {
        color = mix(vec3(0.169,0.518,0.612), vec3(0.2,0.573,0.671), noise);
    }

    // Output to screen
    FragColor = vec4(u_alpha * color * u_dark, u_alpha);
}`,yr=class extends we.default{get vertexCode(){return vc}get fragmentCode(){return Ec}get uniformTypes(){return{u_projection:{type:we.default.UniformTypes.Matrix,bind:we.default.UniformBinds.Projection},u_world:{type:we.default.UniformTypes.Matrix,bind:we.default.UniformBinds.World},u_time:{type:we.default.UniformTypes.Float,bind:"u_time"},u_aspect_ratio:{type:we.default.UniformTypes.Float,bind:"u_aspect_ratio"},u_alpha:{type:we.default.UniformTypes.Float,bind:"u_alpha"},u_dark:{type:we.default.UniformTypes.Float,bind:"u_dark"}}}get attributeTypes(){return{a_position:{size:3,type:we.default.AttributeTypes.Float,normalize:!1,bind:we.default.AttributeBinds.Position},a_coord:{size:2,type:we.default.AttributeTypes.Float,normalize:!1,bind:we.default.AttributeBinds.TextureCoords}}}};var Ae=xe(Et()),Tc=`#version 300 es
in vec3 a_position;
in vec2 a_coord;

uniform mat4 u_projection;
uniform mat4 u_world;
uniform vec2 u_screen_size;

out vec2 v_texCoord;

void main(void) {
    gl_Position = u_projection * u_world * vec4(a_position, 1.0);
    gl_PointSize = 1.0;
    v_texCoord = a_coord * u_screen_size;
}`,Sc=`#version 300 es
precision highp float;

uniform float u_progress;
uniform vec2 u_pos;

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

    float progress = mix(-0.08, 1.08, u_progress);

    float d = length(uv - u_pos);
    float is_dark = smoothstep(-75.0, 75.0, 40.0 * simplex3d(vec3(uv * .01, .0)) + d - 900.0 + progress * 900.0);

    // Output to screen
    FragColor = vec4(vec3(0.051,0.086,0.086) * is_dark, is_dark);
}`,br=class extends Ae.default{get vertexCode(){return Tc}get fragmentCode(){return Sc}get uniformTypes(){return{u_projection:{type:Ae.default.UniformTypes.Matrix,bind:Ae.default.UniformBinds.Projection},u_world:{type:Ae.default.UniformTypes.Matrix,bind:Ae.default.UniformBinds.World},u_screen_size:{type:Ae.default.UniformTypes.Float2,bind:"u_screen_size"},u_progress:{type:Ae.default.UniformTypes.Float,bind:"u_progress"},u_pos:{type:Ae.default.UniformTypes.Float2,bind:"u_pos"}}}get attributeTypes(){return{a_position:{size:3,type:Ae.default.AttributeTypes.Float,normalize:!1,bind:Ae.default.AttributeBinds.Position},a_coord:{size:2,type:Ae.default.AttributeTypes.Float,normalize:!1,bind:Ae.default.AttributeBinds.TextureCoords}}}};var Ac=1/4,Cc=2.5,Rc=.15,fn=.4,E=50,S=50,wn=.6,ht={time:"MANUAL",instant_reset:!0},kr=new Ol({});kr.remember(ht);kr.add(ht,"time",["MANUAL","SEMI","AUTO"]);kr.add(ht,"instant_reset");kr.hide();u.default.input.setTargetElement(()=>u.default.gfx.canvas);await u.default.init();document.body.appendChild(u.default.gfx.canvas);u.default.gfx.setResolution(800,600,!0);u.default.gfx.centerCanvas();u.default.startFrame();u.default.gfx.clear(u.default.utils.Color.darkslategray);u.default.endFrame();var _t=new d.default(800,430),Tr=!1,_n=!1,ki=P.default.fromHex("#47B2CE"),Pt=(0,Gl.default)((r,e,t,i=32,s=P.default.white,n=ae.TextAlignments.Center,o=Le)=>{console.log("building text");let a=u.default.gfx.buildText(o,r,i,s,n);return a.position.set(e,t),a},(r,e,t)=>r+e.toString()+t.toString()),Le=u.default.assets.loadMsdfFontTexture("fonts/Arial.ttf",{jsonUrl:"fonts/Arial.json",textureUrl:"fonts/Arial.png"}).asset,Fi=u.default.assets.loadMsdfFontTexture("fonts/BowlbyOne-Regular.ttf",{jsonUrl:"fonts/BowlbyOne-Regular.json",textureUrl:"fonts/BowlbyOne-Regular.png"}).asset;await u.default.assets.waitForAll();var ke=new L.default(u.default.gfx.whiteTexture);ke.origin=d.default.zero;ke.size.set(800,600-_t.y);ke.position.set(0,_t.y);ke.color=P.default.fromHex("#2B849C");var Oi=new L.default(u.default.gfx.whiteTexture);Oi.origin=d.default.zero;Oi.size.set(800,8);Oi.position.set(0,_t.y);Oi.color=P.default.fromHex("#12679B");var xn=Pt("Another",400,10,136,ki,ae.TextAlignments.Center,Fi),yn=Pt("Clone",400,136,136,ki,ae.TextAlignments.Center,Fi),bn=Pt("Loading...",400,490,48,P.default.white,ae.TextAlignments.Center,Le);u.default.startFrame();u.default.gfx.clear(u.default.utils.Color.darkslategray);u.default.gfx.drawSprite(ke);u.default.gfx.drawSprite(Oi);u.default.gfx.useEffect(u.default.gfx.builtinEffects.MsdfFont);u.default.gfx.drawGroup(xn,!1);u.default.gfx.drawGroup(yn,!1);u.default.gfx.drawGroup(bn,!1);u.default.endFrame();var vr=Pt("Press any key to start",400,490,48,P.default.white,ae.TextAlignments.Center,Le),zl=new u.default.utils.Storage,Ie=6,Ve=125,ct=100,Cr=(_t.x-Ve*(Ie-1)-ct)*.5,Rr=(_t.y-Ve*2-ct)*.5,Mc=u.default.assets.loadTexture("imgs/directions.png",{generateMipMaps:!0}).asset,Bc=u.default.assets.loadTexture("imgs/spacebar.png",{generateMipMaps:!0}).asset,kc=u.default.assets.loadTexture("imgs/undo_redo.png",{generateMipMaps:!0}).asset,Fc=u.default.assets.loadTexture("imgs/mute.png",{generateMipMaps:!0}).asset,Dc=u.default.assets.loadTexture("imgs/reset.png",{generateMipMaps:!0}).asset,Pc=u.default.assets.loadTexture("imgs/player.png",{generateMipMaps:!0}).asset,Oc=u.default.assets.loadTexture("imgs/player_gray.png",{generateMipMaps:!0}).asset,zc=u.default.assets.loadTexture("imgs/crate.png",{generateMipMaps:!0}).asset,Lc=u.default.assets.loadTexture("imgs/target.png",{generateMipMaps:!0}).asset,Ic=u.default.assets.loadTexture("imgs/button.png",{generateMipMaps:!0}).asset,Yl=u.default.assets.loadTexture("imgs/particle_crate.png",{generateMipMaps:!0}).asset,Nc=u.default.assets.loadTexture("imgs/geo.png",{generateMipMaps:!0}).asset,qc=u.default.assets.loadTexture("imgs/spawner.png",{generateMipMaps:!0}).asset,Ll=u.default.assets.loadTexture("imgs/floors.png",{generateMipMaps:!0}).asset,Uc=u.default.assets.loadTexture("imgs/left_arrow.png",{generateMipMaps:!0}).asset,Hc=u.default.assets.loadTexture("imgs/wait.png",{generateMipMaps:!0}).asset,kn=u.default.assets.loadTexture("imgs/tape_borders.png",{generateMipMaps:!0}).asset,jc=u.default.assets.loadTexture("icons/all.png").asset,Vc=u.default.assets.loadTexture("icons/icon_back.png").asset,Gc=u.default.assets.loadTexture("icons/icon_border.png").asset,Wc=u.default.assets.loadSound("sounds/step.wav").asset,Xc=u.default.assets.loadSound("sounds/push.wav").asset,Yc=u.default.assets.loadSound("sounds/wall.wav").asset,$c=u.default.assets.loadSound("sounds/onTarget.wav").asset,Kc=u.default.assets.loadSound("sounds/offTarget.wav").asset;await u.default.assets.waitForAll();var ti=new L.default(Mc,new oe.default(0,0,150,100)),Zt=new L.default(Bc),ii=new L.default(kc,new oe.default(0,0,200,50)),Qt=new L.default(Fc,new oe.default(0,50,100,50));Qt.position.set(725,550);var $l=new L.default(Dc);$l.position.set(600,550);var vn=new L.default(Pc);vn.size.set(E,E);var Kl=new L.default(Oc);Kl.size.set(E,E);var Jl=new L.default(zc);Jl.size.set(E,E);var En=new L.default(Lc);En.size.set(E,E);var Ci=new L.default(Ic);Ci.size.set(E,E);var Ql=new L.default(qc);Ql.size.set(E,E);var pn=new L.default(Nc,new oe.default(0,0,E,E)),Ce=new L.default(Uc);Ce.size.set(S,S);var Tn=new L.default(Hc);Tn.size.set(S,S);var Mr=new L.default(kn,new oe.default(0,0,S/2,S*1.5));Mr.origin.set(0,0);Mr.position.set(-S/2,0);var Ri=new L.default(kn,new oe.default(S/2,0,S,S*1.5));Ri.origin.set(0,0);var Mi=new L.default(kn,new oe.default(S*1.5,0,S/2,S*1.5));Mi.origin.set(0,0);var Il=new L.default(Vc),Sr=new L.default(Gc);Sr.color=P.default.fromHex("#6D6D6D");var Di=P.default.fromHex("#E5B35B"),Nl=P.default.fromHex("#f5ca7f"),Jc=P.default.fromHex("#99F3ED"),Qc=P.default.fromHex("#6AC2BC"),Sn=P.default.fromHex("#B84B4B"),Zl=new P.default(1.3,1.3,1.3,1),Bt=new L.default(u.default.gfx.whiteTexture);Bt.origin=new d.default(0,-8/(S*1.5));Bt.size.set(S,S*1.5-16);Bt.color=Jc;var kt=new L.default(u.default.gfx.whiteTexture);kt.origin=new d.default(0,-8/(S*1.5));kt.size.set(S,S*1.5-16);kt.color=Qc;var An=class{constructor(e,t){this.pos=e;this.time=t;this.sprite=new L.default(Yl,new oe.default(0,0,E*2,E*2)),this.sprite.position.copy(this.pos.add(1,1).mul(E))}sprite;draw(){let e=(u.default.gameTime.elapsed-this.time)/.15-.05;if(!(e<=0)){if(e>=1){ft=ft.filter(t=>t!==this);return}e=Math.floor(e*9),this.sprite.setSourceFromSpritesheet(new d.default(e%3,Math.floor(e/3)),new d.default(3,3)),u.default.gfx.drawSprite(this.sprite)}}},Cn=class{constructor(e,t){this.pos=e;this.time=t;this.sprite=new L.default(Yl,new oe.default(0,0,E*2,E*2)),this.sprite.position.copy(this.pos.add(1,1).mul(E))}sprite;draw(){let e=(u.default.gameTime.elapsed-this.time)/.1-.02;if(!(e<=0)){if(e>=1){ft=ft.filter(t=>t!==this);return}e=Math.floor(e*9),this.sprite.setSourceFromSpritesheet(new d.default(e%3,Math.floor(e/3)),new d.default(3,3)),this.sprite.size.mulSelf(.5),u.default.gfx.drawSprite(this.sprite)}}},te=class{constructor(e,t,i,s,n){this.dev_name=e;this.public_name=t;this.n_moves=i;this.n_delay=s;this.initial_state=n;n.wall.recalcFloors(n.spawner.pos)}},W=class{constructor(e,t,i){this.major_turn=e;this.minor_turn=t;this.things=i;this.empty=!1,this.someChanges=!0,this.won=!1,this.miniturn_siblings_count=-1}empty;someChanges;won;miniturn_siblings_count;draw(e){this.things.forEach(t=>t.draw(e)),this.spawner.draw(e)}playSounds(e){if(Tr||this.minor_turn<=0)return;let t=this.players[this.minor_turn-1];if(!t||!t.previous)return;t.previous.pos.equals(t.pos)?t.wall_crashed()&&(u.default.sfx.play(Yc,Math.pow(.6,t.index),1,!0),ft.push(new Cn(t.pos.add(t.dir.mul(.5)),u.default.gameTime.elapsed))):u.default.sfx.play(Wc,1.5*Math.pow(.6,t.index),1,!0),this.things.some(l=>!(l instanceof It)||l===t||!l.previous?!1:!l.previous.pos.equals(l.pos))&&u.default.sfx.play(Xc,.6*Math.pow(.6,t.index),1,!0);let s=this.target,n=this.crates,o=this.crates.filter(l=>l.previous&&!l.previous.pos.equals(l.pos)&&this.target.posAt(l.pos)),a=this.crates.some(l=>l.previous&&!l.previous.pos.equals(l.pos)&&this.target.posAt(l.previous.pos));o.length>0&&(u.default.sfx.play($c,.7,1,!0),o.forEach(l=>{ft.push(new An(l.pos,u.default.gameTime.elapsed))})),a&&u.default.sfx.play(Kc,.65,1,!0)}get wall(){let e=this.things.filter(t=>t instanceof Y);if(e.length===0)throw new Error("no walls!");if(e.length>1)throw new Error("too many walls!");return e[0]}get target(){let e=this.things.filter(t=>t instanceof K);if(e.length===0)throw new Error("no Targets!");if(e.length>1)throw new Error("too many Targets!");return e[0]}get spawner(){let e=this.things.filter(t=>t instanceof $);if(e.length===0)throw new Error("no Spawner!");if(e.length>1)throw new Error("too many Spawner!");return e[0]}get players(){return this.things.filter(e=>e instanceof si)}get crates(){return this.things.filter(e=>e instanceof b)}get buttons(){return this.things.filter(e=>e instanceof Qe)}get buttonTargets(){return this.things.filter(e=>e instanceof Br)}nextStates(){if(this.minor_turn!==0)throw new Error("this method should only be called on main states");let e=[],t=this;for(let s=0;s<t.players.length;s++){if(t.players[s].age>=D.length)continue;t=new W(t.major_turn,s+1,t.things.map(l=>l.clone()));let n=t.players[s];if(n.index!==s)throw console.log("cur_state.players:",t.players),console.log("new_player.index:",n.index),console.log("this.minor_turn:",this.minor_turn),new Error("new_player index is wrong! time to use the other way");let o=D[n.age],a=of([[ei.LEFT,d.default.left],[ei.RIGHT,d.default.right],[ei.UP,d.default.up],[ei.DOWN,d.default.down]],o);a!==null&&(t.move(n.pos,a),n.dir=a),n.age+=1,e.push(t)}if((this.major_turn+1)%Oe===0){t=new W(t.major_turn,t.minor_turn+1,t.things.map(o=>o.clone()));let s=t.spawner.dir,n=t.spawner.pos.add(s);t.move(n,s)&&t.things.push(new si(n,s.clone(),t.players.length,0,t.spawner)),e.push(t)}for(let s=0;s<t.buttons.length;s++){let n=t.buttons[s],{value:o,prev_value:a}=n.update(t);for(let l of n.target_ids)e=e.concat(t.buttonTargets[l].mainUpdate(t,o,a)),e.length>0&&(t=e.at(-1))}let i=new W(t.major_turn+1,0,t.things.map(s=>s.clone()));return i.empty=!0,e.forEach(s=>{s.miniturn_siblings_count=e.length}),i.someChanges=e.length>0,e.push(i),i.won=i.isWon(),e}move(e,t){return this.things.every(i=>i.move(this,e,t))}isWon(){let e=this.crates,t=this.target;return e.every(i=>t.posAt(i.pos))}},Lt=class{},Fn=class extends Lt{constructor(t,i){super();this.w=t;this.h=i;this.data=gn(t,i,!1),this.floor_data=gn(t,i,!1),this.floor_spr_1=new L.default(Ll,new oe.default(0,0,E,E)),this.floor_spr_2=new L.default(Ll,new oe.default(E,0,E,E))}previous=null;data;floor_data;floor_spr_1;floor_spr_2;static fromString(t){let i=t.trim().split(`
`).map(a=>a.trim()),s=i.length,n=i[0].length,o=new Fn(n,s);for(let a=0;a<s;a++)for(let l=0;l<n;l++){let h=i[a][l];o.data[a][l]=h==="#"}return o}draw(t){for(let i=0;i<=this.w;i++)for(let s=0;s<=this.h;s++){let n=this.wallAt(i-1,s-1)+this.wallAt(i,s-1)*2+this.wallAt(i-1,s)*4+this.wallAt(i,s)*8;(i+s)%2===1&&(n+=16),(this.floorAt(i-1,s-1)||this.floorAt(i,s-1)||this.floorAt(i-1,s)||this.floorAt(i,s))&&((i+s)%2===1?(this.floor_spr_1.position.set((i+.5)*E,(s+.5)*E),u.default.gfx.drawSprite(this.floor_spr_1)):(this.floor_spr_2.position.set((i+.5)*E,(s+.5)*E),u.default.gfx.drawSprite(this.floor_spr_2))),pn.setSourceFromSpritesheet(new d.default(n%4,Math.floor(n/4)),new d.default(4,8),1,!1),pn.position.set((i+.5)*E,(s+.5)*E),u.default.gfx.drawSprite(pn)}}wallAtPos(t){return!!(t.x<0||t.x>=this.w||t.y<0||t.y>=this.h||this.data[t.y][t.x])}wallAt(t,i){return t<0||t>=this.w||i<0||i>=this.h?0:this.data[i][t]?1:0}floorAt(t,i){return t<0||t>=this.w||i<0||i>=this.h?!1:this.floor_data[i][t]}recalcFloors(t){this.floor_data=gn(this.w,this.h,!1);let i=[t];for(;i.length>0;){let s=i.pop();this.floor_data[s.y][s.x]=!0;for(let n of[d.default.up,d.default.down,d.default.right,d.default.left]){let o=s.add(n);this.wallAtPos(o)||this.floorAt(o.x,o.y)||i.push(o)}}}move(t,i,s){return!this.wallAtPos(i)}clone(){return this}setAt(t,i){t.x<0||t.x>=this.w||t.y<0||t.y>=this.h||(this.data[t.y][t.x]=i)}},Y=Fn;zi(Y,"n_to_x",[]);var K=class extends Lt{constructor(t){super();this.positions=t}previous=null;draw(t){this.positions.forEach(i=>{En.position.set((i.x+1)*E,(i.y+1)*E),u.default.gfx.drawSprite(En)})}move(t,i,s){return!0}clone(){return this}toggleAt(t){let i=Bi(this.positions,s=>s.equals(t));i===-1?this.positions.push(t):this.positions.splice(i,1)}posAt(t){return this.positions.some(i=>i.equals(t))}},Mt=class extends Lt{constructor(t,i,s,n){super();this.pos=t;this.target_ids=i;this.active=s;this.previous=n}draw(t){Ci.position.copy(this.pos.add(1,1).mul(E)),t!==1&&this.previous&&this.previous.active!==this.active?Ci.color=P.default.lerp(Mt.ActiveColor,Mt.InactiveColor,this.active?t:1-t):Ci.color=this.active?Mt.ActiveColor:Mt.InactiveColor,u.default.gfx.drawSprite(Ci)}move(t,i,s){return!0}clone(){return new Mt(this.pos,this.target_ids,this.active,this)}update(t){let i=t.crates.some(n=>n.pos.equals(this.pos))||t.players.some(n=>n.pos.equals(this.pos))||t.spawner.pos.equals(this.pos),s=this.active;return this.active=i,{value:this.active,prev_value:s}}},Qe=Mt;zi(Qe,"ActiveColor",P.default.fromHex("#F0A863")),zi(Qe,"InactiveColor",P.default.fromHex("#4E3116"));var Br=class extends Lt{remove(e){let t=e.buttonTargets.indexOf(this);if(t===-1)throw new Error("removing a button target that doesn't exist");e.buttons.forEach(i=>{i.target_ids=i.target_ids.filter(s=>s!==t).map(s=>s<t?s:s-1)}),e.things=e.things.filter(i=>i!=this)}},Ge=class extends Br{constructor(t,i,s,n){super();this.pos=t;this.dir=i;this.extended=s;this.previous=n}mainUpdate(t,i,s){let n=new W(t.major_turn,t.minor_turn+1,t.things.map(o=>o.clone()));if(i){if(n.move(this.pos.add(this.dir),this.dir)){let o=n.things.find(a=>a instanceof Ge&&a.pos.equals(this.pos));return o.extended=!0,[n]}}else if(n.move(this.pos,this.dir.mul(-1))){let o=n.things.find(a=>a instanceof Ge&&a.pos.equals(this.pos));return o.extended=!1,[n]}return[]}draw(t){}move(t,i,s){return this.extended?!i.equals(this.pos.add(this.dir)):!i.equals(this.pos)}clone(){return new Ge(this.pos.clone(),this.dir.clone(),this.extended,this)}},It=class extends Lt{constructor(t,i){super();this.pos=t;this.previous=i}draw(t){t!==1&&this.previous?this.sprite.position.copy(d.default.lerp(this.previous.pos,this.pos,t).add(1,1).mul(E)):this.sprite.position.copy(this.pos.add(1,1).mul(E)),u.default.gfx.drawSprite(this.sprite)}move(t,i,s){if(!i.equals(this.pos))return!0;let n=i.add(s);return t.move(n,s)?(this.pos.copy(n),!0):!1}},$=class extends It{constructor(t,i,s){super(t,s);this.pos=t;this.dir=i;this.previous=s;this.sprite.rotation=this.dir.getRadians()}sprite=Ql;clone(){return new $(this.pos.clone(),this.dir.clone(),this)}},b=class extends It{sprite=Jl;clone(){return new b(this.pos.clone(),this)}},si=class extends It{constructor(t,i,s,n=0,o){super(t,o);this.pos=t;this.dir=i;this.index=s;this.age=n;this.previous=o}sprite=vn;draw(t){this.sprite=this.age<D.length?vn:Kl,this.sprite.rotation=this.dir.getRadians()+Math.PI/2,this.sprite.color=this.index===0?Zl:u.default.utils.Color.white,t!==1&&this.previous?N===0?this.sprite.position.copy(d.default.lerp(this.pos.sub(this.dir),this.pos,t).add(1,1).mul(E)):(this.sprite.position.copy(d.default.lerp(this.previous.pos,this.pos,t).add(1,1).mul(E)),this.wall_crashed()&&this.sprite.position.copy(this.pos.add(this.dir.mul(t-t*t)).add(1,1).mul(E))):this.sprite.position.copy(this.pos.add(1,1).mul(E)),u.default.gfx.drawSprite(this.sprite)}wall_crashed(){return this.previous!==null&&this.previous.age!==this.age&&this.age>0&&this.age-1<D.length&&D[this.age-1]!==ei.NONE&&this.previous.pos.equals(this.pos)}clone(){return new si(this.pos.clone(),this.dir.clone(),this.index,this.age,this)}},Ct=[new te("first","sofa",17,4,new W(-1,0,[Y.fromString(`
                .###########
                .#.........#
                #########..#
                #.........##
                #...####..#.
                #####..####.
            `),new K([new d.default(2,1)]),new $(new d.default(3,4),d.default.left,null),new b(new d.default(2,3),null)])),new te("basic","cap",10,5,new W(-1,0,[Y.fromString(`
                #####.
                #...#.
                #...##
                #....#
                ######
            `),new K([new d.default(1,3)]),new $(new d.default(1,1),d.default.down,null),new b(new d.default(3,2),null)])),new te("move_spawner","hat",6,4,new W(-1,0,[Y.fromString(`
                .#########.
                .#.......#.
                .#.......#.
                ##.......#.
                #........##
                #.........#
                ###########
            `),new K([new d.default(2,1),new d.default(3,1),new d.default(4,1),new d.default(5,1),new d.default(6,1),new d.default(7,1),new d.default(8,1)]),new $(new d.default(2,5),d.default.up,null),new b(new d.default(2,2),null),new b(new d.default(3,2),null),new b(new d.default(4,2),null),new b(new d.default(5,2),null),new b(new d.default(6,2),null),new b(new d.default(7,2),null),new b(new d.default(8,2),null)])),new te("microban","soko",8,5,new W(-1,0,[Y.fromString(`
                ####..
                #..#..
                #..###
                #....#
                #....#
                #..###
                ####..
            `),new K([new d.default(2,1)]),new $(new d.default(1,3),d.default.right,null),new b(new d.default(3,4),null)])),new te("filler","whale",11,2,new W(-1,0,[Y.fromString(`
                ###########
                #.#.......#
                #.#.......#
                #.#.......#
                #.#.......#
                #........##
                ##########.
            `),new K([new d.default(3,1),new d.default(4,1),new d.default(5,1),new d.default(6,1),new d.default(7,1),new d.default(8,1)]),new $(new d.default(1,1),d.default.down,null),new b(new d.default(3,4),null),new b(new d.default(4,4),null),new b(new d.default(5,4),null),new b(new d.default(6,4),null),new b(new d.default(7,4),null),new b(new d.default(8,4),null)])),new te("basic_reversed","house",15,10,new W(-1,0,[Y.fromString(`
                ...###.
                ####.#.
                #....#.
                #.#..##
                #.#...#-
                #######
            `),new K([new d.default(5,4)]),new $(new d.default(1,4),d.default.up,null),new b(new d.default(3,3),null)])),new te("two_directions","stairs",5,2,new W(-1,0,[Y.fromString(`
                ..........###
                ..........#.#
                .....######.#
                .....#......#
                ######......#
                #...........#
                #############
            `),new K([new d.default(11,2),new d.default(2,5)]),new $(new d.default(7,4),d.default.up,null),new b(new d.default(11,3),null),new b(new d.default(3,5),null)])),new te("push_wall_mid","snake",17,9,new W(-1,0,[Y.fromString(`
                #########
                #.......#
                ####.##.#
                ..#.....#
                ..#.##.##
                ..#....#.
                ..######.
            `),new K([new d.default(5,3)]),new $(new d.default(1,1),d.default.right,null),new b(new d.default(4,2),null)])),new te("bistable_self_loop_push","train",6,3,new W(-1,0,[Y.fromString(`
                .###.......
                ##.#.......
                #..#######.
                #........##
                #.........#
                ###########
            `),new K([new d.default(1,2),new d.default(7,3),new d.default(8,4)]),new $(new d.default(2,1),d.default.down,null),new b(new d.default(1,3),null),new b(new d.default(4,3),null),new b(new d.default(5,4),null)])),new te("loop_init","pipe",15,12,new W(-1,0,[Y.fromString(`
                #######......
                #.....#......
                #.##..#......
                #.....#######
                ###.........#
                .##..########
                ..####.......
            `),new K([new d.default(4,3),new d.default(10,4)]),new $(new d.default(3,5),d.default.right,null),new b(new d.default(3,3),null),new b(new d.default(6,4),null)])),new te("bistable","claw",8,3,new W(-1,0,[Y.fromString(`
                ..##########.
                ..#........#.
                ###.########.
                #....#.......
                ####.########
                ...#........#
                ...##########
            `),new K([new d.default(9,1),new d.default(10,5)]),new $(new d.default(1,3),d.default.right,null),new b(new d.default(5,1),null),new b(new d.default(6,5),null)])),new te("both_tricks","toad",6,5,new W(-1,0,[Y.fromString(`
                .##########.
                .#........#.
                #########.#.
                #.........##
                #..........#
                ############
            `),new K([new d.default(2,1)]),new $(new d.default(2,4),d.default.up,null),new b(new d.default(3,1),null)])),new te("basic_push_diverge","duck",10,3,new W(-1,0,[Y.fromString(`
                .####.
                .#..#.
                .#..##
                .#...#
                ##.###
                #..#..
                ####..
            `),new K([new d.default(2,2)]),new $(new d.default(1,5),d.default.right,null),new b(new d.default(3,2),null)])),new te("gaps","car",8,3,new W(-1,0,[Y.fromString(`
                ...##########.
                ...#........#.
                ...#........#.
                ####........#.
                #...........##
                #............#
                ##############
            `),new K([new d.default(4,1),new d.default(5,1),new d.default(6,2),new d.default(7,1),new d.default(8,1),new d.default(9,2),new d.default(10,1),new d.default(11,1)]),new $(new d.default(2,5),d.default.up,null),new b(new d.default(4,2),null),new b(new d.default(5,2),null),new b(new d.default(6,2),null),new b(new d.default(7,2),null),new b(new d.default(8,2),null),new b(new d.default(9,2),null),new b(new d.default(10,2),null),new b(new d.default(11,2),null)])),new te("double_move_spawner","factory",13,4,new W(-1,0,[Y.fromString(`
                ..###########..
                ###.#.#.#.#.#..
                #...........##.
                #............#.
                #............#.
                #............##
                #.............#
                ###############
            `),new K([new d.default(2,3),new d.default(4,3),new d.default(6,3),new d.default(8,3),new d.default(10,3)]),new $(new d.default(2,6),d.default.up,null),new b(new d.default(2,2),null),new b(new d.default(4,2),null),new b(new d.default(6,2),null),new b(new d.default(8,2),null),new b(new d.default(10,2),null)])),new te("companion_cube","fish",14,12,new W(-1,0,[Y.fromString(`
                ...#########.
                ..##.......#.
                .##........#.
                .#.........#.
                ##.........##
                #...........#
                #...........#
                #############
            `),new K([new d.default(10,3),new d.default(4,1),new d.default(5,1),new d.default(6,1),new d.default(7,1),new d.default(8,1),new d.default(9,1),new d.default(10,1)]),new $(new d.default(2,6),d.default.up,null),new b(new d.default(3,3),null),new b(new d.default(4,2),null),new b(new d.default(5,2),null),new b(new d.default(6,2),null),new b(new d.default(7,2),null),new b(new d.default(8,2),null),new b(new d.default(9,2),null),new b(new d.default(10,2),null)])),new te("u_chain","chip",16,2,new W(-1,0,[Y.fromString(`
                ###########
                #.........#
                #.........#
                #.........#
                #.........#
                #.......###
                #########..
            `),new K([new d.default(3,2),new d.default(4,2),new d.default(5,2),new d.default(6,2),new d.default(7,2),new d.default(8,2)]),new $(new d.default(1,1),d.default.down,null),new b(new d.default(3,4),null),new b(new d.default(4,4),null),new b(new d.default(5,4),null),new b(new d.default(6,4),null),new b(new d.default(7,4),null),new b(new d.default(8,4),null)])),new te("mini_avoid_avoiding","worm",7,3,new W(-1,0,[Y.fromString(`
                .....#########..
                .....#.......#..
                .....#.#########
                .....#.........#
                ########...#####
                #.........##....
                ###########.....
            `),new K([new d.default(11,1),new d.default(13,3),new d.default(2,5)]),new $(new d.default(10,4),d.default.left,null),new b(new d.default(8,1),null),new b(new d.default(10,3),null),new b(new d.default(6,5),null)]))],eu=new Map;{let r=new d.default(6,3),e=0;for(let t of["sofa","cap","hat","soko","whale","house","stairs","snake","train","pipe","claw","toad","duck","car","factory","fish","chip","worm"]){let i=new L.default(jc);i.setSourceFromSpritesheet(new d.default(e%r.x,Math.floor(e/r.x)),r),i.position.set(e%Ie*Ve+Cr+ct/2,Math.floor(e/Ie)*Ve+Rr+ct/2),eu.set(t,i),e++}}var Ft=!1,_e=0,ei=(n=>(n[n.LEFT=0]="LEFT",n[n.RIGHT=1]="RIGHT",n[n.UP=2]="UP",n[n.DOWN=3]="DOWN",n[n.NONE=4]="NONE",n))(ei||{}),$e=!1,Re=!1,Rt=!1,Oe=5,D=[],U=0,N=0,q=0,Pi=0,T,R,ft=[],Ze=d.default.zero,ie=0,Be=0,dt=new L.default(u.default.gfx.whiteTexture);dt.origin=d.default.zero;dt.color=Di;var Ot=new L.default(u.default.gfx.whiteTexture);Ot.origin=d.default.zero;Ot.color=Di;var Rn=!1,ri=0,Mn;tu(Ct[ri]);var Ar=0;function tu(r){Mn=r,U=0,N=0,q=-.99,Pi=2,Ar=0,Oe=r.n_delay,iu(r.n_moves),T=r.initial_state.nextStates().at(-1),R=de(T,D),Ze=new d.default(T.wall.w,T.wall.h).mul(E).sub(_t).add(E,E).mul(.5),r.dev_name==="first"&&(Ze.y+=E*.5),$e=!1,Re=!1,Rt=!1;for(let e in Je)Je[e]=1/0;Ft=!1,ft=[]}function Zc(){let r=T.wall,e=Math.floor((16-r.w)/2),t=Math.floor((9-r.h)/2),i=new Y(16,9);for(let s=0;s<r.w;s++)for(let n=0;n<r.h;n++)i.data[t+n][e+s]=r.data[n][s];T.things=T.things.map(s=>s instanceof Y?i:s instanceof It||s instanceof Ge||s instanceof Qe?(s.pos.addSelf(e,t),s):(s instanceof K&&s.positions.forEach(n=>{n.addSelf(e,t)}),s)),T.wall.recalcFloors(T.spawner.pos),U=0,N=0,q=0,Pi=2,R=de(T,D),Ze=new d.default(16,9).mul(E).sub(_t).add(E,E).mul(.5)}function iu(r,e=!1){if(e){for(;D.length>r;)D.pop();for(;D.length<r;)D.push(4)}else D=Array(r).fill(4);r<13?(ie=r,Be=0):(ie=Math.ceil(r/2),Be=r-ie),dt.position.set(-S*.5+8,8),dt.size.set(S*(ie+1)-16,S*1.5-16),Be>0&&(Ot.position.set(-S*.5+8,8),Ot.size.set(S*(Be+1)-16,S*1.5-16))}function de(r,e){let t=[r],i=r;for(let s=0;s<=U;s++)for(;;){let n=i.nextStates();if(t=t.concat(n),i=n.at(-1),i.major_turn!==s)break}return N+1>t.length&&(N=0),t}function ql(r,e){switch(r){case 0:Ce.rotation=0,Ce.position.copy(e),u.default.gfx?.drawSprite(Ce);break;case 2:Ce.rotation=Math.PI*.5,Ce.position.copy(e),u.default.gfx?.drawSprite(Ce);break;case 1:Ce.rotation=Math.PI,Ce.position.copy(e),u.default.gfx?.drawSprite(Ce);break;case 3:Ce.rotation=Math.PI*1.5,Ce.position.copy(e),u.default.gfx?.drawSprite(Ce);break;case 4:Tn.position.copy(e),u.default.gfx?.drawSprite(Tn);break;default:break}}var ni=new L.default(u.default.gfx.whiteTexture);ni.origin=d.default.zero;ni.size=_t;var Ke=u.default.gfx.createEffect(cr);u.default.gfx.useEffect(Ke);Ke.uniforms.u_aspect_ratio(ni.size.x/ni.size.y);var He=u.default.gfx.createEffect(yr);u.default.gfx.useEffect(He);He.uniforms.u_aspect_ratio(ke.size.x/ke.size.y);var ce=new L.default(u.default.gfx.whiteTexture);ce.origin=d.default.zero;ce.size=u.default.gfx.getCanvasSize();var pe=u.default.gfx.createEffect(br);u.default.gfx.useEffect(pe);pe.uniforms.u_screen_size(ce.size.x,ce.size.y);u.default.gfx.useEffect(null);var Dt=[];function ef(r){let e=new L.default(u.default.gfx.whiteTexture);e.origin=new d.default(0,-8/(S*1.5)),e.size.set(S,S*1.5-16),r<ie?e.position.set(r*S,0):e.position.set((r-ie)*S,0),e.color=Sn,Dt.push([e,.15,r<ie])}function Ul(r,e){for(var t=Dt.length-1;t>=0;t--){let[i,s,n]=Dt[t];n!==e&&(u.default.gfx.drawSprite(i),s-=r,s<=0?Dt.splice(t,1):Dt[t][1]=s)}}var ze=0,tf=function(){return u.default.gfx.buildText(Le,`WASD to
move`,32,P.default.white,ae.TextAlignments.Center).position.set(110,90),u.default.gfx.buildText(Le,`Arrow keys
to move`,32,P.default.white,ae.TextAlignments.Center).position.set(690,90),u.default.gfx.buildText(Le,`Q/E to
change turn`,32,P.default.white,ae.TextAlignments.Center).position.set(110,290),u.default.gfx.buildText(Le,`Z/X to
change turn`,32,P.default.white,ae.TextAlignments.Center).position.set(690,290),u.default.gfx.buildText(Le,"Space to wait",32,P.default.white,ae.TextAlignments.Center).position.set(400,410),u.default.gfx.buildText(Le,"R to restart, Esc. to select level",28,P.default.white,ae.TextAlignments.Center).position.set(400,550),u.default.gfx.buildText(Le,"Q/Z",32,P.default.lightgrey,ae.TextAlignments.Center).position.set(30,420),u.default.gfx.buildText(Le,"E/X",32,P.default.lightgrey,ae.TextAlignments.Center).position.set(770,420),function(){Ft||Rt||ri===0&&(ti.sourceRect.y=u.default.gameTime.elapsed%2<1?0:100,ii.sourceRect.y=u.default.gameTime.elapsed%2<1?0:50,ti.position.set(400,360),Zt.position.set(150,385),ii.position.set(650,385),u.default.gfx.drawSprite(ti),u.default.gfx.drawSprite(Zt),u.default.gfx.drawSprite(ii))}}(),he=0,Kt=-1;function ru(){switch(u.default.startFrame(),u.default.gfx.clear(u.default.utils.Color.darkslategray),u.default.input.pressed("m")&&(Tr=!Tr,Qt.sourceRect.y=Tr?0:50,Qt.size.mulSelf(1.25),Qt.rotation=(Math.random()-.5)*.2,new Xl.default(Qt).to({"size.x":100,"size.y":50,rotation:0}).duration(.1).play()),u.default.input.pressed("b")&&(_n=!_n),u.default.gfx.useEffect(Ke),_n||Ke.uniforms.u_time(u.default.gameTime.elapsed),Ke.uniforms.u_alpha(1),u.default.gfx.drawSprite(ni),u.default.gfx.useEffect(null),_e===0&&(ke.color.a=1),u.default.gfx.useEffect(He),He.uniforms.u_time(u.default.gameTime.elapsed),He.uniforms.u_alpha(1),He.uniforms.u_dark(1),u.default.gfx.drawSprite(ke),u.default.gfx.useEffect(null),U>=D.length&&(ce.color=new P.default(0,0,0,.4),u.default.gfx.drawSprite(ce)),_e){case 1:q===0&&!Re&&u.default.input.pressed(["escape","p"])&&(ze=ri,_e=2);break;case 2:u.default.input.pressed(["escape","p"])?_e=1:(u.default.input.pressed(["enter","space"])||u.default.input.mousePressed())&&Hl(ze);break;default:break}if(_e===1&&!Ft){Bn(["q","z"],u.default.gameTime.delta)&&U>0?(($e||Re)&&rf(),U-=1):Bn(["e","x"],u.default.gameTime.delta)&&($e||Re?$e=!1:(U+=1,U>=R.at(-1).major_turn&&(R=de(T,D)))),!Re&&u.default.input?.pressed(["r"])&&(U=0,ht.instant_reset&&(N=0,q=-.99,D=D.fill(4),R=de(T,D))),q===0&&ht.time==="AUTO"&&R[N].major_turn>=D.length&&R[N].minor_turn==0&&R[N].someChanges&&!R[N].won&&(U+=1,U>=R.at(-1).major_turn&&(R=de(T,D))),u.default.input?.pressed(["t"])&&(console.log("cur_turn: ",N),console.log("selected_turn: ",U),console.log("cur_state: ",R[N]),console.log("all states: ",R));let r=jl([[["w","up"],2],[["s","down"],3],[["d","right"],1],[["a","left"],0],["space",4]],u.default.gameTime.delta);if(r!==null)if($e||Re)$e=!1;else if(U<D.length)D[U]=r,ef(U),U+=1,R=de(T,D);else if(r===4)U+=1,U>=R.at(-1).major_turn&&(R=de(T,D));else if(ht.time==="MANUAL"){Ar+=1;let e=.1,t=Mn.dev_name==="first";t?Zt.color=Zl:(dt.color=Sn,Ot.color=Sn),xi(()=>(t||(u.default.gfx.setCameraOrthographic(new d.default(-400+.5*ie*S,-445)),u.default.gfx.drawSprite(dt),Be>0&&(u.default.gfx.setCameraOrthographic(new d.default(-400+.5*Be*S,-445-75)),u.default.gfx.drawSprite(Ot)),u.default.gfx.resetCamera()),e-=u.default.gameTime.delta,e<0?(Ar-=1,Ar===0&&(dt.color=Di,Ot.color=Di,Zt.color=P.default.white),!0):!1))}else ht.time==="SEMI"&&(U+=1,U>=R.at(-1).major_turn&&(R=de(T,D)))}if(u.default.gfx.setCameraOrthographic(Ze),q<0?R[N].draw(Jt((q+1)/(1-fn),0,1)):q>0?R[N+1].draw(Jt((q-fn)/(1-fn),0,1)):R[N].draw(1),ft.forEach(r=>r.draw()),_e===1&&Rt&&!Ft){let r=u.default.input.mousePosition.add(Ze).div(E).round().sub(1,1);if(u.default.gfx.outlineRect(new oe.default((r.x+.5)*E,(r.y+.5)*E,E,E),u.default.utils.Color.white),u.default.input?.mouseDown(je.MouseButtons.left)&&(T.wall.setAt(r,!0),T.wall.recalcFloors(T.spawner.pos),R=de(T,D)),u.default.input?.mouseDown(je.MouseButtons.right)&&(T.wall.setAt(r,!1),T.wall.recalcFloors(T.spawner.pos),R=de(T,D)),u.default.input?.mouseWheelSign!==0){if(u.default.input.shiftDown){let e=Jt(D.length+u.default.input?.mouseWheelSign,2,30);iu(e,!0)}else Oe+=u.default.input?.mouseWheelSign,Oe=Math.max(1,Oe);R=de(T,D)}if(u.default.input.keyPressed(je.KeyboardKeys.n1)){let e=Bi(T.things,t=>t instanceof b&&t.pos.equals(r));e===-1?T.things.push(new b(r,null)):T.things.splice(e,1),R=de(T,D)}if(u.default.input.keyPressed(je.KeyboardKeys.n2)&&T.target.toggleAt(r),u.default.input.keyPressed(je.KeyboardKeys.n3)&&(T.spawner.pos=r,T.spawner.dir=Vl(u.default.input.mousePosition.add(Ze).div(E).sub(1,1).sub(r)),T.spawner.sprite.rotation=T.spawner.dir.getRadians(),T.players[0].pos=T.spawner.pos.add(T.spawner.dir),T.players[0].dir=T.spawner.dir.clone(),R=de(T,D)),u.default.input.keyPressed(je.KeyboardKeys.n4)){let e=Bi(T.things,t=>t instanceof Ge&&t.pos.equals(r));e===-1?T.things.push(new Ge(r,Vl(u.default.input.mousePosition.add(Ze).div(E).sub(1,1).sub(r)),!1,null)):(console.log(e),T.things[e].remove(T),console.log(T)),R=de(T,D)}if(u.default.input.keyPressed(je.KeyboardKeys.n5)){let e=Bi(T.things,t=>t instanceof Qe&&t.pos.equals(r));e===-1?T.things.push(new Qe(r,[],!1,null)):T.things.splice(e,1),R=de(T,D)}if(u.default.input.keyPressed(je.KeyboardKeys.n6)){if(Kt===-1)Kt=Bi(T.things,e=>e instanceof Qe&&e.pos.equals(r));else{let e=T.buttonTargets.findIndex(t=>t instanceof Ge&&t.pos.equals(r));if(e!==-1){let t=T.things[Kt];t.target_ids.includes(e)?t.target_ids=t.target_ids.filter(i=>i!=e):t.target_ids.push(e)}Kt=-1}R=de(T,D)}if(Kt!==-1){let e=T.things[Kt];u.default.gfx.fillRect(new oe.default((e.pos.x+.5)*E,(e.pos.y+.5)*E,E,E),e.active?u.default.utils.Color.red:u.default.utils.Color.green)}}u.default.gfx.setCameraOrthographic(new d.default(-400+.5*ie*S,-445)),u.default.gfx.drawSprite(dt),Oe<ie&&u.default.gfx.fillRect(new oe.default(Oe*S,8,S,S*1.5-16),Nl);for(let r=U;r>=0;r-=Oe)r>=ie||(r===U?Dt.length===0&&(Bt.position.set(r*S,0),u.default.gfx.drawSprite(Bt)):(kt.position.set(r*S,0),u.default.gfx.drawSprite(kt)));Ul(u.default.gameTime.delta,!1),u.default.gfx.drawSprite(Mr),Mi.position.set(ie*S,0),u.default.gfx.drawSprite(Mi);for(let r=0;r<ie;r++){Ri.position.set(r*S,0),u.default.gfx.drawSprite(Ri);let e=D[r];ql(e,new d.default((r+.5)*S,S*.75))}if(Be>0){u.default.gfx.setCameraOrthographic(new d.default(-400+.5*Be*S,-445-75)),u.default.gfx?.fillRect(new oe.default(-S*.5+8,8,S*(Be+1)-16,S*1.5-16),Di),Oe>=ie&&u.default.gfx.fillRect(new oe.default((Oe-ie)*S,8,S,S*1.5-16),Nl);for(let r=U;r>=ie;r-=Oe)r>=ie+Be||(r===U?Dt.length===0&&(Bt.position.set((r-ie)*S,0),u.default.gfx.drawSprite(Bt)):(kt.position.set((r-ie)*S,0),u.default.gfx.drawSprite(kt)));Ul(u.default.gameTime.delta,!0),u.default.gfx.drawSprite(Mr),Mi.position.set(Be*S,0),u.default.gfx.drawSprite(Mi);for(let r=0;r<Be;r++){Ri.position.set(r*S,0),u.default.gfx.drawSprite(Ri);let e=D[r+ie];ql(e,new d.default((r+.5)*S,S*.75))}}if(u.default.gfx.resetCamera(),Ft&&(u.default.gfx.useEffect(Ke),Ke.uniforms.u_aspect_ratio(ce.size.x/ce.size.y),u.default.gfx.drawSprite(ce),u.default.gfx.useEffect(null),u.default.gfx.useEffect(u.default.gfx.builtinEffects.MsdfFont),u.default.gfx.drawGroup(Pt("Thanks for",400,75,112,ki,ae.TextAlignments.Center,Fi),!1),u.default.gfx.drawGroup(Pt("playing!",400,200,112,ki,ae.TextAlignments.Center,Fi),!1),u.default.gfx.drawGroup(Pt("- knexator",600,450,42,ki,ae.TextAlignments.Center,Fi),!1),u.default.gfx.useEffect(null)),_e===1&&!Ft){let r=u.default.gameTime.delta;for(;r>0;){if(N===0&&q<0){q=zt(q,0,r*4);break}if(q<0?R[N].empty&&(q=0):q>0&&R[N+1].empty&&(q=0),q!==0){let e=Math.abs(R[N].major_turn-U);q>0&&e++;let t=1;for(let a=1;a<e;a++)t*=Ac;let i=R[q>0?N+1:N].miniturn_siblings_count,s=Math.min(Cc/i,1),n=1;ht.time==="AUTO"&&U>=D.length?(n*=Pi,Pi+=u.default.gameTime.delta):Pi=1.5;let o=n/(s*Rc*t);r-=Math.abs(q/o),q=zt(q,0,u.default.gameTime.delta*o)}if(q===0&&(R[N].major_turn!==U||R[N].minor_turn!==0)){let e=Math.sign(U-R[N].major_turn-.5);N+=e,q-=e*.99,e>0&&R[N].playSounds(1),!Rt&&!Re&&R[N].won&&!$e&&(zl.setItem(Mn.dev_name,"y"),q=0,U=R[N].major_turn,$e=!0)}if(q===0)break}!Re&&!Rt&&u.default.input.pressed("dash")&&(Rt=!0,Zc()),!Rt&&!Re&&q===0&&R[N].won&&(ri<Ct.length-2?Hl(ri+1):su(()=>nf()))}if(tf(),_e===2){ce.color=new P.default(0,0,0,.7),u.default.gfx.drawSprite(ce);let r=jl([[["w","up"],-Ie],[["s","down"],Ie],[["d","right"],1],[["a","left"],-1]],u.default.gameTime.delta);if(r!==null&&(ze=af(ze+r,Ct.length)),u.default.input.mouseDelta.length>0){let e=Math.floor((u.default.input.mousePosition.x-Cr+13)/Ve),t=Math.floor((u.default.input.mousePosition.y-Rr+13)/Ve);e=Jt(e,0,Ie-1),t=Jt(t,0,2),ze=t*Ie+e}for(let e=0;e<Ct.length;e++){let t=zl.getItem(Ct[e].dev_name)==="y",i=eu.get(Ct[e].public_name);i?(Il.position.copy(i.position),Sr.position.copy(i.position),Sr.color=t?e===ze?P.default.chartreuse:P.default.darkgreen:e===ze?P.default.cyan:P.default.darkcyan,u.default.gfx.drawSprite(Il),u.default.gfx.drawSprite(i),u.default.gfx.drawSprite(Sr)):u.default.gfx.fillRect(new oe.default(e%Ie*Ve+Cr,Math.floor(e/Ie)*Ve+Rr,ct,ct),t?e===ze?P.default.chartreuse:P.default.darkgreen:e===ze?P.default.cyan:P.default.darkcyan)}u.default.gfx.useEffect(He),He.uniforms.u_dark(.7),u.default.gfx.drawSprite(ke),u.default.gfx.useEffect(null),ti.sourceRect.y=u.default.gameTime.elapsed%2<1?0:100,ii.sourceRect.y=u.default.gameTime.elapsed%2<1?0:50,ti.position.set(400,525),Zt.position.set(150,550),ii.position.set(150,485),u.default.gfx.drawSprite(ti),u.default.gfx.drawSprite(Zt),u.default.gfx.drawSprite(ii),u.default.gfx.drawSprite(Qt),u.default.gfx.drawSprite($l)}_e===0&&(he>0&&(he+=u.default.gameTime.delta*1.5,he>.5&&(q=zt(q,0,u.default.gameTime.delta*4)),he>=1&&(_e=1)),u.default.gfx.useEffect(Ke),Ke.uniforms.u_alpha(1-he*he),u.default.gfx.drawSprite(ni),u.default.gfx.useEffect(He),He.uniforms.u_alpha(1-he*he),u.default.gfx.drawSprite(ke),u.default.gfx.useEffect(u.default.gfx.builtinEffects.MsdfFont),xn.position.y=mn(10,-400+10,he*he),yn.position.y=mn(136,-400+136,he*he),u.default.gfx.drawGroup(xn,!1),u.default.gfx.drawGroup(yn,!1),he===0?(bn._sprites.forEach(r=>{r.color.a-=u.default.gameTime.delta*2}),vr._sprites.forEach(r=>{r.color.a=Jt(u.default.gameTime.elapsed-.8,0,1)})):(vr._sprites.forEach(r=>{r.color.a-=u.default.gameTime.delta}),vr.position.y=mn(490,690,he*he)),u.default.gfx.drawGroup(bn,!1),u.default.gfx.drawGroup(vr,!1),u.default.gfx.useEffect(null),_e===1&&(ke.color.a=1),(u.default.input.anyKeyPressed||u.default.input.anyMouseButtonPressed)&&(he+=1e-4)),al(),u.default.endFrame(),u.default.requestAnimationFrame(ru)}function rf(){console.log("cancelling!"),Rn=!0,$e=!1,Re=!1}function su(r){let e=0,t=1;if(Re=!0,u.default.gfx.useEffect(pe),_e===1){let i=1,s=R[N-i];for(;s.minor_turn!==0;)i++,s=R[N-i];let n=s.crates,a=s.target.positions.filter(h=>n.every(c=>!c.pos.equals(h)));if(a.length===0)throw new Error("idk targets thing");let l=a[0].add(1,1).mul(E).sub(Ze);pe.uniforms.u_pos(l.x,l.y)}else _e===2&&(pe.uniforms.u_pos(ze%Ie*Ve+Cr+ct/2,Math.floor(ze/Ie)*Ve+Rr+ct/2),e=.25,t=1.5);u.default.gfx.useEffect(null),xi(()=>{if(u.default.gfx.useEffect(pe),pe.uniforms.u_progress(e),u.default.gfx.drawSprite(ce),u.default.gfx.useEffect(null),Rn){if(e=zt(e,0,u.default.gameTime.delta*3/wn),e<=0)return Rn=!1,!0}else if(e=zt(e,1,u.default.gameTime.delta*t/wn),e>=1)return Re=!1,r(),!0;return!1})}function sf(r){let e=0;_e=1,ri=r,tu(Ct[r]),u.default.gfx.useEffect(pe);let t=T.spawner,i=t.pos.add(t.dir.mul(.5)).add(1,1).mul(E).sub(Ze);pe.uniforms.u_pos(i.x,i.y),u.default.gfx.useEffect(null),xi(()=>(u.default.gfx.useEffect(pe),pe.uniforms.u_progress(1-e),u.default.gfx.drawSprite(ce),u.default.gfx.useEffect(null),e=zt(e,1,u.default.gameTime.delta/wn),e>=1))}function nf(){let r=0;Ft=!0,u.default.gfx.useEffect(pe),pe.uniforms.u_pos(ce.size.x/2,ce.size.y/2),u.default.gfx.useEffect(null),xi(()=>(u.default.gfx.useEffect(pe),pe.uniforms.u_progress(1-r),u.default.gfx.drawSprite(ce),u.default.gfx.useEffect(null),r=zt(r,1,u.default.gameTime.delta*3),r>=1))}function Hl(r){su(()=>sf(r))}var Je={},Er={};function Bn(r,e){if(Re&&_e===2)return!1;let t=Array.isArray(r)?r.join(""):r;if(t in Je||(Je[t]=0,Er[t]=0),Je[t]=Math.max(0,Je[t]-e),u.default.input.down(r)){if(Je[t]==0)return Er[t]+=1,Je[t]=Er[t]==1?.22:.08,!0}else return Er[t]=0,Je[t]=0,!1;return!1}function zt(r,e,t){return e>r?Math.min(r+t,e):e<r?Math.max(r-t,e):e}function gn(r,e,t){let i=[];for(let s=0;s<e;s++){let n=[];for(let o=0;o<r;o++)n.push(t);i.push(n)}return i}function of(r,e){for(let[t,i]of r)if(t===e)return i;return null}function jl(r,e){for(let[t,i]of r)if(Bn(t,e))return i;return null}function Bi(r,e){for(let t=0;t<r.length;t++)if(e(r[t]))return t;return-1}function Vl(r){return Math.abs(r.x)>Math.abs(r.y)?r.x>=0?d.default.right:d.default.left:r.y>=0?d.default.down:d.default.up}function Jt(r,e,t){return r<e?e:r>t?t:r}function mn(r,e,t){return r*(1-t)+e*t}function af(r,e){return(r%e+e)%e}Wl.default.reset();ru();
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
