import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Query from '@/pages/Query';
import '@/App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                </Route>
                <Route path="/queries/:id" element={<Layout />}>
                    <Route index element={<Query />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
