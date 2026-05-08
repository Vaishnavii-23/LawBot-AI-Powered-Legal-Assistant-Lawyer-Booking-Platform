import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 pt-6">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
