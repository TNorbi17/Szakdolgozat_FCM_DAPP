export class ValidationUtil {
  static validateContract(contract: any): void {
    if (!contract) {
      throw new Error('Contract not loaded');
    }
  }

  static validateAccount(account: any): void {
    if (!account) {
      throw new Error('Account not loaded');
    }
  }

  static validateWeb3(web3: any): void {
    if (!web3) {
      throw new Error('Web3 not loaded');
    }
  }

  static validateAll(contract: any, account: any, web3: any): void {
    this.validateContract(contract);
    this.validateAccount(account);
    this.validateWeb3(web3);
  }
}