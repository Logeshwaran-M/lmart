import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = [];

      snap.forEach((docSnap) => {
        const product = docSnap.data();

        if (Array.isArray(product.variants)) {
          product.variants.forEach((variant, index) => {
            const maxStock =
              typeof variant.maxStock === "number"
                ? variant.maxStock
                : variant.stock || 0;

            list.push({
              productId: docSnap.id,
              variantIndex: index,
              ...variant,
              maxStock,
            });
          });
        }
      });

      setStocks(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const increaseStock = async (item) => {
    if (item.stock >= item.maxStock) return;

    const productRef = doc(db, "products", item.productId);
    const updatedStocks = stocks.map((s) =>
      s.productId === item.productId &&
      s.variantIndex === item.variantIndex
        ? { ...s, stock: s.stock - 1 }
        : s
    );

    setStocks(updatedStocks);

    const variants = updatedStocks
      .filter((s) => s.productId === item.productId)
      .map(({ productId, variantIndex, ...rest }) => rest);

    await updateDoc(productRef, { variants });
  };

  const decreaseStock = async (item) => {
    if (item.stock <= 0) return;

    const productRef = doc(db, "products", item.productId);
    const updatedStocks = stocks.map((s) =>
      s.productId === item.productId &&
      s.variantIndex === item.variantIndex
        ? { ...s, stock: s.stock - 1 }
        : s
    );

    setStocks(updatedStocks);

    const variants = updatedStocks
      .filter((s) => s.productId === item.productId)
      .map(({ productId, variantIndex, ...rest }) => rest);

    await updateDoc(productRef, { variants });
  };

  if (loading) return <p>Loading stocks...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>📦 Stock Management</h2>

      <div style={{ overflowX: "auto" }}>
        <table 
          style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            background: "white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>#</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Variant ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Color</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Size</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Stock</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Max Stock</th>
              <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {stocks.map((item, index) => {
              const isMax = item.stock >= item.maxStock;
              const isZero = item.stock === 0;

              return (
                <tr key={`${item.productId}-${item.variantIndex}`} style={{ 
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9" 
                }}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{index + 1}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.variantId || '-'}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: 20, height: 20, 
                      borderRadius: '50%', 
                      backgroundColor: item.color || '#ccc',
                      marginRight: 8 
                    }} />
                    {item.color || "-"}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.size || "-"}</td>

                  <td style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    fontWeight: "bold",
                    color: isZero ? "#dc3545" : isMax ? "#fd7e14" : "#28a745",
                    backgroundColor: isZero ? "#f8d7da" : isMax ? "#fff3cd" : "#d4edda"
                  }}>
                    {isZero ? "🔴 SOLD OUT" : isMax ? "🟠 MAX STOCK" : `🟢 ${item.stock}`}
                  </td>

                  <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "bold" }}>
                    {item.maxStock}
                  </td>

                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() => decreaseStock(item)}
                      disabled={isZero}
                      style={{
                        padding: "8px 12px",
                        marginRight: "5px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isZero ? "not-allowed" : "pointer",
                        backgroundColor: isZero ? "#6c757d" : "#dc3545",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        minWidth: "40px"
                      }}
                      title={isZero ? "Sold Out - Cannot Decrease" : "Decrease Stock"}
                    >
                      -
                    </button>
                    <button
                      onClick={() => increaseStock(item)}
                      disabled={isMax}
                      style={{
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isMax ? "not-allowed" : "pointer",
                        backgroundColor: isMax ? "#6c757d" : "#28a745",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "16px",
                        minWidth: "40px"
                      }}
                      title={isMax ? "Max Stock Reached" : "Increase Stock"}
                    >
                      +
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button 
        onClick={fetchStocks}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        🔄 Refresh Stocks
      </button>
    </div>
  );
}

export default Stocks;
