  function d(l){
        return document.getElementById(l);
    }

    const c = d("c");
    const ctx = c.getContext("2d");
    var points = [];
    const dis = 300;

    window.onload = function (){
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        init()
    }

    function init(){
        for(i = 0; i < 64; i++){
            points.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                v : {
                    x : (Math.random() * 2) - 1,
                    y : (Math.random() * 2) - 1
                }
            })
        }
        draw()
    }
    function Update(){
        let A = toRadian(Math.random() * 360);
        points.forEach((p, i) => {
            let k = points[i];
            k.x += k.v.x;
            k.y += k.v.y;
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
            if(k.x <= 0 || k.x >= window.innerWidth){k.v.x = -k.v.x;}
            if(k.y <= 0 || k.y >= window.innerHeight){k.v.y = -k.v.y;}
            k.v.x += Math.cos(A) / 100;
            k.v.y += Math.sin(A) / 100;

        })
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = "#08303e"
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.fillStyle = "#FFFFFF"
        ctx.strokeStyle = "#FFFFFF"
        draw();
        window.setTimeout(Update, 60);
    }
    Update()
    function draw(){
        points.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x,p.y,2,0,2*Math.PI);
            ctx.fill();
        })
        drawLines();
    }
    function drawLines(){
        points.forEach(p => {
            points.forEach(p1 => {
                //console.log(Math.sqrt(p.x*p1.x + p.y*p1.y))
                if(Math.dist(p.x, p.y, p1.x, p1.y) < dis){
                    let a = 1 - Math.dist(p.x, p.y, p1.x, p1.y) / dis
                    ctx.globalAlpha = a;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p1.x, p1.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            })
        })
    }
    Math.dist=function(x1,y1,x2,y2){ 
        if(!x2) x2=0; 
        if(!y2) y2=0;
        return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); 
    }

    function toRadian(n) {
        return n * 180 / Math.PI;
    }