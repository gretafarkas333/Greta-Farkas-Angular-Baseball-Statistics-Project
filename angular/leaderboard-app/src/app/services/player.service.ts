import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

const GET_PLAYER = gql`
  query GetPlayer($filter: PlayerFilter) {
    allPlayers(filter:  $filter) {
      playerId
      firstName
      lastName
      imageUrl
      battingHand
      throwingHand
      height
      weight
      birthDate
      draftPickNo
      draftRound
      givenNames
      draftYear
      firstYear
    }
  }
`;

const GET_PITCHERS = gql`
  query GetAllPitcher {
    allPitches {
      pitcherId
      pitcherTeamName
      pitcherFirstName
      pitcherLastName
    }
  }
`;

const GET_PLAYERS = gql`
  query GetPlayers {
    allPlayers {
      playerId
      firstName
      lastName
    }
  }
`;


const GET_PITCHER_INFO = gql`
  query GetPitcherInfo($filter: PitchFilter) {
    allPitches(filter: $filter) {
      pitcherLastName
      pitcherFirstName
      pitcherHand
      pitcherId
    }
  }
`;


const GET_PITCHES = gql`
  query GetPitches($filter: PitchFilter) {
    allPitches(filter: $filter) {
      pitcherId
      batterTeamName
      isStrikeout
      isWalk
      isBb
      isIbb
      isSac
      isHbp
      isHomerun
      isSingle
      isDouble
      isTriple
      isBip
      isSf
      pitcherTeamName
      date
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(private apollo: Apollo) {
  }

  getPlayers(): Observable<any> {
    return this.apollo.query({
      query: GET_PLAYERS
    }).pipe(
      map((result: any) => result.data.allPlayers)
    );
  }

  getPlayer(filter: any): Observable<any> {
    return this.apollo.query({
      query: GET_PLAYER,
      variables: {filter}
    }).pipe(
      map((result: any) => result.data.allPlayers)
    );
  }

  getPitches(filter: any): Observable<any> {
    return this.apollo.query({
      query: GET_PITCHES,
      variables: {filter}
    }).pipe(
      map((result: any) => result.data.allPitches)
    );
  }

  getAllPitchers(): Observable<any> {
    return this.apollo.query({
      query: GET_PITCHERS
    }).pipe(map((result: any) => result.data.allPitches));
  }

  getPitcherInformation(filter: any): Observable<any> {
    return this.apollo.query({
      query: GET_PITCHER_INFO,
      variables: {filter}
    }).pipe(
      map((result: any) => result.data.allPitches[0])
    );
  }
}
