import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Notice from "../components/Notice";
import StatCard from "../components/StatCard";

const blank = { title: "", description: "", propertyType: "APARTMENT", listingType: "SALE", price: "", bedrooms: "", bathrooms: "", area: "", address: "", city: "", state: "", pincode: "" };

export function AgentDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/agent/dashboard").then(({ data }) => setStats(data)).catch(() => setStats({})); }, []);
  if (!stats) return <Loading />;
  return <><div className="stats-grid"><StatCard label="Properties" value={stats.properties} /><StatCard label="Approved" value={stats.approvedProperties} accent="green" /><StatCard label="Pending review" value={stats.pendingProperties} accent="gold" /><StatCard label="Enquiries" value={stats.enquiries} /></div><section className="panel"><h2>Manage your portfolio</h2><p>New or edited listings are sent back for admin verification before public display.</p><Link className="button button-primary" to="/agent/properties/add">Add a property</Link></section></>;
}

export function AgentProperties() {
  const [items, setItems] = useState(null);
  const refresh = () => api.get("/properties/mine/list", { params: { size: 50 } }).then(({ data }) => setItems(data.content)).catch(() => setItems([]));
  useEffect(refresh, []);
  const deactivate = async (id) => { if (window.confirm("Deactivate this property?")) { await api.delete("/properties/" + id); refresh(); } };
  if (!items) return <Loading />;
  return <section className="panel"><div className="panel-header"><h2>My properties</h2><Link className="button button-primary" to="/agent/properties/add">Add property</Link></div>{items.length ? <div className="record-list">{items.map((item) => <article className="record" key={item.id}><div><p className="eyebrow">{item.verificationStatus}</p><h3>{item.title}</h3><p>{item.city} · ₹{Number(item.price).toLocaleString("en-IN")}</p>{item.rejectionReason && <small className="notice-error">Reason: {item.rejectionReason}</small>}</div><div><Link className="button button-quiet" to={"/agent/properties/" + item.id + "/edit"}>Edit</Link><button className="text-button danger" onClick={() => deactivate(item.id)}>Deactivate</button></div></article>)}</div> : <EmptyState title="No properties yet" text="Add your first listing for admin verification." action={{ to: "/agent/properties/add", label: "Add property" }} />}</section>;
}

export function PropertyForm() {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState(blank); const [files, setFiles] = useState([]); const [notice, setNotice] = useState(""); const editing = Boolean(id);
  useEffect(() => { if (editing) api.get("/properties/mine/list", { params: { size: 100 } }).then(({ data }) => { const property = data.content.find((item) => String(item.id) === id); if (property) setForm({ ...blank, ...property, bedrooms: property.bedrooms ?? "", bathrooms: property.bathrooms ?? "" }); else setNotice("Property not found."); }); }, [id, editing]);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); try { const payload = { ...form, price: Number(form.price), area: Number(form.area), bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms), bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms) }; const response = editing ? await api.put("/properties/" + id, payload) : await api.post("/properties", payload); if (!editing && files.length) { const body = new FormData(); Array.from(files).forEach((file) => body.append("files", file)); await api.post("/properties/" + response.data.id + "/images", body); } navigate("/agent/properties"); } catch (error) { setNotice(error.message); } };
  return <section className="panel form-panel"><h2>{editing ? "Edit property" : "Add property"}</h2><p className="muted">Submitting changes sends the listing for admin review.</p><Notice message={notice} error /><form onSubmit={submit} className="form-grid"><label className="wide">Title<input required name="title" value={form.title} onChange={change} /></label><label>Property type<select name="propertyType" value={form.propertyType} onChange={change}>{["APARTMENT","VILLA","HOUSE","PLOT","COMMERCIAL","OFFICE","SHOP"].map((type) => <option key={type}>{type}</option>)}</select></label><label>Listing type<select name="listingType" value={form.listingType} onChange={change}><option>SALE</option><option>RENT</option></select></label><label>Price (₹)<input required type="number" min="1" name="price" value={form.price} onChange={change} /></label><label>Area (sq ft)<input required type="number" min="1" name="area" value={form.area} onChange={change} /></label><label>Bedrooms<input type="number" min="0" name="bedrooms" value={form.bedrooms} onChange={change} /></label><label>Bathrooms<input type="number" min="0" name="bathrooms" value={form.bathrooms} onChange={change} /></label><label>Address<input required name="address" value={form.address} onChange={change} /></label><label>City<input required name="city" value={form.city} onChange={change} /></label><label>State<input required name="state" value={form.state} onChange={change} /></label><label>Pincode<input name="pincode" value={form.pincode} onChange={change} /></label><label className="wide">Description<textarea required name="description" value={form.description} onChange={change} /></label>{!editing && <label className="wide">Property images (JPG, PNG or WEBP)<input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(event) => setFiles(event.target.files)} /></label>}<button className="button button-primary">{editing ? "Save and resubmit" : "Create property"}</button></form></section>;
}

