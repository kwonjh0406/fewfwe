export interface Portfolio {
  id: string
  name: string
  description: string | null
  created_at: string
}
export interface Group {
  id: string
  portfolio_id: string
  name: string
  created_at: string
}

export interface Stock {
  id: string
  portfolio_id: string
  name: string
  symbol: string | null
  manual_price: number | null
  group_name: string | null // Deprecated but kept for backward compatibility if needed
  group_id: string | null
  created_at: string
}

export interface Transaction {
  id: string
  stock_id: string
  type: "buy" | "sell"
  quantity: number
  price: number // price_per_share -> price로 단순화
  transaction_date: string
  created_at: string
}

export interface StockWithTransactions extends Stock {
  transactions: Transaction[]
  totalBuyQuantity: number
  totalBuyAmount: number
  totalSellQuantity: number
  totalSellAmount: number
  remainingQuantity: number
  realizedProfit: number // 실현 수익 (매도 완료된 것)
  profitPercentage: number
  currentPrice?: number
  currentValue?: number
  unrealizedProfit?: number // 평가 수익 (보유 중인 것)
  unrealizedProfitPercentage?: number
  avgBuyPrice?: number
  totalAllocatedCost?: number
  totalProfit?: number // 실현 + 평가 수익
  totalProfitPercentage?: number
}

export interface PortfolioSummary {
  totalBuyAmount: number
  totalSellAmount: number
  totalRealizedProfit: number
  totalUnrealizedProfit: number
  totalProfit: number
  profitPercentage: number // 전체 수익률
}
