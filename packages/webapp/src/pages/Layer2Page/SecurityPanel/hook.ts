import {
  AccountStatus,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { useAccount } from "@loopring-web/core";
import React from "react";

import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import { store } from "@loopring-web/core";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "@loopring-web/core";

import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";

import Web3 from "web3";

export function useResetAccount() {
  const { setShowResetAccount } = useOpenModals();

  const resetKeypair = React.useCallback(() => {
    setShowResetAccount({ isShow: true });
  }, [setShowResetAccount]);

  return {
    resetKeypair,
  };
}

export function useExportAccountInfo() {
  const { account } = useAccount();

  const { setShowExportAccount, setShowAccount } = useOpenModals();

  const exportAccInfo = React.useCallback(() => {
    if (account.readyState !== AccountStatus.ACTIVATED) {
      return undefined;
    }

    return {
      address: account.accAddress,
      accountId: account.accountId,
      level: account.level,
      nonce: account.nonce,
      apiKey: account.apiKey,
      publicX: account.eddsaKey.formatedPx,
      publicY: account.eddsaKey.formatedPy,
      privateKey: account.eddsaKey.sk,
    };
  }, [account]);

  const exportAccount = React.useCallback(async () => {
    const _account = store.getState().account;
    const connectName = (ConnectProvidersSignMap[_account.connectName] ??
      _account.connectName) as unknown as sdk.ConnectorNames;
    const { exchangeInfo, chainId } = store.getState().system;
    const { isMobile } = store.getState().settings;
    let walletType, account;
    if (
      exchangeInfo &&
      LoopringAPI.userAPI &&
      LoopringAPI.walletAPI &&
      LoopringAPI.exchangeAPI
    ) {
      try {
        setShowAccount({
          isShow: true,
          step: AccountStep.ExportAccount_Approve_WaitForAuth,
        });
        const walletTypePromise: Promise<{ walletType: any }> =
          window.ethereum &&
          _account.connectName === sdk.ConnectorNames.MetaMask &&
          isMobile
            ? Promise.resolve({ walletType: undefined })
            : LoopringAPI.walletAPI.getWalletType({
                wallet: _account.accAddress,
              });
        [{ accInfo: account }, { walletType }] = await Promise.all([
          LoopringAPI.exchangeAPI.getAccount({
            owner: _account.accAddress,
          }),
          walletTypePromise,
        ])
          .then((response) => {
            if ((response[0] as sdk.RESULT_INFO)?.code) {
              throw response[0];
            }
            return response;
          })
          .catch((error) => {
            throw error;
          });

        myLog("exportAccount account:", account);

        try {
          const eddsaKey = await sdk.generateKeyPair({
            web3: connectProvides.usedWeb3 as unknown as Web3,
            address: account.owner,
            chainId: chainId as any,
            keySeed:
              account.keySeed && _account.keySeed !== ""
                ? _account.keySeed
                : sdk.GlobalAPI.KEY_MESSAGE.replace(
                    "${exchangeAddress}",
                    exchangeInfo.exchangeAddress
                  ).replace("${nonce}", (account.nonce - 1).toString()),
            walletType: connectName,
            accountId: account.accountId,
          });
          if (eddsaKey.sk === _account.eddsaKey.sk) {
            myLog("try to sendAccountSigned....");
            setShowAccount({ isShow: false });
            setShowExportAccount({ isShow: true });
          } else {
            throw {
              code: UIERROR_CODE.ERROR_PRIVATE_KEY,
              msg: "Wrong private key",
              message: "Wrong private key",
            };
          }
        } catch (error) {
          throw error;
        }
      } catch (e: any) {
        myLog("ExportAccount e:", e);
        const error = LoopringAPI.exchangeAPI.genErr(e);
        const errType = sdk.checkErrorInfo(error, true);
        switch (errType) {
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.ExportAccount_User_Denied,
            });
            return;
          default:
            break;
        }
        setShowAccount({
          isShow: true,
          step: AccountStep.ExportAccount_Failed,
          error: {
            code: UIERROR_CODE.UNKNOWN,
            msg: e?.message,
            ...e,
          },
        });
      }
    }
  }, [setShowAccount, setShowExportAccount]);

  return {
    exportAccInfo,
    exportAccount,
  };
}
