"use client"

import { TrendingUp, TrendingDown, Info, Wallet, ReceiptText, BarChart3 } from "lucide-react"
import type { PortfolioSummary } from "@/types/portfolio"
import { cn } from "@/lib/utils"

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  const isTotalProfit = summary.totalProfit >= 0
  const isUnrealizedProfit = summary.totalUnrealizedProfit >= 0
  const isRealizedProfit = summary.totalRealizedProfit >= 0

  return (
    <div className="grid gap-px bg-zinc-200 border border-zinc-200 rounded-none overflow-hidden sm:grid-cols-2 xl:grid-cols-4">
      <div className="bg-white p-5 lg:p-8 flex flex-col gap-4 lg:gap-6">
        <div className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          총 손익
        </div>
        <div className="flex flex-col gap-1">
          <div className={cn(
            "text-3xl font-black tracking-tighter",
            isTotalProfit ? "text-emerald-500" : "text-rose-500"
          )}>
            {isTotalProfit ? "+" : ""}{summary.totalProfit.toLocaleString()}원
          </div>
          <div className={cn(
            "text-[13px] font-black flex items-center gap-1.5 uppercase tracking-widest",
            isTotalProfit ? "text-emerald-500" : "text-rose-500"
          )}>
            {isTotalProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {summary.profitPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="bg-white p-5 lg:p-8 flex flex-col gap-4 lg:gap-6">
        <div className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          미실현 손익
        </div>
        <div className="flex flex-col gap-1">
          <div className={cn(
            "text-3xl font-black tracking-tighter",
            isUnrealizedProfit ? "text-emerald-500" : "text-rose-500"
          )}>
            {isUnrealizedProfit ? "+" : ""}{summary.totalUnrealizedProfit.toLocaleString()}원
          </div>
          <div className="text-[13px] text-zinc-400 font-black uppercase tracking-widest">현재 보유 자산 기준</div>
        </div>
      </div>

      <div className="bg-white p-5 lg:p-8 flex flex-col gap-4 lg:gap-6">
        <div className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ReceiptText className="h-4 w-4" />
          실현 손익
        </div>
        <div className="flex flex-col gap-1">
          <div className={cn(
            "text-3xl font-black tracking-tighter",
            isRealizedProfit ? "text-emerald-500" : "text-rose-500"
          )}>
            {isRealizedProfit ? "+" : ""}{summary.totalRealizedProfit.toLocaleString()}원
          </div>
          <div className="text-[13px] text-zinc-400 font-black uppercase tracking-widest">매각 완료 수익</div>
        </div>
      </div>

      <div className="bg-white p-5 lg:p-8 flex flex-col gap-4 lg:gap-6">
        <div className="text-[14px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Info className="h-4 w-4" />
          거래 규모
        </div>
        <div className="flex flex-col gap-2.5 pt-0.5">
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-zinc-500 font-black uppercase tracking-widest">총 매수</span>
            <span className="font-black text-zinc-900">{summary.totalBuyAmount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between items-center text-[14px]">
            <span className="text-zinc-500 font-black uppercase tracking-widest">총 매도</span>
            <span className="font-black text-zinc-900">{summary.totalSellAmount.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </div>
  )
}
