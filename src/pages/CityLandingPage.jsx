import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import PropertyCard from "../components/PropertyCard";

const modes = [
  { id: "SALE", label: "Buy", copy: "Homes and investment spaces for sale" },
  { id: "RENT", label: "Rent", copy: "Find a place that suits your everyday" },
  { id: "COMMERCIAL", label: "Commercial", copy: "Workspaces and retail opportunities" }
];

const areas = ["Gachibowli", "Madhapur", "Kondapur", "Jubilee Hills", "Kukatpally", "Hitech City", "Manikonda", "Uppal"];
const faqs = [
  ["Is Hyderabad good for property investment?", "Hyderabad combines major employment hubs, expanding transit and varied residential choices. Compare locality, verification status, title documents and total ownership costs before investing."],
  ["Which localities are popular with professionals?", "Gachibowli, Hitech City, Madhapur, Kondapur and Manikonda are popular options for proximity to technology corridors. Your commute, budget and preferred amenities should guide the final shortlist."],
  ["How do I arrange a visit?", "Open any verified listing, sign in, send an enquiry or choose a preferred visit date. The owner or agent can then manage the request in Havenly."],
  ["Can I list my own property?", "Yes. Register as an agent or property owner, add your details and images, then submit your listing for admin verification before it is publicly visible."]
];

export default function CityLandingPage() {
  const [mode, setMode] = useState("SALE");
  const [area, setArea] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();
  const params = useMemo(() => ({ city: "Hyderabad", size: 6, ...(mode === "COMMERCIAL" ? { propertyType: "COMMERCIAL" } : { listingType: mode }) }), [mode]);

  useEffect(() => {
    setLoading(true);
    api.get("/properties", { params }).then(({ data }) => setProperties(data.content || []))
      .catch(() => setProperties([])).finally(() => setLoading(false));
  }, [params]);

  const search = (event) => {
    event.preventDefault();
    const searchParams = new URLSearchParams({ city: "Hyderabad" });
    if (mode === "COMMERCIAL") searchParams.set("propertyType", "COMMERCIAL");
    else searchParams.set("listingType", mode);
    if (area) searchParams.set("query", area);
    navigate("/properties?" + searchParams.toString());
  };

  return <main className="city-page">
    <section className="city-hero">
      <div className="city-hero-inner">
        <p className="eyebrow">HYDERABAD PROPERTY GUIDE</p>
        <h1>Discover a better way to find property in Hyderabad.</h1>
        <p>Explore approved homes, rental spaces and commercial opportunities with local search, verified listings and direct agent contact.</p>
        <form className="city-search" onSubmit={search}>
          <div className="city-mode-tabs">{modes.map((item) => <button type="button" key={item.id} className={mode === item.id ? "active" : ""} onClick={() => setMode(item.id)}>{item.label}</button>)}</div>
          <div className="city-search-row"><input list="hyderabad-areas" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Search Gachibowli, Kondapur, a project..." /><datalist id="hyderabad-areas">{areas.map((item) => <option key={item} value={item} />)}</datalist><button className="button button-accent">Search Hyderabad</button></div>
        </form>
        <div className="city-quick-links"><span>Popular areas:</span>{areas.slice(0, 5).map((item) => <button key={item} onClick={() => { setArea(item); navigate("/properties?city=Hyderabad&query=" + encodeURIComponent(item)); }}>{item}</button>)}</div>
      </div>
      <aside className="city-post-card"><span className="city-post-icon">+</span><h2>Have a property to list?</h2><p>Reach genuine buyers and tenants through a reviewed listing process.</p><Link className="button button-light full-width" to="/register">Post property free</Link></aside>
    </section>

    <section className="city-section city-category-section"><div><p className="eyebrow">EXPLORE HYDERABAD</p><h2>Find a space for every plan.</h2></div><div className="city-category-grid">{[{ name: "Apartments", type: "APARTMENT", detail: "Modern city living" }, { name: "Villas", type: "VILLA", detail: "Space to grow" }, { name: "Plots", type: "PLOT", detail: "Build your vision" }, { name: "Commercial", type: "COMMERCIAL", detail: "Room for business" }].map((item) => <Link key={item.type} to={"/properties?city=Hyderabad&propertyType=" + item.type} className="city-category"><span>{item.name.slice(0, 1)}</span><div><strong>{item.name}</strong><small>{item.detail}</small></div><b>→</b></Link>)}</div></section>

    <section className="city-section"><div className="city-section-heading"><div><p className="eyebrow">{modes.find((item) => item.id === mode).label.toUpperCase()} IN HYDERABAD</p><h2>Featured verified properties</h2><p>{modes.find((item) => item.id === mode).copy}.</p></div><Link to={"/properties?" + new URLSearchParams(params).toString()}>View all →</Link></div>
      {loading ? <Loading label="Finding Hyderabad properties..." /> : properties.length ? <div className="property-grid">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <EmptyState title="More Hyderabad listings are coming" text="Try another property type or browse all approved listings." action={{ to: "/properties?city=Hyderabad", label: "Browse Hyderabad" }} />}
    </section>

    <section className="city-insights"><div className="city-section-heading"><div><p className="eyebrow">LOCAL INSIGHTS</p><h2>Make an informed Hyderabad move.</h2></div></div><div className="insight-grid"><article><span>01</span><h3>Match location to lifestyle</h3><p>Start with commute time, neighbourhood essentials and your daily routine before comparing price per square foot.</p></article><article><span>02</span><h3>Keep the total cost clear</h3><p>Plan for registration, maintenance, legal review and finance costs alongside the listing price.</p></article><article><span>03</span><h3>Choose verified listings</h3><p>Havenly lists only approved properties publicly, so you can begin each shortlist with more confidence.</p></article></div></section>

    <section className="city-section city-faq"><div><p className="eyebrow">HYDERABAD FAQS</p><h2>Questions buyers and renters ask.</h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <article key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{question}</span><b>{openFaq === index ? "−" : "+"}</b></button>{openFaq === index && <p>{answer}</p>}</article>)}</div></section>
  </main>;
}
