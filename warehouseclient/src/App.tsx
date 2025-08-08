import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import BalancePage from "./pages/BalancePage";
import ReceiptsPage from "./pages/ReceiptsPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import ClientsPage from "./pages/ClientsPage";
import UnitsPage from "./pages/UnitsPage";
import ResourcesPage from "./pages/ResourcesPage";
import AddReceiptPage from "./pages/AddReceiptPage";
import AddShipmentPage from "./pages/AddShipmentPage";
import AddClientPage from "./pages/AddClientPage";
import AddUnitPage from "./pages/AddUnitPage";
import AddResourcePage from "./pages/AddResourcePage";
import UpdateClientPage from "./pages/UpdateClientPage";
import UpdateResourcePage from "./pages/UpdateResourcePage";
import UpdateUnitPage from "./pages/UpdateUnitPage";
import UpdateReceiptPage from "./pages/UpdateReceiptPage";
import UpdateShipmentPage from "./pages/UpdateShipmentPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Главная страница */}
                    <Route index element={<BalancePage />} />

                    {/* Основные разделы */}
                    <Route path="balance" element={<BalancePage />} />
                    <Route path="receipts" element={<ReceiptsPage />} />
                    <Route path="shipments" element={<ShipmentsPage />} />

                    {/* Клиенты */}
                    <Route path="clients">
                        <Route index element={<ClientsPage />} />
                        <Route path="add" element={<AddClientPage />} />
                        <Route path=":id" element={<UpdateClientPage />} />
                    </Route>

                    {/* Единицы измерения */}
                    <Route path="units">
                        <Route index element={<UnitsPage />} />
                        <Route path="add" element={<AddUnitPage />} />
                        <Route path=":id" element={<UpdateUnitPage />} />
                    </Route>

                    {/* Ресурсы */}
                    <Route path="resources">
                        <Route index element={<ResourcesPage />} />
                        <Route path="add" element={<AddResourcePage />} />
                        <Route path=":id" element={<UpdateResourcePage />} />
                    </Route>

                    {/* Документы (поступления и отгрузки) */}
                    <Route path="add-receipt" element={<AddReceiptPage />} />
                    <Route path="add-shipment" element={<AddShipmentPage />} />

                    <Route path="receipts">
                        <Route index element={<ReceiptsPage />} />
                        <Route path="add" element={<AddReceiptPage />} />
                        <Route path=":id" element={<UpdateReceiptPage />} />
                    </Route>

                    <Route path="shipments">
                        <Route index element={<ShipmentsPage />} />
                        <Route path="add" element={<AddShipmentPage />} />
                        <Route path=":id" element={<UpdateShipmentPage />} />
                    </Route>

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;