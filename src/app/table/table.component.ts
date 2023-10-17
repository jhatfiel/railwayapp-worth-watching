import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { GamesDataSource } from '../dataSource/gamesDataSource';
import { MatPaginator } from '@angular/material/paginator';
import { tap } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  dataSource: GamesDataSource;
  displayedColumns = ['week', 'date', 'awayTeamName', 'homeTeamName', 'ei'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public dataService: DataService) { }

  ngOnInit() {
    this.dataSource = new GamesDataSource(this.dataService);
    this.dataSource.loadGames(-1, -1); // default to most recent year and week
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(tap(() => this.loadGamesPage())).subscribe();
  }

  loadGamesPage() {
    this.dataSource.loadGames(-1, -1, undefined, undefined, undefined, this.paginator.pageIndex, this.paginator.pageSize);
  }

  onRowClicked(row: any) {
    console.log(`Row clicked: ${JSON.stringify(row)}`);
  }
}