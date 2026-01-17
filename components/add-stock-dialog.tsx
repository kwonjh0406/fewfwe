"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, PlusSquare } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/client"
import type { Group } from "@/types/portfolio"

interface AddStockDialogProps {
  portfolioId: string
  groups: Group[]
  onStockAdded: () => void
}

export function AddStockDialog({ portfolioId, groups, onStockAdded }: AddStockDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [groupId, setGroupId] = useState<string>("")

  useEffect(() => {
    if (open && groups.length > 0 && !groupId) {
      setGroupId(groups[0].id)
    }
  }, [open, groups, groupId])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    const selectedGroup = groups.find(g => g.id === groupId)

    const { error } = await supabase.from("stocks").insert({
      portfolio_id: portfolioId,
      name,
      symbol: symbol ? symbol.toUpperCase() : null,
      group_id: groupId || null,
      group_name: selectedGroup?.name || "기타",
    })

    if (!error) {
      setOpen(false)
      setName("")
      setSymbol("")
      onStockAdded()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 justify-start gap-2 h-10 px-4 border-none text-zinc-500 shadow-none hover:bg-white hover:text-black transition-all font-black text-[13px] rounded-none bg-transparent uppercase tracking-widest focus-visible:ring-0">
          <Plus className="h-4 w-4" />
          <span>종목 추가</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] border-zinc-200 rounded-none p-0 overflow-hidden shadow-none font-sans">
        <DialogHeader className="px-6 pt-10 pb-6 bg-white border-b border-zinc-100">
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-zinc-900">주식 종목 추가</DialogTitle>
          <DialogDescription className="text-[13px] text-zinc-400 font-black uppercase tracking-widest">
            포트폴리오에 새로운 자산을 추가합니다
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-4">
            <Label className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">그룹 선택</Label>
            {groups.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {groups.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGroupId(g.id)}
                    className={cn(
                      "h-12 px-4 border text-[13px] font-black transition-all uppercase tracking-tight text-left truncate flex items-center justify-between rounded-none",
                      groupId === g.id
                        ? "bg-zinc-50 border-zinc-400 text-black"
                        : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-black"
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 border border-dashed border-zinc-200 text-zinc-400 text-[13px] font-black uppercase tracking-widest text-center">
                생성된 그룹이 없습니다
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="symbol" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">티커 심볼 (종목코드)</Label>
            <Input
              id="symbol"
              placeholder="E.G. AAPL, 005930.KS"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="h-12 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-colors placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">자산 명칭</Label>
            <Input
              id="name"
              placeholder="E.G. APPLE, SAMSUNG"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-colors placeholder:text-zinc-400"
            />
          </div>

          <DialogFooter className="pt-4 pb-2">
            <Button
              type="submit"
              disabled={loading || groups.length === 0}
              className="w-full h-14 font-black bg-zinc-900 text-white border-none hover:bg-black transition-all shadow-none rounded-none uppercase tracking-widest text-[14px]"
            >
              {loading ? "처리 중..." : "종목 추가 완료"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
