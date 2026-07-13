import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
export default MainLayout;
