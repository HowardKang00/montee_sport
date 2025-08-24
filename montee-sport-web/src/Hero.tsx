import { motion } from 'framer-motion';

export default function Hero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className="h-[80vh] flex flex-col justify-center items-center text-center bg-gray-50"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h2
        variants={item}
        className="text-5xl font-serif mb-4"
      >
        Discover Your Style
      </motion.h2>
      <motion.p
        variants={item}
        className="text-lg font-sans text-gray-600 max-w-xl mb-6"
      >
        Premium clothing designed for modern living. Shop the latest collections now.
      </motion.p>
      <motion.button
        variants={item}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-black text-white font-sans rounded-2xl shadow-lg"
      >
        Shop Now
      </motion.button>
    </motion.section>
  );
}
