import { ProtectedRoute } from "../../../components/protected-route"
import AuditLogsPage from "../../../audit-logs-page"

export default function Page() {
  return (
    <ProtectedRoute requiredRoles={["admin", "stock_manager"]}>
      <AuditLogsPage />
    </ProtectedRoute>
  )
}
