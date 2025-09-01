// web/src/pages/Home.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Slideshow from "../components/Slideshow";


    const bgPorto = "../../images/porto_montee_4.png";
// Your 6 portfolio images
  const portoImages = [
    "../../images/porto_montee_1.png",
    "../../images/porto_montee_2.png",
    "../../images/porto_montee_3.png",
  ];

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 min-h-screen flex flex-col text-gray-700">
      {/* Hero Section (Full Screen) */}
      <div
        className="relative w-full h-screen flex flex-col justify-center items-center text-center px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPorto})` }}
      >
        <div className="absolute inset-0 bg-black/30" /> {/*dark overlay*/}

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg"
          >
            Elevate Your Style
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Discover curated collections and timeless essentials designed to match your lifestyle.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 px-8 py-4 bg-white text-black font-semibold rounded-full text-xl shadow-xl"
            onClick={() => navigate("/products")}
          >
            Shop Now
          </motion.button>
        </div>
      </div>

    <div className="py-1">
        <Slideshow></Slideshow>
    </div>
    
   
      
      {/* Asymmetrical Grid (Nike Style) */}
      <div className="px-6 py-10 bg-gray-50 grid grid-cols-6 gap-4">
        {portoImages.slice(0, 5).map((img, i) => (
          <motion.div
            key={i}
            className={`overflow-hidden rounded-2xl shadow-lg
              ${i === 0 ? "col-span-6 md:col-span-4 row-span-2 h-[500px]" : ""}
              ${i === 1 ? "col-span-6 md:col-span-2 h-[240px]" : ""}
              ${i === 2 ? "col-span-6 md:col-span-2 h-[240px]" : ""}
              ${i === 3 ? "col-span-6 md:col-span-3 h-[350px]" : ""}
              ${i === 4 ? "col-span-6 md:col-span-3 h-[350px]" : ""}
            `}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
          >
            <img
              src={img}
              alt={`portfolio-${i}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
