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

  const [mainImg, setMainImg] = useState(product.images[1]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // <-- NEW
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Please select a size first");
    let productId = (`${product.id}-${selectedSize}`);
    addToCart({
      id: productId,
      productId: product.id,
      name: product.name,
      price: product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price,
      quantity: quantity,
      img: mainImg,
      size: selectedSize,
      gender: product.gender,
      category: product.category
    });

    // Reset quantity back to 1 after adding to cart
    setQuantity(1);
  };

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-10">
      {/* LEFT: Main Image + Thumbnails */}
      <div className="md:col-span-3 grid md:grid-cols-3 lg:grid-cols-2 gap-1">
        {product.images.slice(1).map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${product.name} ${i}`}
            className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
          />
        ))}
      </div>

      {/* RIGHT: Details */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold mb-2 text-gray-700">{product.name}</h1>
        <p className="text-gray-600 capitalize mb-4">
          {product.gender} · {product.category}
        </p>

        {/* Price Section */}
        {product.discount ? (
          <div className="mt-2 flex items-center justify-start gap-2 mb-6">
            <div className="flex items-center space-x-2">
              <p className="text-black font-bold text-2xl">
                Rp{(product.price - (product.price * product.discount) / 100).toLocaleString("id-ID")}
              </p>
              <p className="text-gray-400 line-through text-lg">
                Rp{product.price.toLocaleString("id-ID")}
              </p>
            </div>
            <span className="text-red-600 border border-red-600 text-xs font-medium px-2 py-0.5 rounded">
              -{product.discount}%
            </span>
          </div>
        ) : (
          <p className="text-black font-bold text-2xl mb-6">
            Rp{product.price.toLocaleString("id-ID")}
          </p>
        )}

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

            <div className="grid grid-cols-3 gap-4 mb-6 text-gray-700">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 text-center border border-gray-300 rounded transition ${
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

        {/* Quantity Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="font-semibold text-gray-700">Quantity</label>
          <div className="flex items-center border rounded">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 text-lg font-bold text-gray-700 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-4 text-gray-700">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 text-lg font-bold text-gray-700 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
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

      {/* Size Chart Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

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
