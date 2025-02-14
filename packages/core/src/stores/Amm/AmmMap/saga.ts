import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getAmmMap, getAmmMapStatus, updateRealTimeAmmMap } from "./reducer";
import { AmmDetail, myLog } from "@loopring-web/common-resources";
import { store } from "../../index";
import { AmmPoolInfoV3, AmmPoolStat, toBig } from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";
import { AmmDetailStore, GetAmmMapParams } from "./interface";
import { volumeToCount, volumeToCountAsBigNumber } from "../../../hooks/help";

type AmmMap<R extends { [key: string]: any }> =
  | { [key: string]: AmmDetail<R> }
  | {}; //key is AMM-XXX-XXX
export const setAmmState = ({
  ammPoolState,
  keyPair,
}: {
  ammPoolState: AmmPoolStat & { apysBips?: string[] };
  keyPair: string;
}) => {
  const { idIndex } = store.getState().tokenMap;
  // @ts-ignore
  const [, coinA, coinB] = keyPair.match(/(\w+)-(\w+)/i);
  const { tokenPrices } = store.getState().tokenPrices;
  if (idIndex && coinA && coinB && tokenPrices) {
    let result = {
      amountDollar: parseFloat(ammPoolState?.liquidityUSD || ""),
      totalLPToken: volumeToCount("LP-" + keyPair, ammPoolState.lpLiquidity),
      totalA: volumeToCount(coinA, ammPoolState.liquidity[0]), //parseInt(ammPoolState.liquidity[ 0 ]),
      totalB: volumeToCount(coinB, ammPoolState.liquidity[1]), //parseInt(ammPoolState.liquidity[ 1 ]),
      rewardValue: ammPoolState.rewards[0]
        ? volumeToCount(
            idIndex[ammPoolState.rewards[0].tokenId as number],
            ammPoolState.rewards[0].volume
          )
        : undefined,
      rewardToken: ammPoolState.rewards[0]
        ? idIndex[ammPoolState.rewards[0].tokenId as number]
        : undefined,
      rewardValue2: ammPoolState.rewards[1]
        ? volumeToCount(
            idIndex[ammPoolState.rewards[1].tokenId as number],
            ammPoolState.rewards[1].volume
          )
        : undefined,
      rewardToken2: ammPoolState.rewards[1]
        ? idIndex[ammPoolState.rewards[1].tokenId as number]
        : undefined,
    };
    const feeA = volumeToCountAsBigNumber(coinA, ammPoolState.fees[0]);
    const feeB = volumeToCountAsBigNumber(coinB, ammPoolState.fees[1]);
    const feeDollar =
      tokenPrices[coinA] && tokenPrices[coinB]
        ? toBig(feeA || 0)
            .times(tokenPrices[coinA])
            .plus(toBig(feeB || 0).times(tokenPrices[coinB]))
        : undefined;
    const APRs = {
      self:
        (parseInt(ammPoolState?.apysBips ? ammPoolState.apysBips[0] : "0") *
          1.0) /
        100,
      event:
        (parseInt(ammPoolState?.apysBips ? ammPoolState?.apysBips[1] : "0") *
          1.0) /
        100,
      fee:
        (parseInt(ammPoolState?.apysBips ? ammPoolState?.apysBips[2] : "0") *
          1.0) /
        100,
    };
    return {
      ...result,
      feeA: feeA?.toNumber(),
      feeB: feeB?.toNumber(),
      feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
      tradeFloat: {
        change: undefined,
        timeUnit: "24h",
      },
      // @ts-ignore
      APR: ammPoolState?.apysBips
        ? APRs.self + APRs.event + APRs.fee
        : (parseInt(ammPoolState.apyBips) * 1.0) / 100,
      APRs,
    };
  }
};
const getAmmMapApi = async <R extends { [key: string]: any }>({
  ammpools,
}: GetAmmMapParams) => {
  if (!LoopringAPI.ammpoolAPI) {
    return undefined;
  }

  let ammMap: AmmMap<R> = {};
  myLog("loop get ammPoolStats");

  const { ammPoolStats } = await LoopringAPI.ammpoolAPI?.getAmmPoolStats();

  let { __timer__ } = store.getState().amm.ammMap;
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(async () => {
      if (!LoopringAPI.ammpoolAPI) {
        return undefined;
      }

      let ammPoolStats: { [key in keyof R]: AmmPoolStat } = (
        await LoopringAPI.ammpoolAPI.getAmmPoolStats()
      ).ammPoolStats as { [key in keyof R]: AmmPoolStat };
      store.dispatch(updateRealTimeAmmMap({ ammPoolStats }));
    }, 900000); //15*60*1000 //900000
  })();
  const {
    tokenMap: { idIndex },
  } = store.getState();

  Reflect.ownKeys(ammpools).forEach(async (key) => {
    const item: AmmPoolInfoV3 = ammpools[key as string];
    if (item.market === key && item.tokens.pooled && idIndex) {
      const coinA = idIndex[item.tokens.pooled[0] as any];
      const coinB = idIndex[item.tokens.pooled[1] as any];
      let status: any = ammpools[key.toString()].status ?? 0;
      status = ("00000" + status.toString(2)).split("");
      let exitDisable = status[status.length - 1] === "0";
      let joinDisable = status[status.length - 2] === "0";
      let swapDisable = status[status.length - 3] === "0";
      let showDisable = status[status.length - 4] === "0";
      let isRiskyMarket = status[status.length - 5] === "1";
      const dataItem: AmmDetailStore<R> = {
        ...item,
        coinA: coinA,
        coinB: coinB,
        isNew:
          Date.now() - Number(item.createdAt) > 3 * 86400 * 1000 ? false : true, //3*24*60*60*1000,
        isActivity: item.status === 7 ? true : false,
        ...setAmmState({
          ammPoolState: ammPoolStats[key],
          keyPair: `${coinA}-${coinB}`,
        }),
        exitDisable,
        joinDisable,
        swapDisable,
        showDisable,
        isRiskyMarket,
        __rawConfig__: item,
      } as AmmDetailStore<R>;
      // @ts-ignore
      ammMap[item.market] = dataItem;
    }
  });
  return { ammMap, __timer__ };
};

export function* getPostsSaga({ payload }: PayloadAction<GetAmmMapParams>) {
  try {
    const { ammpools } = payload;
    const { ammMap, __timer__ } = yield call(getAmmMapApi, { ammpools });
    yield put(getAmmMapStatus({ ammMap, __timer__ }));
  } catch (err) {
    yield put(getAmmMapStatus(err));
  }
}

export function* updateRealTimeSaga({ payload }: any) {
  try {
    const { ammPoolStats } = payload;
    let { ammMap }: { ammMap: AmmMap<object> } = store.getState().amm.ammMap;
    if (ammPoolStats) {
      Reflect.ownKeys(ammPoolStats).map((key) => {
        const keyPair = (key as string).replace("AMM-", "");
        // @ts-ignore
        ammMap[key] = {
          // @ts-ignore
          ...ammMap[key],
          ...setAmmState({
            ammPoolState: ammPoolStats[key as string],
            keyPair,
          }),
        };
        return ammMap;
      });
    }
    yield put(getAmmMapStatus({ ammMap }));
  } catch (err) {
    yield put(getAmmMapStatus(err));
  }
}

export function* ammMapInitSaga() {
  yield all([takeLatest(getAmmMap, getPostsSaga)]);
}

export function* ammMapRealTimeSaga() {
  yield all([takeLatest(updateRealTimeAmmMap, updateRealTimeSaga)]);
}

export const ammMapSaga = [fork(ammMapInitSaga), fork(ammMapRealTimeSaga)];
