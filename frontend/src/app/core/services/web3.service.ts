import { Injectable, signal } from '@angular/core';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { environment } from '@env/environment';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  provider = signal<BrowserProvider | null>(null);
  signer = signal<JsonRpcSigner | null>(null);
  account = signal<string | null>(null);
  chainId = signal<number | null>(null);
  isConnected = signal<boolean>(false);

  private contracts = new Map<string, Contract>();

  constructor() {
    this.checkConnection();
    this.setupEventListeners();
  }

  private async checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await this.connect();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }

  private setupEventListeners() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account.set(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        this.chainId.set(parseInt(chainId, 16));
        window.location.reload();
      });
    }
  }

  async connect(): Promise<string | null> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      this.provider.set(browserProvider);
      this.signer.set(signer);
      this.account.set(accounts[0]);
      this.chainId.set(Number(network.chainId));
      this.isConnected.set(true);

      return accounts[0];
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }

  disconnect() {
    this.provider.set(null);
    this.signer.set(null);
    this.account.set(null);
    this.isConnected.set(false);
    this.contracts.clear();
  }

  getContract(address: string, abi: any[]): Contract {
    const key = address.toLowerCase();
    
    if (!this.contracts.has(key)) {
      const signerValue = this.signer();
      if (!signerValue) {
        throw new Error('Wallet not connected');
      }
      
      const contract = new Contract(address, abi, signerValue);
      this.contracts.set(key, contract);
    }

    return this.contracts.get(key)!;
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Network not found in MetaMask');
      }
      throw error;
    }
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
