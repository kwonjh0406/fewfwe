"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Settings2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/client"
import type { Group } from "@/types/portfolio"

interface EditStockDialogProps {
    stockId: string
    currentName: string
    currentSymbol: string | null
    currentManualPrice: number | null
    currentGroupId: string | null
    groups: Group[]
    onStockUpdated: () => void
}

export function EditStockDialog({
    stockId,
    currentName,
    currentSymbol,
    currentManualPrice,
    currentGroupId,
    groups,
    onStockUpdated,
}: EditStockDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(currentName)
    const [symbol, setSymbol] = useState(currentSymbol || "")
    const [manualPrice, setManualPrice] = useState(currentManualPrice?.toString() || "")
    const [groupId, setGroupId] = useState(currentGroupId || "")

    // Reset state when props change
    useEffect(() => {
        setName(currentName)
        setSymbol(currentSymbol || "")
        setManualPrice(currentManualPrice?.toString() || "")
        setGroupId(currentGroupId || "")
    }, [currentName, currentSymbol, currentManualPrice, currentGroupId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = getSupabaseBrowserClient()
        const selectedGroup = groups.find(g => g.id === groupId)

        const { error } = await supabase
            .from("stocks")
            .update({
                name,
                symbol: symbol ? symbol.toUpperCase() : null,
                manual_price: manualPrice ? parseFloat(manualPrice) : null,
                group_id: groupId || null,
                group_name: selectedGroup?.name || "기타"
            })
            .eq("id", stockId)

        if (!error) {
            setOpen(false)
            onStockUpdated()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-black hover:bg-white bg-white rounded-none transition-all focus-visible:ring-0">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[400px] max-h-[85dvh] border-zinc-200 rounded-none p-0 flex flex-col shadow-none font-sans bg-white">
                <DialogHeader className="px-6 pt-10 pb-6 bg-white border-b border-zinc-100 flex-shrink-0">
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-zinc-900 truncate">종목 정보 수정</DialogTitle>
                    <DialogDescription className="text-[13px] text-zinc-400 font-black uppercase tracking-widest truncate">
                        {currentName} / 자산 정보를 수정합니다
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-10">
                        <div className="space-y-3">
                            <Label className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">그룹 이동</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setGroupId("none")}
                                    className={cn(
                                        "h-11 px-4 border text-[13px] font-black transition-all uppercase tracking-tight text-left truncate flex items-center justify-between rounded-none",
                                        groupId === "none" || !groupId
                                            ? "bg-zinc-50 border-zinc-400 text-black"
                                            : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-black"
                                    )}
                                >
                                    미지정 (기타)
                                </button>
                                {groups.map(g => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => setGroupId(g.id)}
                                        className={cn(
                                            "h-11 px-4 border text-[13px] font-black transition-all uppercase tracking-tight text-left truncate flex items-center justify-between rounded-none",
                                            groupId === g.id
                                                ? "bg-zinc-50 border-zinc-400 text-black"
                                                : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-black"
                                        )}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-symbol" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">티커 심볼 (종목코드)</Label>
                            <Input
                                id="edit-symbol"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-base md:text-[14px] rounded-none transition-all uppercase w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">자산 명칭</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-base md:text-[14px] rounded-none transition-all w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-price" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">사용자 지정 가격 (원)</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={manualPrice}
                                onChange={(e) => setManualPrice(e.target.value)}
                                placeholder="API 가격 무시하고 직접 입력"
                                className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-base md:text-[14px] rounded-none transition-all w-full"
                            />
                        </div>

                        <DialogFooter className="pt-4 pb-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 font-black bg-zinc-900 text-white border-none hover:bg-black transition-all shadow-none rounded-none uppercase tracking-widest text-[13px]"
                            >
                                {loading ? "저장 중..." : "정보 수정 완료"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
