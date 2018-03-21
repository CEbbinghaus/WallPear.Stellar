//Initializing
window.onload = function (){
    if (window.wallpaperRegisterAudioListener) {
        window.wallpaperRegisterAudioListener(wallpaperAudioListener);
    }
    c.width = innerWidth;
    c.height = innerHeight;
    for(i = 0; i < 64; i++){
        points.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            v : {
                x : ((Math.random() * 2) - 1) * 20,
                y : ((Math.random() * 2) - 1) * 20
            }
        })
    }
    c.style.background = "#08303e";
    requestAnimationFrame(update)
}

//Declaring Variables
let s = new Map()
const c = d("c");
const ctx = c.getContext("2d");
var points = [];
s.set('rad', 3)
s.set('dis', 10)
let lastTime = 0;
let DeltaTime = 0;
s.set('rainbow', false)
s.set('opa', true)
let avg2;
s.set('draw', 0)
s.set('sens', 1)
s.set('width', 1)
s.set('loc', 3)
s.set('siz', 3)
s.set('UColor', 'rgb(255,255,255)')
s.set('Color', 'hsl(0, 100%, 60%)')
let rgb = {
    a: 1,
    s: 1,
    c: 0,
    toHex : function(){
        return "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16)
    },
    toHSL: function(){
        return `hsl(${this.c}, 100%, 60%)`;
    },
    Update : function(){
        this.c = (this.c + this.s) % 360;
    }
}


window.wallpaperPropertyListener = {
  applyUserProperties: function(properties) {
		if(properties.bcol){
			let background=properties.bcol.value.split(' ').map(function(c){return Math.ceil(c*255)});
			c.style.background='rgb('+background+')'
		}else if(properties.spd){
			rgb.s = properties.spd.value;
		}
		s.forEach((n, p) => {
				if(properties[p]){
					if(p == 'pcol'){
						s.set('UColor', "rgb("+(properties.pcol.value.split(' ').map(function(c){return Math.ceil(c*255)})).join(",") + ")");
					}else{
						s.set(p, properties[p].value)
					}
			}
  	})
	}
}

//Update
function wallpaperAudioListener(audioArray) {
    //Checking if Audio is Playing or if it is Bugging (AKA All bars are filled to the max)
    totalAmount = 0;
    audioArray.forEach(e => {
        if(e > 1){
            e = 1;
        }
        totalAmount += e;
    });
    //if so then Exit the programm
    if(totalAmount == audioArray.length){
        return;
    }
    totalAmount /= audioArray.length;

    //Averaging Both Channels and creating a single Array
    let Left = audioArray.slice(0, 63)
    let Right = audioArray.slice(63, 127)
    Average = new Array(64);
    for(let i = 0; i < audioArray.length / 2 ;i++){
        Average[i] = Math.max(Right[i], Left[i])
    }

    let low = s.get('draw') - s.get('siz');
    let high = s.get('draw') + s.get('siz');
    if(low < 0)low = 0;
    if(high > Average.length - 1)high = Average.length - 1;
    let am = high - low;
    if(am == 0)am = 1;

    avg2 = Average.slice(low, high).reduce((a, b) => a + b, 0) / am * s.get('sens');
    avg2 = Math.max(avg2, 0.001)
    let ct = Date.now();
    DeltaTime = ct - lastTime;
    lastTime = ct;
}


//Utility Functions
function toRadian(n) {
    return n * 180 / Math.PI;
}

function d(l){
    return document.getElementById(l);
}

var clamp = function(k, mi, ma){
    if(k < mi)return mi;
    if(k > ma)return ma;
    return k;
}

Number.prototype.around = function(n, a){
    if(n < this + a && n > this - a){
        return true;
    }else{
        return false;
    }
}

function update(t) {
    avg2 = avg2 ? avg2 : 0.01; 
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    //Update Each point to make it move
    if(s.get('rainbow')){
        rgb.Update();
        s.set('Color', rgb.toHSL())
    }
    ctx.strokeStyle = s.get('rainbow') ? s.get('Color') : s.get('UColor');
    ctx.fillStyle = s.get('rainbow') ? s.get('Color') : s.get('UColor');
    ctx.lineWidth = s.get('width');
    points.forEach((p, i) => {
        let k = points[i];
        k.x += k.v.x * avg2
        k.y += k.v.y * avg2
        if(k.x - s.get('rad') <= 0){k.v.x = Math.abs(k.v.x);}
        if(k.x + s.get('rad') >= window.innerWidth){k.v.x = -Math.abs(k.v.x);}
        if(k.y - s.get('rad') <= 0){k.v.y = Math.abs(k.v.y);}
        if(k.y + s.get('rad') >= window.innerHeight){k.v.y = -Math.abs(k.v.y);}

        if(s.get('draw') == 0 || s.get('draw') == 1){
            points.forEach(p1 => {
                //if(p.x.around(p1.x, s.get('dis')) && p.x.around(p1.x, s.get('dis'))){
                    let d = Math.hypot(p.x - p1.x, p.y - p1.y);
                    //console.log(d, s.get('dis'))   
                    if(d < (s.get('dis') / 100 * innerWidth)){
                        let a = s.get("opa") ?  1 - d / (s.get('dis') / 100 * innerWidth) : 1;
                        ctx.globalAlpha = a;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p1.x, p1.    y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                //}
            })
        }
    })
    ctx.beginPath();
    points.forEach((p, i) => {
        if(s.get('draw') == 0 || s.get('draw') == 2){
            ctx.moveTo(p.x + s.get('rad'), p.y);
            ctx.arc(p.x,p.y,s.get('rad') * clamp(avg2, 0.6, 0.9),0,2*Math.PI);
        }
    })
    ctx.fill();
    requestAnimationFrame(update)
}
