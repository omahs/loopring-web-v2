import {
  useAccount,
  useTokenMap,
  useModalData,
  useWalletLayer2Socket,
  walletLayer2Service,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useSystem,
  isAccActivated,
  checkErrorInfo,
  useChargeFees,
  useWalletLayer2NFT,
} from "../../index";
import {
  AccountStep,
  NFTDeployProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";

import {
  AccountStatus,
  Layer1Action,
  myLog,
  TradeNFT,
  UIERROR_CODE,
  TOAST_TIME,
  LIVE_FEE_TIMES,
} from "@loopring-web/common-resources";
import { useBtnStatus } from "../common/useBtnStatus";

import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";

import * as sdk from "@loopring-web/loopring-sdk";
import { useLayer1Store } from "../../stores/localStore/layer1Store";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import {
  useHistory,
  useLocation,
  // useLocation
} from "react-router-dom";
import Web3 from "web3";

export function useNFTDeploy<
  T extends TradeNFT<I, any> & { broker: string },
  I
>() {
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const { nftDeployValue, updateNFTDeployData, resetNFTDeployData } =
    useModalData();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const {
    setShowAccount,
    setShowNFTDetail,
    setShowNFTDeploy,
    modals: { isShowNFTDeploy },
  } = useOpenModals();
  const { setOneItem } = useLayer1Store();
  const { checkHWAddr, updateHW } = useWalletInfo();
  const history = useHistory();
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    tokenAddress: nftDeployValue.tokenAddress,
    requestType: sdk.OffchainNFTFeeReqType.NFT_DEPLOY,
    updateData: ({ fee }) => {
      updateNFTDeployData({ ...nftDeployValue, fee });
    },
  });
  const processRequestNFT = React.useCallback(
    async (
      request:
        | sdk.OriginDeployNFTRequestV3
        | sdk.OriginDeployCollectionRequestV3,
      isFirstTime: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3) {
          let isHWAddr = checkHWAddr(account.accAddress);
          isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr;
          let response;
          if (request.hasOwnProperty("nftData")) {
            response = await LoopringAPI.userAPI?.submitDeployNFT(
              {
                request: request as sdk.OriginDeployNFTRequestV3,
                web3: connectProvides.usedWeb3 as unknown as Web3,
                chainId:
                  chainId !== sdk.ChainId.GOERLI
                    ? sdk.ChainId.MAINNET
                    : chainId,
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
          } else {
            response = await LoopringAPI.userAPI?.submitDeployCollection(
              {
                request: request as sdk.OriginDeployCollectionRequestV3,
                web3: connectProvides.usedWeb3 as unknown as Web3,
                chainId:
                  chainId !== sdk.ChainId.GOERLI
                    ? sdk.ChainId.MAINNET
                    : chainId,
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
          }

          if (isAccActivated()) {
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              const code = checkErrorInfo(
                response as sdk.RESULT_INFO,
                isFirstTime
              );
              if (code === sdk.ConnectorError.USER_DENIED) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTDeploy_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTDeploy_First_Method_Denied,
                  info: {
                    symbol: nftDeployValue?.tokenAddress,
                  },
                });
              } else {
                if (
                  [102024, 102025, 114001, 114002].includes(
                    (response as sdk.RESULT_INFO)?.code || 0
                  )
                ) {
                  checkFeeIsEnough({ isRequiredAPI: true });
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTDeploy_Failed,
                  error: response as sdk.RESULT_INFO,
                  info: {
                    symbol: nftDeployValue?.tokenAddress,
                  },
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              setOneItem({
                chainId: chainId as sdk.ChainId,
                uniqueId: request.tokenAddress.toLowerCase(),
                domain: Layer1Action.NFTDeploy,
              });
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTDeploy_In_Progress,
              });

              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTDeploy_Submit,
                info: {
                  symbol: nftDeployValue?.tokenAddress,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              searchParams.delete("detail");
              history.push(pathname + "?" + searchParams.toString());
              // history.push({
              //   search,
              //   ...restLocation,
              // });

              // if (nftDeployValue.collectionMeta) {
              //   history.push({
              //     pathname: `/NFT/assetsNFT/byCollection/${nftDeployValue.collectionMeta.id}-${nftDeployValue.collectionMeta.contractAddress}`,
              //     search,
              //   });
              //   // updateWalletLayer2NFT({
              //   //   page: Number(searchParams.get("collectionPage")) ?? 1,
              //   //   collection: nftDeployValue.collectionMeta,
              //   // });
              // } else {
              //   history.push({
              //     pathname: `/NFT/assetsNFT/byList`,
              //     search,
              //   });
              //   // updateWalletLayer2NFT({
              //   //   page,
              //   //   collection: undefined,
              //   // });
              // }
              setShowNFTDeploy({ isShow: false });
              setShowNFTDetail({ isShow: false });
              resetNFTDeployData();
            }
          } else {
            resetNFTDeployData();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason as sdk.RESULT_INFO, isFirstTime);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeploy_Denied,
              info: {
                symbol: nftDeployValue?.tokenAddress,
              },
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeploy_First_Method_Denied,
              info: {
                symbol: nftDeployValue?.tokenAddress,
              },
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeploy_Failed,
              info: {
                symbol: nftDeployValue?.tokenAddress,
              },
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: (reason as sdk.RESULT_INFO).message,
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
      nftDeployValue?.tokenAddress,
      checkFeeIsEnough,
      setOneItem,
      updateWalletLayer2NFT,
      page,
      resetNFTDeployData,
      updateHW,
    ]
  );
  React.useEffect(() => {
    if (isShowNFTDeploy.isShow) {
      checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES });
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
    };
  }, [isShowNFTDeploy]);

  const checkBtnStatus = React.useCallback(() => {
    if (tokenMap && !isFeeNotEnough.isFeeNotEnough) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [disableBtn, enableBtn, isFeeNotEnough.isFeeNotEnough, tokenMap]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [checkBtnStatus, nftDeployValue, isFeeNotEnough.isFeeNotEnough]);

  const onNFTDeployClick = async (
    _nftDeployValue: T,
    isFirsTime: boolean = true
  ) => {
    const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
    const nftDeployValue = store.getState()._router_modalData.nftDeployValue;

    if (
      readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      LoopringAPI.userAPI &&
      exchangeInfo &&
      !isFeeNotEnough.isFeeNotEnough &&
      nftDeployValue &&
      nftDeployValue.broker &&
      nftDeployValue.tokenAddress &&
      connectProvides.usedWeb3 &&
      (nftDeployValue?.nftData ||
        nftDeployValue?.collectionMeta?.owner?.toLowerCase() ===
          account.accAddress?.toLowerCase()) &&
      nftDeployValue.fee &&
      nftDeployValue?.fee.belong &&
      nftDeployValue?.fee.fee &&
      eddsaKey?.sk
    ) {
      try {
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeploy_WaitForAuth,
        });
        const feeToken = tokenMap[nftDeployValue.fee.belong];
        const feeRaw =
          nftDeployValue.fee.feeRaw ?? nftDeployValue.fee.__raw__?.feeRaw ?? 0;
        const _fee = sdk.toBig(feeRaw);
        // const _fee = sdk.toBig(nftDeployValue.fee.__raw__?.feeRaw ?? 0);
        myLog("fee.__raw__", _fee);
        const storageId = await LoopringAPI.userAPI?.getNextStorageId(
          {
            accountId,
            sellTokenId: Number(feeToken.tokenId),
          },
          apiKey
        );
        let req:
          | sdk.OriginDeployNFTRequestV3
          | sdk.OriginDeployCollectionRequestV3;
        if (
          nftDeployValue.collectionMeta &&
          nftDeployValue.collectionMeta.owner?.toLowerCase() ===
            account.accAddress?.toLowerCase()
        ) {
          req = {
            nftOwner: account.accAddress?.toLowerCase(),
            nftBaseUri: nftDeployValue.collectionMeta.baseUri ?? "",
            tokenAddress: nftDeployValue.tokenAddress,
            nftFactory: nftDeployValue.collectionMeta.nftFactory,
            transfer: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: nftDeployValue.broker,
              storageId: storageId.offchainId,
              token: {
                tokenId: feeToken.tokenId,
                volume: _fee.toFixed(), // TEST: fee.toString(),
              },
              validUntil: getTimestampDaysLater(DAYS),
            },
          };
        } else {
          req = {
            nftData: nftDeployValue.nftData ?? "",
            tokenAddress: nftDeployValue.tokenAddress,
            transfer: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: nftDeployValue.broker,
              storageId: storageId.offchainId,
              token: {
                tokenId: feeToken.tokenId,
                volume: _fee.toFixed(), // TEST: fee.toString(),
              },
              validUntil: getTimestampDaysLater(DAYS),
            },
          };
        }

        myLog("nftDeploy req:", req);

        processRequestNFT(req, isFirsTime);
      } catch (e: unknown) {
        // nftTransfer failed
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeploy_Failed,
          error: { code: UIERROR_CODE.UNKNOWN, msg: (e as any).message },
        });
      }
    } else {
      return false;
    }
  };

  useWalletLayer2Socket({});

  const nftDeployProps = {
    coinMap: {},
    handleOnNFTDataChange<T>(_data: T): void {},
    tradeData: nftDeployValue as T,
    walletMap: {},
    onNFTDeployClick: (trade: T) => {
      onNFTDeployClick(trade);
    },
    nftDeployBtnStatus: btnStatus,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  } as NFTDeployProps<any, any>;

  return {
    nftDeployProps,
    updateNFTDeployData,
  };
}
