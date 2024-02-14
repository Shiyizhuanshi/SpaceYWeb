const cvs = document.getElementById("bg");


const width = window.innerWidth,
      height = window.innerHeight;
cvs.width = width;
cvs.height = height;

const ctx = cvs.getContext("2d");
const fontsize = 15;


const columnWidth = fontsize
const columnCount  = Math.floor(width / fontsize);
const NextChar = new Array(columnCount).fill(0);

function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < columnCount; i++) {
        const char = getRandomChar();
        ctx.fillStyle = getRandomColor();
        ctx.fontsize = '${fontsize}px "Roboto Mono"';
        const x = i * columnWidth;
        const index = NextChar[i];
        const y = (index + 1) * fontsize;
        ctx.fillText(char, x, y);
        if(y > height && Math.random() > 0.975) {
            NextChar[i] = 0;
        }
        NextChar[i] ++;
    }
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomChar() {
    const char = String.fromCharCode(Math.floor(Math.random() * 128));
    return char;
}
draw();
setInterval(draw, 30);
