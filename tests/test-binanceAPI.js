/*
 * Test Suite for Binance API
 */

// Dependencies
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert
chai.should()

const path = require('path')
const localDir = path.join(__dirname, '/../lib/')
const binance = require(localDir + 'binanceAPI.js')

describe('Tests binanceAPI.js', function () {
  it('Test getBTCTickers', async function () {
    await binance.getBTCTickers().should.be.fulfilled
  })

  it('Test getCandleData - Valid Input', async () => {
    let tickers = [{ symbol: 'DENTBTC' }]
    return await binance.getCandleData(tickers).should.be.fulfilled
  })

  it('Test getCandleData - Invalid Input', async () => {
    let tickers = [{ symbol: 'DTBT' }]
    return binance.getCandleData(tickers).should.be.rejected
  })
})
