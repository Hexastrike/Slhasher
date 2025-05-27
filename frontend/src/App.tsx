import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { Layout } from "@/components/Layout";

import Index from "@/pages/Index";
import QueryDetail from "@/pages/QueryDetail";
import Settings from "@/pages/Settings";
import Feedback from "@/pages/Feedback";
// import SearchResults from "@/pages/SearchResults";
import NotFound from "@/pages/NotFound";

import { ThemeProvider } from "@/context/ThemeContext";

import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Outlet /></Layout>}>
            <Route index element={<Index />} />
            <Route path="/queries/:uuid" element={<QueryDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feedback" element={<Feedback />} />
            {/* <Route path="/search" element={<SearchResults />} /> */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;