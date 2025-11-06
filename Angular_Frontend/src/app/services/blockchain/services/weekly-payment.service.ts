import { Injectable } from '@angular/core';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { WeeklyPayment } from '../models';
import { ValidationUtil } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class WeeklyPaymentService {
  async setWeeklyPayment(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerWallet: string,
    amountEth: string
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const valueWei = web3.utils.toWei(amountEth, 'ether');

    return contract.methods['setWeeklyPayment'](playerWallet, valueWei).send({
      from: account,
    });
  }

  async executeWeeklyPayment(
    contract: Contract<AbiItem[]>,
    account: string,
    web3: Web3,
    playerWallet: string,
    weeklyPayment: WeeklyPayment
  ): Promise<any> {
    ValidationUtil.validateAll(contract, account, web3);

    const valueWei = web3.utils.toWei(weeklyPayment.amountEth, 'ether');

    try {
      await contract.methods['executeWeeklyPayment'](playerWallet).call({
        from: account,
        value: valueWei,
      });

      return await contract.methods['executeWeeklyPayment'](playerWallet).send({
        from: account,
        value: valueWei,
      });
    } catch (error: any) {
      
      let errorMessage = 'Ismeretlen hiba történt';

      if (error.message) {
        errorMessage = error.message;
      }

      if (errorMessage.includes('VM Exception while processing transaction: revert')) {
        alert("Jelenleg nem esedékes a játékos heti fizetésének kezdeményezése! A legutolsó fizetése óta nem telt el egy hét!");
      } 
    }
  }

  async stopWeeklyPayment(
    contract: Contract<AbiItem[]>,
    account: string,
    playerWallet: string
  ): Promise<any> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateAccount(account);

    return contract.methods['stopWeeklyPayment'](playerWallet).send({
      from: account,
    });
  }

  async getWeeklyPaymentForPlayer(
    contract: Contract<AbiItem[]>,
    web3: Web3,
    playerWallet: string
  ): Promise<WeeklyPayment> {
    ValidationUtil.validateContract(contract);
    ValidationUtil.validateWeb3(web3);

    const wp: any = await contract.methods['getWeeklyPaymentForPlayer'](
      playerWallet
    ).call();

    return {
      id: Number(wp.id ?? 0),
      teamAddress: wp.teamAddress ?? '',
      playerAddress: wp.playerAddress ?? '',
      amountEth: web3.utils.fromWei(wp.amountWei ?? '0', 'ether'),
      active: wp.active ?? false,
      lastPaymentTimestamp: wp.lastPaymentTimestamp
        ? new Date(Number(wp.lastPaymentTimestamp) * 1000)
        : null,
      lastPaidAmount:
        wp.lastPaidAmount && wp.lastPaidAmount !== '0'
          ? web3.utils.fromWei(wp.lastPaidAmount, 'ether')
          : '0',
    };
  }
}