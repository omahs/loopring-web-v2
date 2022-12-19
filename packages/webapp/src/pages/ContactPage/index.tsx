import { Box, Button, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { DataGridStyled, InputSearch, Table } from "@loopring-web/component-lib";
import DataGrid, { SortColumn } from "react-data-grid";

const ContactPageStyle = styled(Box)`
  background: var(--color-box);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
  border-radius: ${({ theme }) => theme.unit}px;
`

export const ContactPage = () => {
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
          onChange={() => {}}
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
    <Table
      generateRows={() => ['']}
      generateColumns={() => [['']]}
          // {...{
          //   ...defaultArgs,
          //   ...rest,
          // }}
          // {...defaultArgs}
          // {...rest}
      // t={t}
      // i18n={i18n}
      // tReady={tReady}
      // rowHeight={rowHeight}
      // headerRowHeight={headerRowHeight}
      // scroll={scroll}
      // rawData={rawData}
    />
    <DataGridStyled columns={[
      { key: 'id', name: 'ID' },
      { key: 'title', name: 'Title' }
    ]} rows={[{ id: 0, title: 'Example' },
    { id: 1, title: 'Demo' }]} />
    

  </ContactPageStyle>
};
