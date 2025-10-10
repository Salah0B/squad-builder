export interface ApiPlayer {
  id: number;
  name: string;
  age: number;
  number: number;
  position: string;
  photo: string;
}

export interface SquadResponse {
  get: string;
  parameters: {
    team: string;
  };
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    players: ApiPlayer[];
  }>;
}
