"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { getSupabaseBrowserClient } from "@/lib/client"
import { Plus, Trash2, Settings2, FolderPlus, Layers } from "lucide-react"
import type { Group } from "@/types/portfolio"

interface GroupManagerProps {
    portfolioId: string
    groups: Group[]
    onUpdate: () => void
}

export function GroupManager({ portfolioId, groups, onUpdate }: GroupManagerProps) {
    const [open, setOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGroupName.trim()) return

        setLoading(true)
        const supabase = getSupabaseBrowserClient()

        const { error } = await supabase.from("groups").insert({
            portfolio_id: portfolioId,
            name: newGroupName,
        })

        if (!error) {
            setNewGroupName("")
            onUpdate()
        } else {
            alert("그룹 생성 실패: " + error.message)
        }

        setLoading(false)
    }

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm("이 그룹을 삭제하시겠습니까? 그룹에 속한 종목들의 그룹 정보가 초기화됩니다.")) return

        const supabase = getSupabaseBrowserClient()
        await supabase.from("groups").delete().eq("id", groupId)
        onUpdate()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start gap-2 h-10 px-4 border-none text-zinc-500 shadow-none hover:bg-white hover:text-black transition-all font-black text-[13px] rounded-none bg-transparent uppercase tracking-widest focus-visible:ring-0">
                    <Settings2 className="h-4 w-4" />
                    <span>그룹 관리</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[400px] max-h-[85dvh] border-zinc-200 rounded-none p-0 flex flex-col shadow-none font-sans overflow-hidden">
                <DialogHeader className="px-6 pt-10 pb-6 bg-white border-b border-zinc-100 flex-shrink-0">
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase text-zinc-900">그룹 관리</DialogTitle>
                    <DialogDescription className="text-[13px] text-zinc-400 font-black uppercase tracking-widest">
                        자산 그룹을 추가하거나 삭제합니다
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-10 pb-10">
                        {/* Create New Group */}
                        <div className="space-y-4">
                            <Label htmlFor="new-group" className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">새 그룹 빠른 추가</Label>
                            <form onSubmit={handleCreateGroup} className="flex gap-2">
                                <Input
                                    id="new-group"
                                    placeholder="그룹 명칭을 입력하세요..."
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    disabled={loading}
                                    className="h-11 px-4 border-zinc-200 bg-white shadow-none focus-visible:ring-0 focus-visible:border-zinc-400 font-black text-[14px] rounded-none transition-all placeholder:text-zinc-200"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !newGroupName.trim()}
                                    className="h-11 px-6 bg-zinc-900 text-white border-none hover:bg-black transition-all rounded-none font-black text-[13px] uppercase tracking-widest shadow-none flex items-center justify-center min-w-[80px]"
                                >
                                    {loading ? "..." : "추가"}
                                </Button>
                            </form>
                        </div>

                        {/* Group List */}
                        <div className="space-y-4">
                            <Label className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.2em] pl-0.5">현재 등록된 그룹</Label>
                            <div className="space-y-2">
                                {groups.length > 0 ? (
                                    groups.map((group) => (
                                        <div key={group.id} className="flex items-center justify-between px-4 h-11 border border-zinc-200 bg-white group transition-all hover:border-zinc-400 rounded-none">
                                            <div className="flex items-center gap-4 truncate">
                                                <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full group-hover:bg-zinc-900 transition-colors flex-shrink-0" />
                                                <span className="text-[13px] font-black text-zinc-800 uppercase tracking-tight truncate">{group.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-zinc-200 hover:text-rose-500 hover:bg-white bg-white rounded-none opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                                onClick={() => handleDeleteGroup(group.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 text-[13px] font-black text-zinc-200 uppercase tracking-[0.3em] italic bg-zinc-50/30 border border-dashed border-zinc-200">
                                        등록된 그룹이 없습니다
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
