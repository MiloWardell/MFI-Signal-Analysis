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

MFI.calcMoneyFlowIndex = function (querryTickers) {
  const MFIArray = []
  querryTickers.forEach(ticker => {
    if (ticker.candles.length <= config.defaultPeriod + 1) {
      MFIArray.push({
        symbol: ticker.symbol,
        MFI: 'Not Enough Candle Data - Period too large'
      })
    } else {
      const MoneyFlowRatio = calcMoneyFlowRatio(
        ticker.candles.slice(0, config.defaultPeriod + 1)
      )
      const MoneyFlowIndex = calcMoneyFlowIndex(MoneyFlowRatio)

      MFIArray.push({
        symbol: ticker.symbol,
        MFI: Math.round(MoneyFlowIndex)
      })
    }
  })
  return MFIArray
}

function calcMoneyFlowIndex (MoneyFlowRatio) {
  return 100 - 100 / (1 + MoneyFlowRatio)
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
      calcTypicalPrice(
        parseFloat(current.high),
        parseFloat(current.low),
        parseFloat(current.close)
      ) * parseFloat(current.volume)
    const RMFPrevious =
      calcTypicalPrice(
        parseFloat(previous.high),
        parseFloat(previous.low),
        parseFloat(previous.close)
      ) * parseFloat(previous.volume)

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
  return (high + low + close) / 3
}

module.exports = MFI
