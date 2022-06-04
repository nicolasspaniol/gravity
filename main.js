$(document).ready(() => {
  window.menuVisible = true;
  $("#menu-hide-button").click(toggleMenu);

  $("#canvas").mousedown(cnvMouseDown);
  $("#canvas").mouseup(cnvMouseUp);
  $("#canvas").mousemove(cnvMouseMove);
  $("#canvas").mouseleave(() => (window.spawning = false));

  $("#menu-grav").change(updateGravity);
  $("#menu-time").change(updateTimeControl);
  $("#menu-zoom").change(updateZoom);
  $(".menu-border").change(updateOffBorder);
  $(".menu-collision").change(updateOnCollision);

  $(window).resize(resizeCanvas);

  startSim();
});

function startSim() {
  window.spawning = false;
  window.ctx = $("#canvas")[0].getContext("2d");
  window.bodys = new Array();
  window.zoomScale = 1;

  loadBodys("system.json");

  updateGravity();
  updateOffBorder();
  updateOnCollision();
  updateTimeControl();
  resizeCanvas();
  updateZoom();

  globalFrame();
}

function cnvMouseUp(e) {
  if (e.button != 0 || !spawning) return;

  window.directionPosition = new Vector2(e.offsetX, e.offsetY);
  window.spawning = false;

  anyInvalid = false;
  $("#menu > input").each((i, e) => {
    if (!e.checkValidity()) anyInvalid = true;
  });
  if (anyInvalid) {
    alert("Invalid value.");
    return;
  }

  createBody(
    Vector2.fraction(
      Vector2.difference(spawnPosition, directionPosition),
      $("#menu-speed")[0].value
    )
  );
}
function cnvMouseDown(e) {
  if (e.button != 0) return;

  window.spawnPosition = new Vector2(e.offsetX, e.offsetY);
  window.directionPosition = new Vector2(e.offsetX, e.offsetY);
  window.spawning = true;
}
function cnvMouseMove(e) {
  if (spawning) window.directionPosition = new Vector2(e.offsetX, e.offsetY);
}

updateTimeControl = () =>
  (window.timeMultiplier = Number($("#menu-time")[0].value));
function updateZoom() {
  window.zoomScale = Number($("#menu-zoom")[0].value);
  updateScreenCenter();
}
function updateOffBorder() {
  $(".menu-border").each((i, e) => {
    if (e.checked) {
      window.offBorder = i;
    }
  });
}
function updateOnCollision() {
  $(".menu-collision").each((i, e) => {
    if (e.checked) {
      window.onCollision = i;
    }
  });
}
function updateGravity() {
  obj = $("#menu-grav")[0];
  if (obj.checkValidity()) window.gravConstant = Number(obj.value) / 10;
  else alert("Invalid gravitational constant");
}
function resizeCanvas() {
  window.cnv = $("#canvas");
  cnv.attr("height", innerHeight);
  cnv.attr("width", innerWidth);

  window.cnvCenter = new Vector2(innerWidth / 2, innerHeight / 2);
  window.cnvSize = new Vector2(innerWidth, innerHeight);

  updateScreenCenter();
}
updateScreenCenter = () =>
  (window.screenCenter = Vector2.fraction(cnvCenter, zoomScale));

function loadBodys(fileName) {
  window.bodys = new Array();

  $.get(
    fileName,
    {},
    (data, _, __) => {
      data.forEach((planet) => {
        window.bodys.push(
          new PhysicalBody(
            new Vector2(planet.position[0], planet.position[1]),
            new Vector2(planet.speed[0], planet.speed[1]),
            planet.color,
            planet.size,
            planet.density
          )
        );
      });
    },
    "json"
  );
}
function createBody(relativePosition) {
  window.bodys.push(
    new PhysicalBody(
      Vector2.fraction(Vector2.difference(spawnPosition, cnvCenter), zoomScale),
      relativePosition,
      $("#menu-color")[0].value,
      $("#menu-size")[0].value,
      $("#menu-density")[0].value
    )
  );
}

