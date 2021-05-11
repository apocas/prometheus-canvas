var Live = function () {
  var self = this;

  this.particles = [];
  this.canvas1 = document.querySelector('#layer1');
  this.ctx1 = this.canvas1.getContext('2d');
  this.canvas2 = document.querySelector('#layer2');
  this.ctx2 = this.canvas2.getContext('2d');
  this.canvas3 = document.querySelector('#layer3');
  this.ctx3 = this.canvas3.getContext('2d');

  this.setup();
  window.onresize = function (event) {
    self.setup();
  };

  this.sizeMultiplier = 1;

  setTimeout(function () {
    document.getElementById('github').remove();
  }, 15000);

  this.connection = io();

  this.connection.on('connect', function () {
    self.connection.on('logo', function (logo) {
      document.getElementById('logo').src = logo;
    });

    self.connection.on('size', function (size) {
      self.sizeMultiplier = size;
    });

    self.connection.on('servers', function (alertArray) {
      let alertArrayKeys = Object.keys(alertArray);
      for (let alert of alertArrayKeys) {
        var node = self.findNode(alert);

        var size = 5 * self.sizeMultiplier;
        var color = '#01BF21';

        if (alertArray[alert] === 'red') {
          color = '#D94D56';
          size = 10 * self.sizeMultiplier;
        } else if (alertArray[alert] === 'yellow') {
          color = '#EFD38A';
          size = 7 * self.sizeMultiplier;
        }

        if (!node) {
          self.particles.push({
            x: Math.round(Math.random() * self.width),
            y: Math.round(Math.random() * self.height),
            rgba: color,
            vx: Math.round(Math.random() * 3) - 1.5,
            vy: Math.round(Math.random() * 3) - 1.5,
            id: alert,
            status: alertArray[alert],
            size: size
          });
        } else {
          node.size = size;
          node.rgba = color;
          node.status = alertArray[alert];
        }
      }
    });

    console.log('Connected');
  });
};

Live.prototype.start = function () {
  var self = this;
  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 30);
      };
  })();

  (function loop() {
    self.draw();
    setTimeout(function () {
      requestAnimFrame(loop);
    }, 30);
  })();
};


Live.prototype.setup = function () {
  this.width = window.innerWidth;
  this.height = window.innerHeight;

  this.canvas1.width = this.width;
  this.canvas1.height = this.height;
  this.canvas2.width = this.width;
  this.canvas2.height = this.height;
  this.canvas3.width = this.width;
  this.canvas3.height = this.height;
  this.canvas1.style.left = (window.innerWidth - this.canvas1.width) / 2 + 'px';
  this.canvas2.style.left = (window.innerWidth - this.canvas2.width) / 2 + 'px';
  this.canvas3.style.left = (window.innerWidth - this.canvas2.width) / 2 + 'px';
};


Live.prototype.findDistance = function (p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};


Live.prototype.draw = function () {
  this.ctx1.clearRect(0, 0, this.width, this.height);
  this.ctx1.globalCompositeOperation = 'lighter';
  this.ctx2.clearRect(0, 0, this.width, this.height);
  this.ctx2.globalCompositeOperation = 'lighter';
  this.ctx3.clearRect(0, 0, this.width, this.height);
  this.ctx3.globalCompositeOperation = 'lighter';

  var img = document.getElementById("logo");
  this.ctx1.globalAlpha = 0.6;
  this.ctx2.globalAlpha = 0.8;
  this.ctx3.globalAlpha = 0.8;
  this.ctx1.drawImage(img, (this.width / 2) - (img.width / 2), (this.height / 2) - (img.height / 2));

  for (var i = 0; i < this.particles.length; i++) {
    var temp = this.particles[i];

    for (var j = 0; j < this.particles.length; j++) {
      var temp2 = this.particles[j];
      this.ctx1.linewidth = 0.5;

      if (temp.rgba == temp2.rgba) {
        var distance = this.findDistance(temp, temp2);

        if (distance <= (temp.size + temp2.size)) {
          temp.vx *= -1;
          temp.vy *= -1;
          temp2.vx *= -1;
          temp2.vy *= -1;
        } else if (distance < 50) {
          this.ctx1.strokeStyle = "#7A7A7A";
          this.ctx1.beginPath();
          this.ctx1.moveTo(temp.x, temp.y);
          this.ctx1.lineTo(temp2.x, temp2.y);
          this.ctx1.stroke();
        }
      }
    }

    this.ctx1.fillStyle = temp.rgba;
    this.ctx1.strokeStyle = temp.rgba;
    this.ctx2.fillStyle = temp.rgba;
    this.ctx2.strokeStyle = temp.rgba;
    this.ctx3.fillStyle = temp.rgba;
    this.ctx3.strokeStyle = temp.rgba;

    var ctx = this.ctx2;

    if (temp.status != 'green') {
      ctx = this.ctx3;
    }
    ctx.beginPath();
    ctx.arc(temp.x, temp.y, temp.size, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();

    temp.x += temp.vx;
    temp.y += temp.vy;

    if (temp.x > this.width) temp.x = 0;
    if (temp.x < 0) temp.x = this.width;
    if (temp.y > this.height) temp.y = 0;
    if (temp.y < 0) temp.y = this.height;
  }
};


Live.prototype.findNode = function (id) {
  for (var i = 0; i < this.particles.length; i++) {
    if (this.particles[i].id == id) {
      return this.particles[i];
    }
  }
};


var live = new Live();
live.start();
