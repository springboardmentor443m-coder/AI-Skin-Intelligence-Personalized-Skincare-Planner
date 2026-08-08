import { useState } from "react";
import { generateRecommendation } from "../../services/recommendationApi";

function RecommendationForm({ onRecommendation }) {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    country: "",
    skin_type: "",
    budget: "",
    additional_details: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select a face image.");
      return;
    }

    const formData = new FormData();

    formData.append("image", image);
    formData.append("age", form.age);
    formData.append("gender", form.gender);
    formData.append("country", form.country);
    formData.append("skin_type", form.skin_type);
    formData.append("budget", form.budget);
    formData.append(
      "additional_details",
      form.additional_details
    );

    try {
      setLoading(true);

      const data = await generateRecommendation(formData);

      console.log("Recommendation:", data);

      onRecommendation(data);

    } catch (error) {
      console.error("Error:", error);
      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <label>
        Face Image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
      </label>

      <label>
        Age
        <input
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
          min="1"
          max="120"
          required
        />
      </label>

      <label>
        Gender
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label>
        Country
        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="India"
          required
        />
      </label>

      <label>
        Skin Type
        <select
          name="skin_type"
          value={form.skin_type}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Oily">Oily</option>
          <option value="Dry">Dry</option>
          <option value="Combination">Combination</option>
          <option value="Normal">Normal</option>
          <option value="Sensitive">Sensitive</option>
        </select>
      </label>

      <label>
        Budget
        <select
          name="budget"
          value={form.budget}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>

      <label>
        Additional Details
        <textarea
          name="additional_details"
          value={form.additional_details}
          onChange={handleChange}
          placeholder="Tell us anything else about your skin..."
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Get Recommendation"}
      </button>

    </form>
  );
}

export default RecommendationForm;