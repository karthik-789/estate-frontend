import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notice from "../components/Notice";

export default function AuthPage({ register = false }) {
  const { login, register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { const user = register ? await signUp(form) : await login({ email: form.email, password: form.password });
      const fallback = user.role === "ADMIN" ? "/admin/dashboard" : user.role === "AGENT" ? "/agent/dashboard" : "/user/dashboard";
      navigate(location.state?.from || fallback);
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };
  return <section className="auth-page"><form className="auth-card" onSubmit={submit}><Link className="brand" to="/"><span>H</span>Havenly</Link><p className="eyebrow">{register ? "CREATE ACCOUNT" : "WELCOME BACK"}</p><h1>{register ? "Start your search or listing journey." : "Sign in to Havenly."}</h1><Notice message={error} error />
    {register && <><label>Full name<input required name="fullName" value={form.fullName} onChange={update} /></label><label>Phone<input name="phone" value={form.phone} onChange={update} /></label></>}
    <label>Email<input required type="email" name="email" value={form.email} onChange={update} /></label><label>Password<input required minLength="10" type="password" name="password" value={form.password} onChange={update} /></label>
    {register && <label>Account type<select name="role" value={form.role} onChange={update}><option value="USER">Property seeker</option><option value="AGENT">Agent / property owner</option></select></label>}
    <button disabled={busy} className="button button-primary full-width">{busy ? "Please wait..." : register ? "Create account" : "Log in"}</button><p className="muted">{register ? "Already have an account?" : "New to Havenly?"} <Link to={register ? "/login" : "/register"}>{register ? "Log in" : "Create an account"}</Link></p>
  </form></section>;
}

