import { getApplicationStatusIsFinal } from "../../../utils/applications/display.utils";

function ApplicationFormDates({
  form,
  onFieldChange,
}) {
  const applicationStatusIsFinal = getApplicationStatusIsFinal(form.status);
  const followUpIsDisabled = Boolean(form.interviewAt) || form.status === "interview" || applicationStatusIsFinal;

  return (
    <section className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">
          Dates
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <input className="input input-bordered w-full" name="followUpAt" type="date" value={form.followUpAt} onChange={onFieldChange} disabled={followUpIsDisabled} min={form.sentAt} max={form.interviewAt || ""} />
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Date d’entretien
          </span>

          <input className="input input-bordered w-full" name="interviewAt" type="date" value={form.interviewAt} onChange={onFieldChange} disabled={applicationStatusIsFinal} min={form.sentAt} />
        </label>
      </div>
    </section>
  );
}

export default ApplicationFormDates;
