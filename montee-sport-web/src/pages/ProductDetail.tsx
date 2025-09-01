// web/src/pages/ProductDetail.tsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();

  if (!product) return <div className="p-8 text-red-500">Product not found</div>;

  const [mainImg, setMainImg] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Please select a size first");
    addToCart({
      id: Number(product.id.replace(/\D/g, "")) || Date.now(), // 👈 your ids look like strings, convert or fallback
      name: product.name,
      price: product.price ?? 100, // 👈 ensure your product has price in data
      qty: 1,
      img: mainImg,
      size: selectedSize,
    });
  };

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* LEFT: Main Image + Thumbnails */}
      <div>
        <img
          src={mainImg}
          alt={product.name}
          className="w-full h-[500px] object-contain rounded-lg border shadow"
        />
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${product.name} ${i}`}
              onClick={() => setMainImg(img)}
              className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                mainImg === img ? "border-black" : "border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* RIGHT: Details */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-700">{product.name}</h1>
        <p className="text-gray-600 capitalize mb-4">
          {product.gender} · {product.category}
        </p>

        <p className="text-sm text-gray-500 mb-2">
          Series: <span className="font-medium">{product.series}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Colorway: <span className="font-medium">{product.colorway.replace("_", " ")}</span>
        </p>

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <>
            <label className="block font-semibold mb-2 text-gray-700">Select Size</label>
            <div className="flex gap-2 mb-6 text-gray-700">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className={`w-full py-3 rounded-lg transition ${
            selectedSize
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {selectedSize ? "Add to Cart" : "Select a Size"}
        </button>
      </div>

      {/* BELOW: Size Charts */}
      {product.sizeCharts.length > 0 && (
        <div className="md:col-span-2 mt-12">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">
            Size Chart{product.sizeCharts.length > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {product.sizeCharts.map((chart, i) => (
              <img
                key={i}
                src={chart}
                alt={`Size Chart ${i + 1}`}
                className="max-h-[400px] object-contain border rounded"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
