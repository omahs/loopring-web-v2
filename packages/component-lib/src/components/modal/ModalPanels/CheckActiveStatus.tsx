import {
  Account,
  EmptyValueTag,
  FeeInfo,
  SoursURL,
  WalletMap,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import { toBig } from "@loopring-web/loopring-sdk";
import React from "react";
// import styled from "@emotion/styled";
// const ListStyle = styled(List)`
//   list-style: outside;
//   margin-left: ${({ theme }) => 3 * theme.unit}px;
//   .MuiListItem-root {
//     display: list-item;
//     padding: ${({ theme }) => `${theme.unit / 2}px ${theme.unit}px 0`};
//   }
// ` as typeof List;
export const CheckActiveStatus = ({
  walletMap,
  account,
  goSend,
  goDisconnect,
  goUpdateAccount,
  isShow,
  // isDepositing = false,
  chargeFeeTokenList = [],
}: {
  account: Account & { isContract: boolean | undefined };
  chargeFeeTokenList: FeeInfo[];
  goUpdateAccount: () => void;
  goDisconnect: () => void;
  goSend: () => void;
  isDepositing: boolean;
  walletMap?: WalletMap<any, any>;
  isShow: boolean;
  // isFeeNotEnough: boolean;

  onClick: () => void;
}) => {
  const { t } = useTranslation("common");

  const isFeeNotEnough = !(
    walletMap &&
    chargeFeeTokenList.findIndex((item) => {
      if (walletMap && walletMap[item.belong]) {
        if (
          toBig(walletMap[item.belong].count ?? 0).gt(
            toBig(item.fee.toString().replace(",", ""))
          )
        ) {
          return true;
        }
      }
      return false;
    }) !== -1
  );
  React.useEffect(() => {
    if (isShow && !isFeeNotEnough) {
      goUpdateAccount();
    }
  }, [isFeeNotEnough, isShow]);
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      paddingBottom={4}
      width={"100%"}
    >
      <Typography
        component={"h3"}
        variant={"h3"}
        marginBottom={3}
        marginTop={-1}
      >
        {t("labelActiveAccountTitle")}
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        flex={1}
        alignItems={"stretch"}
        alignSelf={"stretch"}
        className="modalContent"
        paddingX={5 / 2}
      >
        {chargeFeeTokenList === undefined ||
        chargeFeeTokenList.length === 0 ||
        walletMap === undefined ||
        account.isContract === undefined ? (
          <Box
            flex={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            flexDirection={"column"}
            height={"100%"}
            width={"100%"}
          >
            <img
              className="loading-gif"
              alt={"loading"}
              width="36"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        ) : (
          <>
            {account.isContract ? (
              <>
                <Typography
                  component={"p"}
                  variant={"h5"}
                  color={"error"}
                  marginTop={1}
                  textAlign={"center"}
                >
                  {t("labelActivatedAccountNotSupport")}
                </Typography>
                <Typography
                  component={"p"}
                  variant={"body1"}
                  color={"textPrimary"}
                  marginTop={1}
                >
                  {t("labelActivatedAccountNotSupportDes")}
                </Typography>
              </>
            ) : (
              <>
                {!!isFeeNotEnough ? (
                  <Typography
                    color={"var(--color-warning)"}
                    component={"p"}
                    variant={"body1"}
                    marginTop={1}
                  >
                    {t("labelNotBalancePayForActive")}
                  </Typography>
                ) : (
                  <Typography
                    color={"textPrimary"}
                    component={"p"}
                    variant={"body1"}
                    marginTop={1}
                  >
                    {t("labelEnoughBalancePayForActive")}
                  </Typography>
                )}
                <Typography
                  component={"p"}
                  variant={"body1"}
                  color={"var(--color-text-third)"}
                  marginTop={2}
                  marginBottom={1}
                >
                  {t("labelActivatedAccountChargeFeeList")}
                </Typography>
                {chargeFeeTokenList?.map((item, index) => (
                  <Typography
                    key={index + item.belong}
                    color={"textSecondary"}
                    display={"flex-inline"}
                    paddingY={1 / 2}
                    marginLeft={2}
                  >
                    <Typography
                      component={"span"}
                      variant={"inherit"}
                      color={"inherit"}
                      display={"inline-block"}
                      minWidth={60}
                    >
                      {item.belong + ": "}
                    </Typography>
                    <Typography component={"span"} color={"inherit"}>
                      {`fee is ${item.fee};`}
                    </Typography>
                    <Typography component={"span"} color={"inherit"}>
                      {` Your L2 asset is ${
                        walletMap && walletMap[item.belong]
                          ? walletMap[item.belong].count
                          : EmptyValueTag
                      }`}
                    </Typography>
                  </Typography>
                ))}
                {!!isFeeNotEnough && (
                  <Typography
                    color={"var(--color-warning)"}
                    component={"p"}
                    variant={"body1"}
                    marginTop={2}
                  >
                    {t("labelHaveInProcessingL1toL2")}
                  </Typography>
                )}
              </>
            )}
          </>
        )}
        <Box marginTop={1} display={"flex"} flexDirection={"column"}>
          <Typography variant={"body1"} color={"var(--color-text-third)"}>
            {t("labelBenefitL2")}
          </Typography>
          {/*<Typography variant={"body1"} color={"var(--color-text-third)"}>*/}
          {/*  By activating Loopring Layer2 account, you will be able to:*/}
          {/*</Typography>*/}
          {/*<ListStyle>*/}
          {/*  <ListItem>*/}
          {/*    <Typography*/}
          {/*      component={"span"}*/}
          {/*      variant={"body1"}*/}
          {/*      color={"textSecondary"}*/}
          {/*    >*/}
          {/*      100X Transaction fees are reduced of Loopring L2*/}
          {/*    </Typography>*/}
          {/*  </ListItem>*/}
          {/*  <ListItem>*/}
          {/*    <Typography*/}
          {/*      component={"span"}*/}
          {/*      variant={"body1"}*/}
          {/*      color={"textSecondary"}*/}
          {/*    >*/}
          {/*      ~2000 transactions per second of Loopring L2*/}
          {/*    </Typography>*/}
          {/*  </ListItem>*/}
          {/*  <ListItem>*/}
          {/*    <Typography*/}
          {/*      component={"span"}*/}
          {/*      variant={"body1"}*/}
          {/*      color={"textSecondary"}*/}
          {/*    >*/}
          {/*      Assets on Loopring L2 are equally secure as they are on the*/}
          {/*      Ethereum mainnet.*/}
          {/*    </Typography>*/}
          {/*  </ListItem>*/}
          {/*</ListStyle>*/}
        </Box>

        {!(
          chargeFeeTokenList.length === 0 ||
          walletMap === undefined ||
          account.isContract === undefined
        ) && (
          <Box marginTop={3}>
            {account?.isContract ? (
              <Button
                size={"large"}
                fullWidth
                onClick={goDisconnect}
                variant={"contained"}
              >
                {t("labelDisconnect")}
              </Button>
            ) : !!isFeeNotEnough ? (
              <Box display={"flex"}>
                <Box paddingRight={1} width={"50%"}>
                  <Button
                    size={"medium"}
                    variant={"contained"}
                    fullWidth
                    onClick={goSend}
                  >
                    {t("labelWaitingL1toL2")}
                  </Button>
                </Box>
                <Box width={"50%"} paddingLeft={1}>
                  <Button
                    size={"medium"}
                    variant={"contained"}
                    fullWidth
                    onClick={goSend}
                  >
                    {t("labelAddAssetGateBtn")}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button
                size={"large"}
                variant={"contained"}
                fullWidth
                onClick={goUpdateAccount}
              >
                {t("labelActiveLayer2PayBtn")}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
