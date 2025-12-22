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
  FaClock,
  FaHdd,
  FaArrowUp,
  FaEdit,
  FaTrash,
  FaPlus,
  FaPencilAlt,
  FaPlayCircle,
  FaTimes,
  FaCheck
} from "react-icons/fa";

type View = "dashboard" | "series" | "settings";

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [videoWizardOpen, setVideoWizardOpen] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const switchView = (view: View) => {
    setCurrentView(view);
  };

  const toggleModal = (modal: "video" | "series") => {
    if (modal === "video") {
      setVideoWizardOpen(!videoWizardOpen);
      if (videoWizardOpen) {
        // Reset wizard when closing
        setWizardStep(1);
      }
    } else {
      setSeriesModalOpen(!seriesModalOpen);
    }
  };

  const wizardNav = (direction: number) => {
    const nextStep = wizardStep + direction;
    if (nextStep >= 1 && nextStep <= 3) {
      setWizardStep(nextStep);
    }
  };

  const getPageTitle = () => {
    const titles: Record<View, string> = {
      dashboard: "Dashboard Overview",
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

              {/* Recent Content Table */}
              <div className="bg-white rounded-lg shadow-card border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="font-bold text-text">Recent Uploads</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-lightGray border-none rounded-md px-3 py-1.5 text-sm w-48 focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-lightGray text-xs font-semibold text-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Video</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
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
                        <td className="px-6 py-4 text-right">
                          <button className="text-accent hover:text-accentHover mr-2">
                            <FaEdit />
                          </button>
                          <button className="text-danger hover:text-red-700">
                            <FaTrash />
                          </button>
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
                      <button className="text-xs text-accent font-medium hover:underline">
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
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg text-text">Upload Video Wizard</h3>
              <button onClick={() => toggleModal("video")} className="text-muted hover:text-text">
                <FaTimes />
              </button>
            </div>

            {/* Steps Indicator */}
            <div className="px-6 py-4 border-b border-border bg-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    wizardStep >= 1 ? "bg-accent text-white border-accent" : "bg-white text-muted border-2"
                  }`}
                >
                  1
                </div>
                <span className={`text-sm font-medium ${wizardStep === 1 ? "" : "text-muted"}`}>
                  Upload
                </span>
              </div>
              <div className="h-0.5 w-12 bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    wizardStep >= 2 ? "bg-accent text-white border-accent" : "bg-white text-muted border-2"
                  }`}
                >
                  2
                </div>
                <span className={`text-sm font-medium ${wizardStep === 2 ? "" : "text-muted"}`}>
                  Details
                </span>
              </div>
              <div className="h-0.5 w-12 bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    wizardStep >= 3 ? "bg-accent text-white border-accent" : "bg-white text-muted border-2"
                  }`}
                >
                  3
                </div>
                <span className={`text-sm font-medium ${wizardStep === 3 ? "" : "text-muted"}`}>
                  Review
                </span>
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-8 overflow-y-auto">
              {/* Step 1: Upload */}
              {wizardStep === 1 && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-lightGray hover:bg-blue-50 hover:border-accent transition-colors cursor-pointer group">
                    <div className="text-5xl text-gray-300 group-hover:text-accent mb-4 transition-colors">
                      <FaCloudUploadAlt className="inline" />
                    </div>
                    <p className="font-medium text-lg text-text mb-2">Drag and drop video files here</p>
                    <p className="text-sm text-muted">Supported formats: MP4, MOV, MKV (Max 2GB)</p>
                    <button className="mt-6 px-6 py-2 bg-white border border-border rounded-md text-sm font-medium hover:text-accent shadow-sm">
                      Select Files
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full border border-border rounded px-3 py-2 text-sm focus:ring-accent"
                      placeholder="Video Title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-border rounded px-3 py-2 text-sm focus:ring-accent"
                      rows={4}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-1">Series</label>
                      <select className="w-full border border-border rounded px-3 py-2 text-sm">
                        <option>None</option>
                        <option>Mastering GenAI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase mb-1">Tags</label>
                      <input
                        type="text"
                        className="w-full border border-border rounded px-3 py-2 text-sm"
                        placeholder="Comma separated"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {wizardStep === 3 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <FaCheck />
                  </div>
                  <h4 className="text-xl font-bold text-text mb-2">Ready to Publish!</h4>
                  <p className="text-muted mb-6">Your video &quot;Intro to LLMs&quot; is ready to be processed.</p>
                  <div className="bg-lightGray p-4 rounded text-left text-sm text-muted">
                    <p>
                      <strong>File:</strong> video_source.mp4 (450MB)
                    </p>
                    <p>
                      <strong>Visibility:</strong> Public
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-border flex justify-between">
              {wizardStep > 1 && (
                <button
                  onClick={() => wizardNav(-1)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-text"
                >
                  Back
                </button>
              )}
              {wizardStep < 1 && <div></div>}
              <div className="flex-1"></div>
              {wizardStep < 3 && (
                <button
                  onClick={() => wizardNav(1)}
                  className="px-6 py-2 bg-accent hover:bg-accentHover text-white rounded-md text-sm font-medium shadow-sm"
                >
                  Next Step
                </button>
              )}
              {wizardStep === 3 && (
                <button
                  onClick={() => {
                    toggleModal("video");
                    alert("Published!");
                  }}
                  className="px-6 py-2 bg-success hover:bg-green-600 text-white rounded-md text-sm font-medium shadow-sm"
                >
                  Publish Now
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
                <label className="block text-xs font-bold text-muted uppercase mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:ring-accent"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-border flex justify-end space-x-2">
              <button
                onClick={() => toggleModal("series")}
                className="px-4 py-2 text-sm font-medium text-muted"
              >
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
