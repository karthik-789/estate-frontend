import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import PropertyCard from "../components/PropertyCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const types = ["", "APARTMENT", "VILLA", "HOUSE", "PLOT", "COMMERCIAL", "OFFICE", "SHOP"];

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState({ content: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "", listingType: searchParams.get("listingType") || "",
    city: searchParams.get("city") || "", propertyType: searchParams.get("propertyType") || "",
    minPrice: searchParams.get("minPrice") || "", maxPrice: searchParams.get("maxPrice") || "", bedrooms: searchParams.get("bedrooms") || ""
  });

  useEffect(() => {
    setLoading(true);
    api.get("/properties", { params: Object.fromEntries([...searchParams, ["size", "12"]]) })
      .then(({ data }) => setPage(data)).catch(() => setPage({ content: [] })).finally(() => setLoading(false));
  }, [searchParams]);

  const update = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    const params = {};
    Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
    setSearchParams(params);
  };
  const clear = () => { setFilters({ query: "", listingType: "", city: "", propertyType: "", minPrice: "", maxPrice: "", bedrooms: "" }); setSearchParams({}); };

  return <section className="section listing-page"><div className="page-title"><p className="eyebrow">PROPERTY SEARCH</p><h1>Find a verified space</h1><p>Every public listing has completed the Havenly verification step.</p></div>
    <form className="filters" onSubmit={submit}><input name="query" value={filters.query} onChange={update} placeholder="Keyword or location" /><select name="listingType" value={filters.listingType} onChange={update}><option value="">Buy or rent</option><option value="SALE">Buy</option><option value="RENT">Rent</option></select><input name="city" value={filters.city} onChange={update} placeholder="City" />
      <select name="propertyType" value={filters.propertyType} onChange={update}>{types.map((type) => <option key={type} value={type}>{type ? type.replace("_", " ") : "Property type"}</option>)}</select><input type="number" min="0" name="minPrice" value={filters.minPrice} onChange={update} placeholder="Min price" /><input type="number" min="0" name="maxPrice" value={filters.maxPrice} onChange={update} placeholder="Max price" /><select name="bedrooms" value={filters.bedrooms} onChange={update}><option value="">Any beds</option>{[1,2,3,4,5].map((beds) => <option key={beds}>{beds}</option>)}</select><button className="button button-primary">Apply filters</button><button className="text-button" type="button" onClick={clear}>Clear</button></form>
    {loading ? <Loading /> : page.content.length ? <><p className="result-count">{page.totalElements} properties found</p><div className="property-grid">{page.content.map((property) => <PropertyCard key={property.id} property={property} />)}</div>{page.totalPages > 1 && <div className="pagination"><button disabled={page.first} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page.number - 1 })}>Previous</button><span>Page {page.number + 1} of {page.totalPages}</span><button disabled={page.last} onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page.number + 1 })}>Next</button></div>}</> : <EmptyState title="No properties matched" text="Try clearing a few filters or searching another location." action={{ to: "/properties", label: "Clear search" }} />}</section>;
}

