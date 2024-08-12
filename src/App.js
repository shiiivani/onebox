import "./App.css";
import Login from "./components/Login";
import Onebox from "./components/Onebox";
import Inbox from "./components/Inbox";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/" element={<Login />} />
        <Route path="/onebox" element={<Onebox />} />
      </Routes>
    </Router>
  );
}

export default App;
