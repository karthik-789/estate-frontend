import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import Notice from "../components/Notice";

export default function AgentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => { api.get("/agent/profile").then(({ data }) => setProfile(data)).catch((error) => setNotice(error.message)); }, []);
  const update = (event) => setProfile({ ...profile, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); try { const { agencyName, licenseNumber, experience, description } = profile; const response = await api.put("/agent/profile", { agencyName, licenseNumber, experience: experience === "" ? null : Number(experience), description }); setProfile(response.data); setNotice("Profile saved and submitted for verification."); } catch (error) { setNotice(error.message); } };
  if (!profile) return <Loading label={notice || "Loading agent profile..."} />;
  return <section className="panel form-panel"><p className="eyebrow">AGENT PROFILE</p><h2>Professional details</h2><p className="muted">Verification status: <strong>{profile.verificationStatus}</strong></p><Notice message={notice} error={notice && !notice.includes("saved")} /><form className="form-grid" onSubmit={submit}><label>Agency name<input name="agencyName" value={profile.agencyName || ""} onChange={update} /></label><label>License number<input name="licenseNumber" value={profile.licenseNumber || ""} onChange={update} /></label><label>Years of experience<input type="number" min="0" name="experience" value={profile.experience ?? ""} onChange={update} /></label><label className="wide">About your service<textarea name="description" value={profile.description || ""} onChange={update} /></label><button className="button button-primary">Save profile</button></form></section>;
}

