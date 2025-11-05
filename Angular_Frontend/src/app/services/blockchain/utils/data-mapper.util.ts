import {
  PlayerDetails,
  TransferOffer,
  OfferStatus
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
  static mapTransferOffer(offerData: any): TransferOffer {
    return {
      offerId: Number(offerData[0]),
      teamWalletAddress: offerData[1],
      teamName: offerData[2],
      playerWalletAddress: offerData[3],
      playerName: offerData[4],
      status: Number(offerData[5]) as OfferStatus,
      timestamp: new Date(Number(offerData[6]) * 1000),
      transferFee: offerData[7].toString(),
      contractExpires: new Date(Number(offerData[8]) * 1000),
      deciderAddress: offerData[9],
      currentTeamWalletAddress: offerData[10],
    };
  }

  static mapTransferOffers(offersData: any[]): TransferOffer[] {
    if (!Array.isArray(offersData)) {
      console.error('Expected array but received:', offersData);
      return [];
    }
    return offersData.map((offer) => this.mapTransferOffer(offer));
  }

  static dateToTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}