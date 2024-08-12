import "./App.css";
import Login from "./components/Login";
import Onebox from "./components/Onebox";
import Inbox from "./components/Inbox";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/https://onebox-zeta.vercel.app/inbox"
          element={<Inbox />}
        />
        <Route path="/https://onebox-zeta.vercel.app/" element={<Login />} />
        <Route
          path="/https://onebox-zeta.vercel.app/onebox"
          element={<Onebox />}
        />
      </Routes>
    </Router>
  );
}

export default App;
