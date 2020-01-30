import './style/main.css';
import perlin from './lib/perlin';
import map_range from './lib/mapRange';

class ASCII {
  constructor() {
    this.track;
    this.img = document.getElementById('source');
    this.time = 0;
    this.frameState = [];
    this.template = 'AaÃbcdeÃ¨Ã©fghiÃ¬jklmnoÃ²pqrstuÃ¹Ã¼vwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%/|\\()#?!"\'â€œâ€â€˜â€™;:Ï€*+â€¢â€”-_,. ';
    this.output = document.querySelector('output') || document.body.appendChild(document.createElement('output'));

    this.SMap = {
      list: Array.from(this.template),
      map: new Map(Array.from(this.template).map((a, b) => [a, b])),
      length: this.template.length,
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
    const measureDiv = document.createElement('div');
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
    for (let i = 0; i < this.rows; i++) {
      this.output.appendChild(document.createElement('span'));
      this.frameState.push(new Array(this.cols).fill(this.zero));
    }
    // for (var i = 0; i < this.rows; i++) {
    //   for (var j = 0; j < this.cols; j++) {
    //       this.frameState[i][j] = Math.floor(5 * perlin(i / 2, j / 2, 0))
    //   }
    // }
  }

  draw() {
    // draw state
    for (let i = 0; i < this.rows; i++) {
      const row = this.output.childNodes[i];
      let res = '';
      for (let j = 0; j < this.cols; j++) {
        const nomer = this.frameState[i][j];
        res += this.SMap.list[nomer];
      }
      if (row.innerHTML !== res) row.innerHTML = res;
    }

    // cooldown
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
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
    const shiftCoordsX = 0;
    const shiftCoordsY = 0;
    this.ctx.clearRect(0, 0, this.cols, this.rows);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.cols, this.rows);
    this.ctx.save();

    this.ctx.globalAlpha = 0.1;
    if (this.track && this.videoRation) {
      const shift = (this.cols - this.rows * this.videoRation / this.aspect) / 2;
      this.ctx.drawImage(this.video, shift, 0, this.rows * this.videoRation / this.aspect, this.rows);
    }

    this.ctx.restore();

    const data = this.ctx.getImageData(0, 0, this.cols, this.rows).data;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const nom = 4 * (i * this.cols + j);
        const symbol = Math.floor(map_range(data[nom], 0, 255, 0, this.one));
        if(symbol!==0) {
          this.frameState[i][j] = symbol;
        }
      }
    }
  }
  getWebcam() {
    this.video = document.createElement('video');
    navigator.getUserMedia({ video: true, audio: false }, (stream) => {      
      this.video.srcObject = stream;
      // this.video.src = window.webkitURL.createObjectURL(stream);
      this.track = stream.getTracks()[0];
      // document.body.appendChild(this.video);
      this.video.play();
    }, (e) => {
      console.error('Rejected!', e);
    });
  }
  animateLoop() {
    if (!this.videoRation) {
      this.videoRation = this.video.videoWidth / this.video.videoHeight;
    }
    this.time++;
    this.drawCanvas();
    this.draw();
    requestAnimationFrame(this.animateLoop.bind(this));
  }
}

const ascii = new ASCII();
