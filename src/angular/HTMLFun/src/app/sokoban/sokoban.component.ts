import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Levels } from '../levels.service';

@Component({
  selector: 'app-sokoban',
  template: `
    <canvas #board width="800" height="600"></canvas>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class SokobanComponent implements AfterViewInit {
  @ViewChild('board') board: ElementRef;
  public canv: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public moves = 0;
  public pushes = 0;
  public imgBorder: Array<Sprite> = [];
  public imgStartfield: Array<Sprite> = [];
  public imgRakisuta: Sprite;
  public imgGoal: Sprite;
  public imgFloor: Sprite;
  public imgObject: Sprite;
  public lastTime = 0;

  constructor(public ngZone: NgZone, public levels: Levels) {
    for (let i = 0; i < 4; i++) {
      this.imgBorder.push(new Sprite(`./assets/images/border${i}.png`, 1, 1));
      this.imgStartfield.push(new Sprite(`./assets/images/starfield-${i + 1}.jpg`, 1, 1));
    }
    this.imgRakisuta = new Sprite('./assets/images/rakisuta1.png', 3, 4);
    this.imgGoal = new Sprite('./assets/images/goal.png', 1, 1);
    this.imgFloor = new Sprite('./assets/images/floor.png', 1, 1);
    this.imgObject = new Sprite('./assets/images/object.png', 1, 1);
  }

  public gameLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const f = time => {
        this.renderFrame(time);
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
  }

  public renderFrame(time: number): void {
    const elapsed = time - this.lastTime;
    // if (elapsed < 99) {
    //   return;
    // }
    this.lastTime = time;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
    this.imgRakisuta.draw(this.ctx,
      this.canv.width / 2,
      this.canv.height / 2,
      Math.floor(time % this.imgRakisuta.lengthX), 0
    );
  }

  ngAfterViewInit() {
    this.canv = this.board.nativeElement;
    this.ctx = this.canv.getContext('2d');
    this.gameLoop();
  }
}

export class Sprite {
  public img: HTMLImageElement;
  private wS: number;
  private hS: number;
  private loaded = false;

  constructor(public src: string, public lengthX: number, public lengthY: number) {
    this.img = new Image();
    this.img.addEventListener('load', () => {
      this.wS = this.img.width / lengthX;
      this.hS = this.img.height / lengthY;
      this.loaded = true;
    });
    this.img.src = src;
  }

  public draw(ctx: CanvasRenderingContext2D, x: number, y: number, sx: number, sy: number) {
    if (!this.loaded) {
      return;
    }
    if (sx > this.lengthX) {
      sx = 0;
    }
    if (sy > this.lengthY) {
      sy = 0;
    }
    ctx.drawImage(this.img, this.wS * sx, this.hS * sy, this.wS, this.hS, x, y, this.wS, this.hS);
  }
}
