function ApplicationFormDates({
  form,
  onFieldChange,
}) {
  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-base-100">
      <div>
        <h3 className="text-lg font-semibold">
          Dates
        </h3>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <label className="form-control w-full">
          <span className="label mb-1">
            Date d’envoi *
          </span>

          <input className="input input-bordered w-full" name="sentAt" type="date" value={form.sentAt} onChange={onFieldChange} required />
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Date de relance
          </span>

          <input className="input input-bordered w-full" name="followUpAt" type="date" value={form.followUpAt} onChange={onFieldChange} disabled={Boolean(form.interviewAt)} max={form.interviewAt} />
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Date d’entretien
          </span>

          <input className="input input-bordered w-full" name="interviewAt" type="date" value={form.interviewAt} onChange={onFieldChange} />
        </label>
      </div>
    </section>
  );
}

export default ApplicationFormDates;
