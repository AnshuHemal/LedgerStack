import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = "https://ledgerstack-backend.vercel.app/api/user";

const Preferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    name: "",
    email: "",
    companyDetails: {
      companyName: "",
      address1: "",
      address2: "",
      authorisedPerson: "",
      registeredAddress1: "",
      registeredAddress2: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      phone: "",
      email: "",
      website: "",
      gstin: "",
      pan: "",
      bankDetails: {
        bankName: "",
        accountNumber: "",
        branch: "",
        ifscCode: "",
      },
    },
    qrCodeImage: "",
    termsAndConditions: "",
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await axios.get(`${API}/preferences`, { withCredentials: true });
        if (res.data?.success && res.data.user) {
          const u = res.data.user;
          setUser({
            name: u.name || "",
            email: u.email || "",
            companyDetails: {
              companyName: u.companyDetails?.companyName || "",
              address1: u.companyDetails?.address1 || "",
              address2: u.companyDetails?.address2 || "",
              authorisedPerson: u.companyDetails?.authorisedPerson || "",
              registeredAddress1: u.companyDetails?.registeredAddress1 || "",
              registeredAddress2: u.companyDetails?.registeredAddress2 || "",
              city: u.companyDetails?.city || "",
              district: u.companyDetails?.district || "",
              state: u.companyDetails?.state || "",
              pincode: u.companyDetails?.pincode || "",
              phone: u.companyDetails?.phone || "",
              email: u.companyDetails?.email || "",
              website: u.companyDetails?.website || "",
              gstin: u.companyDetails?.gstin || "",
              pan: u.companyDetails?.pan || "",
              bankDetails: {
                bankName: u.companyDetails?.bankDetails?.bankName || "",
                accountNumber: u.companyDetails?.bankDetails?.accountNumber || "",
                branch: u.companyDetails?.bankDetails?.branch || "",
                ifscCode: u.companyDetails?.bankDetails?.ifscCode || "",
              },
            },
            qrCodeImage: u.qrCodeImage || "",
            termsAndConditions: u.termsAndConditions || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const updateField = (path, value) => {
    setUser((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (cursor[k] == null || typeof cursor[k] !== "object") cursor[k] = {};
        cursor = cursor[k];
      }
      cursor[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: user.name,
        email: user.email,
        companyDetails: user.companyDetails,
        qrCodeImage: user.qrCodeImage,
        termsAndConditions: user.termsAndConditions,
      };
      const res = await axios.put(`${API}/preferences`, payload, { withCredentials: true });
      if (res.data?.success) {
        toast.success("Preferences updated");
        const u = res.data.user;
        setUser((prev) => ({ ...prev, name: u.name || "", email: u.email || "" }));
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("qrCodeImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="p-3">Loading...</div>;

  return (
    <div className="preferences-page container mt-3">
      <style>{`
        .preferences-page .btn-theme { background-color: #014937; border-color: #014937; color: #fff; }
        .preferences-page .btn-theme:hover { background-color: #013d2f; border-color: #013d2f; color: #fff; }
        .preferences-page .list-group-item.active { background-color: #014937; border-color: #014937; color: #fff; }
        .preferences-page .form-control:focus { border-color: #014937; box-shadow: 0 0 0 0.25rem rgba(1,73,55,0.25); }
        .preferences-page .form-check-input:checked { background-color: #014937; border-color: #014937; }
        .preferences-page .link-theme { color: #014937; }
      `}</style>
      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            <button className={`list-group-item list-group-item-action ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
            <button className={`list-group-item list-group-item-action ${activeTab === "additional" ? "active" : ""}`} onClick={() => setActiveTab("additional")}>Additional Info</button>
          </div>
        </div>
        <div className="col-md-9">
          {activeTab === "profile" && (
            <div className="cardd p-3">
              <h5 className="mb-3">Profile</h5>
              <div className="mb-2"><strong>A) Basic User Profile</strong></div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={user.name} onChange={(e) => updateField("name", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user.email} onChange={(e) => updateField("email", e.target.value)} />
                </div>
              </div>

              <div className="mt-4 mb-2"><strong>B) Company Details</strong></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Company Name</label><input className="form-control" value={user.companyDetails.companyName} onChange={(e) => updateField("companyDetails.companyName", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Authorized Person</label><input className="form-control" value={user.companyDetails.authorisedPerson} onChange={(e) => updateField("companyDetails.authorisedPerson", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Address Line 1</label><input className="form-control" value={user.companyDetails.address1} onChange={(e) => updateField("companyDetails.address1", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Address Line 2</label><input className="form-control" value={user.companyDetails.address2} onChange={(e) => updateField("companyDetails.address2", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Reg. Address 1</label><input className="form-control" value={user.companyDetails.registeredAddress1} onChange={(e) => updateField("companyDetails.registeredAddress1", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Reg. Address 2</label><input className="form-control" value={user.companyDetails.registeredAddress2} onChange={(e) => updateField("companyDetails.registeredAddress2", e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">City</label><input className="form-control" value={user.companyDetails.city} onChange={(e) => updateField("companyDetails.city", e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">District</label><input className="form-control" value={user.companyDetails.district} onChange={(e) => updateField("companyDetails.district", e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">State</label><input className="form-control" value={user.companyDetails.state} onChange={(e) => updateField("companyDetails.state", e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">Pincode</label><input className="form-control" value={user.companyDetails.pincode} onChange={(e) => updateField("companyDetails.pincode", e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">Phone</label><input className="form-control" value={user.companyDetails.phone} onChange={(e) => updateField("companyDetails.phone", e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">Email (on Invoice)</label><input className="form-control" value={user.companyDetails.email} onChange={(e) => updateField("companyDetails.email", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Website</label><input className="form-control" value={user.companyDetails.website} onChange={(e) => updateField("companyDetails.website", e.target.value)} /></div>
                <div className="col-md-3"><label className="form-label">GSTIN</label><input className="form-control" value={user.companyDetails.gstin} onChange={(e) => updateField("companyDetails.gstin", e.target.value)} /></div>
                <div className="col-md-3"><label className="form-label">PAN Number</label><input className="form-control" value={user.companyDetails.pan} onChange={(e) => updateField("companyDetails.pan", e.target.value)} /></div>
              </div>

              <div className="mt-4 mb-2"><strong>C) Bank Details</strong></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Bank Name</label><input className="form-control" value={user.companyDetails.bankDetails.bankName} onChange={(e) => updateField("companyDetails.bankDetails.bankName", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Account Number</label><input className="form-control" value={user.companyDetails.bankDetails.accountNumber} onChange={(e) => updateField("companyDetails.bankDetails.accountNumber", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">Branch</label><input className="form-control" value={user.companyDetails.bankDetails.branch} onChange={(e) => updateField("companyDetails.bankDetails.branch", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label">IFSC Code</label><input className="form-control" value={user.companyDetails.bankDetails.ifscCode} onChange={(e) => updateField("companyDetails.bankDetails.ifscCode", e.target.value)} /></div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-theme" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save / Update"}</button>
              </div>
            </div>
          )}

          {activeTab === "additional" && (
            <div className="cardd p-3">
              <h5 className="mb-3">Additional Info</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">QR Code</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handleQrUpload} />
                  <div className="mt-2">
                    {user.qrCodeImage ? (
                      <img src={user.qrCodeImage} alt="QR" style={{ maxWidth: "200px", height: "auto", border: "1px solid #eee" }} />
                    ) : (
                      <small className="text-muted">No QR uploaded</small>
                    )}
                  </div>
                </div>
                <div className="col-md-12">
                  <label className="form-label">Terms & Conditions</label>
                  <textarea className="form-control" rows={8} value={user.termsAndConditions} onChange={(e) => updateField("termsAndConditions", e.target.value)} />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-theme" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save / Update"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preferences;

