import yahooFinance from "yahoo-finance2"

async function test() {
    try {
        const symbol = "064400.KS"
        const result = await yahooFinance.quote(symbol)
        console.log("Result for " + symbol + ":", result ? "Found" : "Not Found")
        if (result) {
            console.log("Symbol:", result.symbol)
            console.log("Price:", result.regularMarketPrice)
            console.log("Name:", result.longName || result.shortName)
        }
    } catch (e) {
        console.error("Error:", e.message)
    }
}

test()
