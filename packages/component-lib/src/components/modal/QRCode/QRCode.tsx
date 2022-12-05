import { WithTranslation, withTranslation } from "react-i18next";
import QRCode, { BaseQRCodeProps } from "qrcode.react";
import styled from "@emotion/styled";
import { Box, Modal, Typography } from "@mui/material";
import { AModalProps, ModalQRCodeProps, QRCodeProps } from "./Interface";
import { ModalBackButton, ModalCloseButton } from "../../basic-lib";
import { ReactNode } from "react";

const ModalContentStyled = styled(Box)`
  & > div {
    background: var(--color-pop-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--modal-width);
  }
  &.guardianPop .content {
    padding-top: ${({ theme }) => 5 * theme.unit}px;
    border-radius: ${({ theme }) => theme.unit}px;
  }
`;

const AModalContentStyled = styled(Box)`
  & > div {
    background: var(--color-pop-bg);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${({ theme }) => theme.unit * 75}px;
  }
  &.guardianPop .content {
    padding-top: ${({ theme }) => 5 * theme.unit}px;
    border-radius: ${({ theme }) => theme.unit}px;
  }
`;

export const QRCodePanel = ({
  size = 160,
  // title,
  description,
  // fgColor = "#4169FF",
  // bgColor = "#fff",
  url = "https://exchange.loopring.io/",
}: // handleClick
QRCodeProps & Partial<BaseQRCodeProps>) => {
  if (url === undefined) {
    url = "";
  }
  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flexDirection={"column"}
    >
      {/* {title && (
        <Typography
          variant={"h4"}
          component="h3"
          className="modalTitle"
          marginBottom={3}
        >
          {title}
        </Typography>
      )} */}
      <QRCode
        value={url}
        size={size}
        // fgColor={fgColor}
        // bgColor={bgColor}
        style={{ 
          padding: 8, 
          // background: bgColor 
        }}
        aria-label={`link:${url}`}
      />
      {description && (
        <Typography variant={"body1"} marginBottom={3} marginTop={1}>
          {typeof description === 'string' 
            ? `${description.slice(0,6)}...${description.slice(description.length - 4)}`
            : description
          }
          {/* {description.slice(0,6)}...{} */}
        </Typography>
      )}
    </Box>
  );
};

export const Body = ({
  // size = 160,
  title,
  // description,
  // fgColor = "#4169FF",
  // bgColor = "#fff",
  children
}: {
  size: number,
  title: string,
  description: string,
  fgColor: string,
  bgColor: string,
  children: ReactNode,
}) => {
  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flexDirection={"column"}
    >
      {title && (
        <Typography
          variant={"h4"}
          component="h3"
          className="modalTitle"
          marginBottom={3}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
};

export const ModalQRCode = withTranslation("common")(
  ({
    onClose,
    open,
    t,
    ...rest
  }: ModalQRCodeProps &
    QRCodeProps &
    Partial<BaseQRCodeProps> &
    WithTranslation) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalContentStyled
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          className={rest.className}
        >
          <Box
            className={"content"}
            paddingTop={3}
            paddingBottom={3}
            display={"flex"}
            flexDirection={"column"}
          >
            <ModalCloseButton onClose={onClose} {...{ ...rest, t }} />
            <QRCodePanel {...{ ...rest, t }} />
          </Box>
        </ModalContentStyled>
      </Modal>
    );
  }
);

export const AModal = withTranslation("common")(
  ({
    onClose,
    open,
    body,
    title,
    onBack,
    showBackButton,
    t
  }: AModalProps & WithTranslation) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <AModalContentStyled
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          className={"guardianPop"}
        >
          <Box
            className={"content"}
            paddingTop={3}
            paddingBottom={3}
            display={"flex"}
            flexDirection={"column"}
          >
            {showBackButton && <ModalBackButton onBack={onBack}/>}
            <ModalCloseButton onClose={onClose} t={t} />
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              flexDirection={"column"}
            >
              {title && (
                <Typography
                  variant={"h4"}
                  component="h3"
                  className="modalTitle"
                  marginBottom={3}
                >
                  {title}
                </Typography>
              )}
              
            </Box>
            <Box paddingX={5}>{body}</Box>
          </Box>
        </AModalContentStyled>
      </Modal>
    );
  }
);
