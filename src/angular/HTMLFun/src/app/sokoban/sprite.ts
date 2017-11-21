export class Sprite {
  public img: HTMLImageElement;
  private wS: number;
  private hS: number;
  private loaded = false;

  private x = 0;
  private y = 0;

  constructor(
    public src: string,
    public lengthX: number,
    public lengthY: number
  ) {
    this.img = new Image();
    this.img.addEventListener('load', () => {
      this.wS = this.img.width / lengthX;
      this.hS = this.img.height / lengthY;
      this.loaded = true;
    });
    this.img.src = src;
  }

  get X(): number {
    return this.x;
  }

  set X(value: number) {
    if (value >= 0 && value < this.lengthX) {
      this.x = value;
    }
  }

  get Y(): number {
    return this.y;
  }

  set Y(value: number) {
    if (value >= 0 && value < this.lengthY) {
      this.y = value;
    }
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    sx: number,
    sy: number
  ) {
    if (!this.loaded) {
      return;
    }
    ctx.drawImage(
      this.img,
      this.wS * this.x,
      this.hS * this.y,
      this.wS,
      this.hS,
      x,
      y,
      sx,
      sy
    );
  }
}
