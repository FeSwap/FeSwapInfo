import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Link, { CustomLink } from '../Link'
import { Divider } from '..'
import DoubleTokenLogo from '../DoubleLogo'
import { withRouter } from 'react-router-dom'
import { formattedNum, getFeSwapAppLink } from '../../utils'
import { AutoColumn } from '../Column'
import { RowFixed } from '../Row'
import { ButtonLight } from '../ButtonStyled'
import { TYPE } from '../../Theme'
import FormattedName from '../FormattedName'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 5px 0.5fr 0.5fr 1fr;
  grid-template-areas: 'number name0 name1 feswap';
  align-items: flex-start;
  padding: 20px 0;

  > * {
    justify-content: flex-end;
    width: 100%;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 35px 1fr 1fr 1fr;
    grid-template-areas: 'number name0 name1 feswap';
  }

  @media screen and (max-width: 740px) {
    grid-template-columns: 1fr 1fr 0.8fr;
    grid-template-areas: 'name0 name1 feswap';
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1fr 1fr 0.8fr;
    grid-template-areas: 'name0 name1 feswap';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  text-align: end;
  user-select: none;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  & > * {
    font-size: 1em;
  }

  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
`

const SORT_FIELD = {
  VALUE: 'VALUE',
  FESWAP_RETURN: 'FESWAP_RETURN',
}

function MiningPositionList({ miningPositions }) {
  // const below500 = useMedia('(max-width: 500px)')
  const below740 = useMedia('(max-width: 740px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.VALUE)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [miningPositions])

  useEffect(() => {
    if (miningPositions) {
      let extraPages = 1
      if (miningPositions.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(miningPositions.length / ITEMS_PER_PAGE) + extraPages || 1)
    }
  }, [miningPositions])

  const ListItem = ({ miningPosition, index }) => {
    if ((!miningPosition.pairData0) && (!miningPosition.pairData1))  return null
    const pairPercentage = (parseFloat(miningPosition.balance0) + parseFloat(miningPosition.balance1)) /
                          (parseFloat(miningPosition.pairData0.totalSupply) + parseFloat(miningPosition.pairData1.totalSupply))
    const valueUSD = parseFloat(miningPosition.pairData0.reserveUSD) + parseFloat(miningPosition.pairData1.reserveUSD)
    const valueFirstPair = parseFloat(miningPosition.pairData0.reserve0) + parseFloat(miningPosition.pairData1.reserve1)
    const valueSecondPair = parseFloat(miningPosition.pairData0.reserve1) +  parseFloat(miningPosition.pairData1.reserve0)

    const firstPairName0 = miningPosition.miningPool.pair0.token0
    const secondPairName0 = miningPosition.miningPool.pair0.token1
    const firstPairName1 = miningPosition.miningPool.pair1.token0
    const secondPairName1 = miningPosition.miningPool.pair1.token1

    const pairAddress0 = miningPosition.miningPool.pair0.id
    const pairAddress1 = miningPosition.miningPool.pair1.id

    const firstPairAddress0 = miningPosition.pairData0.token0.id
    const secondPairAddress0 = miningPosition.pairData0.token1.id
    const firstPairAddress1 = miningPosition.pairData1.token0.id
    const secondPairAddress1 = miningPosition.pairData1.token1.id

    return (
      <DashGrid style={{ opacity: pairPercentage > 0 ? 1 : 0.6 }} focus={true}>
        {!below740 && <DataText area="number">{index}</DataText>}
        <DataText area="name0" justifyContent="flex-start" alignItems="flex-start">
          <AutoColumn gap="8px" justify="flex-start" align="flex-start">
            <DoubleTokenLogo size={16} a0={firstPairAddress0} a1={secondPairAddress0} margin={!below740} />
          </AutoColumn>
          <AutoColumn gap="8px" justify="flex-start" style={{ marginLeft: '20px' }}>
            <CustomLink to={'/pair/' + pairAddress0}>
              <TYPE.main style={{ whiteSpace: 'nowrap' }} to={'/pair/'}>
                <FormattedName text={firstPairName0 + '-' + secondPairName0} maxCharacters={below740 ? 10 : 18} />
              </TYPE.main>
            </CustomLink>
            <AutoColumn gap="4px" justify="flex-start">
              <Link external href={getFeSwapAppLink(firstPairAddress0, secondPairAddress0)}>
                <ButtonLight style={{ padding: '3px 6px', borderRadius: '3px' }}>Stake More</ButtonLight>
              </Link>
              {pairPercentage > 0 && (
                <Link external href={getFeSwapAppLink(firstPairAddress0, secondPairAddress0)}>
                  <ButtonLight style={{ padding: '3px 6px', borderRadius: '3px' }}>Withdraw</ButtonLight>
                </Link>
              )}
            </AutoColumn>
          </AutoColumn>
        </DataText>
        <DataText area="name1" justifyContent="flex-start" alignItems="flex-start">
          <AutoColumn gap="8px" justify="flex-start" align="flex-start">
            <DoubleTokenLogo size={16} a0={firstPairAddress1} a1={secondPairAddress1} margin={!below740} />
          </AutoColumn>
          <AutoColumn gap="8px" justify="flex-start" style={{ marginLeft: '20px' }}>
            <CustomLink to={'/pair/' + pairAddress1}>
              <TYPE.main style={{ whiteSpace: 'nowrap' }} to={'/pair/'}>
                <FormattedName text={firstPairName1 + '-' + secondPairName1} maxCharacters={below740 ? 10 : 18} />
              </TYPE.main>
            </CustomLink>
            <AutoColumn gap="4px" justify="flex-start">
              <Link external href={getFeSwapAppLink(firstPairAddress1, secondPairAddress1)}>
                <ButtonLight style={{ padding: '3px 6px', borderRadius: '3px' }}>Stake More</ButtonLight>
              </Link>
              {pairPercentage > 0 && (
                <Link external href={getFeSwapAppLink(firstPairAddress1, secondPairAddress1)}>
                  <ButtonLight style={{ padding: '3px 6px', borderRadius: '3px' }}>Withdraw</ButtonLight>
                </Link>
              )}
            </AutoColumn>
          </AutoColumn>
        </DataText>
        <DataText area="feswap">
          <AutoColumn gap="12px" justify="flex-end">
            <TYPE.main>{formattedNum(pairPercentage * valueUSD, true, true)}</TYPE.main>
            <AutoColumn gap="12px" justify="flex-end">
              <RowFixed>
                <TYPE.small fontWeight={400}>{formattedNum(pairPercentage * parseFloat(valueFirstPair))} </TYPE.small>
                <FormattedName
                  text={firstPairName0}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={'11px'}
                />
              </RowFixed>
              <RowFixed>
                <TYPE.small fontWeight={400}>{formattedNum(pairPercentage * parseFloat(valueSecondPair))} </TYPE.small>
                <FormattedName
                  text={secondPairName0}
                  maxCharacters={below740 ? 10 : 18}
                  margin={true}
                  fontSize={'11px'}
                />
              </RowFixed>
            </AutoColumn>
          </AutoColumn>
        </DataText>
      </DashGrid>
    )
  }

  const miningPositionsSorted =
    miningPositions &&
    miningPositions

      .sort((p0, p1) => {
        if (sortedColumn === SORT_FIELD.VALUE) {
          const bal0 = (p0.balance / p0.pairData0?.totalSupply) * p0.pairData0?.reserveUSD
          const bal1 = (p0.balance / p0.pairData0?.totalSupply) * p1.pairData0?.reserveUSD
          return bal0 > bal1 ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1
        }
        return 1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((miningPosition, index) => {
        return (
          <div key={index}>
            <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} miningPosition={miningPosition} />
            <Divider />
          </div>
        )
      })

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '32px', padding: 0 }}>
        {!below740 && (
          <Flex alignItems="flex-start" justifyContent="flexStart">
            <TYPE.main area="number">#</TYPE.main>
          </Flex>
        )}
        <Flex alignItems="flex-start" justifyContent="flex-start">
          <TYPE.main area="number">Pair</TYPE.main>{' '}
        </Flex>
        <Flex alignItems="flex-start" justifyContent="flex-start">
          <TYPE.main area="number">Twin Pair</TYPE.main>{' '}
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="feswap"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.VALUE)
              setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection)
            }}
          >
            {below740 ? 'Value' : 'Liquidity'} {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
      </DashGrid>
      <Divider />
      <List p={0}>{!miningPositionsSorted ? <LocalLoader /> : miningPositionsSorted}</List>
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default withRouter(MiningPositionList)
