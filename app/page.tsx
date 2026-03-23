import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Guarantee from "@/components/Guarantee";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Guarantee />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
