import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PlayerService} from '../../services/player.service';
import {PitcherInfo, PitchingData, PlayerWithStats, PlayerInfo} from '../../models/player.model'
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable, MatTableDataSource
} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {NgIf} from '@angular/common';
import {PitchingStatsService} from '../../services/pitching-stats.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ErrorPopupComponent} from '../error-popup/error-popup.component';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  standalone: true,
  imports: [
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatHeaderRowDef,
    NgIf,
    MatProgressSpinner,
    ErrorPopupComponent
  ],
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;
  players: PlayerWithStats[] = [];
  loading = true;
  displayedColumns = ["rank", "firstName", "lastName", "team", "gamesPlayed", "k9", "ip", "whip", "k", "bb", "h", "hr"]
  pendingPitchers = 0;
  errorMessage: string | null = null;
  idSet = new Set<number>();

  constructor(
    private playerService: PlayerService,
    private router: Router,
    private pitchingStatService: PitchingStatsService
  ) {
  }

  ngOnInit() {
    this.loadFromAllPitchers();
  }

  loadFromAllPitchers(): void {
    this.playerService.getAllPitchers().subscribe({
      next: (players) => {
        players.map(((playerData: PitcherInfo) => this.createPlayerWithStatsModel(playerData)));
      },
      complete: () => {
        this.loadFromAllPlayers();
      },
      error: (error) => {
        console.error('Error loading from all pitchers:', error);
        this.showError("Error loading from all pitchers:" + error);
      }
    });
  }

  loadFromAllPlayers(): any {
    this.playerService.getPlayers().subscribe({
      next: (players: PlayerInfo[]) => {
        players.map(((playerData: PlayerInfo) => this.transformPlayerInfo(playerData)));
      },
      complete: () => {
        this.pendingPitchers = this.players.length;
        this.players.forEach(player => {
          this.getPitchesForPlayer(player);
        });
      },
      error: (error) => {
        console.error('Error loading from all players:', error);
        this.showError("Error loading from all players:" + error);
        this.loading = false;
      }
    });
  }

  transformPlayerInfo(playerInfo: PlayerInfo): void {
    if (!this.idSet.has(playerInfo.playerId)) {
      const pitcherInfo: PitcherInfo = {
        pitcherId: playerInfo.playerId,
        pitcherFirstName: playerInfo.firstName,
        pitcherLastName: playerInfo.lastName
      };
      this.createPlayerWithStatsModel(pitcherInfo);
    }
  }

  getPitchesForPlayer(player: PlayerWithStats) {
    const filter = {"pitcherId": player.id}
    this.playerService.getPitches(filter).subscribe({
      next: (pitches: PitchingData[]) => {
        player.bb = this.pitchingStatService.getBB(pitches);
        player.k = this.pitchingStatService.getStrikeouts(pitches);
        player.hr = this.pitchingStatService.getHR(pitches);
        player.h = this.pitchingStatService.calculateHits(pitches);
        player.ip = this.pitchingStatService.groupPitcherByGame(pitches, player);
        player.whip = this.pitchingStatService.calculateWHIP(player);
        player.k9 = this.pitchingStatService.getK9(player);
      },
      complete: () => {
        this.pendingPitchers--;
        if (this.pendingPitchers === 0) {
          this.sortByK9();
        }
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.showError("Error loading pitching data:" + error.message);
      }
    });
  }

  sortByK9(): void {
    const sorted = [...this.players].sort((a, b) => b.k9 - a.k9);
    this.dataSource = new MatTableDataSource(sorted);

    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'k9') {
        return this.ipToDecimal(item.k9);
      }
      return item[property];
    };

    this.dataSource.sort = this.sort;
    this.loading = false;
  }

  ipToDecimal(kip: number): number {
    const whole = Math.floor(kip);
    const outs = Math.round((kip - whole) * 10);
    return whole + outs / 3;
  }

  createPlayerWithStatsModel(playerData: PitcherInfo): void {
    if (!this.idSet.has(playerData.pitcherId)) {
      const id = playerData.pitcherId ? playerData.pitcherId : 0;
      const firstName = playerData.pitcherFirstName ? playerData.pitcherFirstName : 'N/A';
      const lastName = playerData.pitcherLastName ? playerData.pitcherLastName : 'N/A';
      const team = playerData.pitcherTeamName ? playerData.pitcherTeamName : 'N/A';
      this.idSet.add(id);
      const pitcher: PlayerWithStats = {
        bb: 0,
        h: 0,
        hr: 0,
        ip: 0,
        k: 0,
        k9: 0,
        whip: 0,
        id: id,
        firstName: firstName,
        lastName: lastName,
        team: team
      };
      this.players = [...this.players, pitcher];
    }
  }

  viewPlayer(playerId: number) {
    this.router.navigate(['/player', playerId]);
  }

  showError(message: string) {
    this.errorMessage = message;
  }
}
