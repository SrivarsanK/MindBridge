import dynamic from 'next/dynamic'

const MarketingPage = dynamic(() => import('./page.client'), {
  ssr: false,
  loading: () => (
    <div className="relative overflow-hidden flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  )
})

export default function Page() {
  return <MarketingPage />
}