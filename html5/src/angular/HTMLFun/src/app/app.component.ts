import { NibblesComponent } from './nibbles/nibbles.component';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('nibbles') nibbles: NibblesComponent;
  player = '';
  storageSettings = "Bigous-Nibbles-Record";

  record = {
    player: '',
    size: 5
  };

  constructor() {
    const ss = localStorage.getItem(this.storageSettings);
    if (ss) {
      this.record = JSON.parse(ss);
    }
  }

  public getTailSize(): number {
    return this.nibbles.gameData.tail;
  }

  /**
   * checkRecord
   */
  public checkRecord(): void {
    if (this.nibbles.gameData.tail > this.record.size) {
      this.record.player = this.player;
      this.record.size = this.nibbles.gameData.tail;
      localStorage.setItem(this.storageSettings, JSON.stringify(this.record));
    }
  }
}
