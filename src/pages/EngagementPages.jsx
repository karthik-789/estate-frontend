import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";

export function SavedPropertiesPage() {
  const [items, setItems] = useState(null);
  const refresh = () => api.get("/saved-properties", { params: { size: 30 } })
    .then(({ data }) => setItems(data.content)).catch(() => setItems([]));
  useEffect(() => { refresh(); }, []);
  const remove = async (id) => { await api.delete("/saved-properties/" + id); refresh(); };
  if (!items) return <Loading />;
  return <section className="panel"><h2>Saved properties</h2>{items.length ? <div className="record-list">{items.map((item) =>
    <article className="record" key={item.id}><div><h3>{item.title}</h3><p>{item.city} - INR {Number(item.price).toLocaleString("en-IN")}</p></div>
    <div><Link className="button button-quiet" to={"/properties/" + item.id}>View</Link><button className="text-button danger" onClick={() => remove(item.id)}>Remove</button></div></article>
  )}</div> : <EmptyState title="No saved properties" text="Save listings while you compare options." action={{ to: "/properties", label: "Browse properties" }} />}</section>;
}

export function NotificationsPage() {
  const [items, setItems] = useState(null);
  const refresh = () => api.get("/notifications", { params: { size: 30 } })
    .then(({ data }) => setItems(data.content)).catch(() => setItems([]));
  useEffect(() => { refresh(); }, []);
  const read = async (id) => {
    await api.put("/notifications/" + id + "/read");
    window.dispatchEvent(new Event("notifications-updated"));
    refresh();
  };
  if (!items) return <Loading />;
  return <section className="panel"><h2>Notifications</h2>{items.length ? <div className="record-list">{items.map((item) =>
    <article className="record" key={item.id}><div><h3>{item.title}</h3><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
    {!item.read && <button className="button button-quiet" onClick={() => read(item.id)}>Mark as read</button>}</article>
  )}</div> : <EmptyState title="All caught up" text="Booking, enquiry, payment and listing updates appear here." />}</section>;
}

export function InterestedBuyersPage() {
  const [enquiries, setEnquiries] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadEnquiries = async () => {
      try {
        const firstPage = await api.get("/enquiries/agent", { params: { size: 2000, sort: "createdAt,desc" } });
        const { data } = firstPage;
        const remainingPages = await Promise.all(Array.from({ length: Math.max(0, data.totalPages - 1) }, (_, index) =>
          api.get("/enquiries/agent", { params: { size: 2000, page: index + 1, sort: "createdAt,desc" } })
        ));
        setEnquiries([...(data.content || []), ...remainingPages.flatMap((page) => page.data.content || [])]);
      } catch (error) {
        setLoadError(error.message);
        setEnquiries([]);
      }
    };
    loadEnquiries();
  }, []);

  if (enquiries === null) return <Loading />;
  const properties = new Map();
  enquiries.forEach((enquiry) => {
    const property = properties.get(enquiry.propertyId) || { id: enquiry.propertyId, title: enquiry.propertyTitle, buyers: new Map(), enquiries: [] };
    property.buyers.set(enquiry.userId, enquiry.userName);
    property.enquiries.push(enquiry);
    properties.set(enquiry.propertyId, property);
  });
  const listings = [...properties.values()].sort((left, right) => new Date(right.enquiries[0].createdAt) - new Date(left.enquiries[0].createdAt));
  const interestedBuyerCount = new Set(enquiries.map((enquiry) => enquiry.userId)).size;

  return <section className="interested-buyers-page">
    <header className="interest-heading"><div><p className="eyebrow">BUYER INTEREST</p><h2>Interested buyers</h2><p>See who has contacted you about each property.</p></div><Link className="button button-quiet" to="/agent/notifications">View notifications</Link></header>
    <div className="stats-grid"><StatCard label="Interested members" value={interestedBuyerCount} /><StatCard label="Properties with enquiries" value={listings.length} accent="gold" /><StatCard label="Total messages" value={enquiries.length} accent="green" /></div>
    {loadError ? <Notice message={loadError} error /> : listings.length ? <div className="interest-list">{listings.map((property) => <article className="interest-property" key={property.id}>
      <header><div><p className="eyebrow">PROPERTY INTEREST</p><h3>{property.title}</h3></div><div className="interest-count"><strong>{property.buyers.size}</strong><span>{property.buyers.size === 1 ? "interested member" : "interested members"}</span></div></header>
      <div className="interest-messages">{property.enquiries.map((enquiry) => <div className="interest-message" key={enquiry.id}>
        <div><strong>{enquiry.userName}</strong><span>{new Date(enquiry.createdAt).toLocaleString()}</span></div>
        <p>{enquiry.message}</p><small>{enquiry.status}</small>
      </div>)}</div>
      <footer><Link to={`/properties/${property.id}`}>View listing</Link><Link to="/agent/enquiries">Manage enquiries</Link></footer>
    </article>)}</div> : <EmptyState title="No interested buyers yet" text="When a member contacts you about a listing, their message and interest count will appear here." />}
  </section>;
}

