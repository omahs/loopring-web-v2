import React from "react";
import { LoopringAPI } from "api_wrapper";
import { BigNumber } from "bignumber.js";
import {
  NFTTableFilter,
  NFTTableProps,
  TxnDetailProps,
} from "@loopring-web/component-lib";
import { useSystem } from "stores/system";
import { useAccount } from "stores/account";
import * as sdk from "@loopring-web/loopring-sdk";
import { TxNFTType } from "@loopring-web/loopring-sdk";
import { volumeToCountAsBigNumber } from "../../../../hooks/help";
import moment from "moment";

BigNumber.config({ EXPONENTIAL_AT: 100 });
const LimitNFTHistory = 20;

export const useHistoryNFT = <Row extends TxnDetailProps>() => {
  const { etherscanBaseUrl } = useSystem();
  const { account } = useAccount();
  const [tabIndex, setTabIndex] = React.useState(0);
  const container = React.useRef(null);

  // const [pageSize, setPageSize] = React.useState(10);

  const [nftHistory, setNftHistory] = React.useState<{
    // transfers: Partial<NFTTableProps>;
    // deposits: Partial<NFTTableProps>;
    // withdraws: Partial<NFTTableProps>;
    userNFTTxs: Partial<NFTTableProps<Row>>;
  }>({
    userNFTTxs: {
      etherscanBaseUrl,
      rawData: [],
      pagination: {
        pageSize: LimitNFTHistory,
        total: 0,
      },
      txType: sdk.UserNFTTxTypes[sdk.TxNFTType.ALL],
      showloading: false,
    },
    // transfers: {
    //   etherscanBaseUrl,
    //   rawData: [],
    //   pagination: {
    //     pageSize: LimitNFTHistory,
    //     total: 0,
    //   },
    //   txType: TxType.TRANSFER,
    //   showloading: false,
    // },
    // deposits: {
    //   etherscanBaseUrl,
    //   rawData: [],
    //   pagination: {
    //     pageSize: LimitNFTHistory,
    //     total: 0,
    //   },
    //   txType: TxType.DEPOSIT,
    //   showloading: false,
    // },
    // withdraws: {
    //   etherscanBaseUrl,
    //   rawData: [],
    //   pagination: {
    //     pageSize: LimitNFTHistory,
    //     total: 0,
    //   },
    //   txType: TxType.OFFCHAIN_WITHDRAWAL,
    //   showloading: false,
    // },
  });

  const getTxnList = React.useCallback(
    async ({
      page = 1,
      limit,
      txType = sdk.UserNFTTxTypes[TxNFTType.ALL],
      duration = [null, null],
    }: NFTTableFilter) => {
      if (LoopringAPI.userAPI) {
        const _limit = limit
          ? limit
          : nftHistory.userNFTTxs.pagination?.pageSize ?? LimitNFTHistory;
        const { totalNum, userNFTTxs } =
          await LoopringAPI.userAPI.getUserNFTTransactionHistory(
            {
              accountId: account.accountId,
              offset: (page - 1) * _limit,
              types: txType ? ([txType] as any[]) : undefined,
              // start: (page - 1) * limit,
              start:
                duration && duration[0]
                  ? (duration[0] as any)?.format("x") ?? undefined
                  : undefined,
              end:
                duration && duration[1]
                  ? (duration[1] as any)?.format("x") ?? undefined
                  : undefined,
              limit: _limit,
            },
            account.apiKey
          );
        setNftHistory((state) => {
          return {
            ...state,
            userNFTTxs: {
              ...state.userNFTTxs,
              totalNum,
              duration,
              txType,
              // limit,
              page,
              pagination: {
                pageSize:
                  limit ??
                  nftHistory.userNFTTxs.pagination?.pageSize ??
                  LimitNFTHistory,
                total: totalNum,
              },
              rawData: userNFTTxs.map((item) => {
                return {
                  ...item,
                  amount: item.amount.toString(),
                  // (item.payeeAddress === account.accAddress ? "+" : "-") +
                  // item.amount.toString(),
                  fee: {
                    unit: item.feeTokenSymbol || "",
                    value: Number(
                      volumeToCountAsBigNumber(
                        item.feeTokenSymbol,
                        item.feeAmount || 0
                      )
                    ),
                  },
                };
              }) as Row[],
            },
          };
        });
      }
    },
    [nftHistory]
  );

  React.useEffect(() => {
    // @ts-ignore
    let height = container?.current?.offsetHeight;
    const pageSize = Math.floor(height / 44) - 4;
    if (height) {
      setNftHistory((state) => {
        const userNFTTxs = state.userNFTTxs;

        userNFTTxs.pagination = {
          ...state.userNFTTxs.pagination,
          pageSize,
        } as any;
        getTxnList({
          page: 1,
          limit: pageSize,
          txType: userNFTTxs.txType,
          duration: userNFTTxs.duration,
        });
        return state;
      });
    }
  }, [container]);
  // const getTransferList = React.useCallback(
  //   async (page = 1, limit = LimitNFTHistory) => {
  //     if (LoopringAPI.userAPI) {
  //       const { totalNum, userNFTTransfers } =
  //         await LoopringAPI.userAPI.getUserNFTTransferHistory(
  //           {
  //             accountId: account.accountId,
  //             // start: (page - 1) * limit,
  //             limit,
  //           },
  //           account.apiKey
  //         );
  //       setNftHistory((state) => {
  //         return {
  //           ...state,
  //
  //           transfers: {
  //             txType: TxType.TRANSFER,
  //             ...state.transfers,
  //             pagination: {
  //               pageSize: LimitNFTHistory,
  //               total: totalNum,
  //             },
  //             rawData: userNFTTransfers.map((item) => {
  //               return {
  //                 ...item,
  //                 amount:
  //                   (item.payeeAddress === account.accAddress ? "+" : "-") +
  //                   item.amount.toString(),
  //                 txType: TxType.TRANSFER,
  //                 fee: {
  //                   unit: item.feeTokenSymbol || "",
  //                   value: Number(
  //                     volumeToCountAsBigNumber(
  //                       item.feeTokenSymbol,
  //                       item.feeAmount || 0
  //                     )
  //                   ),
  //                 },
  //               };
  //             }) as any,
  //           },
  //         };
  //       });
  //     }
  //   },
  //   [nftHistory]
  // );
  // const getDepositList = React.useCallback(
  //   async (page = 1, limit = LimitNFTHistory) => {
  //     if (LoopringAPI.userAPI) {
  //       const { totalNum, userNFTDepositHistory } =
  //         await LoopringAPI.userAPI.getUserNFTDepositHistory(
  //           {
  //             accountId: account.accountId,
  //             // start: (page - 1) * limit,
  //             limit,
  //           },
  //           account.apiKey
  //         );
  //       setNftHistory((state) => {
  //         return {
  //           ...state,
  //           deposits: {
  //             txType: TxType.DEPOSIT,
  //             ...state.deposits,
  //             pagination: {
  //               pageSize: LimitNFTHistory,
  //               total: totalNum,
  //             },
  //             rawData: userNFTDepositHistory.map((item) => {
  //               return {
  //                 txType: TxType.DEPOSIT,
  //                 ...item,
  //                 fee: {
  //                   unit: item.feeTokenSymbol || "",
  //                   value: Number(
  //                     volumeToCountAsBigNumber(
  //                       item.feeTokenSymbol,
  //                       item.feeAmount || 0
  //                     )
  //                   ),
  //                 },
  //               };
  //             }) as any,
  //           },
  //         };
  //       });
  //     }
  //   },
  //   [nftHistory]
  // );
  // const getWithdrawalList = React.useCallback(
  //   async (page = 1, limit = LimitNFTHistory) => {
  //     if (LoopringAPI.userAPI) {
  //       const { totalNum, userNFTWithdrawalHistory } =
  //         await LoopringAPI.userAPI.getUserNFTWithdrawalHistory(
  //           {
  //             accountId: account.accountId,
  //             // start: (page - 1) * limit,
  //             limit,
  //           },
  //           account.apiKey
  //         );
  //       setNftHistory((state) => {
  //         return {
  //           txType: TxType.OFFCHAIN_WITHDRAWAL,
  //           ...state,
  //           withdraws: {
  //             txType: TxType.OFFCHAIN_WITHDRAWAL,
  //             ...state.withdraws,
  //             pagination: {
  //               pageSize: LimitNFTHistory,
  //               total: totalNum,
  //             },
  //             rawData: userNFTWithdrawalHistory.map((item) => {
  //               return {
  //                 ...item,
  //                 fee: {
  //                   unit: item.feeTokenSymbol || "",
  //                   value: Number(
  //                     volumeToCountAsBigNumber(
  //                       item.feeTokenSymbol || "",
  //                       item.feeAmount || 0
  //                     )
  //                   ),
  //                 },
  //               };
  //             }) as any,
  //           },
  //         };
  //       });
  //     }
  //   },
  //   [nftHistory]
  // );
  // useEffect(() => {
  //   // getWithdrawalList();
  //   // getDepositList();
  //   // getTransferList();
  //   getTxnList({ page: 1 });
  // }, []);

  return {
    container,
    nftHistory,
    getTxnList,
    // userNFTTxs,
    // getTransferList,
    // getDepositList,
    // getWithdrawalList,
    tabIndex,
    setTabIndex,
  };
};
