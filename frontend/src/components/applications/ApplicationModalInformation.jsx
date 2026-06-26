function ApplicationModalInformation({
  form,
  onFieldChange,
}) {
  return (
    <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
      <div>
        <h3 className="text-lg font-semibold">
          Informations principales
        </h3>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="form-control w-full">
          <span className="label mb-1">
            Entreprise *
          </span>

          <input
            className="input input-bordered w-full"
            name="company"
            type="text"
            autoComplete="off"
            value={form.company}
            onChange={onFieldChange}
            placeholder="Ex : Wayne Enterprises"
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Poste *
          </span>

          <input
            className="input input-bordered w-full"
            name="position"
            type="text"
            autoComplete="off"
            value={form.position}
            onChange={onFieldChange}
            placeholder="Ex : Développeur front-end"
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Type de contrat
          </span>

          <select
            className="select select-bordered w-full"
            name="contractType"
            value={form.contractType}
            onChange={onFieldChange}
          >
            <option value="">
              Non renseigné
            </option>

            <option value="permanent">
              CDI
            </option>

            <option value="fixed_term">
              CDD
            </option>

            <option value="apprenticeship">
              Alternance
            </option>

            <option value="internship">
              Stage
            </option>

            <option value="freelance">
              Freelance
            </option>

            <option value="other">
              Autre
            </option>
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Statut
          </span>

          <select
            className="select select-bordered w-full"
            name="status"
            value={form.status}
            onChange={onFieldChange}
          >
            <option value="sent">
              Envoyée
            </option>

            <option value="follow_up">
              À relancer
            </option>

            <option value="interview">
              Entretien
            </option>

            <option value="rejected">
              Refusée
            </option>

            <option value="accepted">
              Acceptée
            </option>
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Ville
          </span>

          <input
            className="input input-bordered w-full"
            name="location"
            type="text"
            autoComplete="off"
            value={form.location}
            onChange={onFieldChange}
            placeholder="Ex : Toulouse"
          />
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Salaire annuel brut
          </span>

          <input
            className="input input-bordered w-full"
            name="salary"
            type="number"
            min="0"
            step="1"
            value={form.salary}
            onChange={onFieldChange}
            placeholder="Ex : 38000"
          />
        </label>

        <label className="form-control w-full md:col-span-2">
          <span className="label mb-1">
            Lien de l’offre
          </span>

          <input
            className="input input-bordered w-full"
            name="link"
            type="url"
            autoComplete="off"
            value={form.link}
            onChange={onFieldChange}
            placeholder="https://..."
          />
        </label>
      </div>
    </section>
  );
}

export default ApplicationModalInformation;
