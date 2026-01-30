export const getApiErrorMessage = (err, fallback = "Có lỗi xảy ra") => {
  const d = err?.response?.data;

  if (typeof d === "string" && d.trim()) return d;
  if (d?.message) return d.message;
  if (d?.error) return d.error;

  // một số BE trả errors: [] hoặc message dạng object
  if (Array.isArray(d?.errors) && d.errors.length) {
    return d.errors.map((x) => x?.message || x).join(", ");
  }

  return err?.message || fallback;
};
