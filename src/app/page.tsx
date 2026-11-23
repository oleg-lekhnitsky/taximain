import Header from "@/components/taxi/Header";
import Hero from "@/components/taxi/Hero";
import Terms from "@/components/taxi/Terms";
import News from "@/components/taxi/News";
import Cashback from "@/components/taxi/Cashback";
import CityCoverage from "@/components/taxi/CityCoverage";
import AppDownload from "@/components/taxi/AppDownload";
import Faq from "@/components/taxi/Faq";
import Footer from "@/components/taxi/Footer";
import CookieNotice from "@/components/taxi/CookieNotice";
import CountryContent from "@/components/CountrySwitcher/CountryContent";

export default function Home() {
  return (
    <>
      <div id="root">
        <Header />
        <CountryContent>
          <Hero />
          <Terms />
          <CityCoverage />
          <Cashback />
          <AppDownload />
          <Faq />
          <News />
        </CountryContent>
        <Footer />
      </div>
      <CookieNotice />
    </>
  );
}
