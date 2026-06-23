import { Link } from "react-router-dom";

function DashboardPage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-5xl min-h-screen mx-auto p-4 flex flex-col justify-center items-center gap-4">
        <h1 className="text-4xl font-bold">
          Tableau de bord
        </h1>

        <Link className="btn btn-primary w-fit" to="/">
          Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}

export default DashboardPage;
