import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { GamesDataSource } from '../dataSource/gamesDataSource';
import { MatPaginator } from '@angular/material/paginator';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Subject, merge, takeUntil, tap } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';

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
  filterOptions = ['Top 25', 
                   'Power 5', 'ACC', 'Big 12', 'Big Ten', 'Pac-12', 'SEC', 'FBS Independents',
                   'Group of 5', 'American Athletic', 'Conference USA', 'Mid-American', 'MWC', 'Sun Belt'];
  filters = new FormControl('');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dataService: DataService, private breakpointObserver: BreakpointObserver, private router: Router) { }

  ngOnInit() {
    this.dataSource = new GamesDataSource(this.dataService);
    this.dataService.year$.pipe(takeUntil(this.destroyed)).subscribe(year => this.year = year);
    this.dataService.week$.pipe(takeUntil(this.destroyed)).subscribe(week => this.week = week);
    this.breakpointObserver.observe([Breakpoints.XSmall])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        if (result.matches) this.displayedColumns = ['awayTeamName', 'homeTeamName', 'ei'];
        else this.displayedColumns = ['date', 'awayTeamName', 'homeTeamName', 'ei'];
      });
    const httpParams = new HttpParams({fromString: window.location.search.substring(1)});
    this.week = Number(httpParams.get('week') ?? '-1');
    this.dataSource.loadGames(-1, this.week, 'Top 25', 'desc', 'ei'); // default to most recent year and week
  }

  ngAfterViewInit() {
    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadGamesPage())).subscribe();
  }

  loadGamesPage() {
    this.router.navigate([], {queryParams: { week: this.week }, queryParamsHandling: 'merge'})
    // this will be fired every time the selected page changes or one of the filters changes
    this.dataSource.loadGames(this.year, this.week, 'Top 25', this.sort.direction, this.sort.active, this.paginator.pageIndex, this.paginator.pageSize);
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