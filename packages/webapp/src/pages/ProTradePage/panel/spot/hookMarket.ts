import {
  AccountStatus,
  defalutSlipage,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
} from "@loopring-web/common-resources";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  account,
  MarketTradeData,
  TradeBaseType,
  TradeBtnStatus,
  TradeProType,
  useOpenModals,
  useSettings,
  useToggle,
} from "@loopring-web/component-lib";
import {
  usePageTradePro,
  useAccount,
  useTokenMap,
  useSystem,
  useToast,
  LoopringAPI,
  walletLayer2Service,
  useAmount,
  useSubmitBtn,
  useTokenPrices,
} from "@loopring-web/core";
import { useTranslation } from "react-i18next";
import {
  getPriceImpactInfo,
  PriceLevel,
  usePlaceOrder,
  store,
  BIGO,
} from "@loopring-web/core";
import * as _ from "lodash";
import { toBig } from "@loopring-web/loopring-sdk";

export const useMarket = <C extends { [key: string]: any }>({
  market,
  resetTradeCalcData,
}: { market: MarketType } & any): {
  [key: string]: any;
  // market: MarketType|undefined;
  // marketTicker: MarketBlockProps<C> |undefined,
} => {
  const { t } = useTranslation();
  const { getAmount } = useAmount();
  const { tokenMap, marketArray, marketMap } = useTokenMap();
  const [alertOpen, setAlertOpen] = React.useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { account } = useAccount();
  const { slippage, isMobile } = useSettings();
  const { exchangeInfo, allowTrade } = useSystem();
  const {
    toggle: { order },
  } = useToggle();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const autoRefresh = React.useRef<NodeJS.Timeout | -1>(-1);

  const {
    pageTradePro,
    updatePageTradePro,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __AUTO_RECALC__,
  } = usePageTradePro();

  // @ts-ignore
  const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
  const walletMap = pageTradePro.tradeCalcProData?.walletMap ?? {};
  const [isMarketLoading, setIsMarketLoading] = React.useState(false);

  const [marketTradeData, setMarketTradeData] = React.useState<
    MarketTradeData<IBData<any>>
  >(
    // pageTradePro.market === market ?
    {
      base: {
        belong: baseSymbol,
        balance: walletMap ? walletMap[baseSymbol as string]?.count : 0,
      } as IBData<any>,
      quote: {
        belong: quoteSymbol,
        balance: walletMap ? walletMap[quoteSymbol as string]?.count : 0,
      } as IBData<any>,
      slippage: slippage && slippage !== "N" ? slippage : defalutSlipage,
      type: TradeProType.buy,
    }
  );
  React.useEffect(() => {
    return () => {
      if (autoRefresh.current !== -1) {
        clearTimeout(autoRefresh.current as NodeJS.Timeout);
      }
    };
  }, []);
  React.useEffect(() => {
    resetTradeData();
  }, [pageTradePro.market, pageTradePro.tradeCalcProData.walletMap]);

  const autoRecalc = React.useCallback(() => {
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    if (autoRefresh.current !== -1) {
      clearTimeout(autoRefresh.current as NodeJS.Timeout);
    }
    if (
      pageTradePro.lastStepAt &&
      marketTradeData[pageTradePro.lastStepAt].tradeValue
    ) {
      myLog("autoUpdate", marketTradeData);
      onChangeMarketEvent(
        marketTradeData,
        pageTradePro.lastStepAt as TradeBaseType
      );
    }
  }, []);
  const { makeMarketReqInHook } = usePlaceOrder();

  const onChangeMarketEvent = React.useCallback(
    (tradeData: MarketTradeData<IBData<any>>, formType: TradeBaseType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      // myLog(`onChangeMarketEvent ammPoolSnapshot:`, pageTradePro.ammPoolSnapshot)
      if (!pageTradePro.depth) {
        // myLog(`onChangeMarketEvent data not ready!`)
        setIsMarketLoading(true);
        return;
      } else {
        setIsMarketLoading(false);
      }

      let lastStepAt = pageTradePro.lastStepAt;

      if (formType === TradeBaseType.tab) {
        resetTradeData(tradeData.type);
        return;
        // amountBase = tradeData.base.tradeValue ? tradeData.base.tradeValue : undefined
        // amountQuote = amountBase !== undefined ? undefined : tradeData.quote.tradeValue ? tradeData.quote.tradeValue : undefined
      } else if (["base", "quote"].includes(formType)) {
        lastStepAt = formType as any;
      }

      if (lastStepAt) {
        if (autoRefresh.current !== -1) {
          clearTimeout(autoRefresh.current as NodeJS.Timeout);
        }
        autoRefresh.current = setTimeout(() => {
          // myLog('autoUpdate',marketTradeData)
          autoRecalc();
        }, __AUTO_RECALC__);
      }

      // myLog(`onChangeMarketEvent tradeData:`, tradeData, 'formType',formType)

      // setMarketTradeData(tradeData)

      let slippage = sdk
        .toBig(tradeData.slippage ? tradeData.slippage : defalutSlipage)
        .times(100)
        .toString();

      let amountBase =
        lastStepAt === TradeBaseType.base
          ? tradeData.base.tradeValue
          : undefined;
      let amountQuote =
        lastStepAt === TradeBaseType.quote
          ? tradeData.quote.tradeValue
          : undefined;

      let {
        marketRequest,
        calcTradeParams,
        sellUserOrderInfo,
        buyUserOrderInfo,
        minOrderInfo,
        totalFee,
        maxFeeBips,
        feeTakerRate,
        tradeCost,
      } = makeMarketReqInHook({
        isBuy: tradeData.type === "buy",
        base: tradeData.base.belong,
        quote: tradeData.quote.belong,
        amountBase,
        amountQuote,
        marketArray,
        marketMap,
        depth: pageTradePro.depthForCalc,
        ammPoolSnapshot: pageTradePro.ammPoolSnapshot,
        slippage,
      });

      // myLog('depth:',pageTradePro.depth)
      const minSymbol =
        tradeData.type === TradeProType.buy
          ? tradeData.base.belong
          : tradeData.quote.belong;
      const minimumReceived = getValuePrecisionThousand(
        toBig(calcTradeParams?.amountBOutSlip?.minReceivedVal ?? 0)
          .minus(totalFee)
          .toString(),
        tokenMap[minSymbol].precision,
        tokenMap[minSymbol].precision,
        tokenMap[minSymbol].precision,
        false,
        { floor: true }
      );
      const priceImpactObj = getPriceImpactInfo(
        calcTradeParams,
        account.readyState
      );
      updatePageTradePro({
        market,
        sellUserOrderInfo,
        buyUserOrderInfo,
        minOrderInfo: minOrderInfo as any,
        request: marketRequest as any,
        calcTradeParams: calcTradeParams,
        tradeCalcProData: {
          ...pageTradePro.tradeCalcProData,
          fee: totalFee,
          minimumReceived: !minimumReceived?.toString().startsWith("-")
            ? minimumReceived
            : undefined,
          priceImpact: priceImpactObj ? priceImpactObj.value : undefined,
          priceImpactColor: priceImpactObj?.priceImpactColor,
        },
        lastStepAt,
        totalFee,
        maxFeeBips,
        feeTakerRate,
        tradeCost,
      });

      setMarketTradeData((state) => {
        let baseValue = undefined;
        let quoteValue = undefined;
        if (calcTradeParams) {
          baseValue = calcTradeParams.isReverse
            ? Number(calcTradeParams.buyAmt)
            : Number(calcTradeParams.sellAmt);
          quoteValue = calcTradeParams.isReverse
            ? Number(calcTradeParams.sellAmt)
            : Number(calcTradeParams.buyAmt);
        }
        return {
          ...state,
          ...tradeData,
          // slippage: tradeData.slippage,
          base: {
            ...state.base,
            tradeValue:
              baseValue &&
              Number(baseValue.toFixed(tokenMap[state.base.belong].precision)),
          },
          quote: {
            ...state.quote,
            tradeValue:
              quoteValue &&
              Number(
                quoteValue.toFixed(tokenMap[state.quote.belong].precision)
              ),
          },
        };
      });
    },
    [autoRecalc, account.readyState]
  );

  const resetTradeData = React.useCallback(
    (type?: TradeProType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      const walletMap = pageTradePro.tradeCalcProData?.walletMap ?? {};
      setMarketTradeData((state) => {
        return {
          ...state,
          type: type ?? pageTradePro.tradeType,
          base: {
            ...state.base,
            // belong: baseSymbol,
            balance: walletMap ? walletMap[baseSymbol as string]?.count : 0,
            tradeValue: undefined,
          } as IBData<any>,
          quote: {
            ...state.quote,
            balance: walletMap ? walletMap[quoteSymbol as string]?.count : 0,
            tradeValue: undefined,
          } as IBData<any>,
        };
      });
      updatePageTradePro({
        market,
        tradeType: type ?? pageTradePro.tradeType,
        sellUserOrderInfo: null,
        buyUserOrderInfo: null,
        minOrderInfo: null,
        request: null,
        calcTradeParams: null,
        limitCalcTradeParams: null,
        lastStepAt: undefined,
        tradeCalcProData: {
          ...pageTradePro.tradeCalcProData,
          // walletMap:walletMap as any,
          priceImpact: undefined,
          priceImpactColor: undefined,
          minimumReceived: undefined,
          fee: undefined,
        },
        totalFee: undefined,
        maxFeeBips: undefined,
        feeTakerRate: undefined,
        tradeCost: undefined,
      });
    },
    [baseSymbol, quoteSymbol]
  );
  const marketSubmit = React.useCallback(
    async () => {
      // const {calcTradeParams, request, tradeCalcProData,} = pageTradePro;
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      const { calcTradeParams, request } = pageTradePro;
      // setAlertOpen(false);
      // setConfirmOpen(false);
      if (
        !LoopringAPI.userAPI ||
        !tokenMap ||
        !exchangeInfo ||
        !calcTradeParams ||
        !request ||
        account.readyState !== AccountStatus.ACTIVATED
      ) {
        setToastOpen({
          open: true,
          type: "error",
          content: t("labelSwapFailed"),
        });
        setIsMarketLoading(false);

        return;
      }

      // const baseToken = tokenMap[ marketTradeData?.base.belong as string ]
      // const quoteToken = tokenMap[ marketTradeData?.quote.belong as string ]
      try {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: request.sellToken.tokenId as number,
        };

        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          req,
          account.apiKey
        );

        const requestClone = _.cloneDeep(request);

        requestClone.storageId = storageId.orderId;

        myLog(requestClone);

        const response: { hash: string } | any =
          await LoopringAPI.userAPI.submitOrder(
            requestClone,
            account.eddsaKey.sk,
            account.apiKey
          );

        myLog(response);

        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          if ((response as sdk.RESULT_INFO).code === 114002) {
            getAmount({ market });
            resetTradeData(pageTradePro.tradeType);
          }
          setToastOpen({
            open: true,
            type: "error",
            content: t("labelSwapFailed") + " : " + response.message,
          });
        } else {
          await sdk.sleep(__TOAST_AUTO_CLOSE_TIMER__);

          const resp = await LoopringAPI.userAPI.getOrderDetails(
            {
              accountId: account.accountId,
              orderHash: response.hash,
            },
            account.apiKey
          );

          myLog("-----> resp:", resp);

          if (resp.orderDetail?.status !== undefined) {
            myLog("resp.orderDetail:", resp.orderDetail);
            switch (resp.orderDetail?.status) {
              case sdk.OrderStatus.cancelled:
                const baseAmount = sdk.toBig(
                  resp.orderDetail.volumes.baseAmount
                );
                const baseFilled = sdk.toBig(
                  resp.orderDetail.volumes.baseFilled
                );
                const quoteAmount = sdk.toBig(
                  resp.orderDetail.volumes.quoteAmount
                );
                const quoteFilled = sdk.toBig(
                  resp.orderDetail.volumes.quoteFilled
                );
                const percentage1 = baseAmount.eq(BIGO)
                  ? 0
                  : baseFilled.div(baseAmount).toNumber();
                const percentage2 = quoteAmount.eq(BIGO)
                  ? 0
                  : quoteFilled.div(quoteAmount).toNumber();
                myLog(
                  "percentage1:",
                  percentage1,
                  " percentage2:",
                  percentage2
                );
                if (percentage1 === 0 || percentage2 === 0) {
                  setToastOpen({
                    open: true,
                    type: "warning",
                    content: t("labelSwapCancelled"),
                  });
                } else {
                  setToastOpen({
                    open: true,
                    type: "success",
                    content: t("labelSwapSuccess"),
                  });
                }
                break;
              case sdk.OrderStatus.processed:
                setToastOpen({
                  open: true,
                  type: "success",
                  content: t("labelSwapSuccess"),
                });
                break;
              case sdk.OrderStatus.processing:
                setToastOpen({
                  open: true,
                  type: "success",
                  content: t("labelOrderProcessing"),
                });
                break;
              default:
                setToastOpen({
                  open: true,
                  type: "error",
                  content: t("labelSwapFailed"),
                });
                break;
            }
          }
          resetTradeData(pageTradePro.tradeType);
          walletLayer2Service.sendUserUpdate();
        }
      } catch (reason: any) {
        sdk.dumpError400(reason);
        setToastOpen({
          open: true,
          type: "error",
          content: t("labelSwapFailed"),
        });
      }

      // setOutput(undefined)
      await sdk.sleep(__SUBMIT_LOCK_TIMER__);
      setIsMarketLoading(false);
    },
    [
      account.readyState,
      tokenMap,
      marketTradeData,
      setIsMarketLoading,
      setToastOpen,
      setMarketTradeData,
    ]
  );

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    const { minOrderInfo } = pageTradePro;

    if (account.readyState === AccountStatus.ACTIVATED) {
      if (
        marketTradeData?.base.tradeValue === undefined ||
        marketTradeData?.quote.tradeValue === undefined ||
        marketTradeData?.base.tradeValue === 0 ||
        marketTradeData?.quote.tradeValue === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (!minOrderInfo?.minAmtCheck) {
        let minOrderSize = "Error";
        if (minOrderInfo && minOrderInfo?.symbol) {
          const symbol = minOrderInfo.symbol;
          const minToken = tokenMap[symbol];
          const showValue = getValuePrecisionThousand(
            minOrderInfo?.minAmtShow,
            minToken.precision,
            minToken.precision,
            minToken.precision,
            false,
            { isAbbreviate: true, floor: false }
          );
          minOrderSize = `${showValue} ${minOrderInfo?.symbol}`;
          return {
            tradeBtnStatus: TradeBtnStatus.DISABLED,
            label: `labelLimitMin| ${minOrderSize}`,
          };
        } else {
          return {
            tradeBtnStatus: TradeBtnStatus.DISABLED,
            label: ``,
          };
        }
      } else if (
        sdk
          .toBig(
            marketTradeData[
              marketTradeData.type === TradeProType.buy ? "quote" : "base"
            ]?.tradeValue ?? ""
          )
          .gt(
            marketTradeData[
              marketTradeData.type === TradeProType.buy ? "quote" : "base"
            ].balance
          )
      ) {
        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: "" };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }

    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [marketTradeData, marketSubmit]);
  const [smallOrderAlertOpen, setSmallOrderAlertOpen] =
    React.useState<boolean>(false);
  const [secondConfirmationOpen, setSecondConfirmationOpen] =
    React.useState<boolean>(false);
  const { tokenPrices } = useTokenPrices();
  const isSmallOrder =
    marketTradeData && marketTradeData.quote.tradeValue
      ? tokenPrices[marketTradeData.quote.belong] * marketTradeData.quote.tradeValue < 100
      : false;
  const priceAlertCallBack = React.useCallback(
    (confirm: boolean) => {
      if (confirm) {
        if (isSmallOrder) {
          setSmallOrderAlertOpen(true);
        } else {
          setIsMarketLoading(true);
          marketSubmit();
        }
        setAlertOpen(false);
        setConfirmOpen(false);
      } else {
        setAlertOpen(false);
        setConfirmOpen(false);
        setIsMarketLoading(false);
      }
    },
    [isSmallOrder]
  );
  const smallOrderAlertCallBack = React.useCallback(
    (confirm: boolean) => {
      if (confirm) {
        setIsMarketLoading(true);
        marketSubmit();
        setSmallOrderAlertOpen(false);
      } else {
        setSmallOrderAlertOpen(false);
        setIsMarketLoading(false);
      }
    },
    [marketSubmit]
  );
  const secondConfirmationCallBack = React.useCallback(
    (confirm: boolean) => {
      if (confirm) {
        setIsMarketLoading(true);
        marketSubmit();
        setSecondConfirmationOpen(false);
      } else {
        setSecondConfirmationOpen(false);
        setIsMarketLoading(false);
      }
    },
    [marketSubmit]
  );
  

  const onSubmitBtnClick = React.useCallback(async () => {
    setIsMarketLoading(true);
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    const { priceLevel } = getPriceImpactInfo(
      pageTradePro.calcTradeParams,
      account.readyState
    );
    // const isIpValid = true
    if (!allowTrade.order.enable) {
      setShowSupport({ isShow: true });
      setIsMarketLoading(false);
    } else if (!order.enable) {
      setShowTradeIsFrozen({ isShow: true, type: "Limit" });
      setIsMarketLoading(false);
    } else if (priceLevel === PriceLevel.Lv1) {
      setAlertOpen(true);
    } else if (priceLevel === PriceLevel.Lv2) {
      setConfirmOpen(true);
    } else if (isSmallOrder) {
      setSmallOrderAlertOpen(true);
    } else {
      marketSubmit();
    }
  }, [allowTrade, account.readyState, isSmallOrder]);

  const {
    btnStatus: tradeMarketBtnStatus,
    onBtnClick: marketBtnClick,
    btnLabel: tradeMarketI18nKey,
    btnStyle: tradeMarketBtnStyle,
    // btnClickCallbackArray
  } = useSubmitBtn({
    availableTradeCheck: availableTradeCheck,
    isLoading: isMarketLoading,
    submitCallback: onSubmitBtnClick,
  });
  return {
    alertOpen,
    confirmOpen,
    toastOpen,
    closeToast,
    isMarketLoading,
    marketSubmit,
    marketTradeData,
    resetMarketData: resetTradeData,
    onChangeMarketEvent,
    tradeMarketBtnStatus,
    tradeMarketI18nKey,
    marketBtnClick,
    tradeMarketBtnStyle: {
      ...tradeMarketBtnStyle,
      ...{ fontSize: isMobile ? "1.4rem" : "1.6rem" },
    },
    smallOrderAlertCallBack,
    secondConfirmationCallBack,
    smallOrderAlertOpen,
    secondConfirmationOpen,
    setToastOpen,
    priceAlertCallBack
    // marketTicker,
  };
};
