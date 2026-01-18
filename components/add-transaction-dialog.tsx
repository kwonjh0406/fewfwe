"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Plus } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/client"

interface AddTransactionDialogProps {
  stockId: string
  stockName: string
  onTransactionAdded: () => void
}

export function AddTransactionDialog({ stockId, stockName, onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("transactions").insert({
      stock_id: stockId,
      type,
      quantity: Number.parseInt(quantity),
      price: Number.parseFloat(price),
      transaction_date: transactionDate,
    })

    if (!error) {
      setOpen(false)
      setType("buy")
      setQuantity("")
      setPrice("")
      setTransactionDate(new Date().toISOString().split("T")[0])
      onTransactionAdded()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 px-5 gap-2 border-zinc-200 text-zinc-500 shadow-none hover:bg-white hover:text-black transition-all font-black text-[12px] rounded-none uppercase tracking-widest bg-transparent">
          <Plus className="h-4 w-4" />
          거래 내역 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[400px] max-h-[85dvh] border-zinc-200 rounded-none p-0 flex flex-col shadow-none font-sans bg-white">
        <DialogHeader className="px-6 pt-10 pb-6 bg-white border-b border-zinc-100 flex-shrink-0">
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-zinc-900 truncate">거래 기록 추가</DialogTitle>
          <DialogDescription className="text-[13px] text-zinc-400 font-black uppercase tracking-widest truncate">
            {stockName} / 새로운 거래 기록을 입력합니다
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-10">
            <div className="space-y-3">
              <Label className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 종류</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("buy")}
                  className={cn(
                    "h-11 px-4 border text-[13px] font-black transition-all uppercase tracking-tight flex items-center justify-center gap-2 rounded-none",
                    type === "buy"
                      ? "bg-zinc-50 border-zinc-400 text-emerald-500"
                      : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-black"
                  )}
                >
                  매수 (BUY)
                  {type === "buy" && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                </button>
                <button
                  type="button"
                  onClick={() => setType("sell")}
                  className={cn(
                    "h-11 px-4 border text-[13px] font-black transition-all uppercase tracking-tight flex items-center justify-center gap-2 rounded-none",
                    type === "sell"
                      ? "bg-zinc-50 border-zinc-400 text-rose-500"
                      : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-black"
                  )}
                >
                  매도 (SELL)
                  {type === "sell" && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-all w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 단가 (원)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-all w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionDate" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 날짜</Label>
              <Input
                id="transactionDate"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
                className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none w-full"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 font-black bg-zinc-900 text-white border-none hover:bg-black transition-all shadow-none rounded-none uppercase tracking-widest text-[14px]"
              >
                {loading ? "기록 중..." : "거래 기록 추가 완료"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
