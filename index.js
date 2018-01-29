//Initializing
window.onload = function (){
    if (window.wallpaperRegisterAudioListener) {
        window.wallpaperRegisterAudioListener(wallpaperAudioListener);
    } else {
        window.setInterval(run, 1000 / 24);
    }
    c.width = window.innerWidth;
    c.height = window.innerHeight;
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
    c.style.background = "#08303e"
}

//Declaring Variables
const c = d("c");
const ctx = c.getContext("2d");
var points = [];
var rad = 10;
var fade = false;
var dis = 300;
var A = toRadian(Math.random() * 360);
var lastTime = 0;
var DeltaTime = 0;
var rainbow = false;
var avg2;
var D = 0;
var loc = 3;
var siz = 3;
var sens = 1;
var UColor = 'rgb(255,255,255)';
var Color = 'hsl(0, 100%, 60%)';
var rgb = {
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

function lowest(k, l){
    if(k < l)return l;
    else return k;
}

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if(properties.bcol){
            var background=properties.bcol.value.split(' ').map(function(c){return Math.ceil(c*255)});
            c.style.background='rgb('+background+')'
        }
        if(properties.pcol){
            UColor = "rgb("+(properties.pcol.value.split(' ').map(function(c){return Math.ceil(c*255)})).join(",") + ")"
            console.log(UColor);
        }
        if(properties.draw){
            D = properties.draw.value;
        }
        if(properties.rad){
            rad = properties.rad.value;
        }
        if(properties.dis){
            dis = properties.dis.value * 10;
        }
        if(properties.sens){
            sens = properties.sens.value;
        }
        if(properties.loc){
            loc = properties.loc.value;
        }
        if(properties.siz){
            siz = properties.siz.value;
        }
        if(properties.rain){
            rainbow = properties.rain.value;
        }
        if(properties.spd){
            rgb.s = properties.spd.value;
        }
        if(properties.fade){
            fade = properties.fade.value;
        }
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

    let low = loc - siz;
    let high = loc + siz;
    if(low < 0)low = 0;
    if(high > Average.length - 1)high = Average.length - 1;
    let am = high - low;
    if(am == 0)am = 1;

    avg2 = Average.slice(low, high).reduce((a, b) => a + b, 0) / am * sens;
    avg2 = lowest(avg2, 0.01)

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    //Update Each point to make it move
    if(rainbow){
        rgb.Update();
        Color = rgb.toHSL();
    }
    ctx.strokeStyle = rainbow ? Color : UColor;
    ctx.fillStyle = rainbow ? Color : UColor;
    console.log("Current Color = ",ctx.fillStyle || ctx.strokeStyle)
    points.forEach((p, i) => {
        let k = points[i];
        k.x += k.v.x * avg2 /*totalAmount*/ //(Average[i] / 2);
        k.y += k.v.y * avg2 /*totalAmount*/ //(Average[i] / 2);
        if(k.x - rad <= 0){k.v.x = Math.abs(k.v.x);}
        if(k.x + rad >= window.innerWidth){k.v.x = -Math.abs(k.v.x);}
        if(k.y - rad <= 0){k.v.y = Math.abs(k.v.y);}
        if(k.y + rad >= window.innerHeight){k.v.y = -Math.abs(k.v.y);}


        if(D == 0 || D == 1){
            points.forEach(p1 => {
                if(p.x.around(p1.x, dis) && p.x.around(p1.x, dis)){
                    let d = Math.hypot(p.x - p1.x, p.y - p1.y);
                    if(d < dis){
                        let a = 1 - d / dis
                        ctx.globalAlpha = a;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p1.x, p1.    y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            })
        }
    })
    ctx.beginPath();
    points.forEach((p, i) => {
        if(D == 0 || D == 2){
            ctx.moveTo(p.x + rad, p.y);
            ctx.arc(p.x,p.y,rad * clamp(avg2, 0.6, 0.9),0,2*Math.PI);
        }
    })
    ctx.fill();

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


function run(){
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.strokeStyle = rainbow ? Color : UColor;
    ctx.fillStyle = rainbow ? Color : UColor;
    points.forEach((p, i) => {
        let k = points[i];
        k.x += k.v.x * 0.6 /*totalAmount*/ //(Average[i] / 2);
        k.y += k.v.y * 0.6 /*totalAmount*/ //(Average[i] / 2);
        if(k.x - rad <= 0){k.v.x = Math.abs(k.v.x);}
        if(k.x + rad >= window.innerWidth){k.v.x = -Math.abs(k.v.x);}
        if(k.y - rad <= 0){k.v.y = Math.abs(k.v.y);}
        if(k.y + rad >= window.innerHeight){k.v.y = -Math.abs(k.v.y);}


        if(D == 0 || D == 1){
            points.forEach(p1 => {
                if(p.x.around(p1.x, dis) && p.x.around(p1.x, dis)){
                    let d = Math.hypot(p.x - p1.x, p.y - p1.y);
                    if(d < dis){
                        let a = 1 - d / dis
                        ctx.globalAlpha = a;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p1.x, p1.    y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            })
        }
    })
    ctx.beginPath();
    points.forEach((p, i) => {
        if(D == 0 || D == 2){
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x,p.y,rad * clamp(avg2, 0.6, 0.9),0,2*Math.PI);
        }
    })
    ctx.fill();

    let ct = Date.now();
    DeltaTime = ct - lastTime;
    lastTime = ct;
}