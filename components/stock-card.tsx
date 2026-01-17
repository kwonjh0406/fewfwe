"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Edit2, Plus, Calendar, Coins, ArrowRightLeft, TrendingUp, TrendingDown, Wallet, MoreHorizontal, FileText, Settings2, Clock } from "lucide-react"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { EditStockDialog } from "./edit-stock-dialog"
import { getSupabaseBrowserClient } from "@/lib/client"
import type { StockWithTransactions, Group } from "@/types/portfolio"
import { cn } from "@/lib/utils"

interface StockDetailViewProps {
  stock: StockWithTransactions
  groups?: Group[]
  onUpdate: () => void
  onDelete: () => void
}

export function StockDetailView({ stock, groups = [], onUpdate, onDelete }: StockDetailViewProps) {
  const isProfit = stock.realizedProfit >= 0
  const isUnrealizedProfit = (stock.unrealizedProfit || 0) >= 0

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("이 거래 내역을 삭제하시겠습니까?")) return

    const supabase = getSupabaseBrowserClient()
    await supabase.from("transactions").delete().eq("id", transactionId)
    onUpdate()
  }

  return (
    <div className="space-y-8 lg:space-y-16 h-full flex flex-col font-sans">
      {/* Page Header - Ultra Minimal */}
      <div className="flex flex-col gap-6 lg:gap-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 md:gap-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">{stock.name}</h2>
              {stock.symbol && (
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-zinc-100 text-zinc-500 rounded-none text-[10px] md:text-[12px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap">
                  {stock.symbol}
                </span>
              )}
            </div>
            <p className="text-[11px] md:text-[14px] font-black text-zinc-400 uppercase tracking-[0.15em] md:tracking-[0.2em]">자산 세부 정보 및 거래 내역</p>
          </div>

          <div className="flex items-center gap-4">
            <AddTransactionDialog stockId={stock.id} stockName={stock.name} onTransactionAdded={onUpdate} />

            <div className="flex items-center gap-px border border-zinc-200 h-10 bg-white overflow-hidden">
              <EditStockDialog
                stockId={stock.id}
                currentName={stock.name}
                currentSymbol={stock.symbol}
                currentManualPrice={stock.manual_price}
                currentGroupId={stock.group_id}
                groups={groups}
                onStockUpdated={onUpdate}
              />
              <div className="w-px h-5 bg-zinc-200 flex-shrink-0" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-10 w-10 text-zinc-400 hover:text-rose-500 transition-all rounded-none bg-white hover:bg-white focus-visible:ring-0"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Grid - Unified with dashboard allocation style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-zinc-200 border border-zinc-200 gap-px">
          {[
            { label: "보유 수량", value: `${stock.remainingQuantity.toLocaleString()} 주` },
            { label: "평균 단가", value: `${Math.round(stock.avgBuyPrice || 0).toLocaleString()}원` },
            { label: "현재가", value: `${(stock.currentPrice || 0).toLocaleString()}원` },
            { label: "수익률", value: `${(stock.unrealizedProfitPercentage || 0).toFixed(2)}%`, isProfit: isUnrealizedProfit }
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 lg:p-8 flex flex-col gap-1 lg:gap-2">
              <span className="text-[11px] lg:text-[13px] font-black text-zinc-400 uppercase tracking-[0.15em] lg:tracking-[0.2em]">{item.label}</span>
              <span className={cn(
                "text-xl lg:text-2xl font-black tracking-tighter",
                item.isProfit === undefined ? "text-zinc-900" : item.isProfit ? "text-emerald-500" : "text-rose-500"
              )}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats - Grid Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-zinc-200 border border-zinc-200 gap-px">
        {[
          { label: "미실현 수익", value: stock.unrealizedProfit, isProfit: isUnrealizedProfit },
          { label: "실현 수익", value: stock.realizedProfit, isProfit: isProfit },
          { label: "총 매수 금액", value: stock.totalBuyAmount, isProfit: null },
          { label: "총 매도 금액", value: stock.totalSellAmount, isProfit: null }
        ].map((metric, idx) => (
          <div key={idx} className="bg-white p-5 lg:p-8 flex flex-col gap-2 lg:gap-4">
            <span className="text-[11px] lg:text-[13px] font-black text-zinc-400 uppercase tracking-[0.15em] lg:tracking-[0.2em]">{metric.label}</span>
            <div className={cn(
              "text-xl lg:text-2xl font-black tracking-tighter",
              metric.isProfit === null ? "text-zinc-900" : metric.isProfit ? "text-emerald-500" : "text-rose-500"
            )}>
              {(metric.value || 0).toLocaleString()}원
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Table - Full Page Width */}
      <div className="flex flex-col gap-6 lg:gap-10">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 px-1">
          <h3 className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em]">최근 거래 내역</h3>
          <span className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">{stock.transactions.length}개의 기록</span>
        </div>

        <div className="border border-zinc-200 overflow-hidden bg-white">
          {stock.transactions.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden xl:block">
                <Table>
                  <TableHeader className="bg-zinc-50/40">
                    <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                      <TableHead className="font-black text-[13px] text-zinc-400 uppercase tracking-widest pl-8 h-12">날짜</TableHead>
                      <TableHead className="font-black text-[13px] text-zinc-400 uppercase tracking-widest text-center h-12">구분</TableHead>
                      <TableHead className="font-black text-[13px] text-zinc-400 uppercase tracking-widest text-right h-12">수량</TableHead>
                      <TableHead className="font-black text-[13px] text-zinc-400 uppercase tracking-widest text-right h-12">거래단가</TableHead>
                      <TableHead className="font-black text-[13px] text-zinc-400 uppercase tracking-widest text-right pr-8 h-12">거래금액</TableHead>
                      <TableHead className="w-[100px] h-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stock.transactions.map((transaction) => {
                      const isBuy = transaction.type === "buy";
                      return (
                        <TableRow key={transaction.id} className="group hover:bg-zinc-50/30 border-b border-zinc-200 last:border-0 transition-colors">
                          <TableCell className="pl-8 text-[15px] font-black text-zinc-600">
                            {new Date(transaction.transaction_date).toLocaleDateString("ko-KR")}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "text-[13px] font-black uppercase tracking-widest",
                              isBuy ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {isBuy ? "매수" : "매도"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-black text-[15px] text-zinc-500">{transaction.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-[15px] font-black text-zinc-500">{transaction.price.toLocaleString()}원</TableCell>
                          <TableCell className="text-right font-black text-[15px] text-zinc-900 pr-8">
                            {(transaction.quantity * transaction.price).toLocaleString()}원
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <EditTransactionDialog
                                transaction={transaction}
                                stockName={stock.name}
                                onTransactionUpdated={onUpdate}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-300 hover:text-rose-500 hover:bg-white bg-white"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="xl:hidden divide-y divide-zinc-200">
                {stock.transactions.map((transaction) => {
                  const isBuy = transaction.type === "buy";
                  return (
                    <div key={transaction.id} className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                            {new Date(transaction.transaction_date).toLocaleDateString("ko-KR")}
                          </div>
                          <div className={cn(
                            "text-[14px] font-black uppercase tracking-[0.1em]",
                            isBuy ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {isBuy ? "매수" : "매도"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <EditTransactionDialog
                            transaction={transaction}
                            stockName={stock.name}
                            onTransactionUpdated={onUpdate}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-zinc-300 hover:text-rose-500 bg-white"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">수량 / 단가</div>
                          <div className="text-[14px] font-black text-zinc-600">
                            {transaction.quantity.toLocaleString()} / {transaction.price.toLocaleString()}원
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">거래 총액</div>
                          <div className="text-[16px] font-black text-zinc-900">
                            {(transaction.quantity * transaction.price).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-200 gap-4">
              <Clock className="h-10 w-10 opacity-20" />
              <p className="text-[13px] font-black uppercase tracking-[0.4em]">기록된 거래가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
