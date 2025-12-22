"use client";

import { FaBars, FaPlay, FaList, FaVideo, FaClock, FaLayerGroup, FaPlayCircle } from "react-icons/fa";

// Mock data for series - in a real app, this would come from an API
const featuredSeries = {
  slug: "mastering-ai-agents",
  title: "Mastering Generative AI Agents",
  description: "A comprehensive 12-part series taking you from the basics of LLMs to building autonomous multi-agent systems using LangChain, AutoGen, and IBM watsonx.ai.",
  episodes: 12,
  duration: "8 Hours Total",
  level: "Intermediate",
  badge: "Featured Collection"
};

const popularSeries = [
  {
    id: 1,
    slug: "aws-cloud-architect",
    title: "AWS Cloud Architect",
    category: "Cloud",
    categoryColor: "bg-accent",
    description: "Design resilient and scalable systems on AWS. Covers EC2, S3, VPC networking, and serverless patterns.",
    lessons: 24,
    updated: "Oct 2025",
    image: "https://picsum.photos/500/300?random=20"
  },
  {
    id: 2,
    slug: "python-data-science",
    title: "Python for Data Science",
    category: "Data Science",
    categoryColor: "bg-purple-600",
    description: "From Pandas to Scikit-Learn. Master data manipulation, visualization, and basic machine learning models.",
    lessons: 18,
    updated: "Sep 2025",
    image: "https://picsum.photos/500/300?random=21"
  },
  {
    id: 3,
    slug: "kubernetes-deep-dive",
    title: "Kubernetes Deep Dive",
    category: "DevOps",
    categoryColor: "bg-green-600",
    description: "Orchestrate containers like a pro. Deploying, scaling, and managing applications with K8s.",
    lessons: 15,
    updated: "Aug 2025",
    image: "https://picsum.photos/500/300?random=22"
  }
];

const recentSeries = [
  {
    id: 1,
    slug: "ethical-hacking",
    title: "Ethical Hacking Fundamentals",
    category: "Cybersecurity",
    categoryColor: "text-orange-600",
    description: "Learn network scanning, vulnerability assessment, and penetration testing techniques.",
    lessons: 8,
    duration: "4h 20m",
    image: "https://picsum.photos/400/225?random=25"
  },
  {
    id: 2,
    slug: "modern-react-patterns",
    title: "Modern React Patterns",
    category: "Frontend",
    categoryColor: "text-accent",
    description: "Hooks, Context API, and state management strategies for enterprise applications.",
    lessons: 10,
    duration: "5h 15m",
    image: "https://picsum.photos/400/225?random=26"
  }
];

export default function SeriesPage() {
  return (
    <div className="bg-lightGray text-text font-sans antialiased flex flex-col min-h-screen">
      {/* Minimalist Header (Consistent) */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
              <img
                src="https://ui-avatars.com/api/?name=RM&background=268bd2&color=fff&font-size=0.5"
                alt="RuslanMV"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none group-hover:text-accent transition-colors">TV.RuslanMV</span>
              <span className="text-[10px] font-medium text-muted uppercase tracking-wide mt-0.5">Series</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted">
            <a href="/" className="hover:text-accent transition-colors">Live</a>
            <a href="/archive" className="hover:text-accent transition-colors">Archive</a>
            <a href="/series" className="text-text font-semibold hover:text-accent transition-colors">Series</a>
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">About</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button className="md:hidden p-2 text-text" aria-label="Open menu">
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* Featured Series Hero */}
      <section className="bg-darkBg text-white pt-12 md:pt-20 pb-16 md:pb-28 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent opacity-10 transform skew-x-12 translate-x-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mb-4 inline-block">
              {featuredSeries.badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{featuredSeries.title}</h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-2xl">
              {featuredSeries.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href={`/series/${featuredSeries.slug}`} className="bg-accent hover:bg-accentHover text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center shadow-lg">
                <FaPlay className="mr-2" /> Start Series
              </a>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-md font-medium transition-colors flex items-center backdrop-blur-sm">
                <FaList className="mr-2" /> View Syllabus
              </button>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-400 space-x-6">
              <span><FaVideo className="inline mr-2" />{featuredSeries.episodes} Episodes</span>
              <span><FaClock className="inline mr-2" />{featuredSeries.duration}</span>
              <span><FaLayerGroup className="inline mr-2" />{featuredSeries.level}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-12">

        {/* Section: Popular Learning Paths */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text border-l-4 border-accent pl-3">Popular Learning Paths</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularSeries.map((series) => (
              <a
                key={series.id}
                href={`/series/${series.slug}`}
                className="bg-white rounded-lg shadow-card border border-border overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative aspect-[16/9] bg-gray-200 overflow-hidden">
                  <img
                    src={series.image}
                    alt={series.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className={`${series.categoryColor} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1 inline-block`}>
                      {series.category}
                    </span>
                    <h3 className="font-bold text-lg leading-tight">{series.title}</h3>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-muted mb-4 line-clamp-2">{series.description}</p>
                  <div className="mt-auto pt-4 border-t border-lightGray flex items-center justify-between text-xs text-muted">
                    <span><FaPlayCircle className="inline mr-1 text-accent" /> {series.lessons} Lessons</span>
                    <span>Updated: {series.updated}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Section: Recently Added Series */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text border-l-4 border-gray-400 pl-3">Recently Added</h2>
            <a href="#" className="text-sm text-accent hover:underline">View All</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentSeries.map((series) => (
              <a
                key={series.id}
                href={`/series/${series.slug}`}
                className="bg-white rounded-lg shadow-card border border-border p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-full sm:w-48 aspect-video bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                  <img src={series.image} alt={series.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/0 transition-colors">
                    <FaLayerGroup className="text-white text-2xl drop-shadow-md" />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="mb-1">
                    <span className={`text-[10px] font-bold ${series.categoryColor} uppercase tracking-wide`}>
                      {series.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-md text-text mb-2">{series.title}</h3>
                  <p className="text-xs text-muted mb-3 line-clamp-2">{series.description}</p>
                  <span className="text-xs font-medium text-gray-500">{series.lessons} Lessons • {series.duration}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8 text-sm text-muted mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="font-bold text-text">TV.RuslanMV</span>
            <span className="text-gray-300">|</span>
            <span>© 2025 Ruslan Magana Vsevolodovna</span>
          </div>
          <div className="flex space-x-6">
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Terms</a>
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Privacy</a>
            <a href="https://ruslanmv.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Twitter</a>
            <a href="https://github.com/ruslanmv" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
