import { useDefiMap, useDefiTrade, useToast } from "@loopring-web/core";
import { MarketType, myLog } from "@loopring-web/common-resources";
export const useDeFiHook = ({
  market,
  isJoin,
}: {
  market: MarketType;
  isJoin: boolean;
}) => {
  // const [toastOpen, setToastOpen] =
  //   React.useState<{ open?: boolean; type: any; content: string } | undefined>(
  //     undefined
  //   );
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { marketArray } = useDefiMap();
  myLog("isJoin", isJoin, "market", market);
  const { deFiWrapProps, confirmShow, setConfirmShow } = useDefiTrade({
    isJoin,
    setToastOpen: setToastOpen as any,
    market: [...marketArray].includes(market) ? market : marketArray[0], // marketArray[1] as MarketType,
  });
  return {
    deFiWrapProps,
    toastOpen,
    closeToast,
    confirmShow,
    setConfirmShow,
  };
};
