import { API_CONFIG, getApiKey } from "@/config/api.config";
import { SquadResponse } from "@/types/ApiPlayer";

const API_HOST = API_CONFIG.API_HOST;
const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Fetch team squad from API-Football
 * @param teamId - The team ID (e.g., "33" for Manchester United)
 * @returns Promise with squad data
 */
export const fetchTeamSquad = async (teamId: string): Promise<SquadResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': getApiKey(),
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: SquadResponse = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`API returned errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching team squad:', error);
    throw error;
  }
};