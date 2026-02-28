import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { IceCream, ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1920&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-rose-500">
          <IceCream className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight">CoolHouse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2 text-stone-600 font-medium hover:text-stone-900 transition-colors">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl lg:text-7xl font-bold text-stone-900 leading-[1.1] tracking-tight mb-6">
              Sweet Data for <span className="text-rose-500">Sweet Success.</span>
            </h1>
            <p className="text-xl text-stone-600 mb-10 max-w-lg leading-relaxed">
              The ultimate analytical dashboard for CoolHouse Ice Cream Shop. Track sales, manage inventory, and grow your business with data-driven insights.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-stone-900 text-white font-semibold rounded-2xl hover:bg-stone-800 transition-all flex items-center gap-2 group">
                Start Analyzing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-rose-200/50 blur-3xl rounded-full -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-3xl shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: BarChart3, title: "Real-time Analytics", desc: "Watch your sales grow with dynamic charts and instant profit calculations." },
            { icon: ShieldCheck, title: "Secure Management", desc: "Role-based access control ensures your data stays in the right hands." },
            { icon: Zap, title: "Excel Integration", desc: "Seamlessly upload and export data using standard Excel formats." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">{feature.title}</h3>
              <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
