"use client"
import { useLocale } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const { t } = useLocale()
  const trust = [t("trust_ondevice"), t("trust_federated"), t("trust_encryption"), t("trust_247")]
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <section className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-pretty text-3xl md:text-4xl font-semibold">{t("hero_title")}</h1>
          <p className="text-muted-foreground">{t("hero_sub")}</p>
          <div className="flex items-center gap-3 pt-2">
            <Button asChild>
              <Link href="/login">{t("cta_start")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/privacy">{t("cta_privacy")}</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <ul className="grid gap-3">
            {trust.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" aria-hidden />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-muted-foreground">
            MindBridge processes data on-device. Federated learning is optional.
          </div>
        </div>
      </section>
    </div>
  )
}
