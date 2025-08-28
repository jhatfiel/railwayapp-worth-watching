import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient) { }

    private URL = process.env['NX_API_URL'];

    private lengthSubject = new BehaviorSubject<number>(0);
    public length$ = this.lengthSubject.asObservable();

    private yearSubject = new BehaviorSubject<number>(1);
    public year$ = this.yearSubject.asObservable();

    private weekSubject = new BehaviorSubject<number>(1);
    public week$ = this.weekSubject.asObservable();

    private maxWeekSubject = new BehaviorSubject<number>(1);
    public maxWeek$ = this.maxWeekSubject.asObservable();

    private maxCompletedWeekSubject = new BehaviorSubject<number>(1);
    public maxCompletedWeek$ = this.maxCompletedWeekSubject.asObservable();

    private lastUpdatedSubject = new BehaviorSubject<Date>(new Date());
    public lastUpdated$ = this.lastUpdatedSubject.asObservable();

    findGames(year: number, week: number, filter: string, sortOrder: string, sortColumn: string, pageNumber: number, pageSize: number): Observable<any[]> {
        return this.http.get(this.URL + '/api/games', {
            params: new HttpParams()
              .set('year', year)
              .set('week', week)
              .set('filter', filter)
              .set('sortOrder', sortOrder)
              .set('sortColumn', sortColumn)
              .set('pageNumber', pageNumber)
              .set('pageSize', pageSize)
        }).pipe(
            map((res:any) => {
                this.lengthSubject.next(res['matchingGames']);
                this.maxWeekSubject.next(res['maxWeek']);
                this.maxCompletedWeekSubject.next(res['maxCompletedWeek']);
                this.yearSubject.next(res['year']);
                this.weekSubject.next(res['week']);
                this.lastUpdatedSubject.next(new Date(res['lastUpdated']));
                return res['payload']}
            )
        )
    }
}
