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

import { Edit2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/client"
import type { Transaction } from "@/types/portfolio"

interface EditTransactionDialogProps {
    transaction: Transaction
    stockName: string
    onTransactionUpdated: () => void
}

export function EditTransactionDialog({ transaction, stockName, onTransactionUpdated }: EditTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [type, setType] = useState<"buy" | "sell">(transaction.type)
    const [date, setDate] = useState(transaction.transaction_date.split('T')[0])
    const [quantity, setQuantity] = useState(transaction.quantity.toString())
    const [price, setPrice] = useState(transaction.price.toString())

    // Update state when transaction prop changes
    useEffect(() => {
        setType(transaction.type)
        setDate(transaction.transaction_date.split('T')[0])
        setQuantity(transaction.quantity.toString())
        setPrice(transaction.price.toString())
    }, [transaction])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = getSupabaseBrowserClient()

        const { error } = await supabase
            .from("transactions")
            .update({
                type,
                transaction_date: date,
                quantity: Number(quantity),
                price: Number(price),
            })
            .eq("id", transaction.id)

        if (!error) {
            setOpen(false)
            onTransactionUpdated()
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 transition-colors bg-white hover:bg-white">
                    <Edit2 className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[400px] max-h-[85dvh] border-zinc-200 rounded-none p-0 flex flex-col shadow-none font-sans bg-white">
                <DialogHeader className="px-6 pt-10 pb-6 bg-white border-b border-zinc-100 flex-shrink-0">
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-zinc-900 truncate">거래 기록 수정</DialogTitle>
                    <DialogDescription className="text-[13px] text-zinc-400 font-black uppercase tracking-widest truncate">
                        {stockName} / 거래 기록을 수정합니다
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

                        <div className="space-y-2">
                            <Label htmlFor="edit-date" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 날짜</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-quantity" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 수량</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                    min="1"
                                    className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-all w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-price" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">거래 단가 (원)</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    placeholder="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    min="0"
                                    className="h-11 px-4 border-zinc-200 shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-all w-full"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 pb-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 font-black bg-zinc-900 text-white border-none hover:bg-black transition-all shadow-none rounded-none uppercase tracking-widest text-[13px]"
                            >
                                {loading ? "저장 중..." : "기록 수정 완료"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
