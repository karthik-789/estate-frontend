import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Notice from "../components/Notice";
import StatCard from "../components/StatCard";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/dashboard").then(({ data }) => setStats(data)).catch(() => setStats({})); }, []);
  if (!stats) return <Loading />;
  const chart = [{ name: "Users", value: stats.users || 0 }, { name: "Agents", value: stats.agents || 0 }, { name: "Properties", value: stats.properties || 0 }, { name: "Bookings", value: stats.bookings || 0 }];
  return <><div className="stats-grid"><StatCard label="Users" value={stats.users} /><StatCard label="Agents" value={stats.agents} /><StatCard label="Properties" value={stats.properties} /><StatCard label="Pending review" value={stats.pendingProperties} accent="gold" /><StatCard label="Bookings" value={stats.bookings} accent="green" /><StatCard label="Payments" value={stats.payments} /></div><section className="panel chart-panel"><h2>Platform overview</h2><ResponsiveContainer width="100%" height={260}><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#0d3b66" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></section></>;
}

export function AdminUsers({ agents = false }) {
  const [items, setItems] = useState(null);
  const endpoint = agents ? "/admin/agents" : "/admin/users";
  const refresh = () => api.get(endpoint, { params: { size: 50 } }).then(({ data }) => setItems(data.content)).catch(() => setItems([]));
  useEffect(refresh, [agents]);
  const status = async (item) => { await api.put("/admin/users/" + item.id + "/status", null, { params: { active: !item.active } }); refresh(); };
  const verify = async (item) => { await api.put("/admin/agents/" + item.id + "/verification", null, { params: { status: "APPROVED" } }); refresh(); };
  if (!items) return <Loading />;
  return <section className="panel"><h2>{agents ? "Manage agents" : "Manage users"}</h2>{items.length ? <div className="record-list">{items.map((item) => <article className="record" key={item.id}><div><h3>{item.fullName}</h3><p>{item.email} · {item.role}</p><small>{item.city || "No city set"}</small></div><div><span className="status">{item.active ? "ACTIVE" : "BLOCKED"}</span>{agents && <button className="button button-quiet" onClick={() => verify(item)}>Verify profile</button>}<button className={item.active ? "text-button danger" : "button button-quiet"} onClick={() => status(item)}>{item.active ? "Block" : "Activate"}</button></div></article>)}</div> : <EmptyState title="No accounts" text="Accounts appear here after registration." />}</section>;
}

export function VerificationPage() {
  const [items, setItems] = useState(null); const [notice, setNotice] = useState("");
  const refresh = () => api.get("/admin/properties/pending", { params: { size: 50 } }).then(({ data }) => setItems(data.content)).catch(() => setItems([]));
  useEffect(refresh, []);
  const approve = async (id) => { try { await api.put("/admin/properties/" + id + "/approve"); refresh(); } catch (error) { setNotice(error.message); } };
  const reject = async (id) => { const reason = window.prompt("Reason for rejecting this listing:"); if (!reason) return; try { await api.put("/admin/properties/" + id + "/reject", { reason }); refresh(); } catch (error) { setNotice(error.message); } };
  if (!items) return <Loading />;
  return <section className="panel"><h2>Property verification</h2><Notice message={notice} error />{items.length ? <div className="record-list">{items.map((item) => <article className="record" key={item.id}><div><h3>{item.title}</h3><p>{item.propertyType} · {item.city} · listed by {item.owner.fullName}</p><small>{item.description}</small></div><div className="button-group"><button className="button button-primary" onClick={() => approve(item.id)}>Approve</button><button className="button button-quiet" onClick={() => reject(item.id)}>Reject</button></div></article>)}</div> : <EmptyState title="Verification queue is clear" text="New and edited property submissions will appear here." />}</section>;
}

export function ReportsPage() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/reports").then(({ data }) => setStats(data)).catch(() => setStats({})); }, []);
  if (!stats) return <Loading />;
  const chart = [{ name: "Approved", value: stats.approvedProperties || 0 }, { name: "Pending", value: stats.pendingProperties || 0 }, { name: "Enquiries", value: stats.enquiries || 0 }, { name: "Bookings", value: stats.bookings || 0 }, { name: "Payments", value: stats.payments || 0 }];
  return <section className="panel chart-panel"><p className="eyebrow">LIVE PLATFORM TOTALS</p><h2>Reports & analytics</h2><ResponsiveContainer width="100%" height={320}><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#c88a35" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></section>;
}

