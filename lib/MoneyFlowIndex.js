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
  const accMetric = []

  querryTickers.forEach(ticker => {
    const overbought = []
    const oversold = []

    for (let i = 14; i < ticker.candles.length; i++) {
      const candleRange = ticker.candles.slice(i, i + config.defaultPeriod + 1)

      const MoneyFlowIndex = MFI.calcMoneyFlowIndex(candleRange)

      if (MoneyFlowIndex >= 80) {
        const futureCandles = ticker.candles.slice(
          i - config.futureCandlesLength,
          i
        )
        overbought.push(
          MFI.calcPriceDifference(ticker.candles[i], futureCandles)
        )
      }

      if (MoneyFlowIndex <= 20) {
        const futureCandles = ticker.candles.slice(
          i - config.futureCandlesLength,
          i
        )
        oversold.push(MFI.calcPriceDifference(ticker.candles[i], futureCandles))
      }
    }
    if (overbought.length) {
      accMetric.push(
        MFI.accObject(ticker.symbol, overbought, 'Over Bought - < 80')
      )
    }
    if (oversold.length) {
      accMetric.push(MFI.accObject(ticker.symbol, oversold, 'Over Sold - > 20'))
    }
  })

  // Return Accuracy Metric
  return accMetric
}

/*
 * Helper Funcitons
 */
MFI.calcPriceDifference = function (currentCandle, futureCandles) {
  const currentPrice = MFI.calcTypicalPrice(
    currentCandle.high,
    currentCandle.low,
    currentCandle.close
  )
  const futurePriceAverage = MFI.calcAverage(
    futureCandles.map(candle => {
      return MFI.calcTypicalPrice(candle.high, candle.low, candle.close)
    })
  )
  return futurePriceAverage < currentPrice ? 1 : 0
}

MFI.calcAverage = function (array) {
  return (
    array.reduce((accumulator, current) => {
      return accumulator + current
    }) / array.length
  )
}

MFI.accObject = function (symbol, MFISuccessArray, type) {
  return {
    type: type,
    symbol: symbol,
    accuracy: Math.round(MFI.calcAverage(MFISuccessArray) * 100),
    sampleSize: MFISuccessArray.length
  }
}

/*
 * Calculate the Money Flow Index
 */
MFI.getMoneyFlowIndex = function (querryTickers) {
  const MFIArray = querryTickers.map(ticker => {
    if (ticker.candles.length <= config.defaultPeriod + 1) {
      return {
        symbol: ticker.symbol,
        MFI: 'Not Enough Candle Data - Period too large'
      }
    } else {
      const MoneyFlowIndex = MFI.calcMoneyFlowIndex(
        ticker.candles.slice(0, config.defaultPeriod + 1)
      )

      return {
        symbol: ticker.symbol,
        MFI: Math.round(MoneyFlowIndex)
      }
    }
  })

  return MFIArray
}

/*
 * Helper Functions
 */

MFI.calcMoneyFlowIndex = function (candles) {
  return 100 - 100 / (1 + MFI.calcMoneyFlowRatio(candles))
}

MFI.calcMoneyFlowRatio = function (candles) {
  const { positive, negative } = MFI.calcRawMoneyFlow(candles)

  // Declare Sum Funciton
  const sum = function (array) {
    return array.reduce((sum, current) => sum + current, 0)
  }

  // Avoid desion by 0
  if (!negative.length) return sum(positive) / 0.00001
  return sum(positive) / sum(negative)
}

MFI.calcRawMoneyFlow = function (candles) {
  const RMFPositive = []
  const RMFNegative = []
  for (let i = 0; i < candles.length - 1; i++) {
    const current = candles[i]
    const previous = candles[i + 1]

    // Calculate Typical Price
    const RMFCurrent =
      MFI.calcTypicalPrice(current.high, current.low, current.close) *
      parseFloat(current.volume)
    const RMFPrevious =
      MFI.calcTypicalPrice(previous.high, previous.low, previous.close) *
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

MFI.calcTypicalPrice = function (high, low, close) {
  return (parseFloat(high) + parseFloat(low) + parseFloat(close)) / 3
}

module.exports = MFI
