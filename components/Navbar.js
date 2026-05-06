import Link from 'next/link';
import { useRouter } from 'next/router';
import { Clover, Search, Moon, Hash, Menu } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const navItems = [
    { name: 'สถิติและวิเคราะห์เลขเด็ด', path: '/analytics', icon: Search },
    { name: 'ทำนายฝัน', path: '/dream-analysis', icon: Moon },
    { name: 'เซียมซี', path: '/fortune-stick', icon: Hash },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 mb-6 border-b border-purple-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Clover className="text-green-500" size={28} />
            <span className="text-2xl font-bold text-brand-purple-dark tracking-tight">
              ChokDee<span className="text-purple-400">.com</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, idx) => {
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={idx}
                  href={item.path}
                  className={`flex items-center space-x-1 text-sm font-bold transition-colors ${
                    isActive 
                      ? 'text-brand-gold-dark' 
                      : 'text-gray-600 hover:text-brand-gold-dark'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex items-center">
            {/* Mobile menu could go here if needed, but removed for now */}
          </div>
        </div>
      </div>
    </nav>
  );
}
