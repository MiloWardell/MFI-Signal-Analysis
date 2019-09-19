/*
 * Calculates the Money Flow index from the money
 * Flow ratio, raw money flow and typical price
 *
 * The Money flow index shows a number bettween 0 and 100
 * and displays the overbought or oversold markets
 *
 *  0-20: Oversold
 *  80-100: Overbought
 *
 * More Infomation: https://www.investopedia.com/terms/m/mfi.asp
 */

// Dependencies
const config = require('../config.js')

// Initailise Module
const MFI = {}

/*
 * Return an accuracyObject containing the:
 * - type
 * - symbol
 * - accuracy
 * - sample size
 */
MFI.getAccuracyMetric = function (querryTickers) {
  let accMetric = []

  querryTickers.forEach(ticker => {
    let overbought = []
    let oversold = []

    for (let i = 14; i < ticker.candles.length; i++) {
      let candleRange = ticker.candles.slice(i, i + config.defaultPeriod + 1)

      let MFI = calcMoneyFlowIndex(candleRange)

      if (MFI >= 80) {
        let futureCandles = ticker.candles.slice(
          i - config.futureCandlesLength,
          i
        )
        overbought.push(calcPriceDifference(ticker.candles[i], futureCandles))
      }

      if (MFI <= 20) {
        let futureCandles = ticker.candles.slice(
          i - config.futureCandlesLength,
          i
        )
        oversold.push(calcPriceDifference(ticker.candles[i], futureCandles))
      }
    }
    if (overbought.length) {
      accMetric.push(accObject(ticker.symbol, overbought, 'Over Bought - < 80'))
    }
    if (oversold.length) {
      accMetric.push(accObject(ticker.symbol, oversold, 'Over Sold - > 20'))
    }
  })

  // Return Accuracy Metric
  return accMetric
}

/*
 * Helper Funcitons
 */
function calcPriceDifference (currentCandle, futureCandles) {
  const currentPrice = calcTypicalPrice(
    currentCandle.high,
    currentCandle.low,
    currentCandle.close
  )
  const futurePriceAverage = calcAverage(
    futureCandles.map(candle => {
      return calcTypicalPrice(candle.high, candle.low, candle.close)
    })
  )
  return futurePriceAverage < currentPrice ? 1 : 0
}

function calcAverage (array) {
  return (
    array.reduce((accumulator, current) => {
      return accumulator + current
    }) / array.length
  )
}

function accObject (symbol, MFISuccessArray, type) {
  return {
    type: type,
    symbol: symbol,
    accuracy: Math.round(calcAverage(MFISuccessArray) * 100),
    sampleSize: MFISuccessArray.length
  }
}

/*
 * Calculate the Money Flow Index
 */
MFI.getMoneyFlowIndex = function (querryTickers) {
  const MFIArray = []
  querryTickers.forEach(ticker => {
    if (ticker.candles.length <= config.defaultPeriod + 1) {
      MFIArray.push({
        symbol: ticker.symbol,
        MFI: 'Not Enough Candle Data - Period too large'
      })
    } else {
      const MoneyFlowIndex = calcMoneyFlowIndex(
        ticker.candles.slice(0, config.defaultPeriod + 1)
      )

      MFIArray.push({
        symbol: ticker.symbol,
        MFI: Math.round(MoneyFlowIndex)
      })
    }
  })
  return MFIArray
}

/*
 * Helper Functions
 */

function calcMoneyFlowIndex (candles) {
  return 100 - 100 / (1 + calcMoneyFlowRatio(candles))
}

function calcMoneyFlowRatio (candles) {
  const { positive, negative } = calcRawMoneyFlow(candles)

  // Declare Sum Funciton
  const sum = function (array) {
    return array.reduce((sum, current) => sum + current, 0)
  }

  // Avoid desion by 0
  if (!negative.length) return sum(positive) / 0.00001
  return sum(positive) / sum(negative)
}

function calcRawMoneyFlow (candles) {
  const RMFPositive = []
  const RMFNegative = []
  for (let i = 0; i < candles.length - 1; i++) {
    const current = candles[i]
    const previous = candles[i + 1]

    // Calculate Typical Price
    const RMFCurrent =
      calcTypicalPrice(current.high, current.low, current.close) *
      parseFloat(current.volume)
    const RMFPrevious =
      calcTypicalPrice(previous.high, previous.low, previous.close) *
      parseFloat(previous.volume)

    // Seperate positve and negative
    if (RMFCurrent > RMFPrevious) {
      RMFPositive.push(RMFCurrent)
    } else {
      RMFNegative.push(RMFCurrent)
    }
  }

  return {
    positive: RMFPositive,
    negative: RMFNegative
  }
}

function calcTypicalPrice (high, low, close) {
  return (parseFloat(high) + parseFloat(low) + parseFloat(close)) / 3
}

module.exports = MFI
