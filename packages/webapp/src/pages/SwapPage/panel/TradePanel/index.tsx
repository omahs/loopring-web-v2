import { useCallback, useEffect, useState } from 'react'

import { Tabs } from '@mui/material'
import { Tab } from '@mui/material'
import styled from '@emotion/styled'

import { RawDataTradeItem, TradeTable, } from '@loopring-web/component-lib'
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router'
import { TableWrapStyled } from '../../../styled';
import { Divider } from '@mui/material'
import store from 'stores'

const TabsStyled = styled(Tabs)`
  margin-left: ${({theme}) => theme.unit}px;
`
const applyProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

const RowConfig = {
    rowHeight:44,
    headerRowHeight:44,
}
const tableHeight = RowConfig.headerRowHeight + 15 *  RowConfig.rowHeight;


const TradePanel = withTranslation('common')(
    // withRouter(
    (
        {tradeArray, myTradeArray, t}:
            { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] } & WithTranslation & RouteComponentProps) => {
        const [value, setValue] = useState(1)
        // const [tableHeight, setTableHeight] = useState(0);
        const handleChange = (event: any, newValue: any) => {
            setValue(newValue)
        }
        const { tokenMap } = store.getState().tokenMap

        return (<TableWrapStyled alignSelf={'stretch'} xs={12} marginY={2} paddingBottom={2} flex={1}
                                 className={'MuiPaper-elevation2'}>
                <TabsStyled value={value}
                            onChange={handleChange}
                            aria-label="tabs switch">
                    <Tab label={t('labelRecent')}   {...applyProps(0)} />
                    <Tab label={t('labelMyTrade')} {...applyProps(1)} />
                </TabsStyled>
                <Divider style={{marginTop:'-1px'}}/>
                {value === 1?
                    <TradeTable
                        rowHeight={RowConfig.rowHeight}
                        headerRowHeight={RowConfig.headerRowHeight}
                        rawData={myTradeArray}
                        pagination={{pageSize:14}}
                        tokenMap={tokenMap}
                        currentheight={tableHeight - RowConfig.rowHeight}/>:
                    <TradeTable
                        rowHeight={RowConfig.rowHeight}
                        headerRowHeight={RowConfig.headerRowHeight}
                        rawData={tradeArray}
                        tokenMap={tokenMap}
                        currentheight={tableHeight}/>
                }

            </TableWrapStyled>
        )
    }
) as (props: { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] }) => JSX.Element;
//)

export default TradePanel

