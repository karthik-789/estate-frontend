import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Notice from "../components/Notice";
import StatCard from "../components/StatCard";

const load = (path, set, setLoading) => { setLoading(true); api.get(path, { params: { size: 30 } }).then(({ data }) => set(data.content || data)).catch(() => set([])).finally(() => setLoading(false)); };

export function UserDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/user/dashboard").then(({ data }) => setStats(data)).catch(() => setStats({})); }, []);
  if (!stats) return <Loading />;
  return <><div className="dashboard-intro"><p>Track your property conversations and next steps in one secure place.</p></div><div className="stats-grid"><StatCard label="Total enquiries" value={stats.enquiries} /><StatCard label="Booking requests" value={stats.bookings} accent="gold" /><StatCard label="Payments" value={stats.payments} accent="green" /></div><section className="panel"><h2>Next steps</h2><p>Browse verified listings, send an enquiry, then schedule a visit when a property feels right.</p><a className="button button-primary" href="/properties">Explore properties</a></section></>;
}

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(user || {});
  const [notice, setNotice] = useState("");
  const submit = async (event) => { event.preventDefault(); try { await api.put("/users/me", form); await refreshUser(); setNotice("Profile saved."); } catch (error) { setNotice(error.message); } };
  return <section className="panel form-panel"><h2>My profile</h2><Notice message={notice} error={notice !== "Profile saved."} /><form onSubmit={submit} className="form-grid"><label>Full name<input required name="fullName" value={form.fullName || ""} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label><label>Phone<input name="phone" value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Address<input name="address" value={form.address || ""} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label><label>City<input name="city" value={form.city || ""} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><label>State<input name="state" value={form.state || ""} onChange={(event) => setForm({ ...form, state: event.target.value })} /></label><button className="button button-primary">Save profile</button></form></section>;
}

export function EnquiriesPage({ agent = false, admin = false }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const endpoint = admin ? "/admin/enquiries" : agent ? "/enquiries/agent" : "/enquiries/my";
  const refresh = () => load(endpoint, setItems, setLoading);
  useEffect(refresh, []);
  const update = async (id, status) => { await api.put("/enquiries/" + id, { status }); refresh(); };
  if (loading) return <Loading />;
  return <section className="panel"><h2>{agent || admin ? "Manage enquiries" : "My enquiries"}</h2>{items.length ? <div className="record-list">{items.map((item) => <article className="record" key={item.id}><div><h3>{item.propertyTitle}</h3><p>{agent || admin ? item.userName + " · " : ""}{item.message}</p><small>{new Date(item.createdAt).toLocaleDateString()}</small></div><div><span className="status">{item.status}</span>{(agent || admin) && <select value={item.status} onChange={(event) => update(item.id, event.target.value)}><option>NEW</option><option>CONTACTED</option><option>CLOSED</option></select>}</div></article>)}</div> : <EmptyState title="No enquiries yet" text="Property enquiries will appear here." />}</section>;
}

export function BookingsPage({ agent = false, admin = false }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [notice, setNotice] = useState("");
  const endpoint = admin ? "/admin/bookings" : agent ? "/bookings/agent" : "/bookings/my";
  const refresh = () => load(endpoint, setItems, setLoading);
  useEffect(refresh, []);
  const update = async (id, status) => { try { await api.put("/bookings/" + id + "/status", { status }); refresh(); } catch (error) { setNotice(error.message); } };
  const pay = async (item) => { try { await api.post("/payments/mock", { bookingId: item.id, paymentMethod: "UPI", simulateSuccess: true }); setNotice("DEMO payment approved. Your booking is confirmed."); refresh(); } catch (error) { setNotice(error.message); } };
  if (loading) return <Loading />;
  return <section className="panel"><h2>{agent || admin ? "Manage bookings" : "My bookings"}</h2><Notice message={notice} error={notice && !notice.includes("approved")} />{items.length ? <div className="record-list">{items.map((item) => <article className="record" key={item.id}><div><h3>{item.propertyTitle}</h3><p>Visit: {item.visitDate} · Amount: ₹{Number(item.amount).toLocaleString("en-IN")}</p><small>{agent || admin ? "Requested by " + item.userName : "Agent: " + item.agentName}</small></div><div><span className="status">{item.status}</span>{(agent || admin) ? <select value={item.status} onChange={(event) => update(item.id, event.target.value)}><option>PENDING</option><option>CONFIRMED</option><option>CANCELLED</option><option>COMPLETED</option></select> : item.status === "PENDING" && <button className="button button-primary" onClick={() => pay(item)}>Pay (demo)</button>}</div></article>)}</div> : <EmptyState title="No bookings yet" text="Schedule a property visit to begin." action={{ to: "/properties", label: "Find a property" }} />}</section>;
}

export function PaymentsPage({ admin = false }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => load(admin ? "/admin/payments" : "/payments/my", setItems, setLoading), [admin]);
  if (loading) return <Loading />;
  return <section className="panel"><p className="eyebrow">DEMO / MOCK PAYMENTS</p><h2>{admin ? "All payment records" : "Payment history"}</h2>{items.length ? <div className="record-list">{items.map((item) => <article className="record" key={item.id}><div><h3>Booking #{item.bookingId}</h3><p>{item.paymentMethod} · {item.transactionId}</p></div><div><strong>₹{Number(item.amount).toLocaleString("en-IN")}</strong><span className="status">{item.paymentStatus}</span></div></article>)}</div> : <EmptyState title="No payments yet" text="Payments made through the demo flow will appear here." />}</section>;
}

