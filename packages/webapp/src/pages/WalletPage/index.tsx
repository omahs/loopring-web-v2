import { useTranslation, WithTranslation, withTranslation } from "react-i18next";
import React, { MouseEventHandler, useCallback } from "react";
import {
  AccountStatus,
  AddIcon,
  ApprovalIcon,
  CopyIcon,
  copyToClipBoard,
  ExitIcon,
  HelpIcon,
  LockIcon,
  LockIcon2,
  RightArrowIcon,
  RightIcon,
  RoundAddIcon,
  SoursURL,
  subMenuGuardian,
  ViewHistoryIcon,
} from "@loopring-web/common-resources";
import { Box, Button, Grid, IconButton, Link, Tooltip, Typography } from "@mui/material";
import {
  AModal,
  EmptyDefault,
  GuardianStep,
  ModalCloseButton,
  ModalQRCode,
  QRCodePanel,
  SubMenu,
  SubMenuList,
  SwitchPanelStyled,
  useSettings,
} from "@loopring-web/component-lib";
import { useAccount, BtnConnectL1, StylePaper, LoopringAPI } from "@loopring-web/core";
import { useRouteMatch } from "react-router-dom";
import { TxHebaoAction, useHebaoMain } from "./hook";
import { ModalLock } from "./modal";
import { WalletHistory } from "./WalletHistory";
import { WalletValidationInfo } from "./WalletValidationInfo";
import { WalletProtector } from "./WalletProtector";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Guardian, HebaoOperationLog, Protector } from "@loopring-web/loopring-sdk";
import moment from "moment";

const VCODE_UNIT = 6;

const WrongStatusStyled = styled(Box)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding: ${({ theme }) => theme.unit * 10}px auto;
  background-color: ${({ theme }) => theme.colorBase.box};
  .logo{
    width: ${({ theme }) => theme.unit * 8}px;
    height: ${({ theme }) => theme.unit * 8}px;
    margin-bottom: ${({ theme }) => theme.unit * 8}px;
  }
  .content{
    text-align: center;
    color: ${({ theme }) => theme.colorBase.textSecondary};
    width: ${({ theme }) => theme.unit * 50}px;
    margin-bottom: ${({ theme }) => theme.unit * 8}px;
  }
  .button{
    color: ${({ theme }) => theme.colorBase.textSecondary};
  }
