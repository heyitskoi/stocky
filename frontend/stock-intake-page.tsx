"use client"

import { useState } from "react"
import { History, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockIntakeForm } from "@/components/stock-intake-form"
import StockIntakeHistoryPage from "./stock-intake-history-page"

export default function StockIntakePage() {
  const [activeTab, setActiveTab] = useState("intake")
  const [refreshHistory, setRefreshHistory] = useState(0)

  const handleIntakeSuccess = () => {
    // Switch to history tab and refresh data
    setActiveTab("history")
    setRefreshHistory((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Intake</h1>
            <p className="text-muted-foreground">Record new stock arrivals and view intake history</p>
          </div>
          <TabsList>
            <TabsTrigger value="intake" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Intake
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="intake" className="space-y-4">
          <StockIntakeForm onSuccess={handleIntakeSuccess} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <StockIntakeHistoryPage key={refreshHistory} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
