import { BriefcaseBusiness } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <div className="min-h-screen">
      <aside>
        <Link className="flex flex-row justify-center items-center gap-2 text-4xl font-bold" to="/">
          <BriefcaseBusiness className="text-primary" size="34" /><h1>Job<span className="text-primary">Trace</span></h1>
        </Link>
      </aside>
    </div>
  );
}

export default Dashboard;