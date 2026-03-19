import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PlayerService} from '../../services/player.service';
import {
  PitcherInfo,
  PitchingData,
  PitchingStatsByDate,
  PlayerBioData,
  PlayerProfileInfo
} from '../../models/player.model';
import {
  MatCard,
  MatCardLgImage,
} from '@angular/material/card';
import {CommonModule} from '@angular/common';

import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatButton} from '@angular/material/button';
import {groupBy} from 'graphql/jsutils/groupBy';
import {PitchingStatsService} from '../../services/pitching-stats.service';
import {ErrorPopupComponent} from '../error-popup/error-popup.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  templateUrl: './player-profile.component.html',
  imports: [
    MatCard,
    MatCardLgImage,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatTabGroup,
    MatTab,
    MatButton,
    ErrorPopupComponent,
    MatProgressSpinner,
  ],
  styleUrls: ['./player-profile.component.css']
})

export class PlayerProfileComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;
  playerId!: number;
  playerProfileInfo!: PlayerProfileInfo;
  displayedColumns = ["date", "k9", "ip", "whip", "k", "bb", "h", "hr"];
  pitchByDateStats: PitchingStatsByDate[] = [];
  photoAvailable = false;
  errorMessage: string | null = null;
  loading = true;

  constructor(
    private playerService: PlayerService,
    private pitcherStatsService: PitchingStatsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.playerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlayer();
  }

  backToLeaderBoard() {
    this.router.navigate(['/leaderboard']);
  }

  loadPlayer() {
    const filter = {"playerId": this.playerId};
    this.playerService.getPlayer(filter).subscribe({
      next: (playerBioData: PlayerBioData[]) => {
        if (playerBioData.length > 0) {
          this.playerProfileInfo = this.createPlayerProfileInfo(playerBioData[0]);
        } else {
          this.loadPlayerInfoFromPitches();
        }
      },
      complete: () => {
        if (this.playerProfileInfo != undefined) {
          this.getPitches();
        }
      },
      error: (error) => {
        console.error('Error loading player data for playerId: ' + this.playerId + ': ', error);
        this.showError(`Error loading player data for playerId: ${this.playerId} : ${error.message || error}`);
      }
    });
  }

  loadPlayerInfoFromPitches() {
    const filter = {"pitcherId": this.playerId};
    this.playerService.getPitcherInformation(filter).subscribe({
      next: (player: PitcherInfo) => {
        this.transformPitcherInfo(player);
      },
      complete: () => {
        this.getPitches();
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.showError(`Error loading player data for playerId: ${this.playerId} : ${error.message || error}`);
      }
    });
  }

  getPitches(): void {
    const filter = {"pitcherId": this.playerId};
    this.playerService.getPitches(filter).subscribe({
      next: (pitches) => {
        if (pitches.length > 0) {
          const dateList = this.groupPitchesByDate(pitches);
          dateList.map((date: string) => this.getPitchesByDate(date));
        }
      },
      complete: () => {
        this.dataSource = new MatTableDataSource(this.pitchByDateStats);
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pitching data:', error);
        this.showError(`Error loading pitching data for playerId: ${this.playerId} : ${error.message || error}`);
      }
    });
  }

  transformPitcherInfo(pitcherInfo: PitcherInfo): void {
    let throwingHand = 'N/A';
    if (pitcherInfo.pitcherHand) {
      throwingHand = pitcherInfo.pitcherHand === 1 ? 'L' : 'R';
    }
    const playerBioData: PlayerBioData = {
      firstName: pitcherInfo.pitcherFirstName,
      lastName: pitcherInfo.pitcherLastName,
      playerId: this.playerId,
      throwingHand: throwingHand
    };
    this.playerProfileInfo = this.createPlayerProfileInfo(playerBioData)
  }

  getPitchesByDate(date: string) {
    const filter = {"pitcherId": this.playerId, "date": date}
    this.playerService.getPitches(filter).subscribe({
      next: (pitches: PitchingData[]) => {
        this.getAllStats(pitches, date);
      },
      error: (error) => {
        console.error('Error loading pitching data:', error);
        this.showError(`Error loading pitching data for playerId: ${this.playerId}  on Date ${date}: ${error.message || error}`);
      }
    });
  }

  getAllStats(pitches: PitchingData[], date: string): void {
    const gameDate: PitchingStatsByDate = this.pitchByDateStats.filter(games => games.date === date)[0];
    gameDate.ip = this.pitcherStatsService.getIpFromGame(pitches);
    gameDate.bb = this.pitcherStatsService.getBB(pitches);
    gameDate.k = this.pitcherStatsService.getStrikeouts(pitches);
    gameDate.hr = this.pitcherStatsService.getHR(pitches);
    gameDate.h = this.pitcherStatsService.calculateHits(pitches);
    gameDate.whip = this.pitcherStatsService.calculateWHIP(gameDate);
    gameDate.k9 = this.pitcherStatsService.getK9(gameDate);
    this.pitchByDateStats = [...this.pitchByDateStats];
  }

  groupPitchesByDate(pitchingData: PitchingData[]): string[] {
    const gamesByDate = (groupBy(pitchingData, (pitch: PitchingData) => pitch.date));
    const dateList = [...gamesByDate.keys()];
    dateList.forEach(date => {
      const pitchingGameData: PitchingStatsByDate = {
        bb: 0,
        h: 0,
        hr: 0,
        ip: 0,
        k: 0,
        k9: 0,
        whip: 0,
        date: date
      };
      this.pitchByDateStats = [...this.pitchByDateStats, pitchingGameData];
    });
    this.pitchByDateStats = [...this.pitchByDateStats];
    return dateList;

  }

  createPlayerProfileInfo(playerInfo: PlayerBioData): PlayerProfileInfo {
    this.photoAvailable = !!playerInfo.imageUrl;
    return {
      playerId: this.playerId,
      fullName: playerInfo.firstName + ' ' + playerInfo.lastName,
      battingHand: playerInfo.battingHand ? playerInfo.battingHand : 'N/A',
      throwingHand: playerInfo.throwingHand ? playerInfo.throwingHand : 'N/A',
      height: playerInfo.height ? this.inchesToHeight(playerInfo.height) : 'N/A',
      weight: playerInfo.weight ? playerInfo.weight : 'N/A',
      birthDate: playerInfo.birthDate ? playerInfo.birthDate : 'N/A',
      imageUrl: playerInfo.imageUrl ? playerInfo.imageUrl : 'N/A',
      draftPickNo: !playerInfo.draftPickNo || playerInfo.draftPickNo === 0 ? 'N/A' : playerInfo.draftPickNo,
      draftRound: !playerInfo.draftRound || playerInfo.draftRound === 0 ? 'N/A' : playerInfo.draftRound,
      draftYear: !playerInfo.draftYear || playerInfo.draftYear === 0 ? 'N/A' : playerInfo.draftYear,
      givenNames: playerInfo.givenNames ? playerInfo.givenNames : 'N/A',
      firstYear: playerInfo.firstYear ? playerInfo.firstYear : 'N/A'
    };
  }

  inchesToHeight(totalInches: number): string {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  }

  showError(message: string) {
    this.errorMessage = message;
  }
}

