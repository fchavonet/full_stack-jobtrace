function getPageButtonClassName(
  page,
  currentPage
) {
  let className =
    "join-item btn btn-sm cursor-pointer";

  if (page === currentPage) {
    className =
      "join-item btn btn-sm btn-primary text-primary-content cursor-pointer";
  }

  return className;
}

function getAriaCurrent(
  page,
  currentPage
) {
  if (page === currentPage) {
    return "page";
  }

  return undefined;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    function (_, index) {
      return index + 1;
    }
  );

  function goToPreviousPage() {
    if (currentPage <= 1) {
      return;
    }

    onPageChange(currentPage - 1);
  }

  function goToNextPage() {
    if (currentPage >= totalPages) {
      return;
    }

    onPageChange(currentPage + 1);
  }

  function goToPage(page) {
    if (page === currentPage) {
      return;
    }

    onPageChange(page);
  }

  return (
    <nav
      className="w-full mt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
      aria-label="Pagination"
    >
      <p className="text-sm text-base-content/60">
        Page {currentPage} sur {totalPages}
      </p>

      <div className="max-w-full overflow-x-auto">
        <div className="join">
          <button
            className="join-item btn btn-sm cursor-pointer"
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Précédent
          </button>

          {pages.map(function (page) {
            return (
              <button
                className={getPageButtonClassName(
                  page,
                  currentPage
                )}
                type="button"
                key={page}
                aria-label={"Aller à la page " + page}
                aria-current={getAriaCurrent(
                  page,
                  currentPage
                )}
                onClick={function () {
                  goToPage(page);
                }}
              >
                {page}
              </button>
            );
          })}

          <button
            className="join-item btn btn-sm cursor-pointer"
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Pagination;
