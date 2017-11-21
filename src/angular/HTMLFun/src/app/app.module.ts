import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NibblesComponent } from './nibbles/nibbles.component';
import { SokobanComponent } from './sokoban/sokoban.component';


@NgModule({
  declarations: [
    AppComponent,
    NibblesComponent,
    SokobanComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
