import Header from "../components/layout/Header";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Header
        authenticatedLinkIcon="home"
        authenticatedLinkLabel="Accueil"
        authenticatedLinkTo="/"
        pageTitle="Tableau de bord"
      />

      <main>

      </main>
    </div>
  );
}

export default DashboardPage;
