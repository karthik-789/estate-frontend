import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import Notice from "../components/Notice";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { api.get("/properties/" + id).then(({ data }) => setProperty(data)).catch((error) => setNotice(error.message)); }, [id]);
  const enquiry = async (event) => { event.preventDefault(); try { await api.post("/enquiries", { propertyId: property.id, message }); setNotice("Enquiry sent to " + property.owner.fullName + "."); setMessage(""); } catch (error) { setNotice(error.message); } };
  const booking = async (event) => { event.preventDefault(); try { await api.post("/bookings", { propertyId: property.id, visitDate, amount: property.price }); navigate("/user/bookings"); } catch (error) { setNotice(error.message); } };
  const save = async () => { try { await api.post("/saved-properties/" + property.id); setNotice("Property saved to your dashboard."); } catch (error) { setNotice(error.message); } };

  if (!property) return <section className="section"><Loading label={notice || "Loading property..."} /></section>;
  const canAct = user?.role === "USER";
  return <section className="section property-details"><div className="breadcrumb"><Link to="/properties">Properties</Link> / {property.city}</div>
    <div className="details-grid"><div><div className="gallery">{property.images?.length ? property.images.map((image) => <img key={image.id} src={image.imageUrl} alt={property.title} />) : <div className="gallery-placeholder">{property.propertyType.replace("_", " ")}</div>}</div>
      <p className="eyebrow">{property.listingType} · {property.propertyType.replace("_", " ")}</p><h1>{property.title}</h1><p className="location">⌖ {property.address}, {property.city}, {property.state}</p><h2>{money.format(property.price)}{property.listingType === "RENT" ? <small> / month</small> : ""}</h2><div className="fact-strip"><span>{property.bedrooms ?? "—"} bedrooms</span><span>{property.bathrooms ?? "—"} bathrooms</span><span>{property.area} sq ft</span></div><h3>About this property</h3><p className="description">{property.description}</p></div>
      <aside className="contact-card"><p className="eyebrow">LISTED BY</p><h3>{property.owner.fullName}</h3><p>{property.owner.phone || "Contact via enquiry"}</p><Notice message={notice} error={notice.includes("required") || notice.includes("cannot")} />
      {!user && <Link className="button button-primary full-width" to="/login">Log in to enquire</Link>}
      {canAct && <><button className="button button-quiet full-width" onClick={save}>Save property</button><form onSubmit={enquiry}><label>Message<textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="I would like to know more about this property." /></label><button className="button button-primary full-width">Send enquiry</button></form><form className="visit-form" onSubmit={booking}><label>Preferred visit date<input required type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} /></label><button className="button button-secondary full-width">Schedule visit & book</button></form></>}
      {user?.role === "AGENT" && <p className="muted">Agent actions are available from your dashboard.</p>}</aside>
    </div></section>;
}