`

const WrongStatus = ({ logo, content, onClickDisconnect }: { logo: string, content: string, onClickDisconnect: MouseEventHandler }) => {
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
  padding: ${({ theme }) => theme.unit * 4}px;
  padding-top: auto;
  padding-bottom: auto;
  background: ${({ theme }) => theme.colorBase.box};
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  width: ${({ theme }) => theme.unit * 60}px;
  height: ${({ theme }) => theme.unit * 12}px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Section = ({ logo, title, description, onClick }: { logo: JSX.Element, title: string, description?: string, onClick: MouseEventHandler }) => {
  return <>
    <SectionStyled onClick={onClick}>
      <Box display={"flex"} alignItems={"center"}>
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

const WalletProtectors = ({ protectorList }: { protectorList: Protector[] }) => {
  const { t } = useTranslation();
  if (protectorList.length === 0) {
    return <Box flex={1} height={"100%"} width={"100%"}>
      <EmptyDefault
        style={{ alignSelf: "center" }}
        height={"100%"}
        message={() => (
          <Box
            flex={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {t("labelNoContent")}
          </Box>
        )}
      />
    </Box>
  } else {
    return <>
      {protectorList.map(x => <>
        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} marginBottom={4}>
          <Box>
            {/* todo: Unknown translation */}
            <Typography variant={"h6"}>{x.ens ? x.ens : 'Unknown'}</Typography>
            <Typography color={"var(--color-text-third)"}>{x.address}</Typography>
          </Box>
          <Button variant={"outlined"} size={"medium"} color={"secondary"}>Lock Wallet</Button>
        </Box>
      </>)}
    </>

  }
  
}

const RqeusetApprovals = ({ guardiansList }: { guardiansList: Guardian[] }) => {
  const {t} = useTranslation();
  return guardiansList.length !== 0 ? <>
    {guardiansList.map((guardian, index) => {
      return (
        <Box
          key={guardian.address + index}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          marginBottom={4}
        >
          <Box>
            <Typography variant={"h6"}>Request for Wallet Recovery</Typography>
            <Typography variant={"h6"}>
              {/* todo: Unknown translation */}
              {guardian.ens ? guardian.ens : 'Unknown'} /
              <Typography component={"span"} color={"var(--color-text-third)"}>{guardian.address && `${guardian.address.slice(0, 6)}...${guardian.address.slice(guardian.address.length - 4,)}`}</Typography>
            </Typography>
          </Box>
          <Box>
            <Box display={"inline-block"} marginRight={2}><Button variant={"outlined"} size={"medium"}>Approve</Button></Box>

            <Button variant={"outlined"} size={"medium"}>Reject</Button>
          </Box>
        </Box>
      );
    })}
  </> : (
    <Box flex={1} height={"100%"} width={"100%"}>
      <EmptyDefault
        style={{ alignSelf: "center" }}
        height={"100%"}
        message={() => (
          <Box
            flex={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {t("labelNoContent")}
          </Box>
        )}
      />
    </Box>
  )
}
const History = ({ operationLogList}: { operationLogList: HebaoOperationLog[] }) => {
  operationLogList = [
    {status: 1, createdAt: 0, ens: 'ens', from: '111',hebaoTxType: 1, to: '111', id: 1},
    {status: 1, createdAt: 0, ens: 'ens', from: '111',hebaoTxType: 1, to: '111', id: 1},
  ]
  const {t} = useTranslation();
  return operationLogList.length !== 0 ? <>
    {operationLogList.map((log, index) => {
      return (
        <Box
          key={log.id}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          marginBottom={4}
        >
          <Box>
            <Typography variant={"h6"}>{log.status === TxHebaoAction.Approve ? '授权' : '拒绝'}{log.ens ? log.ens : 'Unknow'}为守护人</Typography>
            <Typography variant={"h6"}>
              {moment(
                new Date(log.createdAt),
                "YYYYMMDDHHMM"
              ).fromNow()}
            </Typography>
          </Box>
        </Box>
      );
    })}
  </> : (
    <Box flex={1} height={"100%"} width={"100%"}>
      <EmptyDefault
        style={{ alignSelf: "center" }}
        height={"100%"}
        message={() => (
          <Box
            flex={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            {t("labelNoContent")}
          </Box>
        )}
      />
    </Box>
  )
}

const YoStyled = styled(Box)`
  display: flex;
  /* justify-content: center; */
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding: ${({ theme }) => theme.unit * 10}px auto;
  /* background-color: ${({ theme }) => theme.colorBase.box}; */
  /* .logo{
    width: ${({ theme }) => theme.unit * 8}px;
    height: ${({ theme }) => theme.unit * 8}px;
    margin-bottom: ${({ theme }) => theme.unit * 8}px;
  }
  .content{
    text-align: center;
    color: ${({ theme }) => theme.colorBase.textSecondary};
    width: ${({ theme }) => theme.unit * 50}px;
    margin-bottom: ${({ theme }) => theme.unit * 8}px;
  }
  .button{
    color: ${({ theme }) => theme.colorBase.textSecondary};
  } */
