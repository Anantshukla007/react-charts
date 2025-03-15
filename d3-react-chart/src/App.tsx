import React from "react";
import Dashboard from "./components/Dashboard";
import "./styles/App.css"; // Import CSS file

const App: React.FC = () => {
  return (
    <div className="app">
      <Dashboard />
    </div>
  );
};

export default App;
