import { ProtectedRoute } from "../../components/protected-route"
import MyEquipmentPage from "../../my-equipment-page"

export default function Page() {
  return (
    <ProtectedRoute>
      <MyEquipmentPage />
    </ProtectedRoute>
  )
}
