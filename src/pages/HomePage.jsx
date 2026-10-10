import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import PropertyCard from "../components/PropertyCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Notice from "../components/Notice";

export default function HomePage() {
  const [properties, setProperties] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [listingType, setListingType] = useState("SALE");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => { api.get("/properties", { params: { size: 3 } }).then(({ data }) => setProperties(data.content)).catch((error) => { setProperties([]); setLoadError(error.message); }); }, []);
  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ listingType });
    if (query.trim()) params.set("query", query.trim());
    navigate("/properties?" + params);
  };

  return <><section className="home-hero"><div className="home-hero-content">
    <p className="home-eyebrow">HOMES, CONSIDERED</p>
    <h1>A place to<br />call yours.</h1>
    <p className="home-hero-description">Discover verified homes and distinctive spaces across India.</p>
    <form className="home-search" onSubmit={search}>
      <div className="home-search-mode" role="group" aria-label="Listing type">
        <button type="button" aria-pressed={listingType === "SALE"} className={listingType === "SALE" ? "selected" : ""} onClick={() => setListingType("SALE")}>Buy</button>
        <button type="button" aria-pressed={listingType === "RENT"} className={listingType === "RENT" ? "selected" : ""} onClick={() => setListingType("RENT")}>Rent</button>
      </div>
      <label className="home-location">
        <span>Where would you like to live?</span>
        <input aria-label="Location or property" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="City, neighbourhood, or property" />
      </label>
      <button className="home-search-submit" type="submit">Explore homes</button>
    </form>
    <div className="home-proof"><span>6+ Indian markets</span><span>Every public listing reviewed</span></div>
  </div><a className="home-photo-credit" href="https://www.pexels.com/photo/white-and-blue-house-106399/" target="_blank" rel="noreferrer">Photography via Pexels</a></section>
  <section className="section home-listings"><div className="section-heading"><div><p className="eyebrow">A THOUGHTFUL COLLECTION</p><h2>Explore verified properties</h2></div><Link to="/properties">See all properties →</Link></div>
    {properties === null ? <Loading label="Loading featured properties..." /> : properties.length ? <div className="property-grid">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : loadError ? <Notice message={loadError} error /> : <EmptyState title="No featured properties yet" text="Approved listings will appear here." />}
  </section>
  <section className="section muted-section"><div className="section-heading"><div><p className="eyebrow">HOW IT WORKS</p><h2>Move forward with confidence</h2></div></div>
    <div className="steps"><article><span>01</span><h3>Search intentionally</h3><p>Use location, category, budget and listing filters to narrow the field.</p></article><article><span>02</span><h3>Connect directly</h3><p>Ask questions, schedule a visit, and keep every enquiry in one place.</p></article><article><span>03</span><h3>Book simply</h3><p>Submit your request and complete a transparent development-demo payment flow.</p></article></div>
  </section>
  <section className="cta"><div><p className="eyebrow">OWN A PROPERTY?</p><h2>List with a professional workflow.</h2><p>Agent tools for listings, verification, enquiries and bookings.</p></div><Link className="button button-light" to="/register">Register as an agent</Link></section></>;
}

