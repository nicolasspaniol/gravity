class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(value) {
    this.x += value.x;
    this.y += value.y;
  }
  static sum(a, b) {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  subtract(value) {
    this.x -= value.x;
    this.y -= value.y;
  }
  static difference(a, b) {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  times(value) {
    this.x *= value;
    this.y *= value;
  }
  static product(a, value) {
    return new Vector2(a.x * value, a.y * value);
  }

  divide(value) {
    this.x /= value;
    this.y /= value;
  }
  static fraction(a, value) {
    return new Vector2(a.x / value, a.y / value);
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  normalize() {
    this.divide(this.magnitude());
  }

  copy() {
    return new Vector2(this.x, this.y);
  }

  squaredHypotenuse() {
    return this.x ** 2 + this.y ** 2;
  }
  hypotenuse() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
}
