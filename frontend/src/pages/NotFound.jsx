import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Button from "../components/common/Button";
const NotFound = () => {
  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 text-center py-24">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-heading font-semibold text-lg mt-4">Page not found</p>
        <p className="text-body mt-2">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="inline-block mt-6">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </MainLayout>
  );
};
export default NotFound;
