import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core';
import { getAddress } from '@ethersproject/address'
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import ERC20_ABI from '../abi/ERC20.json';
import IPO_ABI from '../abi/ipoABI.json';
import RouterABI from '../abi/LiquidityStakeRouter.json';
import BabyABI from '../abi/IBabyGame.json'
import BabyCardABI from '../abi/IBabyCard.json'
import CommunityNetABI from '../abi/ICommunityNet.json'


export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        let msg = address == undefined ? "undefined" : address;
        throw Error(`Invalid address parameter '${msg}'.`)
    }
    return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function useContract<T extends Contract = Contract>(
    addressOrAddressMap: string | { [chainId: number]: string } | undefined,
    ABI: any,
    withSignerIfPossible = true
): T | null {
    const { library, account, chainId } = useWeb3React()
    return useMemo(() => {
        if (!addressOrAddressMap || !ABI || !library || !chainId) return null
        let address: string | undefined
        if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
        else address = addressOrAddressMap[chainId]
        if (!address) {
            return null
        }

        try {
            return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function useERC20(tokenAddress: string) {
    if (tokenAddress == "BNB") {
        tokenAddress = process.env.REACT_APP_TOKEN_BNB + ""
    }
    return useContract(tokenAddress, ERC20_ABI);
}


export function useRouterContract(address?: string) {
    if (!address) {
        address = process.env.REACT_APP_ROUTER + "";
    }
    return useContract(address, RouterABI);
}

export function useBabyCardContract(address: string) {
    return useContract(address, BabyCardABI);
}

export function useCommunityNetContract(address: string) {
    return useContract(address, CommunityNetABI);
}
