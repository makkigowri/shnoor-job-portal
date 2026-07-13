import MainLayout from "../layouts/MainLayout";
import Hero from "../components/sections/Hero";
import WhyJoinShnoor from "../components/sections/WhyJoinShnoor";
import CurrentOpenings from "../components/sections/CurrentOpenings";
import AboutAndProcess from "../components/sections/AboutAndProcess";
import Faq from "../components/sections/Faq";
const Landing = () => {
  return (
    <MainLayout>
      <Hero />
      <WhyJoinShnoor />
      <CurrentOpenings />
      <AboutAndProcess />
      <Faq />
    </MainLayout>
  );
};
export default Landing;
