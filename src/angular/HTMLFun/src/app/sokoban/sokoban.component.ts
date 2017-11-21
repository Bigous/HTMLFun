import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Levels } from '../levels.service';
import { Sprite } from './sprite';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-sokoban',
  template: `
  <div>
    <h1>Sokoban</h1>
    <h2>Level: {{ levels.CurrentLevel }} / {{ levels.LastLevel }} - Elapsed time: {{ getElapsed() }} s</h2>
    <canvas #canv width="800" height="600"></canvas>
  </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class SokobanComponent implements AfterViewInit, OnDestroy, OnInit {
  private subscriptions: Array<Subscription> = [];
  @ViewChild('canv') canvRef: ElementRef;
  public canv: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public moves = 0;
  public pushes = 0;
  public imgBorder: Array<Sprite> = [];
  public imgStarField: Array<Sprite> = [];
  public imgRakisuta: Sprite;
  public imgGoal: Sprite;
  public imgFloor: Sprite;
  public imgObject: Sprite;
  public imgList: Array<Array<Sprite>> = [];
  public lastTime = 0;

  constructor(public ngZone: NgZone, public levels: Levels) {
    for (let i = 0; i < 4; i++) {
      this.imgBorder.push(new Sprite(`./assets/images/border${i}.png`, 1, 1));
      this.imgStarField.push(new Sprite(`./assets/images/starfield-${i + 1}.jpg`, 1, 1));
    }
    this.imgRakisuta = new Sprite('./assets/images/rakisuta1.png', 3, 4);
    this.imgGoal = new Sprite('./assets/images/goal.png', 1, 1);
    this.imgFloor = new Sprite('./assets/images/floor.png', 1, 1);
    this.imgObject = new Sprite('./assets/images/object.png', 1, 1);
    this.imgList.push([this.imgStarField[0]]);
    this.imgList.push([this.imgFloor]);
    this.imgList.push([this.imgBorder[3]]);
    this.imgList.push([this.imgGoal]);
    this.imgList.push([this.imgFloor, this.imgObject]);
    this.imgList.push([this.imgFloor, this.imgRakisuta]);
    this.imgList.push([this.imgGoal, this.imgObject]);
    this.imgList.push([this.imgGoal, this.imgRakisuta]);
  }

  ngOnInit() {
    this.subscriptions.push(this.levels.onLevelFinished.subscribe(won => {
      this.onWining(won);
    }));
    this.subscriptions.push(this.levels.onManMove.subscribe(move => {
      this.onManMove(move);
    }));
    this.subscriptions.push(this.levels.onObjMove.subscribe(move => {
      this.onManMove(move);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => { s.unsubscribe(); });
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
    if (elapsed < 99) {
      return;
    }
    this.lastTime = time;
    const sx = this.canv.width / this.levels.MaxColumn;
    const sy = this.canv.height / this.levels.MaxRow;
    const s = Math.floor(Math.min(sx, sy));

    this.imgRakisuta.X = (this.imgRakisuta.X + 1) % this.imgRakisuta.lengthX;

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
    const board = this.levels.Board;
    let iRow = 0;
    for (const row of board) {
      let iCol = 0;
      for (const cell of row) {
        if (cell === 2) { // border
          let border = 3;
          if (iCol > 0 && row[iCol - 1] === 2 && iCol < row.length - 1 && row[iCol + 1] === 2) {
            border = 1;
          } else if (iCol > 0 && row[iCol - 1] === 2) {
            border = 2;
          } else if (iCol < row.length - 1 && row[iCol + 1] === 2) {
            border = 0;
          }
          this.imgList[cell] = [this.imgBorder[border]];
        }
        this.imgList[cell].forEach(sprite => {
          sprite.draw(this.ctx, iCol * s, iRow * s, s, s);
        });
        iCol++;
      }
      iRow++;
    }
  }

  ngAfterViewInit() {
    this.canv = this.canvRef.nativeElement;
    this.ctx = this.canv.getContext('2d');
    this.gameLoop();
  }

  getElapsed(): number {
    return Math.floor(this.levels.ElapsedTime / 1000);
  }

  @HostListener('body:keydown', ['$event'])
  public keys(event: KeyboardEvent): void {
    switch (event.key) {
      case 'PageUp':
        this.levels.toNextLevel();
        break;
      case 'PageDown':
        this.levels.toPriorLevel();
        break;
      case 'ArrowUp':
        this.levels.moveMan(0, -1);
        this.imgRakisuta.Y = 3;
        break;
      case 'ArrowDown':
        this.levels.moveMan(0, 1);
        this.imgRakisuta.Y = 0;
        break;
      case 'ArrowLeft':
        this.levels.moveMan(-1, 0);
        this.imgRakisuta.Y = 1;
        break;
      case 'ArrowRight':
        this.levels.moveMan(1, 0);
        this.imgRakisuta.Y = 2;
        break;
    }
  }

  onWining(won: { time: number, moves: number, pushes: number }): void {
    // TODO: Implement wining behavior.
  }

  onManMove(move: { oldPos: { x: number, y: number }, newPos: { x: number, y: number } }) {
    // TODO: Implement soft transition for man
  }

  onObjMove(move: { oldPos: { x: number, y: number }, newPos: { x: number, y: number } }) {
    // TODO: Implement soft transition for object
  }
}
