import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const dashboard = user?.role === "ADMIN" ? "/admin/dashboard" : user?.role === "AGENT" ? "/agent/dashboard" : "/user/dashboard";
  return <div className="site-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span>H</span>Havenly</Link>
      <nav>
        <NavLink to="/">Home</NavLink><NavLink to="/properties">Properties</NavLink>
        <NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink>
      </nav>
      <div className="topbar-actions">
        {user ? <><Link className="button button-quiet" to={dashboard}>Dashboard</Link><button className="text-button" onClick={logout}>Log out</button></>
          : <><Link className="button button-quiet" to="/login">Log in</Link><Link className="button button-primary" to="/register">Get started</Link></>}
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="footer"><div><strong>Havenly</strong><p>Better property decisions, from first search to final booking.</p></div><p>© {new Date().getFullYear()} Havenly Real Estate</p></footer>
  </div>;
}

