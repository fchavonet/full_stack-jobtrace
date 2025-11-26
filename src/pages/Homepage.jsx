import AuthModal from "../components/auth/AuthModal";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import HeroSection from "../components/homepage/sections/HeroSection";

function Homepage() {
  return (
    <>
      <Header />

      <main className="w-full flex flex-col flex-grow justify-center items-center bg-base-200">
        <HeroSection />
      </main>

      <Footer />

      <AuthModal />
    </>
  );
}

export default Homepage;