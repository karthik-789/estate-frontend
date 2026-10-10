import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function PropertyCard({ property }) {
  const image = property.images?.[0]?.imageUrl;
  return <article className="property-card">
    <div className={"property-image " + (!image ? "property-image-fallback" : "")}>
      {image ? <img src={image} alt={property.title} /> : <span>{property.propertyType}</span>}
      <span className="badge">{property.listingType}</span>
      {property.verificationStatus === "APPROVED" && <span className="verified">Verified</span>}
    </div>
    <div className="property-body">
      <p className="eyebrow">{property.propertyType.replace("_", " ")}</p>
      <h3><Link to={"/properties/" + property.id}>{property.title}</Link></h3>
      <p className="muted">{property.address}, {property.city}</p>
      <strong className="price">{money.format(property.price)}{property.listingType === "RENT" ? <small> / month</small> : ""}</strong>
      <div className="facts">
        {property.bedrooms != null && <span>{property.bedrooms} beds</span>}
        {property.bathrooms != null && <span>{property.bathrooms} baths</span>}
        <span>{property.area} sq ft</span>
      </div>
      <Link className="button button-secondary full-width" to={"/properties/" + property.id}>View details</Link>
    </div>
  </article>;
}

