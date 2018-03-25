import "./style/main.css";
import perlin from './lib/perlin';
import map_range from './lib/mapRange';

class ASCII {
    constructor() {
        this.track;
        this.img = document.getElementById("source");
        this.time = 0;
        this.frameState = [];
        this.template = "AaÃbcdeÃ¨Ã©fghiÃ¬jklmnoÃ²pqrstuÃ¹Ã¼vwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%/|\\()#?!\"'â€œâ€â€˜â€™;:Ï€*+â€¢â€”-_,. ";
        this.output = document.querySelector('output') || document.body.appendChild(
            document.createElement('output')
        );

        this.SMap = {
            list: Array.from(this.template),
            map: new Map(
                Array.from(this.template).map(function (a, b) {
                    return [a, b];
                })
            ),
            length: this.template.length
        };
        this.zero = this.SMap.map.get('0');
        this.one = this.SMap.map.get('1');

        this.videoRation = 0;


        this.calcSizes();
        this.drawGrid();
        this.initCanvas();
        this.drawCanvas();
        this.getWebcam();
        window.addEventListener('resize', (e) => {
            this.calcSizes();
            this.drawGrid();
        });
        this.animateLoop();
    }

    calcSizes() {
        let measureDiv = document.createElement('div');
        measureDiv.style.cssText = 'position:absolute;display:block;white-space: pre;';
        measureDiv.innerHTML = 'X'.repeat(100);
        measureDiv.innerHTML += 'X\n'.repeat(99);
        document.body.appendChild(measureDiv);

        this.charWidth = measureDiv.offsetWidth / 100;
        this.lineHeight = measureDiv.offsetHeight / 100;
        this.aspect = this.charWidth / this.lineHeight;
        document.body.removeChild(measureDiv);

        this.rows = Math.floor(window.innerHeight / this.lineHeight);
        this.cols = Math.floor(window.innerWidth / this.charWidth);
    }
    drawGrid() {
        for (var i = 0; i < this.rows; i++) {
            this.output.appendChild(document.createElement('span'));
            this.frameState.push(
                new Array(this.cols).fill(this.zero)
            );
        }
        // for (var i = 0; i < this.rows; i++) {
        //     for (var j = 0; j < this.cols; j++) {
        //         this.frameState[i][j] = Math.floor(120 * perlin(i / 20, j / 20, 0));
        //     }
        // }
    }

    draw() {
        // draw state
        for (var i = 0; i < this.rows; i++) {
            let row = this.output.childNodes[i];
            let res = '';
            for (var j = 0; j < this.cols; j++) {
                let nomer = this.frameState[i][j];
                res += this.SMap.list[nomer];
            }
            if (row.innerHTML !== res) row.innerHTML = res;

        }

        // cooldown
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                if (this.frameState[i][j] < this.SMap.length - 1) {
                    this.frameState[i][j] = ++this.frameState[i][j] % this.SMap.length;
                }

            }
        }

    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.height = this.rows;
        this.canvas.width = this.cols;
        document.body.appendChild(this.canvas);
    }
    drawCanvas() {
        let shiftCoordsX = 0;
        let shiftCoordsY = 0;
        this.ctx.clearRect(0, 0, this.cols, this.rows);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.cols, this.rows);
        this.ctx.save();

        this.ctx.globalAlpha = 0.1;
        if (this.track && this.videoRation) {
            let shift = (this.cols - this.rows * this.videoRation / this.aspect) / 2;
            this.ctx.drawImage(this.video, shift, 0, this.rows * this.videoRation / this.aspect, this.rows);
        }

        this.ctx.restore();

        let data = this.ctx.getImageData(0, 0, this.cols, this.rows).data;
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                let nom = 4 * (i * this.cols + j);
                let symbol = Math.floor(map_range(data[nom], 0, 255, 0, this.one));
                if (symbol !== 0) {
                    this.frameState[i][j] = symbol;
                }
            }
        }
    }
    getWebcam() {
        this.video = document.createElement('video');
        navigator.getUserMedia({ video: true, audio: false }, (stream) => {
            this.video.src = window.URL.createObjectURL(stream);
            this.track = stream.getTracks()[0];
        }, function (e) {
            console.error('Rejected!', e);
        });
    }
    animateLoop() {
        if (!this.videoRation) {
            this.videoRation = this.video.videoWidth / this.video.videoHeight;
        }
        this.time ++;
        this.drawCanvas();
        this.draw();
        requestAnimationFrame(this.animateLoop.bind(this));
    }
}

var ascii = new ASCII();
