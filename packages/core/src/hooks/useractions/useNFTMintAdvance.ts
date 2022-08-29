import React from "react";

import {
  AccountStep,
  NFTMintAdvanceProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  ErrorType,
  TradeNFT,
  myLog,
  UIERROR_CODE,
  EmptyValueTag,
  MINT_LIMIT,
  SagaStatus,
  Explorer,
  TOAST_TIME,
  IPFS_LOOPRING_SITE,
} from "@loopring-web/common-resources";

import * as sdk from "@loopring-web/loopring-sdk";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import {
  useTokenMap,
  useAccount,
  useSystem,
  useModalData,
  useWalletLayer2NFT,
  store,
} from "../../stores";
import { useBtnStatus } from "../common";
import { LoopringAPI } from "../../api_wrapper";
import { checkErrorInfo } from "./utils";
import { isAccActivated } from "./checkAccStatus";
import {
  useWalletLayer2Socket,
  walletLayer2Service,
  useChargeFees,
} from "../../services";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useTranslation } from "react-i18next";
import { getTimestampDaysLater } from "../../utils";
import { ActionResult, ActionResultCode, DAYS } from "../../defs";
const CID = require("cids");

export const useNFTMintAdvance = <T extends TradeNFT<I>, I>() => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const { nftMintAdvanceValue, updateNFTMintAdvanceData } = useModalData();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const { t } = useTranslation("common");
  const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const [isAvailableId, setIsAvailableId] = React.useState(false);
  const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false);
  const { setShowAccount, setShowNFTMintAdvance } = useOpenModals();
  const [tokenAddress, setTokenAddress] =
    React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const account = store.getState().account;
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      accountStatus === SagaStatus.UNSET
    ) {
      setTokenAddress(() => {
        if (account.accAddress && LoopringAPI.nftAPI) {
          return (
            LoopringAPI.nftAPI?.computeNFTAddress({
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            }).tokenAddress || undefined
          );
        } else {
          return undefined;
        }
      });
    }
  }, [accountStatus]);

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  } = useChargeFees({
    tokenAddress: tokenAddress?.toLowerCase(),
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: ({ fee }) => {
      updateNFTMintAdvanceData({
        ...nftMintAdvanceValue,
        fee,
      });
    },
  });
  const checkAvailable = ({
    nftMintAdvanceValue,
    isFeeNotEnough,
    isAvailableId,
  }: {
    nftMintAdvanceValue: TradeNFT<any>;
    isFeeNotEnough: any;
    isAvailableId: boolean;
  }) => {
    return (
      nftMintAdvanceValue.royaltyPercentage !== undefined &&
      Number.isInteger(nftMintAdvanceValue.royaltyPercentage / 1) &&
      nftMintAdvanceValue.royaltyPercentage >= 0 &&
      nftMintAdvanceValue.royaltyPercentage <= 10 &&
      nftMintAdvanceValue &&
      tokenAddress &&
      nftMintAdvanceValue.tradeValue &&
      Number(nftMintAdvanceValue.tradeValue) > 0 &&
      Number(nftMintAdvanceValue.tradeValue) <= MINT_LIMIT &&
      (nftMintAdvanceValue.image !== undefined ||
        nftMintAdvanceValue.name !== undefined) &&
      nftMintAdvanceValue.nftId &&
      nftMintAdvanceValue.fee &&
      nftMintAdvanceValue.fee.belong &&
      nftMintAdvanceValue.fee.feeRaw &&
      !isFeeNotEnough.isFeeNotEnough &&
      isAvailableId
    );
  };

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        checkAvailable({ nftMintAdvanceValue, isFeeNotEnough, isAvailableId })
      ) {
        enableBtn();
        return;
      }
      if (!isAvailableId) {
        setLabelAndParams("labelNFTMintWrongCIDBtn", {});
      } else if (
        (!nftMintAdvanceValue.image && !nftMintAdvanceValue.name) ||
        !(
          nftMintAdvanceValue.royaltyPercentage !== undefined &&
          Number.isInteger(nftMintAdvanceValue.royaltyPercentage / 1) &&
          nftMintAdvanceValue.royaltyPercentage >= 0 &&
          nftMintAdvanceValue.royaltyPercentage <= 10
        )
      ) {
        setLabelAndParams("labelNFTMintNoMetaBtn", {});
      }
      disableBtn();
      myLog("try to disable nftMintAdvance btn!");
    },
    [
      isAvailableId,
      isFeeNotEnough,
      resetBtnInfo,
      nftMintAdvanceValue,
      tokenAddress,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  useWalletLayer2Socket({});

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    isFeeNotEnough.isFeeNotEnough,
    isAvailableId,
    nftMintAdvanceValue,
    feeInfo,
  ]);

  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough(true);
    updateNFTMintAdvanceData({
      ...nftMintAdvanceValue,
      tradeValue: 0,
      nftIdView: "",
      image: undefined,
      name: "",
      nftId: undefined,
      description: "",
      tokenAddress,
      fee: feeInfo,
    });
  }, [checkFeeIsEnough, tokenAddress, updateNFTMintAdvanceData]);
  const processRequest = React.useCallback(
    async (request: sdk.NFTMintRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          setLastRequest({ ...request });

          const response = await LoopringAPI.userAPI?.submitNFTMint(
            {
              request,
              web3: connectProvides.usedWeb3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
              walletType: (ConnectProvidersSignMap[connectName] ??
                connectName) as unknown as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            }
          );

          myLog("submitNFTMintAdvance:", response);

          if (isAccActivated()) {
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              // Withdraw failed
              const code = checkErrorInfo(
                response as sdk.RESULT_INFO,
                isNotHardwareWallet
              );
              if (code === sdk.ConnectorError.USER_DENIED) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_Denied,
                  info: {
                    symbol: nftMintAdvanceValue.name,
                    value: nftMintAdvanceValue.tradeValue,
                    isAdvanceMint: true,
                  },
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_First_Method_Denied,
                  info: {
                    symbol: nftMintAdvanceValue.name,
                    value: nftMintAdvanceValue.tradeValue,
                    isAdvanceMint: true,
                  },
                });
              } else {
                if (
                  [102024, 102025, 114001, 114002].includes(
                    (response as sdk.RESULT_INFO)?.code || 0
                  )
                ) {
                  checkFeeIsEnough(true);
                }

                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_Failed,
                  info: {
                    symbol: nftMintAdvanceValue.name,
                    value: nftMintAdvanceValue.tradeValue,
                  },
                  error: response as sdk.RESULT_INFO,
                });
                resetDefault();
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_In_Progress,
                info: {
                  symbol: nftMintAdvanceValue.name,
                  value: nftMintAdvanceValue.tradeValue,
                },
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_Success,
                info: {
                  symbol: nftMintAdvanceValue.name,
                  value: nftMintAdvanceValue.tradeValue,
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-nftMintAdvance`,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              updateWalletLayer2NFT({ page });
              resetDefault();
              // checkFeeIsEnough();
            }
          } else {
            resetDefault();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Denied,
              info: {
                symbol: nftMintAdvanceValue.name,
                value: nftMintAdvanceValue.tradeValue,
                isAdvanceMint: true,
              },
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_First_Method_Denied,
              info: {
                symbol: nftMintAdvanceValue.name,
                value: nftMintAdvanceValue.tradeValue,
                isAdvanceMint: true,
              },
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Failed,
              info: {
                symbol: nftMintAdvanceValue.name,
                value: nftMintAdvanceValue.tradeValue,
              },
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
            });
          }
        }
      }
    },
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      nftMintAdvanceValue.name,
      nftMintAdvanceValue.tradeValue,
      resetDefault,
      checkFeeIsEnough,
      updateWalletLayer2NFT,
      page,
      updateHW,
    ]
  );

  const handleOnNFTDataChange = React.useCallback(
    async (data: T) => {
      let shouldUpdate = {};

      if (
        data.nftIdView &&
        LoopringAPI.nftAPI &&
        nftMintAdvanceValue.nftIdView !== data.nftIdView
      ) {
        setIsNFTCheckLoading(true);
        let nftId: string = "";
        try {
          let cid: string;
          if (/^Qm[a-zA-Z0-9]{44}$/.test(data.nftIdView)) {
            cid = data.nftIdView;
          } else {
            cid = new CID(data.nftIdView).toV0();
          }
          nftId = LoopringAPI.nftAPI.ipfsCid0ToNftID(cid);
          shouldUpdate = {
            nftId,
            // nftIdView: data.nftIdView,
            ...shouldUpdate,
          };
          setIsAvailableId(true);
        } catch (error: any) {
          myLog("handleOnNFTDataChange -> data.nftId", error);
          setIsAvailableId(false);
          shouldUpdate = {
            nftId: "",
            // nftIdView:'',
          };
        }

        if (nftId && nftId !== "") {
          try {
            const value = await fetch(
              IPFS_LOOPRING_SITE + `${data.nftIdView}`
            ).then((response) => response.json());

            if (value) {
              shouldUpdate = {
                nftId: nftId,
                name: value.name ?? t("labelUnknown"),
                image: value.image,
                description: value.description ?? EmptyValueTag,
                balance: MINT_LIMIT,
                royaltyPercentage: value.royalty_percentage,
                ...shouldUpdate,
              };
            } else {
              shouldUpdate = {
                nftId: nftId,
                name: undefined,
                image: undefined,
                description: undefined,
                balance: undefined,
                ...shouldUpdate,
              };
            }
          } catch (error: any) {
            shouldUpdate = {
              nftId: nftId,
              name: undefined,
              image: undefined,
              description: undefined,
              balance: undefined,
              ...shouldUpdate,
            };
            myLog(error);
          }
        }
      } else if (data.nftIdView) {
      } else if (!data.nftIdView) {
        setIsAvailableId(false);
        shouldUpdate = {
          nftId: "",
          name: undefined,
          image: undefined,
          description: undefined,
          balance: undefined,
        };
      }
      setIsNFTCheckLoading(false);
      updateNFTMintAdvanceData({
        ...nftMintAdvanceValue,
        ...data,
        ...shouldUpdate,
      });
    },
    [nftMintAdvanceValue, t, updateNFTMintAdvanceData]
  );

  const onNFTMintAdvanceClick = React.useCallback(
    async (_nftMintAdvanceValue, isFirstTime: boolean = true) => {
      let result: ActionResult = { code: ActionResultCode.NoError };
      // pattern="^Qm[a-zA-Z0-9]{44}$"
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        exchangeInfo &&
        account.readyState === AccountStatus.ACTIVATED &&
        nftMintAdvanceValue &&
        tokenAddress &&
        checkAvailable({ nftMintAdvanceValue, isFeeNotEnough, isAvailableId })
      ) {
        setShowNFTMintAdvance({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
          info: {
            symbol: nftMintAdvanceValue.name,
            value: nftMintAdvanceValue.tradeValue,
          },
        });
        try {
          const { accountId, accAddress, apiKey } = account;
          const fee = sdk.toBig(
            nftMintAdvanceValue?.fee?.feeRaw ??
              nftMintAdvanceValue?.fee?.__raw__?.feeRaw ??
              0
          );
          const feeToken = tokenMap[nftMintAdvanceValue?.fee?.belong ?? ""];
          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId,
              sellTokenId: feeToken.tokenId,
            },
            apiKey
          );
          const req: sdk.NFTMintRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            minterId: accountId,
            minterAddress: accAddress,
            toAccountId: accountId,
            toAddress: accAddress,
            nftType: 0,
            tokenAddress,
            nftId: nftMintAdvanceValue.nftId ?? "",
            amount: nftMintAdvanceValue.tradeValue?.toString() ?? "",
            validUntil: getTimestampDaysLater(DAYS),
            storageId: storageId?.offchainId,
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            },
            royaltyPercentage: Math.floor(
              nftMintAdvanceValue?.royaltyPercentage ?? 0
            ),
            forceToMint: false,
          };
          myLog("onNFTMintAdvanceClick req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            info: {
              symbol: nftMintAdvanceValue.name,
              value: nftMintAdvanceValue.tradeValue,
            },
            error: { code: 400, message: e.message } as sdk.RESULT_INFO,
          });
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    [
      account,
      chainId,
      checkAvailable,
      exchangeInfo,
      isAvailableId,
      isFeeNotEnough,
      nftMintAdvanceValue,
      processRequest,
      setShowAccount,
      setShowNFTMintAdvance,
      tokenAddress,
      tokenMap,
    ]
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTMint_WaitForAuth,
        info: {
          symbol: nftMintAdvanceValue.name,
          value: nftMintAdvanceValue.tradeValue,
        },
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [
      lastRequest,
      nftMintAdvanceValue.name,
      nftMintAdvanceValue.tradeValue,
      processRequest,
      setShowAccount,
    ]
  );
  const nftMintAdvanceProps: NFTMintAdvanceProps<T, I> = {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    isNFTCheckLoading,
    isAvailableId,
    handleOnNFTDataChange,
    onNFTMintClick: onNFTMintAdvanceClick,
    walletMap: {} as any,
    coinMap: totalCoinMap as any,
    tradeData: { ...nftMintAdvanceValue } as any,
    nftMintBtnStatus: btnStatus,
    btnInfo,
  };

  return {
    nftMintAdvanceProps,
    retryBtn,
  };
};
