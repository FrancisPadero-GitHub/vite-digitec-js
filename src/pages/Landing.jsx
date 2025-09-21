import { Link } from "react-router-dom";
import logo from "../assets/digitec-logo.png";

/**
 * 
 * Provide a navigation router here that if a session is detected from a logged in user redirect
 * them to their specific role page
 * 
 */

const Landing = () => {
  return (
    <div className="min-h-screen text-base-content">
      {/* Responsive Header */}
      <header className="navbar bg-base-100 container mx-auto px-4 py-4 md:py-6">
        <div className="flex-1">
          <Link
            to="/"
            className="flex items-center normal-case text-lg md:text-xl"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3">
              <img
                src={logo}
                alt="Digitec Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-primary font-bold text-sm sm:text-base md:text-lg">
              East CDO Timbalo Eagles Club
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex-none md:hidden">
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-5 h-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-none">
          <ul className="menu menu-horizontal px-1 gap-1 md:gap-2">
            <li>
              <Link
                to="/"
                className="text-primary font-bold text-sm md:text-base"
              >
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-sm md:text-base">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="text-sm md:text-base">
                Blogs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm md:text-base">
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="btn btn-primary px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg bg-green-800 hover:bg-green-600 flex items-center gap-1 md:gap-2 transition-all duration-300 hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                <span className="hidden sm:inline">Login</span>
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
              <h1 className="text-green-800 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                We Help Great Companies Grow Up
              </h1>
              <p className="text-base md:text-lg opacity-70">
                Our services can incorporate any combinations of the following:
              </p>
              <div className="relative">
                <span className="absolute right-149 top-0 h-full w-2 bg-green-800"></span>
                <p className="mt-1 ml-4 text-base md:text-lg opacity-70 mb-0 pr-8 relative">
                  Lorem bla blah blah bla Free Palestine
                </p>
                <p className="ml-4 text-base md:text-lg opacity-70 mb-6 pr-8 relative">
                  Free Palestine
                </p>
              </div>
              <div className="flex justify-center lg:justify-start">
                <Link
                  to="/"
                  className="bg-green-800 btn btn-primary px-6 py-3 md:px-8 md:py-4 text-base md:text-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              {/* Images with responsive rounded corners */}
              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f547ce64-dad8-4b2f-adc2-51d75e7e294d.png"
                  alt="Modern office"
                  className="w-full h-full object-cover rounded-[40px_4px_40px_4px] md:rounded-[60px_4px_60px_4px]"
                />
              </div>

              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ff7ae62e-8f97-4681-bf95-5f34fffb7c32.png"
                  alt="Work desk"
                  className="w-full h-full object-cover rounded-[60px_60px_60px_4px] md:rounded-[100px_100px_100px_4px]"
                />
              </div>

              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/396386b7-81f6-4255-8dbd-e2b8b256bd21.png"
                  alt="Office room"
                  className="w-full h-full object-cover rounded-[60px_4px_60px_60px] md:rounded-[100px_4px_100px_100px]"
                />
              </div>

              <div className="col-span-1 row-span-1 overflow-hidden rounded-box">
                <img
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/329e3516-4836-4f32-b257-72b211c242bc.png"
                  alt="Team meeting"
                  className="w-full h-full object-cover rounded-[40px_4px_30px_4px] md:rounded-[60px_4px_48px_4px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-12 md:py-16 px-0 md:px-4 lg:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Text Column */}
            <div className="mt-8 lg:mt-20 flex flex-col max-w-full lg:max-w-md flex-1 order-2 lg:order-1">
              <h2 className="text-green-800 text-2xl md:text-3xl font-bold mb-6 relative pb-4 before:absolute before:bottom-0 before:left-0 before:w-12 before:h-1 before:bg-green-700">
                About HubSpot
              </h2>
              <p className="leading-relaxed mb-6 text-sm md:text-base">
                We build software that helps businesses grow better. Our
                platform includes marketing, sales, service, and website
                management products that start free and scale to meet your needs
                at any stage of growth.
              </p>

              <div className="flex space-x-4 md:space-x-6 mb-8">
                {/* Facebook Icon */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="btn btn-circle btn-sm md:btn-md hover:bg-blue-600/20 hover:text-blue-600 transition-all duration-300 transform hover:scale-110"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-5 h-5 md:w-6 md:h-6"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* YouTube Icon */}
                <a
                  href="#"
                  aria-label="YouTube"
                  className="btn btn-circle btn-sm md:btn-md hover:bg-red-600/20 hover:text-red-600 transition-all duration-300 transform hover:scale-110"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-5 h-5 md:w-6 md:h-6"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Blog posts side-by-side */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 order-1 lg:order-2">
              {[
                {
                  title: "Marketing Hub",
                  desc: "Marketing software to help you attract the right audience and convert more visitors into customers.",
                  img: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                },
                {
                  title: "Sales Hub",
                  desc: "Sales CRM software to help you get deeper insights into prospects and close more deals faster.",
                  img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                },
              ].map((post, index) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-box shadow-md hover:shadow-lg transition-shadow duration-300 group"
                  aria-label={`Featured ${post.title}`}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-800">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-sm sm:text-base">{post.desc}</p>
                    <a
                      href="#"
                      className="text-green-800 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm sm:text-base"
                    >
                      View more
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div>
                <form className="bg-base-100 space-y-6 rounded-box shadow-lg p-6 md:p-8 border border-base-200">
                  {/* Header with decorative elements */}
                  <div className="text-center mb-6 md:mb-8 relative">
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <div className="w-16 h-1 bg-primary rounded-full"></div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                      Contact Us
                    </h1>
                    <p className="text-left mt-3 text-sm md:text-base">
                      We'd love to hear from you! Send us a message and we'll
                      respond as soon as possible.
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="mt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content font-medium text-sm md:text-base">
                          Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Your full name"
                          className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary text-sm md:text-base"
                          required
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content font-medium text-sm md:text-base">
                          Phone <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Your phone number"
                          className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary text-sm md:text-base"
                          required
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content font-medium text-sm md:text-base">
                        Email <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary text-sm md:text-base"
                        required
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-base-content font-medium text-sm md:text-base">
                        Message <span className="text-error">*</span>
                      </span>
                    </label>
                    <textarea
                      rows="4"
                      placeholder="How can we help you?"
                      className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary text-sm md:text-base"
                      required
                    ></textarea>
                  </div>

                  {/* Submit button */}
                  <div className="form-control mt-6 md:mt-8">
                    <button className="btn btn-primary w-full text-white hover:shadow-lg transition-all text-sm md:text-base">
                      Send Message
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Map Section */}
                <form className="mt-4 bg-base-100 space-y-6 rounded-box shadow-lg p-6 md:p-8 border border-base-200">
                  <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6 pb-2 border-b border-base-200">
                    Our Location
                  </h3>
                  <div className="relative h-48 sm:h-64 rounded-box overflow-hidden shadow-md">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.654246110987!2d-87.63123992416491!3d41.87859557131583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2c3cd0f4cbed%3A0xafe0a6ad09c0c000!2sChicago%2C%20IL!5e0!3m2!1sen!2sus!4v1712345678901!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-box"
                      title="Business Location Map"
                    ></iframe>
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex gap-2">
                      <a
                        href="https://maps.google.com?q=15551+McLean+Brot,+Eight,+IL"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-xs sm:btn-sm btn-primary text-white"
                      >
                        Open in Maps
                      </a>
                    </div>
                  </div>
                </form>
              </div>

              {/* Contact Information Section */}
              <div className="bg-base-100 p-6 md:p-8 rounded-box shadow-lg border border-base-200">
                {/* Introductory Text */}
                <div className="mb-6 md:mb-8 text-center">
                  <div className="inline-block mb-3 md:mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 md:h-10 w-8 md:w-10 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-neutral text-sm md:text-base">
                    Have questions? Reach out through any channel below. Our
                    team is ready to assist you!
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6 pb-2 border-b border-base-200">
                      Contact Information
                    </h3>

                    <div className="space-y-4 md:space-y-6">
                      {/* Phone */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-base-200 rounded-box transition-colors duration-200">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 md:h-6 w-5 md:w-6 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content mb-1 text-sm md:text-base">
                            Phone
                          </h4>
                          <a
                            href="tel:773-365-5040"
                            className="text-neutral hover:text-primary transition-colors text-sm md:text-base"
                          >
                            773-365-5040
                          </a>
                        </div>
                      </div>

                      {/* Enhanced Location Section */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-base-200 rounded-box transition-colors duration-200">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 md:h-6 w-5 md:w-6 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content mb-1 text-sm md:text-base">
                            Address
                          </h4>
                          <p className="text-neutral text-sm md:text-base">
                            15551 McLean Brot, Eight, IL
                          </p>
                          <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                            <a
                              href="https://maps.google.com?q=15551+McLean+Brot,+Eight,+IL"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline btn-primary"
                            >
                              Get Directions
                            </a>
                            <a
                              href="tel:773-365-5040"
                              className="btn btn-xs btn-outline btn-primary"
                            >
                              Call Now
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-base-200 rounded-box transition-colors duration-200">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 md:h-6 w-5 md:w-6 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content mb-1 text-sm md:text-base">
                            Email
                          </h4>
                          <a
                            href="mailto:office@depovertimes.com"
                            className="text-neutral hover:text-primary transition-colors text-sm md:text-base"
                          >
                            office@depovertimes.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6 pb-2 border-b border-base-200">
                      Business Hours
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead className="bg-primary text-primary-content">
                          <tr>
                            <th className="py-2 md:py-4 text-xs md:text-sm">
                              Weekdays
                            </th>
                            <th className="py-2 md:py-4 text-xs md:text-sm">
                              Saturday
                            </th>
                            <th className="py-2 md:py-4 text-xs md:text-sm">
                              Sunday
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-base-200 transition-colors">
                            <td className="text-neutral py-2 md:py-4 text-xs md:text-sm">
                              9:00 AM - 8:00 PM
                            </td>
                            <td className="text-neutral py-2 md:py-4 text-xs md:text-sm">
                              9:00 AM - 6:00 PM
                            </td>
                            <td className="text-neutral py-2 md:py-4 text-xs md:text-sm">
                              9:00 AM - 5:00 PM
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/5 rounded-box">
                      <div className="flex items-center gap-2 md:gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 md:h-5 w-4 md:w-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-neutral text-xs md:text-sm">
                          Closed on public holidays
                        </span>
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
