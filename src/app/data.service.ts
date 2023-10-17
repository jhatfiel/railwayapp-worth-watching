import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient) { }

    private URL = 'https://worth-watching-express.up.railway.app';

    private lengthSubject = new BehaviorSubject<number>(0);
    public length$ = this.lengthSubject.asObservable();

    findGames(year: number, week: number, filter: string, sortOrder: string, sortColumn: string, pageNumber: number, pageSize: number): Observable<any[]> {
        return this.http.get(URL + '/api/games', {
            params: new HttpParams()
              .set('year', year)
              .set('week', week)
              .set('filter', filter)
              .set('sortOrder', sortOrder)
              .set('sortColumn', sortColumn)
              .set('pageNumber', pageNumber)
              .set('pageSize', pageSize)
        }).pipe(
            map((res:any) => { this.lengthSubject.next(res['matchingGames']); return res['payload']} )
        )
    }
}
