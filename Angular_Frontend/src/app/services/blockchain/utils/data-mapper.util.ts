import {
  PlayerDetails,
  TransferOffer,
  Bonus,
  Penalty,
  OfferStatus,
  PaymentHistory,
  PaymentStatistics
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

  static mapBonus(bonusData: any): Bonus {
    return {
      bonusId: Number(bonusData[0]),
      teamWalletAddress: bonusData[1],
      teamName: bonusData[2],
      playerWalletAddress: bonusData[3],
      amount: bonusData[4].toString(),
      message: bonusData[5],
      timestamp: Number(bonusData[6]),
    };
  }

  static mapBonuses(bonusesData: any[]): Bonus[] {
    if (!Array.isArray(bonusesData)) {
      console.error('Expected array but received:', bonusesData);
      return [];
    }
    return bonusesData.map((bonus) => this.mapBonus(bonus));
  }

  static mapPenalty(penaltyData: any): Penalty {
    return {
      penaltyId: Number(penaltyData[0]),
      teamWalletAddress: penaltyData[1],
      teamName: penaltyData[2],
      playerWalletAddress: penaltyData[3],
      amount: penaltyData[4].toString(),
      message: penaltyData[5],
      timestamp: Number(penaltyData[6]),
      paid: penaltyData[7],
    };
  }

  static mapPenalties(penaltiesData: any[]): Penalty[] {
    if (!Array.isArray(penaltiesData)) {
      console.error('Expected array but received:', penaltiesData);
      return [];
    }
    return penaltiesData.map((penalty) => this.mapPenalty(penalty));
  }

  static getUnpaidPenalties(penalties: Penalty[]): Penalty[] {
    return penalties.filter(penalty => !penalty.paid);
  }

  static calculateUnpaidAmount(penalties: Penalty[]): string {
    const unpaidPenalties = this.getUnpaidPenalties(penalties);
    const totalAmount = unpaidPenalties.reduce((sum, penalty) => {
      return sum + parseFloat(penalty.amount);
    }, 0);
    
    return totalAmount.toString();
  }

  static hasUnpaidPenalties(penalties: Penalty[]): boolean {
    return penalties.some(penalty => !penalty.paid);
  }

  static mapPaymentHistory(paymentData: any, web3?: any): PaymentHistory {
  

  if (!paymentData || typeof paymentData !== 'object') {
    throw new Error('Invalid payment data structure - not an object');
  }


  const convertBigInt = (value: any): string => {
    return typeof value === 'bigint' ? value.toString() : value?.toString() || '0';
  };

  const convertBigIntToNumber = (value: any): number => {
    return typeof value === 'bigint' ? Number(value) : Number(value) || 0;
  };


  return {
    id: convertBigIntToNumber(paymentData[0] || paymentData.id),
    teamAddress: paymentData[1] || paymentData.teamAddress || '',
    teamName: paymentData[2] || paymentData.teamName || '',
    playerAddress: paymentData[3] || paymentData.playerAddress || '',
    amountWei: convertBigInt(paymentData[4] || paymentData.amount),
    amountEth: web3 && (paymentData[4] || paymentData.amount) ? 
      parseFloat(web3.utils.fromWei(convertBigInt(paymentData[4] || paymentData.amount), 'ether')) : 0,
    paymentTimestamp: paymentData[5] || paymentData.timestamp ? 
      new Date(convertBigIntToNumber(paymentData[5] || paymentData.timestamp) * 1000) : new Date(),
    paymentType: paymentData[6] || paymentData.paymentType || 'unknown'
  };
}

  static mapPaymentHistories(paymentsData: any[], web3?: any): PaymentHistory[] {
    if (!Array.isArray(paymentsData)) {
      console.error('Expected array but received:', paymentsData);
      return [];
    }

    const validPayments: PaymentHistory[] = [];
    
    paymentsData.forEach((payment, index) => {
      try {
        const mappedPayment = this.mapPaymentHistory(payment, web3);
        validPayments.push(mappedPayment);
      } catch (error) {
        console.warn(`Skipping invalid payment at index ${index}:`, error);
      }
    });

    return validPayments;
  }

  
  static filterPaymentsByType(payments: PaymentHistory[], type: string): PaymentHistory[] {
    return payments.filter(payment => payment.paymentType === type);
  }

  static getWeeklyPaymentsOnly(payments: PaymentHistory[]): PaymentHistory[] {
    return this.filterPaymentsByType(payments, 'weekly');
  }

  static getPaymentsByTeam(payments: PaymentHistory[], teamName: string): PaymentHistory[] {
    return payments.filter(payment => payment.teamName === teamName);
  }

  static getPaymentsInDateRange(
    payments: PaymentHistory[], 
    startDate: Date, 
    endDate: Date
  ): PaymentHistory[] {
    return payments.filter(payment => {
      const paymentDate = payment.paymentTimestamp;
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }

 
  static calculateTotalEarnings(payments: PaymentHistory[]): number {
    return payments.reduce((total, payment) => total + payment.amountEth, 0);
  }

  static calculateAveragePayment(payments: PaymentHistory[]): number {
    if (payments.length === 0) return 0;
    return this.calculateTotalEarnings(payments) / payments.length;
  }

  static getLastPaymentDate(payments: PaymentHistory[]): Date | null {
    if (payments.length === 0) return null;
    
    const sortedPayments = [...payments].sort(
      (a, b) => b.paymentTimestamp.getTime() - a.paymentTimestamp.getTime()
    );
    
    return sortedPayments[0].paymentTimestamp;
  }


  static sortPayments(
    payments: PaymentHistory[], 
    sortBy: 'date' | 'amount' | 'team' | 'type', 
    direction: 'asc' | 'desc' = 'desc'
  ): PaymentHistory[] {
    const sorted = [...payments].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.paymentTimestamp.getTime() - b.paymentTimestamp.getTime();
          break;
        case 'amount':
          comparison = a.amountEth - b.amountEth;
          break;
        case 'team':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
        case 'type':
          comparison = a.paymentType.localeCompare(b.paymentType);
          break;
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }

 
}