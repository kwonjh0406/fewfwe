"use client"

import { useEffect, useState, useCallback } from "react"
import { PortfolioSummaryCard } from "./portfolio-summary-card"
import { StockDetailView } from "./stock-card"
import { AddStockDialog } from "./add-stock-dialog"
import { GroupManager } from "./group-manager"
import { getSupabaseBrowserClient } from "@/lib/client"
import type { Portfolio, Stock, Transaction, StockWithTransactions, PortfolioSummary, Group } from "@/types/portfolio"
import { Loader2, Folder, PieChart, LayoutGrid, Settings2, Wallet, History, PlusSquare, Search, TrendingUp, TrendingDown, AlertCircle, Plus, Menu, X } from "lucide-react"
import { getStockPrices } from "@/app/actions"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PortfolioDashboardProps {
  portfolioId: string
}

type GroupedStocks = Record<string, StockWithTransactions[]>

export function PortfolioDashboard({ portfolioId }: PortfolioDashboardProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [stocks, setStocks] = useState<StockWithTransactions[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupedStocks, setGroupedStocks] = useState<GroupedStocks>({})
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalBuyAmount: 0,
    totalSellAmount: 0,
    totalRealizedProfit: 0,
    totalUnrealizedProfit: 0,
    totalProfit: 0,
    profitPercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dbError, setDbError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const calculateStockMetrics = (stock: Stock, transactions: Transaction[], currentPrice?: number): StockWithTransactions => {
    let totalBuyQuantity = 0
    let totalBuyAmount = 0
    let totalSellQuantity = 0
    let totalSellAmount = 0

    for (const t of transactions) {
      const amount = t.quantity * t.price
      if (t.type === "buy") {
        totalBuyQuantity += t.quantity
        totalBuyAmount += amount
      } else {
        totalSellQuantity += t.quantity
        totalSellAmount += amount
      }
    }

    const remainingQuantity = totalBuyQuantity - totalSellQuantity
    const avgBuyPrice = totalBuyQuantity > 0 ? totalBuyAmount / totalBuyQuantity : 0
    const costOfSold = totalSellQuantity * avgBuyPrice
    const realizedProfit = totalSellAmount - costOfSold
    const profitPercentage = costOfSold > 0 ? (realizedProfit / costOfSold) * 100 : 0

    let unrealizedProfit = 0
    let unrealizedProfitPercentage = 0
    let currentValue = 0

    if (currentPrice && remainingQuantity > 0) {
      currentValue = remainingQuantity * currentPrice
      const costOfRemaining = remainingQuantity * avgBuyPrice
      unrealizedProfit = currentValue - costOfRemaining
      unrealizedProfitPercentage = costOfRemaining > 0 ? (unrealizedProfit / costOfRemaining) * 100 : 0
    }

    const totalProfit = realizedProfit + unrealizedProfit
    const totalCost = costOfSold + (remainingQuantity * avgBuyPrice)
    const totalProfitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    return {
      ...stock,
      transactions,
      totalBuyQuantity,
      totalBuyAmount: Math.round(totalBuyAmount),
      totalSellQuantity,
      totalSellAmount: Math.round(totalSellAmount),
      remainingQuantity,
      realizedProfit: Math.round(realizedProfit),
      profitPercentage,
      currentPrice,
      currentValue: Math.round(currentValue),
      unrealizedProfit: Math.round(unrealizedProfit),
      unrealizedProfitPercentage,
      totalProfit: Math.round(totalProfit),
      totalProfitPercentage
    }
  }

  const fetchData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    setDbError(null)

    try {
      const { data: portfolioData, error: pError } = await supabase.from("portfolios").select("*").eq("id", portfolioId).single()
      if (pError) throw pError
      if (portfolioData) setPortfolio(portfolioData)

      const { data: groupsData, error: gError } = await supabase.from("groups").select("*").eq("portfolio_id", portfolioId).order("created_at", { ascending: true })
      if (groupsData) setGroups(groupsData)

      const { data: stocksData, error: sError } = await supabase
        .from("stocks")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .order("created_at", { ascending: true })

      if (sError) throw sError

      if (stocksData) {
        const symbols = stocksData.map((s: any) => s.symbol).filter(Boolean) as string[]
        const prices = await getStockPrices(symbols)

        const stocksWithTransactions: StockWithTransactions[] = []
        let totalBuyAmount = 0
        let totalSellAmount = 0
        let totalRealizedProfit = 0
        let totalUnrealizedProfit = 0
        let totalProfit = 0

        for (const stock of stocksData) {
          const { data: transactions } = await supabase
            .from("transactions")
            .select("*")
            .eq("stock_id", stock.id)
            .order("transaction_date", { ascending: true })

          const currentPrice =
            stock.manual_price ? stock.manual_price : (stock.symbol && prices[stock.symbol] ? prices[stock.symbol] : undefined)
          const stockWithMetrics = calculateStockMetrics(stock, transactions || [], currentPrice)

          stocksWithTransactions.push(stockWithMetrics)

          totalBuyAmount += stockWithMetrics.totalBuyAmount
          totalSellAmount += stockWithMetrics.totalSellAmount
          totalRealizedProfit += stockWithMetrics.realizedProfit
          totalUnrealizedProfit += stockWithMetrics.unrealizedProfit || 0
          totalProfit += stockWithMetrics.totalProfit || 0
        }

        setStocks(stocksWithTransactions)

        const grouped: GroupedStocks = {}
        groupsData?.forEach((g: Group) => { grouped[g.name] = [] })

        stocksWithTransactions.forEach(stock => {
          let groupName = "기타"
          let matched = false

          if (stock.group_id) {
            const group = groupsData?.find((g: Group) => g.id === stock.group_id)
            if (group) {
              groupName = group.name
              matched = true
            }
          } else if (stock.group_name) {
            const matchedGroup = groupsData?.find((g: Group) => g.name === stock.group_name)
            if (matchedGroup) {
              groupName = matchedGroup.name
              matched = true
            }
          }

          if (!matched) groupName = "기타"
          if (!grouped[groupName]) grouped[groupName] = []
          grouped[groupName].push(stock)
        })

        if (grouped["기타"] && grouped["기타"].length === 0) {
          delete grouped["기타"]
        }

        setGroupedStocks(grouped)

        const totalCostOfSold = stocksWithTransactions.reduce((acc, s) => {
          const avgBuyPrice = s.totalBuyQuantity > 0 ? s.totalBuyAmount / s.totalBuyQuantity : 0
          return acc + s.totalSellQuantity * avgBuyPrice
        }, 0)

        const totalCostOfHeld = stocksWithTransactions.reduce((acc, s) => {
          const avgBuyPrice = s.totalBuyQuantity > 0 ? s.totalBuyAmount / s.totalBuyQuantity : 0
          return acc + s.remainingQuantity * avgBuyPrice
        }, 0)

        const totalInvested = totalCostOfSold + totalCostOfHeld
        const portfolioProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

        setSummary({
          totalBuyAmount,
          totalSellAmount,
          totalRealizedProfit,
          totalUnrealizedProfit,
          totalProfit,
          profitPercentage: portfolioProfitPercentage,
        })
      }
    } catch (err: any) {
      console.error("Fetch Error:", err)
      setDbError(err.message || "데이터베이스 연결 오류")
    }

    setLoading(false)
  }, [portfolioId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const deleteStock = async () => {
    if (!selectedStockId) return
    const stockName = stocks.find(s => s.id === selectedStockId)?.name
    if (!confirm(`${stockName} 종목을 삭제하시겠습니까? 모든 거래 내역도 함께 삭제됩니다.`)) return

    const supabase = getSupabaseBrowserClient()
    await supabase.from("stocks").delete().eq("id", selectedStockId)
    setSelectedStockId(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-200" />
      </div>
    )
  }

  const selectedStock = stocks.find(s => s.id === selectedStockId)
  const filteredStocks = searchQuery
    ? stocks.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.symbol?.toLowerCase().includes(searchQuery.toLowerCase()))
    : stocks

  return (
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Flush & Simple */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-[#F9F9F9] border-r border-zinc-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 outline-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-5 py-8 flex items-center justify-between">
          <div
            className="cursor-pointer"
            onClick={() => {
              setSelectedStockId(null)
              setIsSidebarOpen(false)
            }}
          >
            <span className="font-black truncate text-[20px] tracking-tight uppercase text-zinc-900">내 자산 현황</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-zinc-400"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 space-y-3 mb-8">
          <div className="flex items-center border border-zinc-200 bg-white overflow-hidden h-10">
            <div className="flex-1 flex items-center">
              <AddStockDialog portfolioId={portfolioId} groups={groups} onStockAdded={fetchData} />
            </div>
            <div className="w-px h-4 bg-zinc-200 flex-shrink-0" />
            <div className="flex-1 flex items-center">
              <GroupManager portfolioId={portfolioId} groups={groups} onUpdate={fetchData} />
            </div>
          </div>

          <div className="relative border border-zinc-200 bg-white overflow-hidden h-10 group transition-all focus-within:border-zinc-400">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors" />
            <Input
              placeholder="종목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-full pl-11 pr-4 border-none bg-transparent shadow-none focus-visible:ring-0 text-[13px] font-black uppercase tracking-widest placeholder:text-zinc-500 w-full rounded-none"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2 pb-10">
          <div className="space-y-6">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-[14px] font-black cursor-pointer transition-colors uppercase tracking-tight",
                selectedStockId === null ? "text-black bg-zinc-50 border-l-2 border-zinc-900" : "text-zinc-500 hover:text-black hover:bg-zinc-50 border-l-2 border-transparent"
              )}
              onClick={() => {
                setSelectedStockId(null)
                if (window.innerWidth < 1024) setIsSidebarOpen(false)
              }}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>전체 개요</span>
            </div>

            <div className="space-y-8 pt-2">
              {groups.map(group => {
                const groupStocksInSidebar = filteredStocks.filter(s => s.group_id === group.id || (!s.group_id && s.group_name === group.name))
                if (groupStocksInSidebar.length === 0 && !searchQuery) return null

                return (
                  <div key={group.id} className="space-y-2">
                    <div className="px-4 py-1 text-[14px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Folder className="h-3.5 w-3.5" /> {group.name}
                    </div>
                    <div className="flex flex-col">
                      {groupStocksInSidebar.map(stock => (
                        <div
                          key={stock.id}
                          className={cn(
                            "px-4 py-2.5 text-[14px] font-black cursor-pointer transition-all border-l-2",
                            selectedStockId === stock.id ? "border-zinc-900 text-black bg-zinc-50" : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-50"
                          )}
                          onClick={() => {
                            setSelectedStockId(stock.id)
                            if (window.innerWidth < 1024) setIsSidebarOpen(false)
                          }}
                        >
                          <span className="truncate block pl-2 font-black">{stock.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Gita Group for sidebar */}
              {filteredStocks.filter(s => !s.group_id && (!s.group_name || s.group_name === "기타") && !groups.find(g => g.name === s.group_name)).length > 0 && (
                <div className="space-y-2">
                  <div className="px-4 py-1 text-[14px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Folder className="h-3.5 w-3.5" /> 기타
                  </div>
                  <div className="flex flex-col">
                    {filteredStocks.filter(s => !s.group_id && (!s.group_name || s.group_name === "기타") && !groups.find(g => g.name === s.group_name)).map(stock => (
                      <div
                        key={stock.id}
                        className={cn(
                          "px-4 py-2.5 text-[14px] font-black cursor-pointer transition-all border-l-2",
                          selectedStockId === stock.id ? "border-zinc-900 text-black bg-zinc-50" : "border-transparent text-zinc-500 hover:text-black hover:bg-zinc-50"
                        )}
                        onClick={() => {
                          setSelectedStockId(stock.id)
                          if (window.innerWidth < 1024) setIsSidebarOpen(false)
                        }}
                      >
                        <span className="truncate block pl-2 font-black">{stock.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 lg:px-10 bg-white z-20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 -ml-2 mr-1 text-zinc-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-zinc-900 font-black uppercase tracking-tight text-[16px]">
              {selectedStockId ? selectedStock?.name : "자산 관리 대시보드"}
            </span>
          </div>
          {dbError && (
            <div className="flex items-center gap-2 text-rose-500 text-[13px] font-black animate-pulse uppercase tracking-widest">
              <AlertCircle className="h-3.5 w-3.5" />
              데이터베이스 오류
            </div>
          )}
        </header>

        <ScrollArea className="flex-1">
          <div className="px-4 py-8 md:px-6 lg:px-8 xl:px-12 lg:py-12 w-full space-y-12 lg:space-y-24 pb-48">
            {selectedStockId ? (
              <div className="animate-in fade-in duration-200">
                <StockDetailView
                  stock={stocks.find(s => s.id === selectedStockId)!}
                  groups={groups}
                  onUpdate={fetchData}
                  onDelete={deleteStock}
                />
              </div>
            ) : (
              <div className="space-y-24 animate-in fade-in duration-300">
                <section className="space-y-12">
                  <h2 className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">포트폴리오 요약</h2>
                  <PortfolioSummaryCard summary={summary} />
                </section>

                <section className="space-y-12 pb-24">
                  <h2 className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">자산 구성 및 관리</h2>

                  <div className="grid gap-px bg-zinc-200 border border-zinc-200 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(groupedStocks).map(([group, groupStocks]) => (
                      <div key={group} className="bg-white flex flex-col min-h-[250px]">
                        <div className="px-6 py-6 flex items-center justify-between border-b border-zinc-200 bg-zinc-50/30">
                          <h3 className="font-black text-[14px] text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            {group}
                            <span className="text-zinc-300 font-normal">/</span>
                            {groupStocks.length}
                          </h3>
                        </div>
                        <div className="flex-1">
                          {groupStocks.length > 0 ? (
                            <div className="divide-y divide-zinc-200">
                              {groupStocks.map(stock => {
                                const isProfit = (stock.unrealizedProfit || 0) >= 0;
                                return (
                                  <div
                                    key={stock.id}
                                    className="px-6 py-6 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center justify-between group"
                                    onClick={() => setSelectedStockId(stock.id)}
                                  >
                                    <div className="flex flex-col gap-1.5">
                                      <div className="font-black text-[14px] text-zinc-800 uppercase tracking-tight">{stock.name}</div>
                                      <div className="text-[13px] text-zinc-400 font-black uppercase tracking-widest">{stock.remainingQuantity.toLocaleString()} 주</div>
                                    </div>
                                    <div className="text-right flex flex-col gap-1.5">
                                      <div className="font-black text-[15px] text-zinc-900 tracking-tight">
                                        {(stock.currentValue || 0).toLocaleString()}
                                        <span className="text-[10px] font-medium ml-0.5 text-zinc-500">원</span>
                                      </div>
                                      <div className={cn(
                                        "text-[13px] font-black tracking-widest",
                                        isProfit ? "text-emerald-500" : "text-rose-500"
                                      )}>
                                        {isProfit ? "+" : ""}{(stock.unrealizedProfitPercentage || 0).toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-[13px] font-black text-zinc-200 uppercase tracking-[0.3em] italic">
                              데이터 없음
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
