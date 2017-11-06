import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-nibbles',
  template: `<canvas #tela width="400" height="400"></canvas>`,
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class NibblesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tela') canv: ElementRef;

  game = {
    px: 10,
    py: 10,
    gs: 20,
    tc: 20,
    xv: 0,
    yv: 0,
    ax: 15,
    ay: 15,
    tail: 5,
    trail: [],
    ctx: undefined,
    stop: false
  };

  constructor( public ngZone: NgZone) {}

  ngAfterViewInit() {
    console.log('---< mounted >---');
    const canv = this.canv.nativeElement;
    const ctx = this.game.ctx = canv.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);
    const _self = this;
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(_self.drawFrame.bind(_self));
    });
    document.addEventListener('keydown', this.keys.bind(this));
  }

  public ngOnDestroy(): void {
    this.game.stop = true;
    console.log('---< beforeDestroy >---');
  }

  public drawFrame(): void {
    if (this.game.stop) {
      return;
    }
    const canv = this.canv.nativeElement;
    const ctx = this.game.ctx;
    this.game.px += this.game.xv;
    this.game.py += this.game.yv;
    if (this.game.px < 0) {
      this.game.px = this.game.tc - 1;
    }
    if (this.game.px > this.game.tc - 1) {
      this.game.px = 0;
    }
    if (this.game.py < 0) {
      this.game.py = this.game.tc - 1;
    }
    if (this.game.py > this.game.tc - 1) {
      this.game.py = 0;
    }
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = 'lime';
    for (let i = 0; i < this.game.trail.length; i++) {
      ctx.fillRect(this.game.trail[i].x * this.game.gs, this.game.trail[i].y * this.game.gs, this.game.gs - 2, this.game.gs - 2);
      // se bateu
      if (this.game.trail[i].x == this.game.px && this.game.trail[i].y == this.game.py) {
        this.game.tail = 5;
      }
    }

    this.game.trail.push({ x: this.game.px, y: this.game.py });
    while (this.game.trail.length > this.game.tail) {
      this.game.trail.shift();
    }

    if (this.game.ax == this.game.px && this.game.ay == this.game.py) {
      this.game.tail++;
      this.game.ax = Math.floor(Math.random() * this.game.tc);
      this.game.ay = Math.floor(Math.random() * this.game.tc);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(this.game.ax * this.game.gs, this.game.ay * this.game.gs, this.game.gs - 2, this.game.gs - 2);

    const _self = this;
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(_self.drawFrame.bind(_self));
    });
  }

  public keys(evnt: KeyboardEvent): void {
    switch (evnt.keyCode) {
      case 37:
        this.game.xv = -1;
        this.game.yv = 0;
        break;
      case 38:
        this.game.xv = 0;
        this.game.yv = -1;
        break;
      case 39:
        this.game.xv = 1;
        this.game.yv = 0;
        break;
      case 40:
        this.game.xv = 0;
        this.game.yv = 1;
        break;
    }
  }
}
