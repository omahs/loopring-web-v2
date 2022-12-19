import { Avatar, Box, Button, OutlinedInput, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { DataGridStyled, InputSearch, Table } from "@loopring-web/component-lib";
import DataGrid, { SortColumn } from "react-data-grid";
import { useTranslation } from "react-i18next";
import { ActiveIcon } from "@loopring-web/common-resources";

const ContactPageStyle = styled(Box)`
  background: var(--color-box);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
  border-radius: ${({ theme }) => theme.unit}px;
`

const Line = styled('div')`
  border-radius: ${({theme}) => theme.unit / 2}px;
  height: 1px;
  margin-top: ${({theme}) => theme.unit * 2}px;;
  background: var(--color-divide);
`;

export const ContactPage = () => {
  // const { t, i18n, ready } = useTranslation()
  const datas = [
    {
      name: 'Musk',
      address: '0xaaa',
      avatarURL: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
      editing: true
    },
    {
      name: 'Musk',
      address: '0xaaa',
      avatarURL: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
      editing: true
    }
  ]

  return <ContactPageStyle
    className={"MuiPaper-elevation2"}
    paddingX={4}
    paddingY={3}
  >
    <Box display={"flex"} justifyContent={"space-between"}>
      <Typography>Contacts</Typography>
      <Box display={"flex"}>
        <InputSearch
          value={"searchValue"}
          onChange={() => { }}
        />
        <Box marginLeft={2}>
          <Button
            variant={"contained"}
            size={"small"}>
            Add
          </Button>
        </Box>
      </Box>
    </Box>
    <Box className="table-divide">
      <Line />
      {datas.map(data => {
        const { editing, name, address, avatarURL } = data;
        return <Box paddingY={2} display={"flex"} justifyContent={"space-between"}>
          <Box display={"flex"}>
            <Avatar sizes={"32px"} src={avatarURL}></Avatar>
            <Box marginLeft={1}>
              {
                editing
                  ? <OutlinedInput size={"small"} value={name} />
                  : <Typography>{name}</Typography>
              }
              <Typography>{address}</Typography>
            </Box>
          </Box>
          <Box display={"flex"}>
            <Box marginRight={2}>
              <Button
                variant={"contained"}
                size={"small"}>
                Send
              </Button>
            </Box>
            <Box marginRight={2}>
              <Button
                variant={"outlined"}
                size={"medium"}>
                Transactions
              </Button>
            </Box>
            <Button
              variant={"outlined"}
              size={"medium"}>
              Delete
            </Button>
          </Box>
        </Box>
      })}
    </Box>
  </ContactPageStyle>
};
