import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NibblesComponent } from './nibbles/nibbles.component';
import { SokobanComponent } from './sokoban/sokoban.component';
import { Levels } from './levels.service';


@NgModule({
  declarations: [
    AppComponent,
    NibblesComponent,
    SokobanComponent
  ],
  imports: [
    FormsModule,
    BrowserModule
  ],
  providers: [Levels],
  bootstrap: [AppComponent]
})
export class AppModule { }
