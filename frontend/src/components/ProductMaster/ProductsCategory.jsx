import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

const ProductsCategory = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const API_URL = import.meta.env.VITE_PRODUCT_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/product-category`);
        setTableData(response.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const handleRowClick = async (categoryId) => {
    try {
      const response = await axios.get(
        `${API_URL}/product-category/${categoryId}`
      );
      setFormData({
        name: response.data.name,
      });
      setSelectedCategoryId(categoryId);
      setShowModal(true);
    } catch (err) {
      setError("Failed to fetch data");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/product-group/${selectedCategoryId}`,
        formData
      );
      toast.success(response.data.message);
      setShowModal(false);
    } catch (err) {
      toast.error("Error updating product category");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/product-group/${selectedCategoryId}`
      );
      toast.success(`Category successfully deleted..`);
      setShowModal(false);
    } catch (err) {
      toast.error("Error deleting product category");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div>
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={row._id} onClick={() => handleRowClick(row._id)}>
                <td>{row.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for editing or deleting */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Edit Product Group
              </h5>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between align-items-center">
              <div>
                <button
                  type="button"
                  className="login-button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="login-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="login-button"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsCategory;
