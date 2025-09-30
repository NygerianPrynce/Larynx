import { motion } from 'framer-motion';
import { Button } from './ui/button';

const FramerTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-center mb-8 text-purple-800"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🎭 Framer Motion Test
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button Animations */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Button Animations</h3>
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full">Hover & Tap Me!</Button>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="secondary" className="w-full">
                  Glow Effect
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Page Transitions */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Page Transitions</h3>
            <div className="space-y-3">
              <motion.div
                className="bg-purple-100 p-3 rounded-lg cursor-pointer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ x: -10 }}
              >
                ← Slide from left (hover me!)
              </motion.div>
              <motion.div
                className="bg-purple-100 p-3 rounded-lg cursor-pointer"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ x: -5, scale: 1.02 }}
                whileTap={{ x: 10 }}
              >
                Slide from right → (hover me!)
              </motion.div>
            </div>
          </motion.div>

          {/* Loading Animations */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Loading Animations</h3>
            <div className="space-y-4">
              <motion.div
                className="w-8 h-8 bg-purple-500 rounded-full mx-auto"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div
                className="flex space-x-2 justify-center"
                initial="hidden"
                animate="visible"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-3 h-3 bg-purple-500 rounded-full"
                    variants={{
                      hidden: { opacity: 0, scale: 0 },
                      visible: { 
                        opacity: 1, 
                        scale: 1,
                        transition: { delay: index * 0.2 }
                      }
                    }}
                    animate={{
                      y: [0, -10, 0],
                      transition: {
                        duration: 0.6,
                        repeat: Infinity,
                        delay: index * 0.2
                      }
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Card Animations */}
          <div 
            className="transform-gpu"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg border transform-gpu"
              style={{ 
                transformStyle: "preserve-3d",
                transformOrigin: "center center"
              }}
              initial={{ opacity: 0, rotateX: -15 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ 
                rotateY: 8,
                rotateX: 5,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)"
              }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">3D Card Effect</h3>
              <p className="text-gray-600 text-sm">
                Hover to see the whole card rotate! 🔄
              </p>
              <div className="mt-3 w-full h-2 bg-gradient-to-r from-purple-200 to-purple-400 rounded-full"></div>
              <div className="mt-2 text-xs text-purple-500 font-medium">
                Quick response, no delay!
              </div>
            </motion.div>
          </div>

          {/* Stagger Animation */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Stagger Animation</h3>
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-purple-100 p-2 rounded text-sm"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ 
                    backgroundColor: "rgb(196, 181, 253)",
                    scale: 1.02
                  }}
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Interactive Elements */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border"
            initial={{ opacity: 0, rotate: -5 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Interactive Elements</h3>
            <motion.div
              className="w-full h-20 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(to right, rgb(168, 85, 247), rgb(147, 51, 234))"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                background: [
                  "linear-gradient(to right, rgb(168, 85, 247), rgb(147, 51, 234))",
                  "linear-gradient(to right, rgb(147, 51, 234), rgb(168, 85, 247))",
                  "linear-gradient(to right, rgb(168, 85, 247), rgb(147, 51, 234))"
                ]
              }}
              transition={{
                background: { duration: 3, repeat: Infinity }
              }}
            >
              Animated Gradient
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Animation */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.p
            className="text-gray-600 text-lg"
            animate={{ 
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ✨ Ready to add these animations to your app! ✨
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default FramerTest;
