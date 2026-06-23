import { BriefcaseBusiness } from "lucide-react";

function App() {
  return (
    <main className="min-h-screen">
      <section className="max-w-5xl min-h-screen mx-auto p-4 flex  flex-col justify-center items-center gap-4">
        <h1 className="flex flex-row justify-center items-center text-4xl font-bold">
          <BriefcaseBusiness className="inline w-10 h-10 me-4 text-primary" /> JobTrace
        </h1>

        <button className="btn btn-primary" type="button">
          DaisyUI et Lucide fonctionnent
        </button>
      </section>
    </main>
  );
}

export default App;