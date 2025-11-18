import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

// custom hook
import { useMemberRole } from "../backend/context/useMemberRole";
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
import MenuIcon from '@mui/icons-material/Menu'; // Added for mobile menu

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

// Projects of ECTEC
const project = {
  2023: [
    {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60",
      title: "Outreach Program", // Changed from location
      date: "January 25, 2025", // Changed from price
    },
  ],
  2024: [
    {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60",
      title: "Outreach Program",
      date: "January 25, 2025",
    },
  ],
  2025: [
    {
      img: "https://scontent.fcgm1-1.fna.fbcdn.net/v/t39.30808-6/481279822_122104358912790047_3299124637793993201_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGiqDgoV5-FD32XHXnsKBxYhgavblMpq0SGBq9uUymrRJYGGvyD4P5-f7QxrsCmCCvA22sx4nf2wS8CrA_Jw_4s&_nc_ohc=DjwrzoRwOC0Q7kNvwEmGorV&_nc_oc=Adm5afSD3V89U7-anB-Z8RSoDuqqBe8Qp7Nqw1LURrZgaoxlwWVE0-tp7AGuvPYkjDb_nFFi9vYkA7pPxStMh321&_nc_zt=23&_nc_ht=scontent.fcgm1-1.fna&_nc_gid=KJgtRkTTBfZYJ_bcIwKj_A&oh=00_Afgqstzg7tv8BArXo_pKXyq6SMjslzmRP0guF_5nKmFjoA&oe=691E6CDF",
      title: "Outreach Program",
      date: "January 25, 2025",
    },
    {
      img: "https://scontent.fcgm1-1.fna.fbcdn.net/v/t39.30808-6/481217155_122104318058790047_5274804630572731356_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEl2oLUIhsuN-AUhpTUEjsdhTAd_JozWDyFMB38mjNYPD8QmSnpFFTfeeVkSSXbidtyu6z5_HpV9-JtlMyetCCo&_nc_ohc=BKnUmqjY6vIQ7kNvwEKiJ2S&_nc_oc=AdlAp0xzo4Dt4Mqh4RFQJKUXtfVQWu-b0uaQMJZ6zSLGJ615xIvFtKC3mXnqScUvrIPXxi9-JjTVjYPjWhB_9IYN&_nc_zt=23&_nc_ht=scontent.fcgm1-1.fna&_nc_gid=-TuJk6Rqlxii9r9v1TIbfg&oh=00_AfivzLOxIpsOHlkd-uadj5I4fksV8vgxbp9P6jpf6C84IQ&oe=691E6398",
      title: "BANGON 2025",
      date: "January 18, 2025",
    },
  ],
};

const Landing = () => {
  const { memberRole: data } = useMemberRole();
  const { recoveryMode } = useAuth();
  const role = data ?? null;

  // States for flight booking tabs
  const [activeCity, setActiveCity] = useState("Manila");

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (e) => {
    if (!role) {
      e.preventDefault();
      toast.error("Please log in first.");
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
    setIsMobileMenuOpen(false); // Close mobile menu after click
  };

  const scrollToProject = () => {
    const element = document.getElementById('about-project');
    if (element) {
      const offsetTop = element.offsetTop;
      window.scrollTo({ top: offsetTop - 80, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after click
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact-section');
    if (element) {
      const offsetTop = element.offsetTop;
      window.scrollTo({top: offsetTop, behavior: 'smooth'});
    }
    setIsMobileMenuOpen(false); // Close mobile menu after click
  };

  // Carousel state & control for gallery (existing)
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % gallery.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);
  const prevSlide = () => { setIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1)); };
  const nextSlide = () => { setIndex((prev) => (prev + 1) % gallery.length); };

  return (
    <div className="min-h-screen text-base-content">
      <Toaster position="bottom-right" />
      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-base-100 shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-5 navbar">
          <div className="flex-1">
            <Link 
              to={role ? `/${role}` : "/"} 
              onClick={handleNavigation} 
              className="flex items-center normal-case text-lg md:text-xl"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 md:mr-3">
                <img src={logo} alt="Digitec Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-primary font-bold text-sm sm:text-base md:text-lg ml-2">
                DigiTEC – ECTEC Multi-Purpose Cooperative Portal
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-none">
            <ul className="menu menu-horizontal px-1 gap-1 md:gap-2">
              <li>
                {role && !recoveryMode ? (
                  <Link to={`/${role}`} className="text-sm md:text-base">Dashboard</Link>
                ) : (
                  <Link to="/" onClick={handleNavigation} className="text-sm md:text-base">Home</Link>
                )}
              </li>
              <li><button onClick={scrollToAbout} className="text-sm md:text-base">About ECTEC</button></li>
              <li><button onClick={scrollToProject} className="text-sm md:text-base">Projects</button></li>
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
          {/* Mobile Menu Button */}
          <div className="md:hidden flex-none">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn btn-ghost btn-circle"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-base-100 shadow-lg">
            <ul className="menu menu-vertical px-4 py-2">
              <li>
                {role && !recoveryMode ? (
                  <Link to={`/${role}`} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                ) : (
                  <Link to="/" onClick={handleNavigation}>Home</Link>
                )}
              </li>
              <li><button onClick={scrollToAbout}>About ECTEC</button></li>
              <li><button onClick={scrollToProject}>Projects</button></li>
              <li><button onClick={scrollToContact}>Contact Info</button></li>
              <li>
                <Link
                  to="/login"
                  className="btn btn-primary bg-green-800 hover:bg-green-600 mt-2 mb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="hero py-8 lg:py-12">
          <div className="hero-content flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <p className="text-md mb-2 uppercase tracking-wide">Empowering Members Online</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"> {/* Fixed sizing */}
                <span>Service Through Strong </span>
                <span className="text-green-800">Brotherhood</span>
              </h1>
              <p className="text-base sm:text-lg md:text-2xl opacity-70 mb-6">
                Unifying membership and finances in one digital platform.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Link 
                  to={role && !recoveryMode ? `/${role}` : "/login"} 
                  className="bg-green-800 btn btn-primary px-6 py-4 md:px-8 md:py-6 text-base md:text-lg"
                >
                  {role && !recoveryMode ? 'Go to Dashboard' : 'Get Started'}
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

        {/*Projects of ECTEC*/}
        <section id="about-project" className="py-12 md:py-16 max-w-7xl mx-auto"> {/* Removed extra 'section' */}
          <h2 className="font-bold text-center text-lg md:text-2xl mb-6 md:mb-10 text-green-800">
            Projects of ECTEC
          </h2>

          {/* Tabs */}
          <div className="tabs justify-center mb-8 overflow-x-auto no-scrollbar">
            {Object.keys(project).map((city) => (
              <a
                key={city}
                className={`tab tab-bordered whitespace-nowrap ${
                  activeCity === city
                    ? "tab-active border-b-4 border-primary font-semibold text-primary"
                    : "text-gray-400"
                } text-sm md:text-base cursor-pointer`}
                onClick={() => setActiveCity(city)}
                href="#!"
              >
                {city}
              </a>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {project[activeCity]?.map(({ img, title, date }) => (
              <div
                key={title}
                className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group"
              >
                {/* Aspect Ratio 4:3, maintain consistent card height */}
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left text-white">
                  <p className="text-xs md:text-sm">
                    <span className="font-bold text-yellow-400">{date}</span>
                  </p>
                  <p className="font-bold text-lg md:text-xl">{title}</p>
                </div>
              </div>
            ))}
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
