# Squad Builder

This is a React Native application for managing football team lineups with an interactive visual field. Drag players to reposition them, view detailed player information, and select your best starting squad.

## 🚀 Run the app

1. Install dependencies

   ```bash
   npm install
   ```

2. Add your api key on config/api.config.ts

3. Start the app

   ```bash
   npx expo start
   ```

## 🌟 Features

- Drag & Drop Players: Touch and drag any player to reposition them on the field (implemented)
- Player Information: Tap any player to view detailed stats (implemented)
- Player Substitutions: Substitute starting players with bench players (implemented)
- Interactive Football Field: Customizable visual representation of a football field (not implemented)

## 📝 Player Object Properties


| Property      | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| `id`          | number  | Unique player identifier from API                |
| `name`        | string  | Player's full name                               |
| `position`    | string  | Playing position (GK, DEF, MID, FWD)             |
| `number`      | number  | Jersey number                                    |
| `age`         | number  | Player's age                                     |
| `nationality` | string  | Player's nationality                             |
| `photo`       | string  | URL to player's photo                            |
| `x`           | number  | Horizontal position on field (0-100, percentage) |
| `y`           | number  | Vertical position on field (0-100, percentage)   |
| `isStarter`   | boolean | Whether the player is in the starting XI         |