import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';
@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroesUrl = 'api/heroes';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  /* 비동기통신으로 서버에서 히어로즈 데이터 불러오기  */
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      /* 탭 오퍼레이터로 로그를 찍고 에러가 발생하면 빈 배열을 옵저버블로 방출 */
      tap((_) => this.log(`fetched heroes`)),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    );
  }
  /* 비동기통신으로 서버에서 id에 해당하는 히어로 데이터 불러오기 */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap((_) => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }
  /* 히어로 데이터를 수정하고 싶다. */
  updateHero(hero: Hero): Observable<Hero> {
    return this.http.put<Hero>(this.heroesUrl, hero, this.httpOptions);
  }
  /* 히어로 데이터 생성 */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /* 히어로 삭제 */
  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap((_) => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }
  /* 검색 */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      /* 입력된 내용이 없으면 빈 배열을 반환 */
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}.`).pipe(
      tap((x) =>
        x.length
          ? this.log(`found heroes matching "${term}"`)
          : this.log(`no heroes matching "${term}"`)
      ),
      catchError(this.handleError<Hero[]>('searchedHeroes', []))
    );
  }
  /* 로그를 찍히게 하고싶다. */
  private log(message: string) {
    this.messageService.add(`HeroService : ${message}`);
  }
  /* 에러 핸들링 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`{operation} filed: ${error.message}`);
      return of(result as T);
    };
  }
}
