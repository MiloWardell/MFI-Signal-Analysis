/*
 * Main
 */

// Dependencies
const binance = require('./lib/binanceAPI.js')
const sql = require('./lib/sql.js')
const MFI = require('./lib/MoneyFlowIndex.js')

const config = require('./config.js')

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p)
  process.exit()
})

// Initiallize app
const app = {}

app.init = async function () {
  let tickers
  try {
    // Return BTC pairs
    console.log('TICKERS: Calling Binance API...')
    const tickerSymbols = await binance.getBTCTickers()

    if (config.updateTickers) {
      // Return Candle Data
      console.log('CANDLE: Calling Binance API...')
      tickers = await binance.getCandleData(tickerSymbols, config.intervals)

      // Push Candles to DB
      await sql.createTable(tickerSymbols)
      await sql.postData(tickers)
    }

    // Querry Data
    config.intervals.forEach(async resolution => {
      const querryTickers = await sql.getData(tickerSymbols, resolution)
      const MoneyFlowIndex = MFI.getMoneyFlowIndex(querryTickers)
      const accMetric = MFI.getAccuracyMetric(querryTickers)

      // Display the User
      console.log('')
      console.log({ resolution: resolution })

      console.log('\n-- PAST PERFORMERS --')
      console.log(
        accMetric.filter(item => {
          return item.accuracy >= 80 && item.sampleSize >= 10
        })
      )

      console.log('\n-- CURRENT SIGNALS --')
      console.log(
        MoneyFlowIndex.filter(ticker => ticker.MFI > 80 || ticker.MFI < 20)
      )
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports = app
app.init()