class PhysicalBody {
  constructor(position, direction, color, size, density) {
    this.position = position;
    this.speed = direction;
    this.color = color;
    this.size = Number(size);
    this.mass = this.size ** 2 * Math.PI * Number(density);
    this.forces = new Vector2();
  }
  destruct() {
    console.log(
      `deleted body at position (${this.position.x}, ${this.position.y})`
    );
    bodys.splice(bodys.indexOf(this), 1);
    delete this;
  }
  applyGravity() {
    this.forces.divide(this.mass);
    this.speed.add(this.forces);
    this.forces = new Vector2();
  }
  updatePosition() {
    this.position.add(Vector2.product(this.speed, timeMultiplier));
  }
  render() {
    let screenPosition = Vector2.sum(
      Vector2.product(this.position, zoomScale),
      cnvCenter
    );

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      screenPosition.x,
      screenPosition.y,
      this.size * zoomScale,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

function checkCollision(a, b) {
  if (!a || !b) return;

  if (
    Vector2.difference(a.position, b.position).hypotenuse() <
    a.size + b.size
  ) {
    switch (onCollision) {
      case 0:
        let totalMass = a.mass + b.mass;

        if (b.mass > a.mass) {
          a.speed.x = b.speed.x;
          a.speed.y = b.speed.y;

          //a.position.x = b.position.x;
          //a.position.y = b.position.y;
        }

        let c1 = toRgb(a.color);
        let c2 = toRgb(b.color);
        a.color = toHex(
          Math.floor((c1.r * a.mass + c2.r * b.mass) / totalMass),
          Math.floor((c1.g * a.mass + c2.g * b.mass) / totalMass),
          Math.floor((c1.b * a.mass + c2.b * b.mass) / totalMass)
        );

        a.size += b.size;
        a.mass = totalMass;

        b.destruct();
        break;

      case 1:
        a.destruct();
        b.destruct();
    }
  }
}

function calculateGravity(a, b) {
  if (!a || !b) return;

  let diff = Vector2.difference(a.position, b.position);
  let f = (gravConstant * a.mass * b.mass) / (diff.x ** 2 + diff.y ** 2);

  diff.normalize();
  forceVector = Vector2.product(diff, f * timeMultiplier);

  a.forces.subtract(forceVector);
  b.forces.add(forceVector);
}

function pairedUpdate() {
  var l = bodys.length;
  for (var a = 0, b = 0; a < l; a++) {
    for (b = a + 1; b < l; b++) {
      let bodyA = bodys[a];
      let bodyB = bodys[b];

      if (onCollision != 2) checkCollision(bodyA, bodyB);
      calculateGravity(bodyA, bodyB);
    }
  }
}

function globalFrame() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  pairedUpdate();

  bodys.forEach((b) => {
    switch (window.offBorder) {
      case 0:
        if (
          Math.abs(b.position.x) - b.size >= screenCenter.x ||
          Math.abs(b.position.y) - b.size >= screenCenter.y
        ) {
          b.destruct();
        }

        break;
      case 1:
        if (b.position.x >= screenCenter.x - b.size)
          b.speed.x = -Math.abs(b.speed.x);
        if (b.position.y >= screenCenter.y - b.size)
          b.speed.y = -Math.abs(b.speed.y);
        if (b.position.x <= -(screenCenter.x - b.size))
          b.speed.x = Math.abs(b.speed.x);
        if (b.position.y <= -(screenCenter.y - b.size))
          b.speed.y = Math.abs(b.speed.y);
    }

    b.applyGravity();
    b.updatePosition();
    b.render();
  });

  if (spawning) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";

    ctx.beginPath();
    ctx.moveTo(spawnPosition.x, spawnPosition.y);
    ctx.lineTo(directionPosition.x, directionPosition.y);
    ctx.stroke();
  }

  requestAnimationFrame(globalFrame);
}

function toHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  return `#${`00${r}`.slice(r.length)}${`00${g}`.slice(g.length)}${`00${b}`.slice(b.length)}`;
}
function toRgb(hexCode) {
  obj = new Object();

  obj.r = parseInt(hexCode.slice(1, 3), 16);
  obj.g = parseInt(hexCode.slice(3, 5), 16);
  obj.b = parseInt(hexCode.slice(5, 7), 16);

  return obj;
}