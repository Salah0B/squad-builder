import { Player } from '@/types/Player';
import { ApiPlayer } from '../types/ApiPlayer';

const positionMap: { [key: string]: string } = {
  'Goalkeeper': 'GK',
  'Defender': 'DEF',
  'Midfielder': 'MID',
  'Attacker': 'FWD',
};

const defaultPositions: { [key: string]: { x: number; y: number } } = {
  'GK': { x: 50, y: 85 },
  'DEF': { x: 50, y: 70 },
  'MID': { x: 50, y: 50 },
  'FWD': { x: 50, y: 20 },
};

/**
 * Maps API player data to app Player format
 * @param apiPlayers - Players from API
 * @param maxStarters - Maximum number of starting players (default 11)
 * @returns Array of mapped players with positions
 */
export const mapApiPlayersToAppPlayers = (
  apiPlayers: ApiPlayer[],
  maxStarters: number = 11
): Player[] => {
  // Sort players by position priority and number
  const sortedPlayers = [...apiPlayers].sort((a, b) => {
    const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
    const aIndex = positionOrder.indexOf(a.position);
    const bIndex = positionOrder.indexOf(b.position);
    
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return (a.number || 999) - (b.number || 999);
  });

  // Group by position
  const playersByPosition: { [key: string]: ApiPlayer[] } = {
    'Goalkeeper': [],
    'Defender': [],
    'Midfielder': [],
    'Attacker': [],
  };

  sortedPlayers.forEach(player => {
    if (playersByPosition[player.position]) {
      playersByPosition[player.position].push(player);
    }
  });

  // Assign positions based on formation (4-3-3)
  const formationPositions = [
    { type: 'Goalkeeper', count: 1, positions: [{ x: 50, y: 89 }] },
    { 
      type: 'Defender', 
      count: 4, 
      positions: [
        { x: 18, y: 70 }, // LB
        { x: 40, y: 72 }, // CB
        { x: 60, y: 72 }, // CB
        { x: 82, y: 70 }, // RB
      ] 
    },
    { 
      type: 'Midfielder', 
      count: 3, 
      positions: [
        { x: 30, y: 45 }, // CM
        { x: 50, y: 50 }, // CM
        { x: 70, y: 45 }, // CM
      ] 
    },
    { 
      type: 'Attacker', 
      count: 3, 
      positions: [
        { x: 25, y: 25 }, // LW
        { x: 50, y: 15 }, // ST
        { x: 75, y: 25 }, // RW
      ] 
    },
  ];

  const mappedPlayers: Player[] = [];
  let starterCount = 0;

  // Assign starters
  formationPositions.forEach(({ type, count, positions }) => {
    const playersOfType = playersByPosition[type] || [];
    
    for (let i = 0; i < Math.min(count, playersOfType.length); i++) {
      const apiPlayer = playersOfType[i];
      const position = positions[i] || defaultPositions[positionMap[type]];
      
      mappedPlayers.push({
        id: apiPlayer.id,
        name: apiPlayer.name,
        position: positionMap[type] || type,
        number: apiPlayer.number || 0,
        age: apiPlayer.age || 0,
        nationality: 'UNKNOWN',
        photo: apiPlayer.photo,
        x: position.x,
        y: position.y,
        isStarter: true,
      });
      starterCount++;
    }

    // Add remaining players to bench
    for (let i = count; i < playersOfType.length; i++) {
      const apiPlayer = playersOfType[i];
      
      mappedPlayers.push({
        id: apiPlayer.id,
        name: apiPlayer.name,
        position: positionMap[type] || type,
        number: apiPlayer.number || 0,
        age: apiPlayer.age || 0,
        nationality: '',
        photo: apiPlayer.photo,
        x: 0,
        y: 0,
        isStarter: false,
      });
    }
  });

  return mappedPlayers;
};