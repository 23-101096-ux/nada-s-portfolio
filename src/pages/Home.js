import { useState } from "react";
import Hero from "../components/Hero1";
import HomeHero from "../components/Homehero";
import HomeSec2 from "../components/Homesec2";
import HomeSec3 from "../components/Homesec3";
import HomeSec4 from "../components/Homesec4";
import "./home.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Home() {
  const [play, setPlay] = useState(false); // starts the hero animation

  return (
    <main className="home">
      <HomeHero onReveal={() => setPlay(true)}>
        <Hero play={play} />
        <Header />
      </HomeHero>

      <HomeSec2 />

      <HomeSec3 />

      <HomeSec4 />

      <Footer />
    </main>
  );
}