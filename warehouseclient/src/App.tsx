import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import BalancePage from "./pages/BalancePage";
import IncomesPage from "./pages/IncomesPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import ClientsPage from "./pages/ClientsPage";
import UnitsPage from "./pages/UnitsPage";
import ResourcesPage from "./pages/ResourcesPage";
import AddReceiptPage from "./pages/AddReceiptPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<BalancePage />} />
                    <Route path="balance" element={<BalancePage />} />
                    <Route path="incomes" element={<IncomesPage />} />
                    <Route path="shipments" element={<ShipmentsPage />} />
                    <Route path="clients" element={<ClientsPage />} />
                    <Route path="units" element={<UnitsPage />} />
                    <Route path="resources" element={<ResourcesPage />} />
                    <Route path="add-receipt" element={<AddReceiptPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;