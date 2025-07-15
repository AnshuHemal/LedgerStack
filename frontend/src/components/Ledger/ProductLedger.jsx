import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductLedger = () => {
  const [products, setProducts] = useState([]);

  const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${PRODUCT_URL}`, {
        withCredentials: true,
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  return (
    <>
      <div className="child__container d-flex justify-content-between align-items-start">
        <div className="ms-lg-2">
          <h5
            className="display-6"
            style={{ fontSize: "25px", fontWeight: "500" }}
          >
            Product Ledger
          </h5>
          <p className="m-0 p-0" style={{ fontSize: "16px" }}>
            Streamline your inventory overview with ease.
          </p>
        </div>
      </div>

      <div className="table-container mt-4">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Group</th>
              <th>Category</th>
              <th>Opening Quantity</th>
              <th>Closing Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.productGroupId?.name || "N/A"}</td>
                  <td>{product.categoryId?.name || "N/A"}</td>
                  <td>{product.openingQuantity ?? 0}</td>
                  <td>{product.closingQuantity ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductLedger;
