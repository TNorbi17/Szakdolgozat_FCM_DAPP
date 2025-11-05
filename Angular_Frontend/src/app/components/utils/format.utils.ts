import Web3 from 'web3';

export function formatEth(wei: string, web3?: Web3): string {
  if (!web3) {
    return '0';
  }
  return web3.utils.fromWei(wei, 'ether');
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('hu-HU');
}