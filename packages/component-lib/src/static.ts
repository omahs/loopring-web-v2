import {
  Account,
  AccountStatus,
  AmmInData,
  CoinInfo,
  CoinMap,
  DualCalcData,
  DualViewInfo,
  ForexMap,
  HeaderMenuItemInterface,
  TradeCalcData,
  WalletCoin,
  WalletMap,
} from "@loopring-web/common-resources";
import { List } from "immutable";
import { ConnectProviders } from "@loopring-web/web3-provider";
import {
  Currency,
  DUAL_TYPE,
  LuckyTokenItemForReceive,
} from "@loopring-web/loopring-sdk";
export const account: Account = {
  __timer__: -1,
  frozen: false,
  accAddress: "xxxxxxxxxxxxxxxxxxx",
  qrCodeUrl: "",
  readyState: AccountStatus.UN_CONNECT,
  accountId: -1,
  apiKey: "",
  eddsaKey: "",
  publicKey: {},
  level: "",
  keySeed: "",
  nonce: undefined,
  keyNonce: undefined,
  connectName: ConnectProviders.Unknown,
};
export const coinMap: CoinMap<CoinType, CoinInfo<CoinType>> = {
  ETH: {
    icon: "https://exchange.loopring.io/assets/images/ethereum/assets/0x9A0aBA393aac4dFbFf4333B06c407458002C6183/logo.png",
    name: "ETH",
    simpleName: "ETH",
    description: "",
    company: "ETH",
  },
  LRC: {
    icon: "https://exchange.loopring.io/assets/images/ethereum/assets/0x565aBA393aac4dFbFf4333B06c407458002C6183/logo.png",
    name: "LRC",
    simpleName: "LRC",
    description: "",
    company: "LRC",
  },
  USDT: {
    icon: "https://exchange.loopring.io/assets/images/ethereum/assets/0x565aBA393aac4dFbFf4333B06c407458002C6183/logo.png",
    name: "USDT",
    simpleName: "USDT",
    description: "",
    company: "USDT",
  },
  USDC: {
    icon: "https://exchange.loopring.io/assets/images/ethereum/assets/0x565aBA393aac4dFbFf4333B06c407458002C6183/logo.png",
    name: "USDC",
    simpleName: "USDC",
    description: "",
    company: "USDC",
  },
  LRCA: {
    icon: "red",
    name: "LRCA",
    simpleName: "LRCA",
    description: "",
    company: "LRC",
  },
  LRCB: {
    icon: "red",
    name: "LRCA",
    simpleName: "LRCB",
    description: "",
    company: "LRC",
  },
  DPR: {
    icon: "blue",
    name: "DPR",
    simpleName: "DPR",
    description: "",
    company: "DPR",
  },
  CCB: {
    icon: "blue",
    name: "CCB",
    simpleName: "CCB",
    description: "",
    company: "ETH",
  },
  OKB: {
    icon: "blue",
    name: "OKB",
    simpleName: "OKB",
    description: "",
    company: "ETH",
  },
  CRV: {
    icon: "blue",
    name: "CRV",
    simpleName: "CRV",
    description: "",
    company: "CRV",
  },
  TEST: {
    icon: "blue",
    name: "TEST",
    simpleName: "TEST",
    description: "",
    company: "TEST",
  },
  TEST2: {
    icon: "blue",
    name: "TEST3",
    simpleName: "TEST2",
    description: "",
    company: "CRV",
  },
  TEST3: {
    icon: "blue",
    name: "TEST3",
    simpleName: "TEST3",
    description: "",
    company: "TEST3",
  },
};
export const walletMap = {
  ETH: {
    belong: "ETH",
    count: 11,
  },
  LRC: {
    belong: "LRC",
    count: 11111111111111,
  },
};

export enum ButtonComponentsMap {
  Download,
  Notification,
  Theme,
  Language,
}

export const inputProps = {
  label: "Enter Payment Token",
  subLabel: "Max",
  emptyText: "Select Token",
  placeholderText: "0.00",
  coinMap: coinMap,
};

