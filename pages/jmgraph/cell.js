
var balls = [];
var state = 0;
var handler = 0;
exports.init = function(g) {    
  balls = [];
  state = 1;
  refreshBall(g);
}

function refreshBall(g) {

  var style = {
    lineWidth: 1,
    close: true
  };

  resize(g);

  style.shadow = g.createShadow(0, 0, 20, '#000');



  style.fill = g.createRadialGradient('50%', '50%', 0, '50%', '50%', '50%');
  //var rr1 = Math.floor(Math.random() * 255);
  //var gg1 = Math.floor(Math.random() * 255);
  //var bb1 = Math.floor(Math.random() * 255);
  //var rr2 = Math.floor(Math.random() * 255);
  //var gg2 = Math.floor(Math.random() * 255);
  //var bb2 = Math.floor(Math.random() * 255);
  style.fill.addStop(0, 'rgb(112,154,22)');
  style.fill.addStop(1, 'rgb(49,95,118)');

  var count = g.width / 20;

  for (var i = 0; i < count; i++) {
    var radius = Math.random() * 10 + 4;
    //var styletmp = g.util.clone(style);

    var p = createPosition(radius, 0, g);
    var b = new cell(g, p.x, p.y, radius, style);
    b.vx = Math.random() - Math.random();
    b.vy = Math.random() - Math.random();
    balls.push(b);
  }

  //var radius = Math.random() * 10 + 6;
  var styletmp = g.util.clone(style);
  styletmp.fill = g.createRadialGradient('50%', '50%', 0, '50%', '50%', '50%');
  styletmp.fill.addStop(0, 'rgb(255,255,255)');
  styletmp.fill.addStop(1, 'rgb(255,149,255)');

  //主体细胞

  var myCell = createCell(g, g.width / 2, g.height / 2, 14, styletmp);//new cell(g,graph.width / 2,g.height / 2,10,styletmp);

  //balls.push(myCell);

  g.bind('touchend', function (evt) {
    var x = evt.position.x;
    var y = evt.position.y;
    myCell.go(x, y);
    return false;
  });

  function animate() {
      if(state !== 1) return;
    var bs = balls;
    var len = bs.length;
    //var mvx = 0;
    //var mvy = 0;
    for (var i = 0; i < len; i++) {
      var b1 = bs[i];
      if (!b1 || !b1.visible) continue;
      b1.vx += b1.ax;
      b1.vy += b1.ay;
      for (var j = i + 1; j < len; j++) {
        var b2 = bs[j];
        if (!b2 || !b2.visible) continue;
        var lx = b1.x() - b2.x();
        var ly = b1.y() - b2.y();
        var l = Math.sqrt(lx * lx + ly * ly);
        var lr = b1.radius() + b2.radius();
        var dr = (lr - l) / 2;
        if (dr > 0) {
          var vx = b1.vx;
          var vy = b1.vy;
          var vxb = b2.vx;
          var vyb = b2.vy;

          var bigB, smallB;
          var smallindex = i;
          if (b1.radius() > b2.radius()) {
            bigB = b1;
            smallB = b2;
            smallindex = j;
          }
          else {
            bigB = b2;
            smallB = b1;
          }

          var smr = smallB.radius() - dr;
          var darea = 0;
          if (smr > 0) {
            darea = smallB.radius() * smallB.radius() - smr * smr;
            smallB.radius(smr);
          }
          else {
            darea = smallB.radius() * smallB.radius();
            dr = smallB.radius();
            smallB.visible(false);
            balls.splice(smallindex, 1);
          }
          var bigr = Math.sqrt(bigB.radius() * bigB.radius() + darea);

          bigB.vx = (bigB.radius() * bigB.vx + dr * smallB.vx) / bigr;
          bigB.vy = (bigB.radius() * bigB.vy + dr * smallB.vy) / bigr;
          bigB.radius(bigr);

        }
      }

      if (!b1.visible) continue;
      var x = b1.x() + b1.vx;
      var maxX = b1.graph.width - b1.radius();
      if (x <= b1.radius() || x >= maxX) {
        //b1.vy -= 0.4;
        b1.vx *= -1;
      }
      x = Math.max(x, b1.radius());
      x = Math.min(maxX, x);
      b1.x(x);
      var y = b1.y() + b1.vy;
      var maxY = b1.graph.height - b1.radius();
      if (y <= b1.radius() || y >= maxY) {
        //if(y >= maxY && b1.vy > 0) {b1.vy -= 1;b1.vx -= 0.4;}
        b1.vy *= -1;
      }
      y = Math.max(y, b1.radius());
      y = Math.min(maxY, y);
      b1.y(y);
    }
    g.needUpdate = true;
    handler = setTimeout(animate, 20);
  };
  animate();
}

function createCell(g, x, y, r, style) {
  var c = new cell(g, x, y, r, style);
  balls.push(c);
  return c;
}

function cell(graph, x, y, radius, style) {
  this.graph = graph;

  this.center = { x: x, y: y };
  this.shape = graph.createShape('circle', { style: style, center: this.center, radius: radius, anticlockwise: true });
  graph.children.add(this.shape);

  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;

  this.go = function (x, y) {
    var r = this.radius();
    if (r <= 4) return;

    var myx = this.x();
    var myy = this.y();

    var dx = x - myx;
    var dy = y - myy;
    var dp = Math.sqrt(dx * dx + dy * dy);
    var vx = dx / dp * 1;
    var vy = dy / dp * 1;
    var px = myx + vx * (r + 4);
    var py = myy + vy * (r + 4);

    var mc = createCell(this.graph, px, py, 1, style);
    mc.vx = vx;
    mc.vy = vy;

    var radius = Math.sqrt(r * r - mc.radius() * mc.radius());
    this.radius(radius);

    this.vx = (this.vx * r - mc.vx * mc.radius()) / this.radius();
    this.vy = (this.vy * r - mc.vy * mc.radius()) / this.radius();

    this.graph.needUpdate = true;
  }
  this.x = function (x) {
    if (typeof x !== 'undefined') this.center.x = x;
    return this.center.x;
  }
  this.y = function (y) {
    if (typeof y !== 'undefined') this.center.y = y;
    return this.center.y;
  }

  this.radius = function (r) {
    if (typeof r == 'undefined') return this.shape.radius;
    return this.shape.radius = r;
  }
  this.visible = function (v) {
    if (typeof v !== 'undefined') {
      this.shape.visible = v;
      if(!v) {
        this.graph.children.remove(this.shape);
      }
    }
    return this.shape.visible;
  }
}

function createPosition(radius, i, g) {
  var x = Math.random() * g.width + radius;
  var y = Math.random() * g.height + radius;

  for (var j = i + 1; j < balls.length; j++) {
    var b2 = balls[j];
    var lx = Math.abs(x - b2.x());
    var ly = Math.abs(y - b2.y());
    var l = Math.sqrt(lx * lx + ly * ly);
    //如果二个球重叠则放 弃当前球
    if (l < radius + b2.radius) {
      return createPosition(radius, i , g);
    }
  }
  return { x: x, y: y };
}

function resize(g) {
  if (g) {
    var info = wx.getSystemInfoSync();
    g.width = info.windowWidth - 2;
    g.height = info.windowHeight - 100;
  }
}

exports.destory = function (g) {
    state = 0;
  if (handler) clearTimeout(handler);
  g && g.unbind('touchend');
}