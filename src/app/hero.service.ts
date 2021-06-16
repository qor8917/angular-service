import { Injectable } from '@angular/core';
import { Hero } from 'hero';
import { HEROES } from 'mock-heroes';
import { Observable, of } from 'rxjs';

//Injectable 데코레이터는 클래스가 의존서 주입 시스템에 포함되는 클래스라고 선언하는 구문이다. 그러므로 HeroService 클래스는 의존성으로 주입될 수있으며 이 클래스도 의존성을 주입 받을 수 있다.
@Injectable({
  providedIn: 'root',
})
export class HeroService {
  constructor() {}
  /* 메소드 선언 */
  /* 타입선언할때는 함수의 리턴되는 값의 타입을 적어주면 된다. 여기에서는 Hero interface를 기반으로 하는 배열 */
  /* getHeroes(): Hero[] {
    return HEROES;
  } */

  getHeroes(): Observable<Hero[]> {
    /* HEROES 배열데이터를 옵저버블로 만들기 */
    /* 옵저버블의 오퍼레이터 of 는  */
    const heroes = of(HEROES);
    return heroes;
    console.log(heroes);
  }
}
