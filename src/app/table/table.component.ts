import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { GamesDataSource } from '../dataSource/gamesDataSource';
import { MatPaginator } from '@angular/material/paginator';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Subject, merge, pairwise, takeUntil, tap, startWith } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Game } from '../model/game';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  pageSize = 10;
  week = 1;
  year = 1;
  destroyed = new Subject<void>();
  dataSource: GamesDataSource;
  displayedColumns = ['date', 'awayTeamName', 'homeTeamName', 'ei'];
  p5 = ['ACC', 'Big 12', 'Big Ten', 'Pac-12', 'SEC'];
  g5 = ['American Athletic', 'Conference USA', 'Mid-American', 'MWC', 'Sun Belt'];
  conferenceOptions = ['Top 25', 
                   'Power 5', ...this.p5,
                   'FBS Independents',
                   'Group of 5', ...this.g5];
  confFC = new FormControl<string[]>([]);

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
    this.confFC.setValue((httpParams.get('filter') ?? 'Top 25').split(','));
    this.pageSize = Number(httpParams.get('pageSize') ?? 10);

    this.dataSource.loadGames(-1, this.week, this.confFC.value?.join(','), 'desc', 'ei', 0, this.pageSize); // default to most recent year and week

    this.confFC.valueChanges.pipe(startWith(this.confFC.value), pairwise()).subscribe(([was, now]) => {
      const p5WasMissing = this.p5.some(c => was?.indexOf(c) === -1);
      const g5WasMissing = this.g5.some(c => was?.indexOf(c) === -1);
      const p5NowMissing = this.p5.some(c => now?.indexOf(c) === -1);
      const g5NowMissing = this.g5.some(c => now?.indexOf(c) === -1);
      
      let madeChanges = false;
      if (was?.indexOf('Power 5') === -1 && now?.indexOf('Power 5') !== -1) {
      // checking Power 5 or Group of 5 checks all associated conferences
        this.p5.forEach(c => { if (now?.indexOf(c) === -1) { madeChanges = true; now.push(c); }});
      } else if (was?.indexOf('Group of 5') === -1 && now?.indexOf('Group of 5') !== -1) {
        this.g5.forEach(c => { if (now?.indexOf(c) === -1) { madeChanges = true; now.push(c); }});
      // Checking all of Power 5 or Group of 5 checks that grouping
      } else if (now?.indexOf('Power 5') === -1 && p5WasMissing && !p5NowMissing) {
        madeChanges = true;
        now.push('Power 5');
      } else if (now?.indexOf('Group of 5') === -1 && g5WasMissing && !g5NowMissing) {
        madeChanges = true;
        now.push('Group of 5');
      } else if (was?.indexOf('Power 5') !== -1 && now?.indexOf('Power 5') === -1 && !p5NowMissing) {
      // unchecking Power 5 or Group of 5 unchecks all associated conferences
        madeChanges = true;
        now = now.filter(c => this.p5.indexOf(c) === -1);
      } else if (was?.indexOf('Group of 5') !== -1 && now?.indexOf('Group of 5') === -1 && !g5NowMissing) {
        madeChanges = true;
        now = now.filter(c => this.g5.indexOf(c) === -1);
      } else if (now && !p5WasMissing && p5NowMissing) {
      // unchecking a single conference clears the higher level power 5/group of 5 selection
        madeChanges = true;
        now = now.filter(c => c !== 'Power 5');
      } else if (now && !g5WasMissing && g5NowMissing) {
        madeChanges = true;
        now = now.filter(c => c !== 'Group of 5');
      }

      if (now && now.length === 0) {
        madeChanges = true;
        if (was?.indexOf('Top 25') === -1) now = ['Top 25'];
        else now = ['Power 5', ...this.p5];
        this.confFC.setValue(now);
      } else if (madeChanges) this.confFC.setValue(now, { emitEvent: false });

      this.paginator.pageIndex = 0;
      this.loadGamesPage();
    })
  }

  ngAfterViewInit() {
    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadGamesPage())).subscribe();
  }

  loadGamesPage() {
    this.router.navigate([], {queryParams: { week: this.week, filter: this.confFC.value?.join(','), pageSize: this.paginator.pageSize }, queryParamsHandling: 'merge'})
    // this will be fired every time the selected page changes or one of the filters changes
    this.dataSource.loadGames(this.year, this.week, this.confFC.value?.join(','), this.sort.direction, this.sort.active, this.paginator.pageIndex, this.paginator.pageSize);
  }

  formatSelectedConferences() {
    return this.confFC.value?.filter(c => ['Power 5', 'Group of 5'].indexOf(c) === -1).join(', ') 
  }

  formatWatchabilityIndex(game: Game) {
    if (game.completed) return Number(game.excitement_index).toFixed(2).toString();
    else {
      return '~' + (10 - (Math.abs((game.home_win_probability??0.5)-0.5)*20)).toFixed(2).toString();
    }
  }

  formatSpread(game: Game) {
    if ((game.spread??0) > 0) return `${game.away_team} by ${game.spread}`
    else return `${game.home_team} by ${Math.abs(game.spread??0)}`
  }

  prevWeek() { this.week--; this.paginator.pageIndex = 0; this.loadGamesPage(); }
  nextWeek() { this.week++; this.paginator.pageIndex = 0; this.loadGamesPage(); }

  onRowClicked(row: any) {
    if (row.completed) {
      window.open(`https://collegefootballdata.com/wp/${row.id}`, '_blank');
    } else {
      window.open('https://www.cbssports.com/college-football/scoreboard/', '_blank');
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}