import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.css'],
})
export class HeroSearchComponent implements OnInit {
  constructor(private heroService: HeroService) {}
  /* heroes 배열은 null 이여도 괜찮고 옵저버블로서 Hero interface를 갖춘 배열을 의미 */
  heroes$!: Observable<Hero[]>;
  /* hot옵저버블을 내보낼건데 스트링타입 임 */
  private searchTerms = new Subject<string>();
  search(term: string): void {
    /* 검색어를 계속 방출 중 */
    this.searchTerms.next(term);
  }
  ngOnInit(): void {
    /* 방출을 컨트롤 0.3초 딜레이 주고 방출 값이 같을경우 무시하고 변경되면 새로운 옵저버불 생성 */
    this.heroes$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.heroService.searchHeroes(term))
    );
  }
}
