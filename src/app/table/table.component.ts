import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { GamesDataSource } from '../dataSource/gamesDataSource';
import { MatPaginator } from '@angular/material/paginator';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Subject, merge, takeUntil, tap } from 'rxjs';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  week = 1;
  year = 1;
  destroyed = new Subject<void>();
  dataSource: GamesDataSource;
  displayedColumns = ['date', 'awayTeamName', 'homeTeamName', 'ei'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dataService: DataService, private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {
    this.dataSource = new GamesDataSource(this.dataService);
    this.dataSource.loadGames(-1, -1, 'top25', 'desc', 'ei'); // default to most recent year and week
    this.dataService.year$.pipe(takeUntil(this.destroyed)).subscribe(year => this.year = year);
    this.dataService.week$.pipe(takeUntil(this.destroyed)).subscribe(week => this.week = week);
    this.breakpointObserver.observe([Breakpoints.XSmall])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        if (result.matches) this.displayedColumns = ['awayTeamName', 'homeTeamName', 'ei'];
        else this.displayedColumns = ['date', 'awayTeamName', 'homeTeamName', 'ei'];
      });
  }

  ngAfterViewInit() {
    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadGamesPage())).subscribe();
  }

  loadGamesPage() {
    // this will be fired every time the selected page changes or one of the filters changes
    this.dataSource.loadGames(this.year, this.week, 'top25', this.sort.direction, this.sort.active, this.paginator.pageIndex, this.paginator.pageSize);
  }

  prevWeek() { this.week--; this.paginator.pageIndex = 0; this.loadGamesPage(); }
  nextWeek() { this.week++; this.paginator.pageIndex = 0; this.loadGamesPage(); }

  onRowClicked(row: any) {
    console.log(`Row clicked: ${JSON.stringify(row)}`);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}