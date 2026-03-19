import {Injectable} from '@angular/core';
import {groupBy} from 'graphql/jsutils/groupBy';
import {PitchingData, PitchingStatsByDate, PlayerWithStats} from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PitchingStatsService {
  constructor() {
  }

  getStrikeouts(pitchingData: PitchingData[]): number {
    return pitchingData.filter(e => (e.isStrikeout ?? 0) === 1).length;
  }

  getBB(pitchingData: PitchingData[]): number {
    return pitchingData.filter((e: any) => (e.isWalk ?? 0) === 1 || (e.isBb ?? 0) === 1 || (e.isIbb ?? 0) == 1).length;
  }

  getHR(pitchingData: PitchingData[]): number {
    return pitchingData.filter(e => (e.isHomerun ?? 0) === 1).length
  }

  calculateHits(events: PitchingData[]): number {
    return events.filter(e => (e.isSingle ?? 0) === 1 || (e.isDouble ?? 0) === 1 || (e.isTriple ?? 0) === 1 || (e.isHomerun ?? 0) === 1).length;
  }

  calculateWHIP(player: PlayerWithStats | PitchingStatsByDate): number {
    if (player.ip === 0 || player.ip === undefined || player.bb === undefined || player.h === undefined) {
      return 0;
    } else {
      const walksHits = player?.bb + player?.h;
      return Number((walksHits / player?.ip).toFixed(3));
    }
  }

  groupPitcherByGame(pitchingData: PitchingData[], player: PlayerWithStats): number {
    const pitcherGames = groupBy(pitchingData, (pitch: PitchingData) => `${pitch.batterTeamName.toLowerCase()}|${pitch.date}`);
    player.gamesPlayed = pitcherGames.size;
    let ipPerGame: number[] = [];
    for (const pitches of pitcherGames.values()) {
      const ip = this.getIpFromGame(pitches);
      ipPerGame = [...ipPerGame, ip];
    }
    const totalIp = ipPerGame.reduce((total: number, ip: number) => total + ip, 0);
    return Number(totalIp.toFixed(1));
  }

  getIpFromGame(pitchingData: readonly PitchingData[]): number {
    let outs = 0;
    for (const pitch of pitchingData) {
      outs += this.getOutsFromPitch(pitch);
    }
    return this.calculateIP(outs);
  }

  calculateIP(outs: number): number {
    return Math.floor(outs / 3) + (outs % 3) / 10;
  }

  getOutsFromPitch(p: PitchingData): number {
    if (p.isStrikeout === 1) {
      return 1;
    }

    if (p.isSf === true || p.isSf === 1) {
      return 1;
    }

    if (p.isSac === true || p.isSac === 1) {
      return 1;
    }

    if (p.isBip === 1) {
      const isHit =
        p.isSingle == 1 ||
        p.isDouble == 1 ||
        p.isTriple == 1 ||
        p.isHomerun == 1;
      if (!isHit) return 1;
    }
    return 0;
  }

  getK9(player: PlayerWithStats | PitchingStatsByDate): number {
    if (player.ip <= 0) {
      return 0;
    } else {
      const num: number = player?.k * 9;
      return Number((num / player.ip).toFixed(2));
    }
  }
}