export const coinType = {
  ETH: "ETH",
  USDT: "USDT",
  USDC: "USDC",
  LRC: "LRC",
  CRV: "CRV",
  DPR: "DPR",
  CCB: "CCB",
  OKB: "OKB",
  LRCA: "LRCA",
  LRCB: "LRCB",
  TEST: "TEST",
  TEST2: "TEST2",
  TEST3: "TEST3",
};

export const tradeCalcData: TradeCalcData<CoinType> = {
  coinSell: "ETH", //name
  coinBuy: "LRC",
  BtoS: "1,11",
  StoB: "1,11",
  buyPrecision: 5,
  sellPrecision: 7,
  coinInfoMap: coinMap,
  sellCoinInfoMap: coinMap,
  buyCoinInfoMap: coinMap,
  walletMap: walletMap as WalletMap<CoinType, WalletCoin<CoinType>>,
  slippage: 0.5,
  priceImpact: "12",
  priceImpactColor: "var(--color-success)",
  minimumReceived: "1%",
  fee: "1%",
};
export const ammCalcData: AmmInData<CoinType> = {
  myCoinA: { belong: "ETH", balance: 1000, tradeValue: 0 },
  myCoinB: { belong: "LRC", balance: 1000, tradeValue: 0 },
  lpCoinA: { belong: "ETH", balance: 1000, tradeValue: 0 },
  lpCoinB: { belong: "LRC", balance: 122, tradeValue: 0 },
  lpCoin: { belong: "ETH", balance: 1000, tradeValue: 0 },
  AtoB: 50,
  BtoA: 50,
  coinInfoMap: coinMap,
  slippage: 0.5,
  fee: "0.01",
  percentage: "0.01",
};

