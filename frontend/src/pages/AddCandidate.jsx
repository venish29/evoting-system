import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function AddCandidate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    candidateId: "",
    name: "",
    party: "",
    partyShort: "",
    age: "",
    state: "",
    position: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

const addCandidate = async (e) => {
  e.preventDefault(); // ✅ prevent reload

  try {
    const res = await axios.post(
      `${API}/api/admin/candidates`,
      form,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("evoting_token")}`
        }
      }
    );

      alert(res.data.message || "Candidate added successfully!");

      // reset form
      setForm({
        candidateId: "",
        name: "",
        party: "",
        partyShort: "",
        age: "",
        state: "",
        position: ""
      });

      // ✅ redirect to dashboard
      navigate("/admin");

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error adding candidate");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Candidate</h2>

      <form onSubmit={addCandidate} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
        
        <input
          name="candidateId"
          placeholder="Candidate ID (e.g. c001)"
          value={form.candidateId}
          onChange={handleChange}
          required
        />

        <input
          name="name"
          placeholder="Candidate Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="party"
          placeholder="Party Name"
          value={form.party}
          onChange={handleChange}
          required
        />

        <input
          name="partyShort"
          placeholder="Party Short (e.g. BJP)"
          value={form.partyShort}
          onChange={handleChange}
          required
        />

        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
        />

        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          required
        />

        <input
          name="position"
          placeholder="Position (optional)"
          value={form.position}
          onChange={handleChange}
        />

        <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
          Add Candidate
        </button>

      </form>
    </div>
  );
}