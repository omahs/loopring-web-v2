import {
  LanguageKeys,
  ThemeKeys,
  UpColor,
} from "@loopring-web/common-resources";
import { Currency } from "@loopring-web/loopring-sdk";
import { Layouts } from "react-grid-layout";

export enum PlatFormType {
  mobile = "mobile",
  desktop = "desktop",
  tablet = "tablet",
}

export type PlatFormKeys = keyof typeof PlatFormType;
export type CoinSource = {
  x: number;
  y: number;
  w: number;
  h: number;
  offX: number;
  offY: number;
  sourceW: number;
  sourceH: number;
};
export interface SettingsState {
  themeMode: ThemeKeys;
  language: LanguageKeys;
  platform: PlatFormKeys;
  currency: Currency;
  upColor: keyof typeof UpColor;
  slippage: number | "N";
  coinJson: {
    [key: string]: CoinSource;
  };
  hideL2Assets: boolean;
  hideL2Action: boolean;
  hideInvestToken: boolean;
  isMobile: boolean;
  hideSmallBalances: boolean;
  proLayout: Layouts;
  feeChargeOrder: string[];
  swapSecondConfirmation: boolean | undefined;
}
