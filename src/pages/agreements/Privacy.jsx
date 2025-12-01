import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText } from 'lucide-react';
import privacyMd from './privacy-policy.md?raw';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('');

  // Extract headings for table of contents
  const headings = [
    { id: 'privacy-policy', title: 'Privacy Policy' },
    { id: 'personal-statement', title: 'Personal Statement' },
    { id: 'what-information-do-we-gather', title: 'What Information Do We Gather?' },
    { id: 'who-do-we-share-your-information-with', title: 'Who Do We Share Your Information With?' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'disclosure-of-your-information', title: 'Disclosure Of Your Information' },
    { id: 'data-retention', title: 'Data Retention' },
    { id: 'updates-to-this-policy', title: 'Updates To This Policy' },
    { id: 'capstone-project-disclaimer', title: 'Capstone Project Disclaimer' }
  ];

  // Nav function to scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Tracks which section is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 } // 30% of the section should be visible
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="flex items-center space-x-2 text-base-content/70 hover:text-base-content transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Login</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/terms" 
                className="flex items-center space-x-2 text-base-content/70 hover:text-base-content transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Terms & Conditions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left (table of contents) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-6">
                <h2 className="text-lg font-semibold text-base-content mb-4">Contents</h2>
                <nav className="space-y-2">
                  {headings.map((heading, index) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToSection(heading.id)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        activeSection === heading.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-base-content hover:text-base-content hover:bg-base-200'
                      }`}
                    >
                      <span className="text-xs text-base-content/40 mr-2">{index + 1}.</span>
                      {heading.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Right (content) */}
          <div className="lg:col-span-3">
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-8">
              <div className="prose prose-base max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 
                        id="privacy-policy"
                        className="text-2xl font-bold text-base-content mb-6 border-b border-base-300 pb-4 scroll-mt-8"
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => {
                      // Convert title to ID
                      const id = children.toString().toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '-');
                      
                      return (
                        <h2 
                          id={id}
                          className="text-xl font-semibold text-base-content mt-12 mb-4 scroll-mt-8"
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-primary mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-base-content leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-2 mb-4 text-base-content">
                        {children}
                      </ul>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-base-content">
                        {children}
                      </strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/30 pl-4 bg-primary/5 py-3 my-6 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-primary hover:text-primary/80 underline"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => (
                      <hr className="border-base-300 my-8" />
                    )
                  }}
                >
                  {privacyMd}
                </ReactMarkdown>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;