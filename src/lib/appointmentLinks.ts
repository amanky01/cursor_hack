/** Query params consumed by the appointments booking page for prefill. */
export function buildAppointmentsHref(opts: {
  hospitalName: string;
  city?: string;
  doctor?: string;
  specialty?: string;
}): string {
  const p = new URLSearchParams();
  if (opts.hospitalName.trim()) p.set("hospital", opts.hospitalName.trim());
  if (opts.city?.trim()) p.set("city", opts.city.trim());
  if (opts.doctor?.trim()) p.set("doctor", opts.doctor.trim());
  if (opts.specialty?.trim()) p.set("specialty", opts.specialty.trim());
  const q = p.toString();
  return q ? `/appointments?${q}` : "/appointments";
}
