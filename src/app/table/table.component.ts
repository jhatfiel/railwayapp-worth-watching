import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { GamesDataSource } from '../dataSource/gamesDataSource';
import { MatPaginator } from '@angular/material/paginator';
import { merge, tap } from 'rxjs';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  dataSource: GamesDataSource;
  displayedColumns = ['week', 'date', 'awayTeamName', 'homeTeamName', 'ei'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dataService: DataService) { }

  ngOnInit() {
    this.dataSource = new GamesDataSource(this.dataService);
    this.dataSource.loadGames(-1, -1); // default to most recent year and week
  }

  ngAfterViewInit() {
    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadGamesPage())).subscribe();
  }

  loadGamesPage() {
    // this will be fired every time the selected page changes or one of the filters changes
    this.dataSource.loadGames(-1, -1, undefined, undefined, undefined, this.paginator.pageIndex, this.paginator.pageSize);
  }

  onRowClicked(row: any) {
    console.log(`Row clicked: ${JSON.stringify(row)}`);
  }
}