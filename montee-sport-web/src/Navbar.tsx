import { motion } from 'framer-motion';

export default function Navbar() {
  const navItems = ['Home', 'Shop', 'About', 'Contact'];

  return (
    <motion.nav
      className="flex justify-between items-center px-8 py-4 bg-white shadow-md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-serif">Clothify</h1>
      <ul className="flex space-x-8 font-sans">
        {navItems.map((item, idx) => (
          <motion.li
            key={item}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="cursor-pointer"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}
