import { ProtectedRoute } from "../../components/protected-route"
import TransferManagementPage from "../../transfer-management-page"

export default function Page() {
  return (
    <ProtectedRoute requiredRoles={["stock_manager", "admin"]}>
      <TransferManagementPage />
    </ProtectedRoute>
  )
}
