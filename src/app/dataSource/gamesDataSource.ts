import { DataService } from './../data.service';
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Game } from "../model/game";
import { BehaviorSubject, Observable, of, catchError, finalize } from "rxjs";

export class GamesDataSource implements DataSource<Game> {
    private gamesSubject = new BehaviorSubject<Game[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private dataService: DataService) {}

    connect(collectionViewer: CollectionViewer): Observable<Game[]> {
        return this.gamesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.gamesSubject.complete();
        this.loadingSubject.complete();
    }

    loadGames(year: number, week: number, filter = '', sortOrder = 'desc', sortColumn = 'ei', pageNumber = 0, pageSize = 10) {
        this.loadingSubject.next(true);

        this.dataService.findGames(year, week, filter, sortOrder, sortColumn, pageNumber, pageSize)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(games => this.gamesSubject.next(games));
    }
}