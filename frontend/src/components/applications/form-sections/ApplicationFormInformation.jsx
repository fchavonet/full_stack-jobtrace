import {
  APPLICATION_CONTRACT_TYPE_OPTIONS,
  APPLICATION_STATUS_OPTIONS
} from "../../../constants/application.constants";

import CityAutocomplete from "../CityAutocomplete";

function ApplicationFormInformation({
  form,
  onFieldChange,
  onLocationValueChange,
  onLocationSelect
}) {
  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">
          Informations principales
        </h3>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
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
            placeholder="Nom de l'entreprise..."
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
            placeholder="Intitulé du poste..."
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
            {APPLICATION_CONTRACT_TYPE_OPTIONS.map(
              function (option) {
                return (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                );
              }
            )}
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
            {APPLICATION_STATUS_OPTIONS.map(
              function (option) {
                return (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                );
              }
            )}
          </select>
        </label>

        <CityAutocomplete
          value={form.location}
          onValueChange={
            onLocationValueChange
          }
          onCitySelect={
            onLocationSelect
          }
        />

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
            placeholder="22404"
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

export default ApplicationFormInformation;
