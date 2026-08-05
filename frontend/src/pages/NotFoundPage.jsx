import { Link } from "react-router";

function NotFoundPage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-5xl min-h-screen mx-auto p-4 flex flex-col justify-center items-center gap-4">
        <h1 className="text-4xl font-bold">
          Page introuvable
        </h1>

        <Link className="btn btn-primary" to="/">
          Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
