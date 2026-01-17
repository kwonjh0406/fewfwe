import { getSupabaseServerClient } from "@/lib/server"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"

export default async function Home() {
  const supabase = await getSupabaseServerClient()

  let { data: portfolio } = await supabase.from("portfolios").select("*").limit(1).maybeSingle()

  if (!portfolio) {
    const { data: newPortfolio } = await supabase
      .from("portfolios")
      .insert({
        name: "내 포트폴리오",
        description: "주식 투자 포트폴리오",
      })
      .select()
      .single()

    portfolio = newPortfolio
  }

  if (!portfolio) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-zinc-400 font-black uppercase tracking-[0.3em] text-[11px] animate-pulse">
        Initializing Portfolio...
      </div>
    )
  }

  return (
    <PortfolioDashboard portfolioId={portfolio.id} />
  )
}
