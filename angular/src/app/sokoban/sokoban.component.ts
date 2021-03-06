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
import { IMove, IPosition, IWin, LevelsService } from './levels.service';
import { Sprite } from './sprite';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-sokoban',
  template: `
  <div class="game-screen">
    <audio #backSound autoplay loop>
      <source src="./assets/sounds/puzzle-0{{ levels.CurrentLevel % 2 + 1 }}.mp3" type="audio/mp3">
    </audio>
    <div class="game-header">
      <h1>Sokoban</h1>
      <h2>Level: {{ levels.CurrentLevel }} / {{ levels.LastLevel }} - Elapsed time: {{ getElapsed() }} s</h2>
    </div>
    <canvas #canv class="game-board" width="2048" height="1536"></canvas>
    <div class="game-footer">
      Teste
    </div>
    <audio autoplay *ngIf="finished==='win'">
      <source src="./assets/sounds/level-up/piano.wav" type="audio/wav">
    </audio>
  </div>
  `,
  styles: [
    `
  .game-screen {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .game-footer {
  }
  .game-board {
    width: 100%;
    height: 300px;
    flex: 1;
  }
  .game-footer {
  }
  `
  ],
  providers: [LevelsService],
  encapsulation: ViewEncapsulation.None
})
export class SokobanComponent implements AfterViewInit, OnDestroy, OnInit {
  private subscriptions: Array<Subscription> = [];
  private touchPosStart: IPosition;
  @ViewChild('canv') canvRef: ElementRef;
  @ViewChild('backSound') backSound: ElementRef;
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
  public finished = '';

  constructor(public ngZone: NgZone, public levels: LevelsService) {
    for (let i = 0; i < 4; i++) {
      this.imgBorder.push(new Sprite(`./assets/images/border${i}.png`, 1, 1));
      this.imgStarField.push(
        new Sprite(`./assets/images/starfield-${i + 1}.jpg`, 1, 1)
      );
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
    this.subscriptions.push(
      this.levels.onLevelFinished.subscribe(won => {
        this.onWining(won);
      })
    );
    this.subscriptions.push(
      this.levels.onManMove.subscribe(move => {
        this.onManMove(move);
      })
    );
    this.subscriptions.push(
      this.levels.onObjMove.subscribe(move => {
        this.onObjMove(move);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }

  ngAfterViewInit() {
    this.canv = this.canvRef.nativeElement;
    this.ctx = this.canv.getContext('2d');
    this.backSound.nativeElement.volume = 0.2;
    this.gameLoop();
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
    if (this.levels.isLoading) {
      return;
    }
    const elapsed = time - this.lastTime;
    if (elapsed < 99) {
      return;
    }
    this.lastTime = time;
    // console.log(this.canv.clientWidth);
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
        if (cell === 2) {
          // border
          let border = 3;
          if (
            iCol > 0 &&
            row[iCol - 1] === 2 &&
            iCol < row.length - 1 &&
            row[iCol + 1] === 2
          ) {
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

  getElapsed(): number {
    return Math.floor(this.levels.ElapsedTime / 1000);
  }

  private toNextLevel() {
    this.levels.toNextLevel();
    this.finished = '';
  }

  private toPriorLevel() {
    this.levels.toPriorLevel();
    this.finished = '';
  }

  private moveUp() {
    this.levels.moveMan(0, -1);
    this.imgRakisuta.Y = 3;
  }

  private moveDown() {
    this.levels.moveMan(0, 1);
    this.imgRakisuta.Y = 0;
  }

  private moveLeft() {
    this.levels.moveMan(-1, 0);
    this.imgRakisuta.Y = 1;
  }

  private moveRight() {
    this.levels.moveMan(1, 0);
    this.imgRakisuta.Y = 2;
  }

  @HostListener('document:keydown', ['$event'])
  public keys(event: KeyboardEvent): void {
    switch (event.key) {
      case 'PageUp':
        this.toNextLevel();
        break;
      case 'PageDown':
        this.toPriorLevel();
        break;
      case 'ArrowUp': // FF and Chrome
      case 'Up': // Edge
        this.moveUp();
        break;
      case 'ArrowDown':
      case 'Down':
        this.moveDown();
        break;
      case 'ArrowLeft':
      case 'Left':
        this.moveLeft();
        break;
      case 'ArrowRight':
      case 'Right':
        this.moveRight();
        break;
    }
  }

  @HostListener('document:touchstart', ['$event'])
  public touchStart(event: TouchEvent) {
    const tStart = event.touches[0] || event.changedTouches[0];
    this.touchPosStart = { x: tStart.pageX, y: tStart.pageY };
  }

  @HostListener('document:touchend', ['$event'])
  public touchEnd(event: TouchEvent) {
    const tEnd = event.touches[0] || event.changedTouches[0];
    const dx = this.touchPosStart.x - tEnd.pageX;
    const dy = this.touchPosStart.y - tEnd.pageY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        this.moveLeft();
      } else {
        this.moveRight();
      }
    } else {
      if (dy > 0) {
        this.moveUp();
      } else {
        this.moveDown();
      }
    }
  }

  onWining(won: IWin): void {
    // TODO: Implement wining behavior.
    console.log('Ganhou porra!', won);
    this.finished = 'win';
  }

  onManMove(move: IMove) {
    // TODO: Implement soft transition for man
  }

  onObjMove(move: IMove) {
    // TODO: Implement soft transition for object
  }
}
