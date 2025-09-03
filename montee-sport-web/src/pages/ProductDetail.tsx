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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Please select a size first");
    addToCart({
      id: Number(product.id.replace(/\D/g, "")) || Date.now(),
      name: product.name,
      price: product.price ?? 100,
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
          {/* Price Section */}
          {product.discount ? (
            <div className="mt-2 flex items-center justify-start gap-2 mb-6">
              <div className="flex items-center space-x-2">
                {/* Discounted Price */}
                <p className="text-black font-bold text-2xl">
                  Rp{(product.price - (product.price * product.discount) / 100).toLocaleString("id-ID")}
                </p>

                {/* Original Price (crossed out) */}
                <p className="text-gray-400 line-through text-lg">
                  Rp{product.price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Discount Percentage Badge */}
              <span className="text-red-600 border border-red-600 text-xs font-medium px-2 py-0.5 rounded">
                -{product.discount}%
              </span>
            </div>
          ) : (
            // Normal price when no discount
            <p className="text-black font-bold text-2xl mb-6">
              Rp{product.price.toLocaleString("id-ID")}
            </p>
          )}
        <p className="text-sm text-gray-500 mb-2">
          Series: <span className="font-medium">{product.series}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Colorway: <span className="font-medium">{product.colorway.replace("_", " ")}</span>
        </p>

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-gray-700">Select Size</label>
              {product.sizeCharts.length > 0 && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-sm underline text-gray-600 hover:text-black"
                >
                  Size Chart
                </button>
              )}
            </div>

            <div className="flex gap-5 mb-6 text-gray-700">
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

      {/* RIGHT DRAWER OVERLAY */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Background overlay */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="w-[600px] max-w-full bg-white shadow-lg h-full p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <h2 className="text-xl font-semibold text-gray-700">Size Chart</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-500 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {product.sizeCharts.map((chart, i) => (
                <img
                  key={i}
                  src={chart}
                  alt={`Size Chart ${i + 1}`}
                  className="w-full object-contain border rounded"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>
        {`
          @keyframes slide-in-right {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
