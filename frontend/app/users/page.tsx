import { ProtectedRoute } from "../../components/protected-route"
import UserManagementPage from "../../user-management-page"

export default function Page() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <UserManagementPage />
    </ProtectedRoute>
  )
}
