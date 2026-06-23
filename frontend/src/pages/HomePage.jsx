import { BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-5xl min-h-screen mx-auto p-4 flex flex-col justify-center items-center gap-4">
        <h1 className="flex flex-row justify-center items-center gap-2 text-4xl font-bold">
          <BriefcaseBusiness className="h-10 w-10 text-primary" /> JobTrace
        </h1>

        <Link className="btn btn-primary" to="/dashboard">
          Accéder au tableau de bord
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