`

const Yo = () => {
  return <YoStyled marginTop={2}>
    <Section onClick={() => { }} title={"Set as Guardian"} logo={<RoundAddIcon htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
    <Section description={"Who I Protect"} onClick={() => { }} title={"Lock/unlock Wallet"} logo={<LockIcon2 htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
    <Section description={"Guardian Request Handling"} onClick={() => { }} title={"Approve Requests"} logo={<ApprovalIcon htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
    <Section description={"Guardian Handling Records"} onClick={() => { }} title={"View History"} logo={<ViewHistoryIcon htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
  </YoStyled>
}

const InputCodeStyle = styled(Box)`
  margin-bottom: ${({ theme }) => theme.unit * 11}px;
  .code-input {
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  //.code-label {
  //  margin-bottom: 16px;
  //}
  //.code-inputs {
  //  display: flex;
  //  justify-content: start;
  //  align-items: center;
  //}
  .code-inputs input {
    border: none;
    color: var(--color-text-third);
    background-color: var(--field-opacity);
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    text-align: center;
    height: 60px;
    width: 40px;
    border-radius: 4px;
    margin: 0 4px;
    border: 1px solid var(--color-border);
    font-size: 38px;
  }
  .code-inputs input:focus {
    outline: none;
  }
  .code-inputs input:first-of-type {
    margin-left: 24px;
  }
  .code-inputs input:nth-of-type(3n) {
    margin-right: 24px;
  }
` as typeof Box;

const InputCode = ({
  length,
  loading,
  onComplete,
}: {
  length: number;
  loading: boolean;
  onComplete: (code: string) => void;
}) => {
  const [code, setCode] = React.useState([...Array(length)].map(() => ""));
  const inputs = React.useRef([]);
  // Typescript
  // useRef<(HTMLInputElement | null)[]>([])

  const processInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: number
  ) => {
    const num = e.target.value;
    if (/[^0-9]/.test(num)) return;
    const newCode = [...code];
    newCode[slot] = num;
    setCode(newCode);
    if (slot !== length - 1) {
      // @ts-ignore
      inputs.current[slot + 1].focus();
    }
    if (newCode.every((num) => num !== "")) {
      onComplete(newCode.join(""));
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, slot: number) => {
    if (e.keyCode === 8 && !code[slot] && slot !== 0) {
      const newCode = [...code];
      newCode[slot - 1] = "";
      setCode(newCode);
      // @ts-ignore
      inputs.current[slot - 1].focus();
    }
  };

  return (
    <InputCodeStyle
      className="code-input"
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      {/*<label className="code-label">{label}</label>*/}
      <Box
        className="code-inputs"
        display={"flex"}
        justifyContent={"start"}
        alignItems={"center"}
      >
        {code.map((num, idx) => {
          return (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={num}
              autoFocus={!code[0].length && idx === 0}
              readOnly={loading}
              onChange={(e) => processInput(e, idx)}
              onKeyUp={(e) => onKeyUp(e, idx)}
              // @ts-ignore
              ref={(ref) => ref && inputs.current.push(ref)}
            />
          );
        })}
      </Box>
    </InputCodeStyle>
  );
};


export const GuardianPage = withTranslation(["common"])(
  ({ t, ..._rest }: WithTranslation) => {
    const { account } = useAccount();
    let match = useRouteMatch("/guardian/:item");
    const [openQRCode, setOpenQRCode] = React.useState(false);
    const onOpenAdd = React.useCallback((open: boolean) => {
      setOpenQRCode(open);
    }, []);
    const [showHistory, setShowHistory] = React.useState(false);
    const onOpenHistory = React.useCallback((open: boolean) => {
      setShowHistory(open);
    }, []);
    const [showApprovalRequests, setShowApprovalRequests] = React.useState(false);
    const onOpenApprovalRequests = React.useCallback((open: boolean) => {
      setShowApprovalRequests(open);
    }, []);

    const [showLockWallet, setShowLockWallet] = React.useState(false);
    const onOpenLockWallet = React.useCallback((open: boolean) => {
      setShowLockWallet(open);
    }, []);
    const [showCodeInput, setShowCodeInput] = React.useState(false);
    const onOpenCodeInput = React.useCallback((open: boolean) => {
      setShowCodeInput(open);
    }, []);

    // const openQRCode = match?.params['item'] === 'add-guardian';
    // if (match?.params?['item'] === 'add-guardian') {
    //   openQRCode
    // }
    // const description = () => (
      
    //   // <Typography
    //   //   marginTop={2}
    //   //   component={"div"}
    //   //   textAlign={"center"}
    //   //   variant={"body2"}
    //   // >
    //   //   <Typography
    //   //     color={"var(--color-text-secondary)"}
    //   //     component={"p"}
    //   //     variant={"inherit"}
    //   //   >
          
    //   //     {account?.accAddress}
    //   //     <IconButton>
    //   //       <CopyIcon />
    //   //     </IconButton>
    //   //     {/* {account?.accAddress && `${account?.accAddress.slice(0,6)}...${account?.accAddress.slice(account?.accAddress.length - 4)}`} */}
    //   //   </Typography>
    //   // </Typography>
    // );
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
    // address
    // : 
    // "0x2bbb00232bead228973528dc7590fcb366bb9856"
    // ens
    // : 
    // "testtest.loopring.eth"
    // lockStatus
    // : 
    // "LOCKED"
    // protectList[0].
    console.log('protectList', protectList)
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
            '1'
            // <WalletValidationInfo
            //   onOpenAdd={onOpenAdd}
            //   isContractAddress={isContractAddress}
            //   // isLoading={isLoading}
            //   {...{ guardiansList, guardianConfig, setOpenHebao }}
            //   handleOpenModal={handleOpenModal}
            //   loadData={loadData}
            // />
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
            '1'
            // <WalletProtector
            //   onOpenAdd={onOpenAdd}
            //   protectList={protectList}
            //   guardianConfig={guardianConfig}
            //   loadData={loadData}
            //   isContractAddress={isContractAddress}
            //   // isContractAddress={isContractAddress}
            //   handleOpenModal={handleOpenModal}
            // />
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
            ? <WrongStatus
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
    const theme = useTheme()
    const onClickCopy = useCallback((str: string) => {
      copyToClipBoard(str)
    }, [])
    return <>
      {/* <ModalQRCode
        open={openQRCode}
        fgColor={"#000"}
        bgColor={"#fff"}
        className={"guardianPop"}
        onClose={() => onOpenAdd(false)}
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
        description={
          <Button>
            <Typography
              marginTop={2}
              component={"div"}
              variant={"body2"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography
                color={"var(--color-text-secondary)"}
                component={"p"}
                variant={"inherit"}
                display={"flex"}
                alignItems={"center"}
              >
                <Typography marginRight={0.5}>{account?.accAddress}</Typography>

                <CopyIcon />
              </Typography>
            </Typography>
          </Button>
        }
        url={`ethereum:${account?.accAddress}?type=${account?.connectName}&action=HebaoAddGuardian`}
      /> */}
      <AModal
        open={openQRCode}
        onClose={() => onOpenAdd(false)}
        title={
          <Typography component={"p"} textAlign={"center"} marginBottom={1}>
            
            <Typography
              color={"var(--color-text-primary)"}
              component={"p"}
              variant={"h4"}
              marginBottom={2}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              {t("labelWalletAddAsGuardian")}
              <Tooltip title={'Easily add other Loopring Wallets as Guardians to secure your identity and crypto assets. After entering the wallet address, the user will receive a notification of the request directly in their Loopring Wallet app. Invite your friends and family to use the Loopring Wallet.'}>
                <Box marginLeft={1} display={"flex"} alignItems={"center"}>
                  <HelpIcon fontSize="large" />
                </Box>
              </Tooltip>
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
        body={
          <QRCodePanel
            description={
              <Button onClick={() => account?.accAddress && onClickCopy(account?.accAddress)}>
                <Typography
                  marginTop={2}
                  component={"div"}
                  variant={"body2"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Typography
                    color={"var(--color-text-secondary)"}
                    component={"p"}
                    variant={"inherit"}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <Typography marginRight={0.5}>{account?.accAddress}</Typography>

                    <CopyIcon />
                  </Typography>
                </Typography>
              </Button>}
            size={260}
            url={`ethereum:${account?.accAddress}?type=${account?.connectName}&action=HebaoAddGuardian`}
          />
        }
      />
      <AModal
        open={showLockWallet}
        onClose={() => onOpenLockWallet(false)}
        title={
          <Typography component={"p"} textAlign={"center"} marginBottom={1}>
            <Typography
              color={"var(--color-text-primary)"}
              component={"p"}
              variant={"h4"}
              marginBottom={2}
            >
              Lock/unlock Wallet
            </Typography>
            <Typography
              color={"var(--color-text-secondary)"}
              component={"p"}
              variant={"body1"}
              marginBottom={2}
            >
              Who I Protect
            </Typography>
          </Typography>
        }
        body={<WalletProtectors protectorList={protectList}></WalletProtectors>}
      />
      <AModal
        open={showApprovalRequests}
        onClose={() => onOpenApprovalRequests(false)}
        title={
          <Typography component={"p"} textAlign={"center"} marginBottom={1}>
            <Typography
              color={"var(--color-text-primary)"}
              component={"p"}
              variant={"h4"}
              marginBottom={2}
            >
              Approval Requests
            </Typography>
            <Typography
              color={"var(--color-text-secondary)"}
              component={"p"}
              variant={"body1"}
              marginBottom={2}
            >
              Guardian Request Handling
            </Typography>
          </Typography>
        }
        body={<RqeusetApprovals guardiansList={guardiansList} />}
      />
      <AModal
        open={showCodeInput}
        showBackButton
        onBack={() => {alert('todo')}}
        onClose={() => onOpenApprovalRequests(false)}
        title={
          <Typography component={"p"} textAlign={"center"} marginBottom={1}>
            <Typography
              color={"var(--color-text-primary)"}
              component={"p"}
              variant={"h4"}
              marginBottom={2}
            >
              Large amount approval request
            </Typography>
            <Typography
              color={"var(--color-text-secondary)"}
              component={"p"}
              variant={"body1"}
              marginBottom={2}
            >
              todo
            </Typography>
          </Typography>
        }
        body={
          <Box flexDirection={"column"} display={"flex"} alignItems={"center"}>
            <InputCode
              length={VCODE_UNIT}
              // onComplete={submitApprove}
              loading={false}

            />
            <Button
              style={{
                width: `${theme.unit * 39}px`
              }}
              variant={"contained"}

            >Agree</Button>
          </Box>
        }
      />
      <AModal
        open={showHistory}
        onClose={() => onOpenHistory(false)}
        title={
          <Typography component={"p"} textAlign={"center"} marginBottom={1}>
            <Typography
              color={"var(--color-text-primary)"}
              component={"p"}
              variant={"h4"}
              marginBottom={2}
            >
              View History
            </Typography>
          </Typography>
        }
        body={<History operationLogList={operationLogList}/>}
      />
      <YoStyled marginTop={2}>
        <Section onClick={() => onOpenAdd(true)} title={"Set as Guardian"} logo={<RoundAddIcon htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
        <Section description={"Who I Protect"} onClick={() => onOpenLockWallet(true)} title={"Lock/unlock Wallet"} logo={<LockIcon2 htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
        <Section description={"Guardian Request Handling"} onClick={() => onOpenApprovalRequests(true)} title={"Approve Requests"} logo={<ApprovalIcon htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
        <Section description={"Guardian Handling Records"} onClick={() => onOpenHistory(true)} title={"View History"} logo={<ViewHistoryIcon htmlColor="var(--color-text-primary)" style={{ width: "var(--svg-size-cover)", height: "var(--svg-size-cover)" }} />} />
      </YoStyled>
      {/* <Yo /> */}
    </>


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
          open={openHebao.isShow}
          step={openHebao.step}
          handleOpenModal={handleOpenModal}
          onClose={() => {
            setOpenHebao({
              isShow: false,
              step: GuardianStep.LockAccount_WaitForAuth,
            });
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
