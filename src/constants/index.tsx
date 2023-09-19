import { InjectedConnector } from '@web3-react/injected-connector'
export const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 10, 11, 42, 15, 97, 56, 15, 54321],
})

export const MAX_UNIT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export const Day = 24 * 60 * 60 * 1000;
export const Days = 8;

export const enum SUPPORT_CHAINIDS {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
    DEV = 15,
    BSC_TEST = 97,
    BSC_MAINNET = 56,
    LOCAL = 15,
    ink = 54321
};