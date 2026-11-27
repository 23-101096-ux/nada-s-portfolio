import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Preloader from "./components/Preloader";

// pages that are not built yet
const Soon = ({ name }) => (
  <main
    style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#000",
      color: "#fff",
      fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif",
      letterSpacing: "0.2em",
    }}
  >
    {name} — coming soon
  </main>
);

function Routing() {
  return (
    <BrowserRouter>
     <Preloader />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/skills" element={<Soon name="SKILLS" />} />
        <Route path="/contact" element={<Soon name="CONTACT" />} />
        <Route path="/faq" element={<Soon name="FAQ" />} />
        <Route path="/privacy" element={<Soon name="PRIVACY" />} />
        <Route path="*" element={<Soon name="404" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;