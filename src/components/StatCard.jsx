export default function StatCard({ label, value, accent = "blue" }) {
  return <article className={"stat-card accent-" + accent}>
    <span>{label}</span><strong>{value ?? 0}</strong>
  </article>;
}

