export default function Notice({ message, error }) {
  if (!message) return null;
  return <p className={"notice " + (error ? "notice-error" : "notice-success")} role="alert">{message}</p>;
}

