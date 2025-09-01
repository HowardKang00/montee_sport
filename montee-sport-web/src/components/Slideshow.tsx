// web/src/components/Slideshow.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

  // Slideshow images
const images = [
  "../../images/porto_montee_series_1.png",
  "../../images/porto_montee_series_2.png",
  "../../images/porto_montee_series_3.png",
];

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [paused, setPaused] = useState(false);

  const nextSlide = () => {
    setDirection("right");
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setDirection("left");
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-play with pause on hover
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, index]);

  return (
    <div
      className="relative w-full max-w-6xl h-screen mx-auto overflow-hidden rounded-2xl shadow-xl mt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={index}
          src={images[index]}
          alt={`Slide ${index + 1}`}
          custom={direction}
          initial={{ x: direction === "right" ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction === "right" ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full object-fill"
        />
      </AnimatePresence>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 -translate-y-1/2 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 -translate-y-1/2 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
      >
        <ChevronRight size={28} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? "right" : "left");
              setIndex(i);
            }}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
