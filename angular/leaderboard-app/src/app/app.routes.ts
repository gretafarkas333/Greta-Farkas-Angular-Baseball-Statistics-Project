import { RouterModule, Routes } from '@angular/router';



export const routes: Routes = [
  { path: '', redirectTo: '/leaderboard', pathMatch: 'full' },
  {
    path: 'leaderboard', loadComponent: () => import('./components/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: 'player/:id', loadComponent: () => import('./components/player-profile/player-profile.component').then(m => m.PlayerProfileComponent)
  }
];


