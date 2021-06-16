import { Component, OnInit } from '@angular/core';
import { Hero } from 'hero';
import { HeroService } from '../hero.service';

//데코레이터 함수(메타데이터 지정)
@Component({
  //컴포넌트의 css 엘리먼트 셀렉터( DOM 트리에서 이 컴포넌트를 표현하는 이름)
  selector: 'app-heroes',
  //컴포넌트 템플릿 파일의 위치
  templateUrl: './heroes.component.html',
  //컴포넌트 css 스타일 파일의 위치
  styleUrls: ['./heroes.component.css'],
})
export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];
  //처음 로드 되었을때는 아무도 클릭안한 상태이기 떄문에 selectedHero속성에 ?를 붙여 옵셔널한 속성이라고 선언한다.
  selectedHero?: Hero;
  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
  /* 의존성 주입 */
  constructor(private heroService: HeroService) {}

  //컴포넌트를 생성한 직후에 ngOnInit 호출함 컴포넌트를 초기화 하는 로직은 이 메소드에 작성
  ngOnInit(): void {
    this.getHeroes();
  }
  // 동기 방식으로 할당 된다.
  /* getHeroes(): void {
    this.heroes = this.heroService.getHeroes();
  } */
  /* HEROES 옵저버블 구독하기 */
  /* 옵저버블을 구독하면 옵저버블의 데이터를 옵저버가 데이터를 받을 수있다. */
  /* observable.subscribe(observer) */
  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes));
  }
  /*  */
}
