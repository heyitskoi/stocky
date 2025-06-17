import { ProtectedRoute } from "@/components/protected-route"
import StockIntakePage from "@/stock-intake-page"

export default function Intake() {
  return (
    <ProtectedRoute requiredRoles={["stock_manager", "admin"]}>
      <StockIntakePage />
    </ProtectedRoute>
  )
}
