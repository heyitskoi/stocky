import { ProtectedRoute } from "@/components/protected-route"
import AccountApprovalsPage from "@/account-approvals-page"

export default function AccountApprovals() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <AccountApprovalsPage />
    </ProtectedRoute>
  )
}
