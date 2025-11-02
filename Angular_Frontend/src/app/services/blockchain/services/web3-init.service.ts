import { Injectable } from '@angular/core';
import Web3 from 'web3';

@Injectable({
  providedIn: 'root',
})
export class Web3InitService {
  private web3Instance: Web3 | undefined;
  private currentAccount: string | undefined;

  async initialize(): Promise<{ web3: Web3; account: string }> {
    if (window.ethereum) {
      return this.initializeWithMetaMask();
    } else if (window.web3) {
      return this.initializeWithLegacyWeb3();
    } else {
      return this.initializeWithGanache();
    }
  }

  private async initializeWithMetaMask(): Promise<{
    web3: Web3;
    account: string;
  }> {
    this.web3Instance = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await this.web3Instance.eth.getAccounts();
    this.currentAccount = accounts[0];
    console.log('Connected to MetaMask:', this.currentAccount);
    return { web3: this.web3Instance, account: this.currentAccount };
  }

  private async initializeWithLegacyWeb3(): Promise<{
    web3: Web3;
    account: string;
  }> {
    this.web3Instance = new Web3(window.web3.currentProvider);
    const accounts = await this.web3Instance.eth.getAccounts();
    this.currentAccount = accounts[0];
    console.log('Connected with legacy Web3:', this.currentAccount);
    return { web3: this.web3Instance, account: this.currentAccount };
  }

  private async initializeWithGanache(): Promise<{
    web3: Web3;
    account: string;
  }> {
    console.warn('Non-Ethereum browser detected. Connecting to Ganache...');
    this.web3Instance = new Web3(
      new Web3.providers.HttpProvider('http://127.0.0.1:8545')
    );
    const accounts = await this.web3Instance.eth.getAccounts();
    this.currentAccount = accounts[0];
    console.log('Connected to Ganache:', this.currentAccount);
    return { web3: this.web3Instance, account: this.currentAccount };
  }

  getWeb3(): Web3 | undefined {
    return this.web3Instance;
  }

  getAccount(): string | undefined {
    return this.currentAccount;
  }
}