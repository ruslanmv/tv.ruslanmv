"use client";

import { useState } from "react";
import {
  FaBars,
  FaChartLine,
  FaLayerGroup,
  FaCog,
  FaCloudUploadAlt,
  FaEye,
  FaVideo,
  FaHdd,
  FaArrowUp,
  FaEdit,
  FaTrash,
  FaPlus,
  FaPencilAlt,
  FaTimes,
  FaCheck,
  FaFilter,
  FaSearch,
  FaChartBar,
  FaClosedCaptioning,
  FaPhotoVideo,
  FaInfoCircle,
  FaImage,
  FaChevronDown,
  FaCopy,
  FaPlay,
  FaFileVideo
} from "react-icons/fa";

type View = "dashboard" | "videos" | "series" | "settings";

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [videoWizardOpen, setVideoWizardOpen] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [scheduleVisible, setScheduleVisible] = useState(false);

  const switchView = (view: View) => {
    setCurrentView(view);
  };

  const toggleModal = (modal: "video" | "series") => {
    if (modal === "video") {
      setVideoWizardOpen(!videoWizardOpen);
      if (videoWizardOpen) {
        // Reset wizard when closing
        setWizardStep(1);
        setScheduleVisible(false);
      }
    } else {
      setSeriesModalOpen(!seriesModalOpen);
    }
  };

  const wizardNav = (direction: number) => {
    const nextStep = wizardStep + direction;
    if (nextStep >= 1 && nextStep <= 4) {
      setWizardStep(nextStep);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setWizardStep(step);
    }
  };

  const toggleSchedule = (show: boolean) => {
    setScheduleVisible(show);
  };

  const getPageTitle = () => {
    const titles: Record<View, string> = {
      dashboard: "Dashboard Overview",
      videos: "Video Content Manager",
      series: "Manage Series",
      settings: "Site Configuration"
    };
    return titles[currentView];
  };

  return (
    <div className="bg-lightGray text-text font-sans antialiased flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden border border-gray-200 mr-3">
            <img
              src="https://ui-avatars.com/api/?name=RM&background=268bd2&color=fff&font-size=0.5"
              alt="RuslanMV"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-lg text-text">TV Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-muted uppercase tracking-wider">Main</div>
          <button
            onClick={() => switchView("dashboard")}
            className={`w-full flex items-center px-6 py-3 font-medium border-r-4 transition-colors ${
              currentView === "dashboard"
                ? "bg-blue-50 text-accent border-accent"
                : "text-muted hover:bg-gray-50 hover:text-text border-transparent"
            }`}
          >
            <FaChartLine className="mr-3" /> Dashboard
          </button>
          <button
            onClick={() => switchView("videos")}
            className={`w-full flex items-center px-6 py-3 font-medium border-r-4 transition-colors ${
              currentView === "videos"
                ? "bg-blue-50 text-accent border-accent"
                : "text-muted hover:bg-gray-50 hover:text-text border-transparent"
            }`}
          >
            <FaVideo className="mr-3" /> Videos
          </button>
          <button
            onClick={() => switchView("series")}
            className={`w-full flex items-center px-6 py-3 font-medium border-r-4 transition-colors ${
              currentView === "series"
                ? "bg-blue-50 text-accent border-accent"
                : "text-muted hover:bg-gray-50 hover:text-text border-transparent"
            }`}
          >
            <FaLayerGroup className="mr-3" /> Series
          </button>

          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
            Site Config
          </div>
          <button
            onClick={() => switchView("settings")}
            className={`w-full flex items-center px-6 py-3 font-medium border-r-4 transition-colors ${
              currentView === "settings"
                ? "bg-blue-50 text-accent border-accent"
                : "text-muted hover:bg-gray-50 hover:text-text border-transparent"
            }`}
          >
            <FaCog className="mr-3" /> Settings
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <img
              src="https://ruslanmv.com/assets/images/profile.jpg"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff";
              }}
              className="w-9 h-9 rounded-full mr-3"
              alt="Admin"
            />
            <div>
              <p className="text-sm font-bold text-text">Ruslan Magana</p>
              <p className="text-xs text-muted">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center text-muted">
            <button className="md:hidden mr-4 text-text" aria-label="Open menu">
              <FaBars />
            </button>
            <h2 className="font-bold text-text text-lg">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleModal("video")}
              className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center"
            >
              <FaCloudUploadAlt className="mr-2" /> Upload Video
            </button>
          </div>
        </header>

        {/* Dynamic View Container */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* VIEW: DASHBOARD */}
          {currentView === "dashboard" && (
            <div className="view-section">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-card border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Total Views</p>
                      <h3 className="text-2xl font-bold text-text">5.2M</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-accent rounded-md">
                      <FaEye />
                    </div>
                  </div>
                  <span className="text-xs text-success font-medium flex items-center">
                    <FaArrowUp className="mr-1" /> 12%
                  </span>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-card border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Total Videos</p>
                      <h3 className="text-2xl font-bold text-text">342</h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                      <FaVideo />
                    </div>
                  </div>
                  <span className="text-xs text-muted font-medium flex items-center">+4 added this week</span>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-card border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Series</p>
                      <h3 className="text-2xl font-bold text-text">12</h3>
                    </div>
                    <div className="p-2 bg-green-50 text-success rounded-md">
                      <FaLayerGroup />
                    </div>
                  </div>
                  <span className="text-xs text-muted font-medium flex items-center">
                    2 active learning paths
                  </span>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-card border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-muted font-bold uppercase">Storage</p>
                      <h3 className="text-2xl font-bold text-text">85%</h3>
                    </div>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-md">
                      <FaHdd />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>

              {/* Latest Activity */}
              <div className="bg-white rounded-lg shadow-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-bold text-text">Latest Activity</h3>
                  <button
                    onClick={() => switchView("videos")}
                    className="text-sm text-accent font-medium hover:underline"
                  >
                    View All Videos
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-lightGray text-xs font-semibold text-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Video</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium">Intro to Generative AI</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">Oct 12, 2025</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium">LangChain Agents Deep Dive</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">Oct 10, 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: VIDEOS */}
          {currentView === "videos" && (
            <div className="view-section">
              <div className="bg-white rounded-lg shadow-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <h3 className="font-bold text-text text-lg">Video Content Manager</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-2.5 text-muted text-xs" />
                      <input
                        type="text"
                        placeholder="Search videos..."
                        className="bg-lightGray border border-border rounded-md pl-9 pr-3 py-2 text-sm w-64 focus:ring-1 focus:ring-accent outline-none"
                      />
                    </div>
                    <button className="bg-white border border-border px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center">
                      <FaFilter className="mr-1" /> Filter
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-lightGray text-xs font-semibold text-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 w-10">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="px-6 py-4">Video</th>
                        <th className="px-6 py-4">Visibility</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Views</th>
                        <th className="px-6 py-4 text-right">Comments</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      <tr className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-24 h-14 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                              <img
                                src="https://picsum.photos/160/90?random=1"
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </div>
                            <div>
                              <div className="font-medium text-text">Intro to Generative AI</div>
                              <div className="text-xs text-muted">Mastering GenAI Series</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-success">
                            <FaEye className="mr-2" /> Public
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">Oct 12, 2025</td>
                        <td className="px-6 py-4 text-right">12,405</td>
                        <td className="px-6 py-4 text-right">45</td>
                        <td className="px-6 py-4 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                            <button className="text-muted hover:text-accent" title="Edit">
                              <FaEdit />
                            </button>
                            <button className="text-muted hover:text-text" title="Analytics">
                              <FaChartBar />
                            </button>
                            <button className="text-muted hover:text-danger" title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-24 h-14 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                              <img
                                src="https://picsum.photos/160/90?random=2"
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </div>
                            <div>
                              <div className="font-medium text-text">LangChain Agents</div>
                              <div className="text-xs text-muted">Mastering GenAI Series</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-success">
                            <FaEye className="mr-2" /> Public
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">Oct 10, 2025</td>
                        <td className="px-6 py-4 text-right">8,230</td>
                        <td className="px-6 py-4 text-right">32</td>
                        <td className="px-6 py-4 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                            <button className="text-muted hover:text-accent" title="Edit">
                              <FaEdit />
                            </button>
                            <button className="text-muted hover:text-text" title="Analytics">
                              <FaChartBar />
                            </button>
                            <button className="text-muted hover:text-danger" title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-24 h-14 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0 flex items-center justify-center">
                              <FaFileVideo className="text-muted text-xl" />
                            </div>
                            <div>
                              <div className="font-medium text-text">AutoGen Setup Guide</div>
                              <div className="text-xs text-muted">Draft</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-muted">
                            <FaPencilAlt className="mr-2" /> Draft
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">--</td>
                        <td className="px-6 py-4 text-right">--</td>
                        <td className="px-6 py-4 text-right">--</td>
                        <td className="px-6 py-4 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                            <button className="text-muted hover:text-accent" title="Edit">
                              <FaEdit />
                            </button>
                            <button className="text-muted hover:text-danger" title="Delete">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SERIES */}
          {currentView === "series" && (
            <div className="view-section">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-text text-lg">Manage Series</h3>
                <button
                  onClick={() => toggleModal("series")}
                  className="bg-white border border-border text-text hover:border-accent hover:text-accent px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  <FaPlus className="inline mr-2" /> Create New Series
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Series Card */}
                <div className="bg-white rounded-lg shadow-card border border-border overflow-hidden group">
                  <div className="h-32 bg-gray-200 relative">
                    <img
                      src="https://picsum.photos/400/200?random=20"
                      className="w-full h-full object-cover"
                      alt="Series"
                    />
                    <div className="absolute top-2 right-2 space-x-1">
                      <button className="bg-white p-1.5 rounded-full text-xs shadow hover:text-accent">
                        <FaPencilAlt />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-text">Mastering GenAI</h4>
                    <p className="text-xs text-muted mb-3">12 Videos • Last updated 2 days ago</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                      <button
                        onClick={() => switchView("videos")}
                        className="text-xs text-accent font-medium hover:underline"
                      >
                        Manage Videos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {currentView === "settings" && (
            <div className="view-section">
              <div className="bg-white rounded-lg shadow-card border border-border max-w-4xl mx-auto">
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-lg text-text">Site Configuration</h3>
                  <p className="text-sm text-muted">
                    Customize the appearance and core settings of your TV channel.
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* General */}
                  <div>
                    <h4 className="text-sm font-bold text-text uppercase mb-4 border-b pb-2">General Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">
                          Site Title
                        </label>
                        <input
                          type="text"
                          defaultValue="TV.RuslanMV"
                          className="w-full bg-lightGray border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          defaultValue="contact@ruslanmv.com"
                          className="w-full bg-lightGray border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <h4 className="text-sm font-bold text-text uppercase mb-4 border-b pb-2">
                      Top Banner / Ticker
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-1">
                        Announcement Text
                      </label>
                      <input
                        type="text"
                        defaultValue="New Tutorial: Building Multi-Agent Systems with Universal A2A Agent"
                        className="w-full bg-lightGray border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                      />
                    </div>
                    <div className="mt-2 flex items-center">
                      <input type="checkbox" defaultChecked className="text-accent rounded mr-2" />
                      <span className="text-sm text-muted">Enable Banner on Homepage</span>
                    </div>
                  </div>

                  {/* Featured */}
                  <div>
                    <h4 className="text-sm font-bold text-text uppercase mb-4 border-b pb-2">
                      Homepage Featured Video
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-1">
                        Video ID / URL
                      </label>
                      <input
                        type="text"
                        defaultValue="vid_89324"
                        className="w-full bg-lightGray border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-accent outline-none"
                      />
                      <p className="text-xs text-muted mt-1">
                        This video will play automatically in the hero section.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 border-t border-border flex justify-end">
                  <button className="bg-accent hover:bg-accentHover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* VIDEO UPLOAD WIZARD MODAL */}
      {videoWizardOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-xl text-text">Upload Video</h3>
              <button onClick={() => toggleModal("video")} className="text-muted hover:text-text">
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Steps Indicator */}
            <div className="px-6 py-4 bg-gray-50 border-b border-border flex justify-center items-center space-x-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(1)}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    wizardStep >= 1
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-muted border-2 border-gray-300"
                  }`}
                >
                  1
                </div>
                <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Upload</span>
              </div>
              <div className="h-0.5 w-10 bg-gray-300"></div>
              {/* Step 2 */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(2)}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    wizardStep >= 2
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-muted border-2 border-gray-300"
                  }`}
                >
                  2
                </div>
                <span className="text-[10px] font-bold text-muted mt-1 uppercase tracking-wide">Details</span>
              </div>
              <div className="h-0.5 w-10 bg-gray-300"></div>
              {/* Step 3 */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(3)}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    wizardStep >= 3
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-muted border-2 border-gray-300"
                  }`}
                >
                  3
                </div>
                <span className="text-[10px] font-bold text-muted mt-1 uppercase tracking-wide">Elements</span>
              </div>
              <div className="h-0.5 w-10 bg-gray-300"></div>
              {/* Step 4 */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(4)}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    wizardStep >= 4
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-muted border-2 border-gray-300"
                  }`}
                >
                  4
                </div>
                <span className="text-[10px] font-bold text-muted mt-1 uppercase tracking-wide">Visibility</span>
              </div>
            </div>

            {/* Wizard Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-white relative">
              {/* Step 1: Upload */}
              {wizardStep === 1 && (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-lg border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-lightGray hover:bg-blue-50 hover:border-accent transition-all cursor-pointer group">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-accent" />
                    </div>
                    <p className="font-medium text-xl text-text mb-2">Drag and drop video files to upload</p>
                    <p className="text-sm text-muted mb-6">Your videos will remain private until you publish them.</p>
                    <button
                      onClick={() => wizardNav(1)}
                      className="px-8 py-3 bg-accent hover:bg-accentHover text-white rounded-md text-sm font-bold uppercase shadow-lg transform active:scale-95 transition-all"
                    >
                      Select Files
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-8 text-center max-w-md">
                    By submitting your videos to TV.RuslanMV, you acknowledge that you agree to our Terms of Service
                    and Community Guidelines.
                  </p>
                </div>
              )}

              {/* Step 2: Details */}
              {wizardStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title & Description */}
                    <div className="space-y-4">
                      <div className="group">
                        <label className="flex justify-between text-xs font-bold text-muted uppercase mb-1">
                          Title (required) <span className="text-[10px]">0/100</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border border-border rounded p-3 text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all placeholder-gray-300"
                          placeholder="Add a title that describes your video"
                        />
                      </div>
                      <div className="group">
                        <label className="flex justify-between text-xs font-bold text-muted uppercase mb-1">
                          Description <span className="text-[10px]">0/5000</span>
                        </label>
                        <textarea
                          className="w-full border border-border rounded p-3 text-sm focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all h-32 resize-y placeholder-gray-300"
                          placeholder="Tell viewers about your video"
                        ></textarea>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-2">Thumbnail</label>
                      <p className="text-xs text-muted mb-3">
                        Select or upload a picture that shows what&apos;s in your video.
                      </p>
                      <div className="flex gap-4">
                        <div className="w-32 h-20 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-blue-50 transition-colors text-muted hover:text-accent">
                          <FaImage className="mb-1" />
                          <span className="text-[10px] uppercase font-bold">Upload file</span>
                        </div>
                        <div className="w-32 h-20 bg-gray-100 rounded relative group cursor-pointer overflow-hidden border border-transparent hover:border-accent">
                          <img
                            src="https://picsum.photos/128/80?random=101"
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                            alt=""
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100">
                            <FaCheck className="text-white drop-shadow-md" />
                          </div>
                        </div>
                        <div className="w-32 h-20 bg-gray-100 rounded relative group cursor-pointer overflow-hidden border border-transparent hover:border-accent">
                          <img
                            src="https://picsum.photos/128/80?random=102"
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                            alt=""
                          />
                        </div>
                      </div>
                    </div>

                    {/* Playlist */}
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-2">Playlists</label>
                      <div className="relative group">
                        <select className="w-full border border-border rounded p-3 text-sm focus:ring-1 focus:ring-accent outline-none appearance-none bg-white">
                          <option value="" disabled>
                            Select a playlist
                          </option>
                          <option value="genai">Mastering GenAI</option>
                          <option value="python">Python for Data Science</option>
                          <option value="new">+ New Playlist</option>
                        </select>
                        <FaChevronDown className="absolute right-3 top-3.5 text-muted pointer-events-none group-focus-within:text-accent" />
                      </div>
                    </div>

                    {/* Audience */}
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-2">Audience</label>
                      <div className="space-y-3 p-4 bg-gray-50 rounded border border-border">
                        <p className="text-sm font-medium mb-1">Is this video made for kids?</p>
                        <p className="text-xs text-muted mb-3">
                          Regardless of your location, you&apos;re legally required to comply with COPPA.
                        </p>

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input type="radio" name="audience" className="mt-0.5 text-accent focus:ring-accent" />
                          <span className="text-sm">Yes, it&apos;s made for kids</span>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="audience"
                            className="mt-0.5 text-accent focus:ring-accent"
                            defaultChecked
                          />
                          <span className="text-sm">No, it&apos;s not made for kids</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Sticky Preview */}
                  <div className="lg:col-span-1">
                    <div className="bg-lightGray rounded border border-border sticky top-0">
                      <div className="aspect-video bg-black rounded-t overflow-hidden relative">
                        <video className="w-full h-full object-cover opacity-60"></video>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaPlay className="text-white/50 text-4xl" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start text-xs text-muted mb-4">
                          <div>
                            <div className="uppercase font-bold mb-1">Video Link</div>
                            <a href="#" className="text-accent hover:underline truncate block w-32">
                              tv.ruslanmv.com/v/xyz123
                            </a>
                          </div>
                          <button className="text-accent hover:bg-blue-50 p-1 rounded">
                            <FaCopy />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted uppercase font-bold">Filename</div>
                          <div className="text-sm truncate">my_awesome_video_final.mp4</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Video Elements */}
              {wizardStep === 3 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <h4 className="text-lg font-bold text-text">Video Elements</h4>
                  <p className="text-sm text-muted mb-6">
                    Use cards and an end screen to show viewers related videos, websites, and calls to action.
                  </p>

                  {/* Element Row */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-muted">
                        <FaClosedCaptioning />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Add subtitles</h5>
                        <p className="text-xs text-muted">Reach a broader audience by adding subtitles.</p>
                      </div>
                    </div>
                    <button className="text-accent font-bold text-sm uppercase px-3 py-1 hover:bg-blue-50 rounded">
                      Add
                    </button>
                  </div>

                  {/* Element Row */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-muted">
                        <FaPhotoVideo />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Add an end screen</h5>
                        <p className="text-xs text-muted">Promote related content at the end of your video.</p>
                      </div>
                    </div>
                    <button className="text-accent font-bold text-sm uppercase px-3 py-1 hover:bg-blue-50 rounded">
                      Import
                    </button>
                  </div>

                  {/* Element Row */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-muted">
                        <FaInfoCircle />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-text">Add cards</h5>
                        <p className="text-xs text-muted">Promote related content during your video.</p>
                      </div>
                    </div>
                    <button className="text-accent font-bold text-sm uppercase px-3 py-1 hover:bg-blue-50 rounded">
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Visibility */}
              {wizardStep === 4 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-lg font-bold text-text">Visibility</h4>
                    <p className="text-sm text-muted">Choose when to publish and who can see your video.</p>

                    <div className="border border-border rounded overflow-hidden">
                      {/* Save or Publish */}
                      <div className="p-4 border-b border-border bg-gray-50">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="publish_action"
                            className="mt-1 text-accent focus:ring-accent"
                            defaultChecked
                            onChange={() => toggleSchedule(false)}
                          />
                          <div>
                            <span className="block text-sm font-bold text-text">Save or publish</span>
                            <span className="block text-xs text-muted">
                              Make your video public, unlisted, or private.
                            </span>
                          </div>
                        </label>
                      </div>
                      <div className="p-6 space-y-4 pl-10">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" name="visibility_opt" className="text-accent focus:ring-accent" />
                          <span className="text-sm group-hover:text-text text-muted transition-colors">Private</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" name="visibility_opt" className="text-accent focus:ring-accent" />
                          <span className="text-sm group-hover:text-text text-muted transition-colors">
                            Unlisted
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="visibility_opt"
                            className="text-accent focus:ring-accent"
                            defaultChecked
                          />
                          <span className="text-sm group-hover:text-text text-muted transition-colors">Public</span>
                        </label>
                      </div>

                      {/* Schedule */}
                      <div className="p-4 border-t border-border bg-gray-50">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="publish_action"
                            className="mt-1 text-accent focus:ring-accent"
                            onChange={() => toggleSchedule(true)}
                          />
                          <div>
                            <span className="block text-sm font-bold text-text">Schedule</span>
                            <span className="block text-xs text-muted">Select a date to make your video public.</span>
                          </div>
                        </label>
                      </div>
                      {scheduleVisible && (
                        <div className="p-6 pl-10 transition-all">
                          <div className="flex space-x-4">
                            <input
                              type="date"
                              className="border border-border rounded p-2 text-sm text-muted focus:ring-accent outline-none"
                            />
                            <input
                              type="time"
                              className="border border-border rounded p-2 text-sm text-muted focus:ring-accent outline-none"
                            />
                          </div>
                          <p className="text-xs text-muted mt-2">Time zone: Local time (GMT+2)</p>
                        </div>
                      )}
                    </div>

                    {/* Legal */}
                    <div className="bg-blue-50 p-4 rounded text-xs text-muted border border-blue-100">
                      <h5 className="font-bold text-accent mb-1">Before you publish, check the following:</h5>
                      <p>
                        Do children appear in this video? Make sure you follow our policies to protect minors from
                        harm, exploitation, bullying, and violations of labor law.
                      </p>
                    </div>
                  </div>

                  {/* Right Sticky Preview */}
                  <div className="lg:col-span-1">
                    <div className="bg-lightGray rounded border border-border sticky top-0 opacity-75">
                      <div className="aspect-video bg-black rounded-t overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaPlay className="text-white/50 text-4xl" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start text-xs text-muted mb-4">
                          <div>
                            <div className="uppercase font-bold mb-1">Video Link</div>
                            <div className="text-accent truncate w-32">tv.ruslanmv.com/v/xyz123</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-white px-6 py-4 border-t border-border flex justify-between items-center">
              {wizardStep > 1 ? (
                <button
                  onClick={() => wizardNav(-1)}
                  className="px-4 py-2 text-sm font-bold uppercase text-muted hover:text-text transition-colors"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              <div className="flex-1"></div>
              {wizardStep < 4 ? (
                <button
                  onClick={() => wizardNav(1)}
                  className="px-6 py-2 bg-accent hover:bg-accentHover text-white rounded-sm text-sm font-medium shadow-sm uppercase tracking-wide transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => {
                    toggleModal("video");
                    alert("Video processed and published successfully!");
                  }}
                  className="px-6 py-2 bg-success hover:bg-green-600 text-white rounded-sm text-sm font-medium shadow-sm uppercase tracking-wide transition-all"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE SERIES MODAL */}
      {seriesModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg text-text">Create New Series</h3>
              <button onClick={() => toggleModal("series")} className="text-muted hover:text-text">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1">Series Title</label>
                <input
                  type="text"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1">Description</label>
                <textarea
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:ring-accent"
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1">Cover Image URL</label>
                <input
                  type="text"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:ring-accent"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-border flex justify-end space-x-2">
              <button onClick={() => toggleModal("series")} className="px-4 py-2 text-sm font-medium text-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleModal("series");
                  alert("Series Created!");
                }}
                className="px-6 py-2 bg-accent text-white rounded-md text-sm font-medium"
              >
                Create Series
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
