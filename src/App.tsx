import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ClubListPage from "./pages/ClubListPage";
import ClubDetailPage from "./pages/ClubDetailPage";
import RequestPage from "./pages/RequestPage";
import BetaPopup from "./components/BetaPopup";

export default function App() {
    return (
        <>
            <BetaPopup />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/klubber" element={<ClubListPage />} />
                    <Route path="/klub/:clubId" element={<ClubDetailPage />} />
                    <Route path="/indberetning" element={<RequestPage />} />
                </Route>
            </Routes>
        </>
    );
}
