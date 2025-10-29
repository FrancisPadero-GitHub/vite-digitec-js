import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

// custom hook
import { useAuth } from "../backend/context/AuthProvider";

import logo from "../assets/digitec-logo.png";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import hero4 from "../assets/hero4.jpg";

import gallery1 from "../assets/gallery1.jpg";
import gallery2 from "../assets/gallery2.jpg";
import gallery3 from "../assets/gallery3.jpg";
import gallery4 from "../assets/gallery4.jpg";
import gallery5 from "../assets/gallery5.jpg";
import gallery6 from "../assets/gallery6.jpg";

import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

/**
 * 
 * Provide a navigation router here that if a session is detected from a logged in user redirect
 * them to their specific role page
 * 
 */

// Images for carousel; will add more/change later on 
const gallery = [
  gallery1,
  gallery2,
  gallery3,
  gallery4,
  gallery5,
  gallery6,
];


const Landing = () => {
  const { role: memberRole } = useAuth();
  console.log(`TEST`, { memberRole });
  const handleNavigation = (e) => {
    if (!memberRole) {
      e.preventDefault();
      toast.error("Please log in to access the dashboard.");
      return;
    }
  };

  // Smooth scrolling for header links
  const scrollToAbout = () => {
    const element = document.getElementById('about-section');
    if (element) {
      const offsetTop = element.offsetTop;
      window.scrollTo({ top: offsetTop - 80, behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact-section');
    if (element) {
      const offsetTop = element.offsetTop;
      window.scrollTo({top: offsetTop, behavior: 'smooth'});
    }
  };
  const [index, setIndex] = useState(0);

  // Animation for carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % gallery.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Manual controls for carousel
  const prevSlide = () => { setIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1)); };
  const nextSlide = () => { setIndex((prev) => (prev + 1) % gallery.length); };

  return (
    <div className="min-h-screen text-base-content">
      <Toaster position="bottom-right" />
      {/* Header */}
      <header className="sticky top-0 z-50 navbar bg-base-100 px-4 py-4 md:py-5 shadow-lg">
        <div className="flex-1">
          <Link 
            to={memberRole ? `/${memberRole}` : "/"} 
            onClick={handleNavigation} 
            className="flex items-center normal-case text-lg md:text-xl"
            >
            <div className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3">
              <img src={logo} alt="Digitec Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-primary font-bold text-sm sm:text-base md:text-lg">
              DigiTEC – ECTEC Multi-Purpose Cooperative Portal
            </span>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-none">
          <ul className="menu menu-horizontal px-1 gap-1 md:gap-2">
            <li>
              {memberRole ? (
                <Link to={`/${memberRole}`} className="text-sm md:text-base">Dashboard</Link>
              ) : (
                <Link to="/" className="text-sm md:text-base">Home</Link>
              )}
            </li>
            <li><button onClick={scrollToAbout} className="text-sm md:text-base">About ECTEC</button></li>
            <li><button onClick={scrollToContact} className="text-sm md:text-base">Contact Info</button></li>
            <li>
              <Link
                to="/login"
                className="btn btn-primary md:px-8 md:py-3 md:text-lg bg-green-800 hover:bg-green-600"
              >
                <span className="text-base">Login</span>
              </Link>
            </li>
          </ul>
        </div>
      </header>
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="hero py-8 lg:py-12">
          <div className="hero-content flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <p className="text-black text-md mb-2 uppercase tracking-wide">Empowering Members Online</p>
              <h1 className="text-6xl sm:text-4xl md:text-6xl font-bold leading-tight mb-4">
                <span className="text-black">Service Through Strong </span>
                <span className="text-green-800">Brotherhood</span>
              </h1>
              <p className="text-base sm:text-lg md:text-2xl opacity-70 mb-6">
                Unifying membership and finances in one digital platform.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link 
                  to={memberRole ? `/${memberRole}` : "/login"} 
                  className="bg-green-800 btn btn-primary px-6 py-4 md:px-8 md:py-6 text-base md:text-lg"
                >
                  {memberRole ? 'Go to Dashboard' : 'Get Started'}
                  <LoginOutlinedIcon className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              {/* Images in Hero Section */}
              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img src={hero1}
                  className="w-full h-full object-cover rounded-[40px_4px_40px_4px] md:rounded-[60px_4px_60px_4px]"
                />
              </div>
              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src={hero2}
                  className="w-full h-full object-cover rounded-[60px_60px_60px_4px] md:rounded-[100px_100px_100px_4px]"
                />
              </div>
              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src={hero3}
                  className="w-full h-full object-cover rounded-full md:rounded-full"
                />
              </div>
              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src={hero4}
                  className="w-full h-full object-cover rounded-[40px_4px_30px_4px] md:rounded-[60px_4px_48px_4px]"
                />
              </div>
            </div>
          </div>
        </section>
        {/* About Us Section */}
        <section id="about-section" className="py-12 md:py-16 lg:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Text Column */}
            <div className="flex-1 order-2 lg:order-1 mt-8 lg:mt-20 max-w-lg">
              <h2 className="text-green-800 text-4xl md:text-5xl font-bold mb-6 relative pb-4
                          before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-green-700">
                About ECTEC
              </h2>
              <p className="text-base md:text-lg leading-relaxed mb-6">
                The East CDO Timbalo Eagles Club (ECTEC) is a chapter of the Philippine Eagles
                dedicated to unity, leadership, and service. Guided by strong brotherhood, the
                club fosters networking opportunities, supports personal and professional growth,
                and leads social initiatives that uplift the community.
              </p>
            </div>
            {/* Carousel */}
            <div className="flex-1 order-1 lg:order-2">
              <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
                <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                  {gallery.map((src, i) => (
                    <div key={i} className="w-full flex-shrink-0">
                      <img src={src} alt={`Slide ${i}`} className="w-full aspect-video object-cover" />
                    </div>
                  ))}
                </div>
                {/* Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/70"
                >
                  ❮
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/70"
                >
                  ❯
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Contact Us Section */}
        <section id="contact-section" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-base-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center">
              <div className="bg-base-100 p-6 md:p-8 rounded-box shadow-lg border border-base-200 w-full">
                <div className="mb-6 md:mb-8 text-center">
                  <div className="inline-block mb-3 md:mb-4"><EmailOutlinedIcon fontSize="large" color="text-primary" /></div>
                  <p className="text-neutral text-sm md:text-base">
                    Have questions? Reach out through any channel below. Our
                    team is ready to assist you!
                  </p>
                </div>
                {/* Contact Details */}
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-base-200">Contact Information</h3>
                    <div className="space-y-4 md:space-y-6">
                      {/* Phone */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-base-200 rounded-box duration-200">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <PhoneAndroidOutlinedIcon className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content mb-1 text-base">Phone</h4>
                          <p className="text-neutral hover:text-primary text-base">09123456789</p>
                        </div>
                      </div>
                      {/* Email */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-base-200 rounded-box duration-200">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <EmailOutlinedIcon className="h-5 md:h-6 w-5 md:w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content mb-1 text-base">Email</h4>
                          <a href="mailto:eaglesclubectec@gmail.com" className="text-neutral hover:text-primary text-base">
                            eaglesclubectec@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
