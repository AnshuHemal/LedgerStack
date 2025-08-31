import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import { RefreshHandler } from "./RefreshHandler";
import Overview from "./components/Overview";
import AccountsOverview from "./components/AccountMaster/AccountsOverview";
import ProductsOverview from "./components/ProductMaster/ProductsOverview";
import IncomeExpensesOverview from "./components/IncomeExpenses/IncomeExpensesOverview";
import ProformaInvoiceOverview from "./components/Tools/ProformaInvoice/ProformaInvoiceOverview";
import QuickEntryOverview from "./components/Tools/QuickEntry/QuickEntryOverview";
import AccountLedger from "./components/Ledger/AccountLedger";
import ProductLedger from "./components/Ledger/ProductLedger";
import OutstandingPayable from "./components/Tools/OutstandingPayable";
import OutstandingReceivable from "./components/Tools/OutstandingReceivable";
import InventoryManagement from "./components/Inventory/InventoryManagement";
import GenerateInvoice from "./components/Tools/GenerateInvoice";
import Preferences from "./pages/Preferences";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get(
          "https://ledgerstack-backend.vercel.app/api/auth/verify",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);
  return (
    <>
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            ) : (
              <Login />
            )
          }
        >
          <Route path="" element={<Overview />} />
          <Route path="accounts" element={<AccountsOverview />} />
          <Route path="products" element={<ProductsOverview />} />
          <Route path="income-expenses" element={<IncomeExpensesOverview />} />
          <Route
            path="proforma-invoice"
            element={<ProformaInvoiceOverview />}
          />
          <Route path="quick-entry" element={<QuickEntryOverview />} />
          <Route path="account-ledger" element={<AccountLedger />} />
          <Route path="product-ledger" element={<ProductLedger />} />
          <Route path="outstanding-payable" element={<OutstandingPayable />} />
          <Route
            path="outstanding-receivable"
            element={<OutstandingReceivable />}
          />
          <Route path="inventory/manage" element={<InventoryManagement />} />
          <Route
            path="inventory/manage/warehouse"
            element={<InventoryManagement />}
          />
          <Route
            path="inventory/manage/products"
            element={<InventoryManagement />}
          />
          <Route
            path="inventory/manage/subparts"
            element={<InventoryManagement />}
          />
          <Route
            path="inventory/manage/orders"
            element={<InventoryManagement />}
          />
          <Route
            path="inventory/manage/machines"
            element={<InventoryManagement />}
          />

          <Route path="generate" element={<GenerateInvoice />} />
          <Route path="preferences" element={<Preferences />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
