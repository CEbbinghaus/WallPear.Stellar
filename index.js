//Initializing
window.onload = function (){
    window.wallpaperRegisterAudioListener(wallpaperAudioListener);
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
}

//Declaring Variables
const c = d("c");
const ctx = c.getContext("2d");
var points = [];
var rad = 10;
var dis = 300;
var A = toRadian(Math.random() * 360);
var lastTime = 0;
var DeltaTime = 0;
var avg2;

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {

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
    if(totalAmount == audioArray.length || totalAmount <= 0.3){
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

    avg2 = Average.slice(0, 6).reduce((a, b) => a + b, 0) / 6;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#08303e"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.fillStyle = "#FFFFFF"
    ctx.strokeStyle = "#FFFFFF"
    //Update Each point to make it move
    points.forEach((p, i) => {
        let k = points[i];
        k.x += k.v.x * avg2 //totalAmount //(Average[i] / 2);
        k.y += k.v.y * avg2 //totalAmount //(Average[i] / 2);
        /*
        if(k.x < 0){
            k.x += window.innerWidth;
        }else{
            k.x %= window.innerWidth;
        }
        if(k.y < 0){
            k.y += window.innerHeight;
        }else{
            k.y %= window.innerHeight;
        }*/
        if(k.x - rad <= 0){k.v.x = Math.abs(k.v.x);}
        if(k.x + rad >= window.innerWidth){k.v.x = -Math.abs(k.v.x);}
        if(k.y - rad <= 0){k.v.y = Math.abs(k.v.y);}
        if(k.y + rad >= window.innerHeight){k.v.y = -Math.abs(k.v.y);}

        ctx.beginPath();
        ctx.arc(p.x,p.y,rad * clamp(avg2, 0.6, 0.9),0,2*Math.PI);
        ctx.fill();
        points.forEach(p1 => {
            //console.log(Math.sqrt(p.x*p1.x + p.y*p1.y))
            if(Math.dist(p.x, p.y, p1.x, p1.y) < dis){
                let a = 1 - Math.dist(p.x, p.y, p1.x, p1.y) / dis
                //ctx.globalAlpha = a;
                ctx.strokeStyle = "rgba(255, 255, 255, "+a+")"
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
                //ctx.globalAlpha = 1;
            }
        })
    })

    let ct = Date.now();
    DeltaTime = ct - lastTime;
    lastTime = ct;
}


//Utility Functions
Math.dist=function(x1,y1,x2,y2){ 
    if(!x2) x2=0; 
    if(!y2) y2=0;
    return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); 
}

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