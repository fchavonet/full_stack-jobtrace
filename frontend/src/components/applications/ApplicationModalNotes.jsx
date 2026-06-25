function ApplicationModalNotes({
  form,
  applicationNotesMaxLength,
  onFieldChange,
}) {
  return (
    <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Notes
        </h3>
      </div>

      <label className=" form-control w-full">
        <textarea
          className="textarea textarea-bordered min-h-28 w-full resize-none"
          name="notes"
          maxLength={applicationNotesMaxLength}
          value={form.notes}
          onChange={onFieldChange}
          placeholder="Informations utiles sur la candidature..."
        />

        <span className="mt-1 text-right text-xs text-base-content/50">
          {form.notes.length} / {applicationNotesMaxLength}
        </span>
      </label>
    </section>
  );
}

export default ApplicationModalNotes;
