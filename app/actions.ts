"use server"

import yahooFinance from "yahoo-finance2"

async function fetchNaverPrice(code: string): Promise<number | null> {
    try {
        // Remove .KS or .KQ if present to get just the code
        const cleanCode = code.replace(".KS", "").replace(".KQ", "")
        if (!/^\d{6}$/.test(cleanCode)) return null

        const response = await fetch(`https://finance.naver.com/item/main.nhn?code=${cleanCode}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        })

        const html = await response.text()

        // Regex to find the 'no_today' class which usually contains the current price in Naver Finance
        // Structure: <p class="no_today"> ... <span class="blind">85,000</span> ... </p>
        const match = html.match(/<p class="no_today">[\s\S]*?<span class="blind">([\d,]+)<\/span>/)

        if (match && match[1]) {
            return parseInt(match[1].replace(/,/g, ""), 10)
        }
        return null
    } catch (e) {
        console.error(`Naver Finance fetch failed for ${code}:`, e)
        return null
    }
}

export async function getStockPrices(symbols: string[]) {
    if (!symbols || symbols.length === 0) return {}

    const prices: Record<string, number> = {}
    const yahooSymbols: string[] = []
    const naverCandidates: string[] = []

    // 1. Classify symbols
    for (const symbol of symbols) {
        if (symbol.endsWith(".KS") || symbol.endsWith(".KQ") || /^\d{6}$/.test(symbol)) {
            // Try Yahoo first for standard formatted, but keep track for fallback
            yahooSymbols.push(symbol)
            if (/^\d{6}$/.test(symbol) || symbol.endsWith(".KS") || symbol.endsWith(".KQ")) {
                naverCandidates.push(symbol)
            }
        } else {
            yahooSymbols.push(symbol)
        }
    }

    // 2. Try Yahoo Finance
    try {
        if (yahooSymbols.length > 0) {
            const results = await yahooFinance.quote(yahooSymbols, { validateResult: false })
            if (Array.isArray(results)) {
                results.forEach((quote: any) => {
                    if (quote.symbol && quote.regularMarketPrice) {
                        prices[quote.symbol] = quote.regularMarketPrice
                    }
                })
            } else if (results) {
                const quote = results as any
                if (quote.symbol && quote.regularMarketPrice) {
                    prices[quote.symbol] = quote.regularMarketPrice
                }
            }
        }
    } catch (e) {
        console.error("Yahoo Finance bulk fetch error:", e)
    }

    // 3. Fallback / Naver Processing
    // Check missing prices for potential Korean stocks
    for (const symbol of symbols) {
        // If price not found yet
        if (!prices[symbol]) {
            // If it looks like a KR stock
            if (naverCandidates.includes(symbol) || /^\d{6}$/.test(symbol.replace(/\.K[SQ]/, ""))) {
                const price = await fetchNaverPrice(symbol)
                if (price) {
                    prices[symbol] = price
                }
            } else {
                // Try fetching Yahoo one-by-one as last resort
                try {
                    const quote = await yahooFinance.quote(symbol)
                    if (quote.regularMarketPrice) {
                        prices[symbol] = quote.regularMarketPrice
                    }
                } catch (ignore) { }
            }
        }
    }

    return prices
}