export const layer2ItemData = List<HeaderMenuItemInterface>([
  {
    label: {
      id: "lite",
      i18nKey: "labelClassic",
      description: "Simple and easy-to-user interface",
    },
    router: { path: "" },
  },
  {
    label: {
      id: "pro",
      i18nKey: "labelAdvanced",
      description: "Full access to all trading tools",
    },
    router: { path: "" },
  },
]);
export const TOKEN_INFO = {
  tokenMap: {
    ETH: {
      type: "ETH",
      tokenId: 0,
      symbol: "ETH",
      name: "Ethereum",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      precision: 7,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "5000000000000000",
        maximum: "1000000000000000000000",
        dust: "200000000000000",
      },
      luckyTokenAmounts: {
        minimum: "50000000000000",
        maximum: "1000000000000000000000",
        dust: "50000000000000",
      },
      fastWithdrawLimit: "100000000000000000000",
      gasAmounts: {
        distribution: "85000",
        deposit: "100000",
      },
      enabled: true,
      isLpToken: false,
      tradePairs: ["LRC", "USDT", "USDC"],
    },
    LRC: {
      type: "erc20Trade",
      tokenId: 1,
      symbol: "LRC",
      name: "Loopring",
      address: "0xfc28028d9b1f6966fe74710653232972f50673be",
      decimals: 18,
      precision: 3,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "5000000000000000000",
        maximum: "5000000000000000000000000",
        dust: "5000000000000000000",
      },
      luckyTokenAmounts: {
        minimum: "50000000000000000",
        maximum: "5000000000000000000000000",
        dust: "50000000000000000",
      },
      fastWithdrawLimit: "750000000000000000000000",
      gasAmounts: {
        distribution: "101827",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: false,
      tradePairs: ["ETH"],
    },
    USDT: {
      type: "erc20Trade",
      tokenId: 2,
      symbol: "USDT",
      name: "USDT",
      address: "0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a",
      decimals: 6,
      precision: 2,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "5000000",
        maximum: "2000000000000",
        dust: "250000",
      },
      luckyTokenAmounts: {
        minimum: "50000",
        maximum: "200000000000",
        dust: "50000",
      },
      fastWithdrawLimit: "250000000000",
      gasAmounts: {
        distribution: "106233",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: false,
      tradePairs: ["ETH", "DAI"],
    },
    "LP-LRC-ETH": {
      type: "erc20Trade",
      tokenId: 4,
      symbol: "LP-LRC-ETH",
      name: "AMM-LRC-ETH",
      address: "0xfeb069407df0e1e4b365c10992f1bc16c078e34b",
      decimals: 8,
      precision: 6,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "100000000",
        maximum: "10000000000000000000",
        dust: "100000000",
      },
      luckyTokenAmounts: {
        minimum: "100000000",
        maximum: "10000000000000000000",
        dust: "100000000",
      },
      fastWithdrawLimit: "20000000000",
      gasAmounts: {
        distribution: "150000",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: true,
    },
    "LP-ETH-USDT": {
      type: "erc20Trade",
      tokenId: 7,
      symbol: "LP-ETH-USDT",
      name: "LP-ETH-USDT",
      address: "0x049a02fa9bc6bd54a2937e67d174cc69a9194f8e",
      decimals: 8,
      precision: 6,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "100000000",
        maximum: "10000000000000",
        dust: "100000000",
      },
      luckyTokenAmounts: {
        minimum: "100000000",
        maximum: "10000000000000",
        dust: "100000000",
      },
      fastWithdrawLimit: "20000000000",
      gasAmounts: {
        distribution: "150000",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: true,
    },
    DAI: {
      type: "erc20Trade",
      tokenId: 6,
      symbol: "DAI",
      name: "dai",
      address: "0xcd2c81b322a5b530b5fa3432e57da6803b0317f7",
      decimals: 18,
      precision: 6,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "10000000000000000000",
        maximum: "100000000000000000000000",
        dust: "10000000000000000",
      },
      luckyTokenAmounts: {
        minimum: "10000000000000000000",
        maximum: "100000000000000000000000",
        dust: "10000000000000000000",
      },
      fastWithdrawLimit: "10000000000000000000000",
      gasAmounts: {
        distribution: "150000",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: false,
      tradePairs: ["USDT"],
    },
    USDC: {
      type: "USDC",
      tokenId: 8,
      symbol: "USDC",
      name: "USDC",
      address: "0x47525e6a5def04c9a56706e93f54cc70c2e8f165",
      decimals: 6,
      precision: 6,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "1000",
        maximum: "10000000000000000000",
        dust: "100",
      },
      luckyTokenAmounts: {
        minimum: "1000000",
        maximum: "10000000000",
        dust: "1000000",
      },
      fastWithdrawLimit: "20000000000000000000",
      gasAmounts: {
        distribution: "150000",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: false,
      tradePairs: ["ETH"],
    },
    "LP-USDC-ETH": {
      type: "LP-USDC-ETH",
      tokenId: 9,
      symbol: "LP-USDC-ETH",
      name: "LP-USDC-ETH",
      address: "0xf37cf4ced77b985708d591acc6bfd08586ab3409",
      decimals: 8,
      precision: 7,
      precisionForOrder: 3,
      orderAmounts: {
        minimum: "100000",
        maximum: "1000000000000000000000000000000000000000",
        dust: "10000",
      },
      luckyTokenAmounts: {
        minimum: "1000000000000000",
        maximum: "10000000000000000000",
        dust: "1000000000000000",
      },
      fastWithdrawLimit: "20000000000000000000",
      gasAmounts: {
        distribution: "150000",
        deposit: "200000",
      },
      enabled: true,
      isLpToken: true,
    },
  },
  idIndex: {
    "0": "ETH",
    "1": "LRC",
    "2": "USDT",
    "4": "LP-LRC-ETH",
    "6": "DAI",
    "7": "LP-ETH-USDT",
    "8": "USDC",
    "9": "LP-USDC-ETH",
  },
  marketMap: {
    "LRC-ETH": {
      baseTokenId: 1,
      enabled: true,
      market: "LRC-ETH",
      orderbookAggLevels: 5,
      precisionForPrice: 6,
      quoteTokenId: 0,
      status: 3,
      isSwapEnabled: true,
      createdAt: 1617967800000,
    },
    "ETH-USDT": {
      baseTokenId: 0,
      enabled: true,
      market: "ETH-USDT",
      orderbookAggLevels: 3,
      precisionForPrice: 3,
      quoteTokenId: 2,
      status: 3,
      isSwapEnabled: true,
      createdAt: 1617972300000,
    },
    "DAI-USDT": {
      baseTokenId: 6,
      enabled: true,
      market: "DAI-USDT",
      orderbookAggLevels: 2,
      precisionForPrice: 4,
      quoteTokenId: 2,
      status: 3,
      isSwapEnabled: true,
      createdAt: 0,
    },
    "USDC-ETH": {
      baseTokenId: 8,
      enabled: true,
      market: "USDC-ETH",
      orderbookAggLevels: 3,
      precisionForPrice: 3,
      quoteTokenId: 0,
      status: 3,
      isSwapEnabled: true,
      createdAt: 1636974420000,
    },
  },
};

