import React from 'react'
import { TableCardBody } from 'components/common/TableCardBody'
import { Slot } from 'components/common/Slot'
import {
  ClusterStatsStatus,
  useDashboardInfo,
  usePerformanceInfo,
  useStatsProvider,
} from 'providers/stats/solanaClusterStats'
import { abbreviatedNumber, lamportsToSol } from 'utils'
import { ClusterStatus, useCluster } from 'providers/cluster'
import { TopAccountsCard } from 'components/TopAccountsCard'
import { displayTimestampWithoutDate, displayTimestampUtc } from 'utils/date'
import { Status, useFetchSupply, useSupply } from 'providers/supply'
import { ErrorCard } from 'components/common/ErrorCard'
import { LoadingCard } from 'components/common/LoadingCard'
import { useVoteAccounts } from 'providers/accounts/vote-accounts'
import { CoingeckoStatus, useCoinGecko } from 'utils/coingecko'

const CLUSTER_STATS_TIMEOUT = 5000

export function ClusterStatsPage() {
  return (
    <div className="container mt-4">
      <StakingComponent />
      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col">
              <h4 className="card-header-title">Live Network Stats</h4>
            </div>
          </div>
        </div>
        <StatsCardBody />
      </div>
      {/* <TpsCard /> */}
      <TopAccountsCard />
    </div>
  )
}

function StakingComponent() {
  const { status } = useCluster()
  const supply = useSupply()
  const fetchSupply = useFetchSupply()
  const coinInfo = useCoinGecko('solana')
  const { fetchVoteAccounts } = useVoteAccounts()

  function fetchData() {
    fetchSupply()
    fetchVoteAccounts()
  }

  React.useEffect(() => {
    if (status === ClusterStatus.Connected) {
      fetchData()
    }
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  if (supply === Status.Disconnected) {
    // we'll return here to prevent flicker
    return null
  }

  if (supply === Status.Idle || supply === Status.Connecting || !coinInfo) {
    return <LoadingCard message="Loading supply and price data" />
  } else if (typeof supply === 'string') {
    return <ErrorCard text={supply} retry={fetchData} />
  }

  const circulatingPercentage = (
    (supply.circulating / supply.total) *
    100
  ).toFixed(1)

  let solanaInfo
  if (coinInfo.status === CoingeckoStatus.Success) {
    solanaInfo = coinInfo.coinInfo
  }

  return (
    <div className="row staking-card">
      <div className="col-12 col-lg-6 col-xl">
        <div className="card">
          <div className="card-body">
            <h4>Circulating Supply</h4>
            <h1>
              <em>{displayLamports(supply.circulating)}</em> /{' '}
              <small>{displayLamports(supply.total)}</small>
            </h1>
            <h5>
              <em>{circulatingPercentage}%</em> is circulating
            </h5>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4 col-xl">
        <div className="card" style={{ height: "85%" }}>
          <div className="card-body">
            <h4>Non Circulating Supply</h4>
            <h1>
              <em>0.00</em>{' '}
            </h1>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-6 col-xl">
        <div className="card">
          <div className="card-body">
            {solanaInfo && (
              <>
                <h4>Price </h4>
                <h1>
                  <em>$0.25</em>{' '}
                </h1>
                <h5>
                  <br />
                </h5>
              </>
            )}
            {coinInfo.status === CoingeckoStatus.FetchFailed && (
              <>
                <h4>Price</h4>
                <h1>
                  <em>$--.--</em>
                </h1>
                <h5>Error fetching the latest price information</h5>
              </>
            )}
            {solanaInfo && (
              <p className="updated-time text-muted">
                Updated at{' '}
                {displayTimestampWithoutDate(solanaInfo.last_updated.getTime())}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function displayLamports(value: number) {
  return abbreviatedNumber(lamportsToSol(value))
}

function StatsCardBody() {
  const dashboardInfo = useDashboardInfo()
  // console.log({dashboardInfo});
  const performanceInfo = usePerformanceInfo()
  const { setActive } = useStatsProvider()
  const { cluster } = useCluster()

  React.useEffect(() => {
    setActive(true)
    return () => setActive(false)
  }, [setActive, cluster])

  if (
    performanceInfo.status !== ClusterStatsStatus.Ready ||
    dashboardInfo.status !== ClusterStatsStatus.Ready
  ) {
    const error =
      performanceInfo.status === ClusterStatsStatus.Error ||
      dashboardInfo.status === ClusterStatsStatus.Error
    return <StatsNotReady error={error} />
  }

  const {
    avgSlotTime_1h,
    avgSlotTime_1min,
    epochInfo,
    blockTime,
  } = dashboardInfo
  const hourlySlotTime = Math.round(1000 * avgSlotTime_1h)
  const averageSlotTime = Math.round(1000 * avgSlotTime_1min)
  const { absoluteSlot } = epochInfo

  return (
    <TableCardBody>
      <tr>
        <td className="w-100">Block</td>
        <td className="text-lg-right text-monospace">
          <Slot slot={absoluteSlot} link />
        </td>
      </tr>
      {/* {blockHeight !== undefined && (
        <tr>
          <td className="w-100">Block height</td>
          <td className="text-lg-right text-monospace">
            <Slot slot={blockHeight} />
          </td>
        </tr>
      )} */}
      {blockTime && (
        <tr>
          <td className="w-100">Network time</td>
          <td className="text-lg-right text-monospace">
            {displayTimestampUtc(blockTime)}
          </td>
        </tr>
      )}
      <tr>
        <td className="w-100">Block time (1min average)</td>
        <td className="text-lg-right text-monospace">{averageSlotTime}ms</td>
      </tr>
      <tr>
        <td className="w-100">Block time (1hr average)</td>
        <td className="text-lg-right text-monospace">{hourlySlotTime}ms</td>
      </tr>
    </TableCardBody>
  )
}

export function StatsNotReady({ error }: { error: boolean }) {
  const { setTimedOut, retry, active } = useStatsProvider()
  const { cluster } = useCluster()

  React.useEffect(() => {
    let timedOut = 0
    if (!error) {
      timedOut = setTimeout(setTimedOut, CLUSTER_STATS_TIMEOUT)
    }
    return () => {
      if (timedOut) {
        clearTimeout(timedOut)
      }
    }
  }, [setTimedOut, cluster, error])

  if (error || !active) {
    return (
      <div className="card-body text-center">
        There was a problem loading cluster stats.{' '}
        <button
          className="btn btn-white btn-sm"
          onClick={() => {
            retry()
          }}
        >
          <span className="fe fe-refresh-cw mr-2"></span>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="card-body text-center">
      <span className="spinner-grow spinner-grow-sm mr-2"></span>
      Loading
    </div>
  )
}
