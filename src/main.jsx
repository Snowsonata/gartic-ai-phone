import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // 引入路由核心
import Begin from "./Begin";
import App from "./App";
import "./styles.css";
function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Begin />} />
        <Route path="/app" element={<App/>} />
      </Routes>
    </BrowserRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
