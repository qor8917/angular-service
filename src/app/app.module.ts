import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';

@NgModule({
  //앵귤러 cli를 쓰면 자동으로 사용할 컴포넌트 선언 됨,컴포넌트는 NgModule 어디 한곳이라도 선언 되어야 쓸 수 있음.
  declarations: [AppComponent, HeroesComponent, HeroDetailComponent],
  //사용할 모듈
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
