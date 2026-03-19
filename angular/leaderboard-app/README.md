# Angular Setup Instructions

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Angular CLI (will be installed in step 1)

## Quick Start

1. **Install Angular CLI globally** (if not already installed):
   ```bash
   npm install -g @angular/cli
   ```

2. **Create a new Angular application** (Angular 17+ uses standalone components by default):
   ```bash
   # From the DeveloperTest root directory
   cd angular
   ng new leaderboard-app --routing --style=css --standalone
   cd leaderboard-app
   ```

   When prompted:
   - Would you like to add Angular routing? **Yes**
   - Which stylesheet format? **CSS** (or your preference)

3. **Verify your setup**:
   ```bash
   ng serve
   ```
   
   Open `http://localhost:4200` in your browser. You should see a "Hello World" welcome message confirming your setup is working correctly. Once you see this, stop the server (Ctrl+C) and proceed to the next step.

4. **Install Apollo Client for GraphQL**:
   ```bash
   npm install apollo-angular @apollo/client graphql
   ```

5. **Configure Apollo Client**:

   Update `src/app/app.config.ts` (Angular 17+ uses standalone components):
   ```typescript
   import { ApplicationConfig, importProvidersFrom } from '@angular/core';
   import { provideRouter } from '@angular/router';
   import { provideHttpClient } from '@angular/common/http';
   import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
   import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
   import { HttpLink } from 'apollo-angular/http';
   import { routes } from './app.routes';

   function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
     return {
       link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
       cache: new InMemoryCache(),
     };
   }

   export const appConfig: ApplicationConfig = {
     providers: [
       provideRouter(routes),
       provideHttpClient(),
       importProvidersFrom(ApolloModule),
       {
         provide: APOLLO_OPTIONS,
         useFactory: createApollo,
         deps: [HttpLink],
       },
     ],
   };
   ```

6. **Update the initial app component** to show a welcome message:

   Replace the content of `src/app/app.component.ts`:
   ```typescript
   import { Component } from '@angular/core';
   import { RouterOutlet } from '@angular/router';

   @Component({
     selector: 'app-root',
     standalone: true,
     imports: [RouterOutlet],
     template: `
       <div class="welcome-container">
         <h1>Hello World!</h1>
         <p>🎉 Congratulations! Your Angular application is set up correctly.</p>
         <p>You're ready to start building the leaderboard application.</p>
         <p>Check the README for next steps.</p>
       </div>
     `,
     styles: [`
       .welcome-container {
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         min-height: 100vh;
         text-align: center;
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
       }
       h1 {
         color: #1976d2;
         font-size: 3rem;
         margin-bottom: 1rem;
       }
       p {
         font-size: 1.2rem;
         color: #666;
         margin: 0.5rem 0;
       }
     `]
   })
   export class AppComponent {
     title = 'leaderboard-app';
   }
   ```

7. **Start the development server**:
   ```bash
   ng serve
   ```

   The application will be available at `http://localhost:4200`. You should see the "Hello World" welcome message.

## Project Structure Recommendations

```
src/
├── app/
│   ├── components/
│   │   ├── leaderboard/
│   │   │   ├── leaderboard.component.ts
│   │   │   ├── leaderboard.component.html
│   │   │   └── leaderboard.component.css
│   │   └── player-profile/
│   │       ├── player-profile.component.ts
│   │       ├── player-profile.component.html
│   │       └── player-profile.component.css
│   ├── services/
│   │   └── player.service.ts
│   ├── models/
│   │   └── player.model.ts
│   ├── app-routing.module.ts (or app.routes.ts for standalone)
│   └── app.component.ts
```

## Example Service

Create `src/app/services/player.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const GET_PLAYERS = gql`
  query GetPlayers {
    players {
      playerId
      firstName
      lastName
      imageUrl
      battingHand
      throwingHand
      height
      weight
    }
  }
`;

const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      playerId
      firstName
      lastName
      imageUrl
      battingHand
      throwingHand
      height
      weight
      birthDate
    }
  }
`;

const GET_PITCHES = gql`
  query GetPitches($filter: JSON) {
    pitches(filter: $filter) {
      pitchId
      isHit
      isHomerun
      result
      exitSpeed
      batterId
      pitcherId
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(private apollo: Apollo) {}

  getPlayers(): Observable<any> {
    return this.apollo.query({
      query: GET_PLAYERS
    }).pipe(
      map((result: any) => result.data.players)
    );
  }

  getPlayer(id: string): Observable<any> {
    return this.apollo.query({
      query: GET_PLAYER,
      variables: { id }
    }).pipe(
      map((result: any) => result.data.player)
    );
  }

  getPitches(filter: any): Observable<any> {
    return this.apollo.query({
      query: GET_PITCHES,
      variables: { filter }
    }).pipe(
      map((result: any) => result.data.pitches)
    );
  }
}
```

## Example Component

Create `src/app/components/leaderboard/leaderboard.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  players: any[] = [];
  loading = true;

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers() {
    this.playerService.getPlayers().subscribe({
      next: (players) => {
        // Calculate statistics and sort for leaderboard
        this.players = players;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.loading = false;
      }
    });
  }

  viewPlayer(playerId: number) {
    this.router.navigate(['/player', playerId]);
  }
}
```

## Next Steps After Setup

Once you see the "Hello World" message, you're ready to start building! Here's what to do next:

1. **Set up routing** - Update `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/leaderboard', pathMatch: 'full' },
  { path: 'leaderboard', loadComponent: () => import('./components/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent) },
  { path: 'player/:id', loadComponent: () => import('./components/player-profile/player-profile.component').then(m => m.PlayerProfileComponent) }
];
```

## Styling Tips

- Consider using Angular Material: `ng add @angular/material`
- Or use a CSS framework like Bootstrap or Tailwind
- Make sure your design is responsive

## Building the Assessment

Now that you've confirmed your setup works with the "Hello World" message, you can start building:

1. Replace the welcome message with your leaderboard component
2. Set up routing between leaderboard and player profile
3. Create GraphQL queries to fetch player and pitch data
4. Calculate leaderboard statistics from pitch data
5. Implement the player profile page
6. Add styling and responsive design
7. Handle loading and error states

Good luck!

