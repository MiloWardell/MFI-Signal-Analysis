/*
 * Make request from binance API
 */

// Dependencies
const request = require('request-promise')

// Init binance
const binance = {}

binance.getBTCTickers = function () {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://api.binance.com/api/v1/ticker/allPrices',
      json: true // Automatically parses the JSON string in the response
    })
      .then(tickers => {
        if (!tickers) {
          reject(new Error('Ticker List Empty'))
          return
        }
        resolve(
          tickers.filter(ticker => {
            return new RegExp('BTC$').test(ticker.symbol)
          })
        )
      })
      .catch(err => {
        // API call failed...
        reject(new Error(err.message))
      })
  })
}

binance.getCandleData = function (tickerSymbols, intervals = ['1d']) {
  // Declate Promise Array
  const tickers = []

  tickerSymbols.forEach(tickerSymbol => {
    intervals.forEach(interval => {
      tickers.push(
        new Promise(async (resolve, reject) => {
          try {
            if (tickerSymbol === undefined) {
              reject(new Error('Missing required variable'))
              return
            }

            const candles = await request({
              uri: 'https://api.binance.com/api/v1/klines',
              qs: {
                symbol: tickerSymbol.symbol,
                interval: interval
              },
              json: true // Automatically parses the JSON string in the response
            })

            if (!candles) {
              reject(new Error('Ticker List Empty'))
              return
            }

            resolve({
              symbol: tickerSymbol.symbol,
              interval: interval,
              candles: candles
            })
          } catch (err) {
            reject(new Error(err.message))
          }
        })
      )
    })
  })
  return Promise.all(tickers)
}

module.exports = binance
