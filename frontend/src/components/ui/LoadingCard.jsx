function LoadingCard() {
  return (
    <div className="w-full mt-6 p-6 flex flex-row justify-center items-center rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <span className="loading loading-spinner loading-md" />
    </div>
  );
}

export default LoadingCard;
