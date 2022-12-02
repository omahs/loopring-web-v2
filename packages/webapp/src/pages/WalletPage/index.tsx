import { WithTranslation, withTranslation } from "react-i18next";
import React, { MouseEventHandler } from "react";
import {
  AccountStatus,
  AddIcon,
  ApprovalIcon,
  ExitIcon,
  LockIcon,
  LockIcon2,
  RightArrowIcon,
  RightIcon,
  RoundAddIcon,
  SoursURL,
  subMenuGuardian,
  ViewHistoryIcon,
} from "@loopring-web/common-resources";
import { Box, Button, Link, Typography } from "@mui/material";
import {
  GuardianStep,
  ModalQRCode,
  SubMenu,
  SubMenuList,
  useSettings,
} from "@loopring-web/component-lib";
import { useAccount, BtnConnectL1, StylePaper } from "@loopring-web/core";
import { useRouteMatch } from "react-router-dom";
import { useHebaoMain } from "./hook";
import { ModalLock } from "./modal";
import { WalletHistory } from "./WalletHistory";
import { WalletValidationInfo } from "./WalletValidationInfo";
import { WalletProtector } from "./WalletProtector";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

const WrongStatusStyled = styled(Box)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding: ${({theme}) => theme.unit * 10}px auto;
  background-color: ${({theme}) => theme.colorBase.box};
  .logo{
    width: ${({theme}) => theme.unit * 8}px;
    height: ${({theme}) => theme.unit * 8}px;
    margin-bottom: ${({theme}) => theme.unit * 8}px;
  }
  .content{
    text-align: center;
    color: ${({theme}) => theme.colorBase.textSecondary};
    width: ${({theme}) => theme.unit * 50}px;
    margin-bottom: ${({theme}) => theme.unit * 8}px;
  }
  .button{
    color: ${({theme}) => theme.colorBase.textSecondary};
  }
`

const WrongStatus = ({ logo, content, onClickDisconnect }: { logo: string, content: string, onClickDisconnect: MouseEventHandler}) => {
  return <WrongStatusStyled>
    <img className={"logo"} src={logo} />
    <Typography className={"content"}>
      {content}
    </Typography>
    <Button className={"button"} onClick={onClickDisconnect}>
      <ExitIcon />
      <Typography marginLeft={0.5}>
        Disconnect
      </Typography>
    </Button>
  </WrongStatusStyled>
}

const SectionStyled = styled(Box)`
  padding: auto ${({theme}) => theme.unit * 4}px;
  background: ${({theme}) => theme.colorBase.box};
  margin-bottom: ${({theme}) => theme.unit * 2}px;
  width: ${({theme}) => theme.unit * 60}px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Section = ({logo, title, description, onClick} : {logo: JSX.Element, title: string, description?: string, onClick: MouseEventHandler}) => {
  return <>
    <SectionStyled onClick={onClick}>
      <Box display={"flex"}  alignItems={"center"}>
        {logo}
        <Box paddingLeft={3}>
          <Typography variant={"h4"}>{title}</Typography> 
          {description && <Typography color={"var(--color-text-third) "}>{description}</Typography>}
        </Box>
        
      </Box>
      <RightIcon />
    </SectionStyled>
  </>
}

const YoStyled = styled(Box)`
  display: flex;
  /* justify-content: center; */
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding: ${({theme}) => theme.unit * 10}px auto;
  /* background-color: ${({theme}) => theme.colorBase.box}; */
  /* .logo{
    width: ${({theme}) => theme.unit * 8}px;
    height: ${({theme}) => theme.unit * 8}px;
    margin-bottom: ${({theme}) => theme.unit * 8}px;
  }
  .content{
    text-align: center;
    color: ${({theme}) => theme.colorBase.textSecondary};
    width: ${({theme}) => theme.unit * 50}px;
    margin-bottom: ${({theme}) => theme.unit * 8}px;
  }
  .button{
    color: ${({theme}) => theme.colorBase.textSecondary};
  } */
`

const Yo = () => {
  return <YoStyled marginTop={2}>
    <Section onClick={() => {}} title={"Set as Guardian"} logo={<RoundAddIcon style={{width: "var(--svg-size-cover)", height: "var(--svg-size-cover)"}}  />} />
    <Section description={"Who I Protect"} onClick={() => {}} title={"Lock/unlock Wallet"}  logo={<LockIcon2 style={{width: "var(--svg-size-cover)", height: "var(--svg-size-cover)"}}/>} />
    <Section description={"Guardian Request Handling"} onClick={() => {}} title={"Approve Requests"} logo={<ApprovalIcon style={{width: "var(--svg-size-cover)", height: "var(--svg-size-cover)"}} />} />
    <Section description={"Guardian Handling Records"} onClick={() => {}} title={"View History"} logo={<ViewHistoryIcon style={{width: "var(--svg-size-cover)", height: "var(--svg-size-cover)"}} />} />
  </YoStyled>
}

