import {
  PlayerDetails,
} from '../models';
export class DataMapper {
  static mapPlayer(playerData: any): PlayerDetails {
    return {
      id: Number(playerData[0]),
      name: playerData[1],
      position: Number(playerData[2]),
      dateOfBirth: new Date(Number(playerData[3]) * 1000),
      walletAddress: playerData[4],
      email: playerData[5],
      teamName: playerData[6],
      registrationTimestamp: new Date(Number(playerData[7]) * 1000),
      isFreeAgent: playerData[8],
      contractExpires: new Date(
        playerData[9] ? Number(playerData[9]) * 1000 : 0
      ),
    };
  }

  static mapPlayers(playersData: any[]): PlayerDetails[] {
    if (!Array.isArray(playersData)) {
      console.error('Expected array but received:', playersData);
      return [];
    }
    return playersData.map((player) => this.mapPlayer(player));
  }
}