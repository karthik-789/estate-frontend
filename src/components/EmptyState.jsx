import { Link } from "react-router-dom";

export default function EmptyState({ title, text, action }) {
  return <section className="empty-state">
    <h3>{title}</h3><p>{text}</p>
    {action && <Link className="button button-primary" to={action.to}>{action.label}</Link>}
  </section>;
}