export const GuardianPage = withTranslation(["common"])(
  ({ t, ..._rest }: WithTranslation) => {
    const { account } = useAccount();
    let match = useRouteMatch("/guardian/:item");
    const [openQRCode, setOpenQRCode] = React.useState(false);
    const onOpenAdd = React.useCallback(() => {
      setOpenQRCode(true);
    }, []);
    const description = () => (
      <Typography
        marginTop={2}
        component={"div"}
        textAlign={"center"}
        variant={"body2"}
      >
        <Typography
          color={"var(--color-text-secondary)"}
          component={"p"}
          variant={"inherit"}
        >
          {account?.accAddress}
        </Typography>
      </Typography>
    );
    // @ts-ignore
    const selected = match?.params?.item ?? "myProtected";
    const {
      protectList,
      guardiansList,
      guardianConfig,
      openHebao,
      operationLogList,
      setOpenHebao,
      loadData,
      isLoading,
      isContractAddress,
    } = useHebaoMain();

    const handleOpenModal = ({
      step,
      options,
    }: {
      step: GuardianStep;
      options?: any;
    }) => {
      setOpenHebao((state) => {
        state.isShow = true;
        state.step = step;
        state.options = {
          ...state.options,
          ...options,
        };
        return { ...state };
      });
    };
    const isSmartContractWallet = true
    const guardianRouter = (isLoading: boolean) => {
      switch (selected) {
        case "guardian-validation-info":
          return !!isLoading ? (
            <Box
              flex={1}
              height={"100%"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <img
                className="loading-gif"
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          ) : !isContractAddress ? (
            <WalletValidationInfo
              onOpenAdd={onOpenAdd}
              isContractAddress={isContractAddress}
              // isLoading={isLoading}
              {...{ guardiansList, guardianConfig, setOpenHebao }}
              handleOpenModal={handleOpenModal}
              loadData={loadData}
            />
          ) : (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                margin={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("labelWalletToWallet")}
              </Typography>
            </Box>
          );
        case "guardian-history":
          return (
            <WalletHistory
              operationLogList={operationLogList}
              guardianConfig={guardianConfig}
            />
          );
        case "guardian-protected":
        default:
          return !!isLoading ? (
            <Box
              flex={1}
              height={"100%"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <img
                className="loading-gif"
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          ) : !isContractAddress ? (
            <WalletProtector
              onOpenAdd={onOpenAdd}
              protectList={protectList}
              guardianConfig={guardianConfig}
              loadData={loadData}
              isContractAddress={isContractAddress}
              // isContractAddress={isContractAddress}
              handleOpenModal={handleOpenModal}
            />
          ) : (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                margin={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("labelWalletToWallet")}
              </Typography>
            </Box>
          );
      }
    };
    const { isMobile } = useSettings();
    account.readyState = AccountStatus.UN_CONNECT
    const viewTemplate = React.useMemo(() => {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginTop={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleConnectToWalletAsGuardian")}
              </Typography>

              <Link
                marginY={2}
                variant={"body1"}
                textAlign={"center"}
                color={"textSecondary"}
                target="_blank"
                rel="noopener noreferrer"
                href={"./#/document/walletdesign_en.md"}
              >
                {t("describeWhatIsGuardian")}
              </Link>
              <BtnConnectL1 />
            </Box>
          );
          break;
        case AccountStatus.LOCKED:
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.NOT_ACTIVE:
        case AccountStatus.DEPOSITING:
        case AccountStatus.ACTIVATED:
          return isSmartContractWallet 
          ?  <WrongStatus 
              logo={"https://www.baidu.com/img/flexible/logo/pc/index_gray.png"}
              content={"The connected wallet is a Loopring Smart Wallet. Please use your Loopring Wallet mobile app to add Guardians."}
              onClickDisconnect={() => {

              }}
            />
          : (
            <>
              <Box
                width={"200px"}
                display={"flex"}
                justifyContent={"stretch"}
                marginRight={3}
                marginBottom={2}
                className={"MuiPaper-elevation2"}
              >
                <SubMenu>
                  <SubMenuList
                    selected={selected}
                    subMenu={subMenuGuardian as any}
                  />
                </SubMenu>
              </Box>
              <StylePaper
                minHeight={420}
                display={"flex"}
                alignItems={"stretch"}
                flexDirection={"column"}
                marginTop={0}
                flex={1}
                marginBottom={2}
                className={"MuiPaper-elevation2"}
              >
                {guardianRouter(isLoading)}
              </StylePaper>
            </>
          );
          break;
        case AccountStatus.ERROR_NETWORK:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleOnErrorNetwork", {
                  connectName: account.connectName,
                })}
              </Typography>
            </Box>
          );
          break;
        default:
          break;
      }
    }, [
      account.readyState,
      account.connectName,
      t,
      selected,
      isLoading,
      guardianRouter,
    ]);
    return <Yo/>
    // return (
    //   <WrongStatus
    //     content={"The connected wallet is a Loopring Smart Wallet. Please use your Loopring Wallet mobile app to add Guardians."}
    //     logo={"https://www.baidu.com/img/flexible/logo/pc/index_gray.png"}
    //     onClickDisconnect={() => {

    //     }}
    //   />
    // )
    
    return (
      <>
        <ModalQRCode
          open={openQRCode}
          fgColor={"#000"}
          bgColor={"#fff"}
          className={"guardianPop"}
          onClose={() => setOpenQRCode(false)}
          title={
            <Typography component={"p"} textAlign={"center"} marginBottom={1}>
              <Typography
                color={"var(--color-text-primary)"}
                component={"p"}
                variant={"h4"}
                marginBottom={2}
              >
                {t("labelWalletAddAsGuardian")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                component={"p"}
                variant={"body1"}
                marginBottom={2}
              >
                {t("labelWalletScanQRCode")}
              </Typography>
            </Typography>
          }
          size={260}
          description={description()}
          url={`ethereum:${account?.accAddress}?type=${account?.connectName}&action=HebaoAddGuardian`}
        />
        <ModalLock
          options={openHebao.options ?? {}}
          {...{
            open: openHebao.isShow,
            step: openHebao.step,
            handleOpenModal,
            onClose: () => {
              setOpenHebao({
                isShow: false,
                step: GuardianStep.LockAccount_WaitForAuth,
              });
            },
          }}
        />
        <>
        
        {
        viewTemplate
        }
        </>
      </>
    );
  }
);
