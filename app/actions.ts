"use server"

import YahooFinance from "yahoo-finance2"

// Force instantiation as requested by the error message, and suppress the survey notice
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

async function fetchNaverPrice(code: string): Promise<number | null> {
    try {
        const cleanCode = code.replace(".KS", "").replace(".KQ", "")
        if (!/^\d{6}$/.test(cleanCode)) return null

        const response = await fetch(`https://finance.naver.com/item/main.nhn?code=${cleanCode}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            next: { revalidate: 60 }
        })

        const html = await response.text()
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

    for (const symbol of symbols) {
        if (symbol.endsWith(".KS") || symbol.endsWith(".KQ") || /^\d{6}$/.test(symbol)) {
            yahooSymbols.push(symbol)
            if (/^\d{6}$/.test(symbol) || symbol.endsWith(".KS") || symbol.endsWith(".KQ")) {
                naverCandidates.push(symbol)
            }
        } else {
            yahooSymbols.push(symbol)
        }
    }

    try {
        if (yahooSymbols.length > 0) {
            const results: any = await yf.quote(yahooSymbols)
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

    const remainingSymbols = symbols.filter(s => !prices[s])
    for (const symbol of remainingSymbols) {
        if (naverCandidates.includes(symbol) || /^\d{6}$/.test(symbol.replace(/\.K[SQ]/, ""))) {
            const price = await fetchNaverPrice(symbol)
            if (price) {
                prices[symbol] = price
            }
        } else {
            try {
                const quote: any = await yf.quote(symbol)
                if (quote.regularMarketPrice) {
                    prices[symbol] = quote.regularMarketPrice
                }
            } catch (ignore) { }
        }
    }

    return prices
}
