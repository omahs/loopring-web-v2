import React, { useEffect } from "react";
import styled from "@emotion/styled";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
  Switch,
  FormControlLabel,
  Avatar
} from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { useDualHook } from "./hook";
import {
  Button,
  CoinIcon,
  CoinIcons,
  DualTable,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import {
  ModalDualPanel,
  useDualMap,
  useDualTrade,
  useSystem,
  useTokenMap,
} from "@loopring-web/core";
import { useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import {
  BackIcon,
  getValuePrecisionThousand,
  HelpIcon,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";
import { useSearchParam } from "react-use";

const SelectBox = styled(Box)`
  display: flex;
  flex-direction: row;
  border: 1px solid;
  border-color: ${({selected}: ({selected: boolean})) => selected ? "#FFFFFF" : "#49527D"};
  margin-right: 20px;
`

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const BeginnerMode: any = withTranslation("common")(
  ({
    t,
    setConfirmDualInvest,
  }: WithTranslation & {
    setConfirmDualInvest: (state: any) => void;
  }) => {
    const { tradeMap, marketMap } = useDualMap();
    
    const step1SelectedToken: string | undefined = "LRC"
    const step2BuyOrSell: "Buy" | "Sell" | undefined = "Sell"
    const step3USDCOrUSDT: "USDT" | "USDC" | undefined = "USDT"

    const { coinJson } = useSettings();
    const { forexMap } = useSystem();
    const { tokenMap } = useTokenMap();
    const { setShowDual } = useOpenModals();
    const {
      // pairASymbol,
      // pairBSymbol,
      isLoading,
      dualProducts,
      currentPrice,
      pair,
      market,
    } = useDualHook({ setConfirmDualInvest });
    const { isMobile } = useSettings();
    const dualType = new RegExp(pair).test(market ?? "")
      ? sdk.DUAL_TYPE.DUAL_BASE
      : sdk.DUAL_TYPE.DUAL_CURRENCY;
    const pairASymbol = step1SelectedToken
    const pairBSymbol = step3USDCOrUSDT
    const tokenList = Reflect.ownKeys(tradeMap)
      .filter(tokenName => tokenName !== 'USDT' && tokenName !== 'USDC')
      .sort((a, b) => a.toString().localeCompare(b.toString()))
      .map(tokenName => {
        return {
          tokenName,
          minAPY: '0.001',
          maxAPY: '0.002',
          logo: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'
        }
      })
    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <>
          <Typography>1. Choose a token to sell or buy</Typography>
          <Box display={"flex"} flexDirection={"row"}>
            {tokenList.map(({ tokenName, minAPY, maxAPY, logo }) => (
              <SelectBox padding={"12px 16px"} selected={step1SelectedToken === tokenName}>
                <CoinIcon symbol={(typeof tokenName === 'string') ? tokenName : ''}/>
                {/* <Avatar alt={'todo'} src={coinJson[(typeof tokenName === 'string') ? tokenName : '']} /> */}
                <Box>
                  <Typography>
                    {tokenName}
                  </Typography>
                  <Typography>
                    APR: {minAPY} - {maxAPY}
                  </Typography>
                </Box>
              </SelectBox>
            ))}
          </Box>
        </>

        <>
          <Typography>2. Choose a token to sell or buy</Typography>
          <Box display={"flex"} flexDirection={"row"}>
            <SelectBox padding={"12px 16px"} selected={step2BuyOrSell === "Sell"}>
              
              <Avatar alt={'todo'} src={"https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"} />
              <Box>
                <Typography>
                  Sell {step1SelectedToken} High
                </Typography>
                <Typography>
                  You will receive USDC or USDT
                </Typography>
              </Box>
            </SelectBox>
            <SelectBox padding={"12px 16px"} selected={step2BuyOrSell === "Buy"}>
              <Avatar alt={'todo'} src={"https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"} />
              <Box>
                <Typography>
                  Buy {step1SelectedToken} Low
                </Typography>
                <Typography>
                  You can invest USDC or USDT
                </Typography>
              </Box>
            </SelectBox>
          </Box>
        </>

        <>
          <Typography>3. Choose Target Price and Settlement Date</Typography>
          <Box display={"flex"} flexDirection={"row"}>
            <SelectBox padding={"12px"} selected={step3USDCOrUSDT === "USDC"}>
              <Avatar alt={'todo'} src={"https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"} />
              {
                step2BuyOrSell === "Buy"
                  ? "Buy low with USDC"
                  : "Sell high for USDC"
              }
            </SelectBox>
            <SelectBox padding={"12px"} selected={step3USDCOrUSDT === "USDT"}>
              <Avatar alt={'todo'} src={"https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"} />
              {
                step2BuyOrSell === "Buy"
                  ? "Buy low with USDT"
                  : "Sell high for USDT"
              }
            </SelectBox>
          </Box>
        </>

        <WrapperStyled marginTop={1} flex={1} flexDirection={"column"}>
          {pairASymbol && pairBSymbol && market && (
            <Box
              display={"flex"}
              flexDirection={"row"}
              paddingTop={3}
              paddingX={3}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Box
                component={"h3"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                <Typography component={"span"} display={"inline-flex"}>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <CoinIcons
                    type={"dual"}
                    size={32}
                    tokenIcon={[
                      coinJson[pairASymbol],
                      coinJson[pairBSymbol],
                    ]}
                  />
                </Typography>
                <Typography
                  component={"span"}
                  flexDirection={"column"}
                  display={"flex"}
                >
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    color={"textPrimary"}
                  >
                    {t(
                      dualType === DUAL_TYPE.DUAL_BASE
                        ? "labelDualInvestBaseTitle"
                        : "labelDualInvestQuoteTitle",
                      {
                        symbolA: pairASymbol,
                        symbolB: pairBSymbol,
                      }
                    )}
                  </Typography>
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    color={"textSecondary"}
                    variant={"body2"}
                  >
                    {t("labelDualInvestDes", {
                      symbolA: pairASymbol,
                      symbolB: pairBSymbol,
                    })}
                  </Typography>
                </Typography>
              </Box>
              <Typography
                component={"span"}
                display={isMobile ? "flex" : "inline-flex"}
                color={"textSecondary"}
                variant={"body2"}
                flexDirection={isMobile ? "column" : "row"}
                alignItems={"center"}
              >
                {currentPrice &&
                  (!isMobile ? (
                    <Trans
                      i18nKey={"labelDualCurrentPrice"}
                      tOptions={{
                        price:
                          // PriceTag[CurrencyToTag[currency]] +
                          getValuePrecisionThousand(
                            currentPrice.currentPrice,
                            currentPrice.precisionForPrice
                              ? currentPrice.precisionForPrice
                              : tokenMap[currentPrice.quote]
                                .precisionForOrder,
                            currentPrice.precisionForPrice
                              ? currentPrice.precisionForPrice
                              : tokenMap[currentPrice.quote]
                                .precisionForOrder,
                            currentPrice.precisionForPrice
                              ? currentPrice.precisionForPrice
                              : tokenMap[currentPrice.quote]
                                .precisionForOrder,
                            true,
                            { floor: true }
                          ),
                        symbol: currentPrice.base,
                      }}
                    >
                      LRC Current price:
                      <Typography
                        component={"span"}
                        display={"inline-flex"}
                        color={"textPrimary"}
                        paddingLeft={1}
                      >
                        price
                      </Typography>{" "}
                      :
                    </Trans>
                  ) : (
                    <>
                      <Typography
                        component={"span"}
                        color={"textSecondary"}
                        variant={"body2"}
                        textAlign={"right"}
                      >
                        {t("labelDualMobilePrice", {
                          symbol: currentPrice.base,
                        })}
                      </Typography>
                      <Typography
                        textAlign={"right"}
                        component={"span"}
                        display={"inline-flex"}
                        color={"textPrimary"}
                        paddingLeft={1}
                      >
                        {getValuePrecisionThousand(
                          currentPrice.currentPrice,
                          currentPrice.precisionForPrice
                            ? currentPrice.precisionForPrice
                            : tokenMap[currentPrice.quote]
                              .precisionForOrder,
                          currentPrice.precisionForPrice
                            ? currentPrice.precisionForPrice
                            : tokenMap[currentPrice.quote]
                              .precisionForOrder,
                          currentPrice.precisionForPrice
                            ? currentPrice.precisionForPrice
                            : tokenMap[currentPrice.quote]
                              .precisionForOrder,
                          true,
                          { floor: true }
                        )}
                      </Typography>
                    </>
                  ))}
              </Typography>
            </Box>
          )}
          <Box flex={1}>
            <DualTable
              rawData={dualProducts ?? []}
              showloading={isLoading}
              forexMap={forexMap as any}
              onItemClick={(item) => {
                setShowDual({
                  isShow: true,
                  dualInfo: {
                    ...item,
                    sellSymbol: pairASymbol,
                    buySymbol: pairBSymbol,
                  },
                });
              }}
            />
          </Box>
        </WrapperStyled>

      </Box>
    );
  }
);