export type CoinType = typeof coinType;
export const DUALVIEWINFO: DualViewInfo = {
  apy: "57.49%",
  settleRatio: "0.1656",
  term: "a day",
  productId: "LRC-USDT-220907-0.36-P-USDT",
  expireTime: 1662537600000,
  currentPrice: {
    quote: "USDC",
    base: "LRC",
    precisionForPrice: 3,
    currentPrice: 0.4482078,
  },
  __raw__: {
    info: {
      productId: "LRC-USDT-220907-0.36-P-USDT",
      base: "LRC",
      quote: "USDT",
      currency: "USDT",
      createTime: 1662336421000,
      expireTime: 1662537600000,
      strike: "0.36",
      expired: false,
      dualType: "DUAL_CURRENCY" as DUAL_TYPE,
      ratio: 0.46,
      profit: "",
    },
    index: {
      index: "0.36206575",
      base: "LRC",
      quote: "USDT",
      indexTime: 1662446738246,
    },
    rule: {
      base: "LRC",
      quote: "USDT",
      currency: "USDT",
      basePrecision: 8,
      currencyPrecision: 8,
      baseMin: "20",
      currencyMin: "50",
      baseMax: "200000",
      currencyMax: "200000",
      granulation: 10,
      baseProfitStep: 4,
    },
  },
  strike: "0.36",
  isUp: false,
  sellSymbol: "USDC",
  buySymbol: "LRC",
};
export const DUALCALCDATA: DualCalcData<DualViewInfo> = {
  balance: {},
  coinSell: {
    balance: 100,
    belong: "USDC",
    tradeValue: undefined,
  },
  quota: "1000",
  feeTokenSymbol: "LRC",
  feeVol: undefined,
  greaterEarnTokenSymbol: "",
  greaterEarnVol: "",
  lessEarnTokenSymbol: "",
  lessEarnVol: "",
  maxFeeBips: 0,
  maxSellAmount: "",
  miniSellVol: "",
  sellToken: TOKEN_INFO.tokenMap["USDC"],
  sellVol: "",
  dualViewInfo: DUALVIEWINFO,
};

export const FOREXMAP: ForexMap<Currency> = {
  [Currency.usd]: 1,
  [Currency.cny]: 6.7,
} as any;
export const REDPACKETMOCK: LuckyTokenItemForReceive = {
  hash: "",
  sender: {
    accountId: 10008,
    address: "0xxxxxxxx",
    ens: "",
  },
  champion: {
    accountId: 10008,
    address: "0xxxxxxxx",
    ens: "",
    amount: 100000,
  },
  tokenId: 1,
  tokenAmount: {
    totalCount: 10,
    remainCount: 0,
    totalAmount: "100000000000000000",
    remainAmount: "0",
  } as any,
  type: {
    partition: 0,
    scope: 0,
    mode: 0,
  },
  //@ts-ignore
  status: "RANDOM",
  validSince: 1662669827,
  validUntil: 1662769827,
  info: {
    memo: "Best wishes Best wishes Best  wishes wishes Best wishes Best wishes Best wishes Best wishes Best wishes",
    signer: "",
    signerUrl: "",
    logoUrl: "",
  },
  templateNo: 0,
  createdAt: 1662769827,
};
