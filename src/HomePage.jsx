import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- React Icons Imports ---
import { 
  FiSearch, 
  FiMapPin, 
  FiBriefcase, 
  FiBookmark, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronDown,
  FiFilter
} from "react-icons/fi";
import { BiLoaderAlt, BiSad } from "react-icons/bi";

// --- Sub-Components ---

const FilterSection = ({ title, options, selectedOptions, onChange }) => (
  <details className="py-4 border-b border-gray-100 group" open>
    <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-800 list-none select-none">
      <span className="text-sm">{title}</span>
      <span className="transition-transform duration-300 group-open:rotate-180 text-gray-400">
        <FiChevronDown size={18} />
      </span>
    </summary>
    <div className="mt-4 space-y-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors">
          <input 
            type="checkbox" 
            checked={selectedOptions.includes(opt)}
            onChange={() => onChange(opt)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  </details>
);

const JobCard = ({ job }) => (
  <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
    {/* Decorative Accent on Hover */}
    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
        <p className="text-sm text-gray-500 mt-1 font-medium">{job.department}</p>
        
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold tracking-wide">
          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-600">
            <FiMapPin /> {job.location}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-purple-600">
            <FiBriefcase /> {job.type}
          </span>
        </div>
      </div>
      <button className="text-gray-300 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
        <FiBookmark size={20} />
      </button>
    </div>

    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
      <p className="text-xs text-gray-400 font-medium">Posted {job.postedDate || "Recently"}</p>
      <Link to='/jobDetails' className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group/link">
        Details 
        <span className="group-hover/link:translate-x-1 transition-transform">
          <FiChevronRight />
        </span>
      </Link>
    </div>
  </div>
);

// --- Main Component: Home ---

export default function JobView() {
  const navigate = useNavigate(); 
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Logic state
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);

  // --- LOGOUT FUNCTIONALITY ---
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login');              
  };

  // --- FETCH DATA ---
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("size", pageSize);
      if (searchTerm) params.append("search", searchTerm);
      if (selectedTypes.length > 0) params.append("type", selectedTypes.join(","));
      if (selectedDepts.length > 0) params.append("department", selectedDepts.join(","));

      const response = await fetch(`http://localhost:8080/api/jobs?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.status === 403) {
         console.error("Session expired.");
         handleLogout(); 
         return;
      }

      if (!response.ok) throw new Error("Backend unavailable");
      
      const data = await response.json();
      
      if (data.content) {
          setJobs(data.content);
          setTotalPages(data.totalPages);
      } else {
          setJobs(data);
          setTotalPages(1);
      }
    } catch (error) {
      console.warn("Backend unavailable. Loading Mock Data.");
      
      // Mock Data
      let mockData = [
        { id: 1, title: "Software Engineer", department: "IT Services", location: "Main Campus", type: "Full-Time", postedDate: "2 days ago" },
        { id: 2, title: "Library Assistant", department: "Library", location: "West Campus", type: "Part-Time", postedDate: "3 days ago" },
        { id: 3, title: "Research Fellow", department: "Research", location: "Main Campus", type: "Full-Time", postedDate: "5 days ago" },
        { id: 4, title: "Student Worker", department: "Athletics", location: "East Campus", type: "Student Worker", postedDate: "1 week ago" },
        { id: 5, title: "System Admin", department: "IT Services", location: "Main Campus", type: "Full-Time", postedDate: "1 week ago" },
        { id: 6, title: "Network Engineer", department: "IT Services", location: "Main Campus", type: "Full-Time", postedDate: "2 days ago" },
        { id: 7, title: "Lab Coordinator", department: "Research", location: "Main Campus", type: "Full-Time", postedDate: "3 days ago" },
      ];

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        mockData = mockData.filter(j => 
          j.title.toLowerCase().includes(lowerTerm) || 
          j.department.toLowerCase().includes(lowerTerm) 
        );
      }

      if (selectedTypes.length > 0) {
        mockData = mockData.filter(j => selectedTypes.includes(j.type));
      }
      if (selectedDepts.length > 0) {
        mockData = mockData.filter(j => selectedDepts.includes(j.department));
      }

      setJobs(mockData);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedTypes, selectedDepts, navigate]); 

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // --- HANDLERS ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); 
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDeptToggle = (dept) => {
    setSelectedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const applyFilters = () => {
    setCurrentPage(0);
    fetchJobs();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setSelectedDepts([]);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-popins pb-20">
      
      {/* --- HERO / SEARCH SECTION --- */}
      <div className="bg-white border-b border-gray-100 pb-10 pt-8 shadow-sm">
        <div className=" flex justify-center flex-col items-center mx-auto px-6">
            <div className="max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                   Find your next <span className="text-blue-600">Opportunity</span>
                </h1>
                <p className="text-gray-500 mt-2 text-lg text-center">Browse available positions across campus departments.</p>
            </div>

            {/* Floating Search Bar */}
            <div className="mt-8 max-w-2xl relative z-10">
                <div className="flex w-full items-center rounded-full shadow-lg shadow-blue-500/10 h-16 bg-white border border-gray-200 overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all duration-300 ">
                    <div className="pl-6 text-gray-400">
                        <FiSearch size={22} />
                    </div>
                    <input 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        className="flex-1 w-full border-none outline-none text-gray-800 placeholder:text-gray-400 px-4 text-base h-full bg-transparent font-medium"
                        placeholder="Search for job "
                    />
                    <button onClick={applyFilters} className="mr-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md">
                        Search
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <main className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
          
          {/* --- FILTER SIDEBAR (Left) --- */}
          <aside className="col-span-1 hidden lg:block sticky top-8">
            <div className="rounded-2xl border border-white bg-white p-6 shadow-xl shadow-gray-200/50">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiFilter size={18} /> Filters
                </h3>
                <button onClick={resetFilters} className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide">Reset All</button>
              </div>
              
              <FilterSection 
                title="Job Type" 
                options={['Full-Time', 'Part-Time', 'Tempary']} 
                selectedOptions={selectedTypes}
                onChange={handleTypeToggle}
              />
              
              <FilterSection 
                title="Faculty" 
                options={['Science', 'Art', 'Managment', 'Engineering','Medicine','Technology','Agriculture','Fisheries and Marine Science']} 
                selectedOptions={selectedDepts}
                onChange={handleDeptToggle}
              />
              
              <button 
                onClick={applyFilters}
                className="w-full mt-6 bg-gray-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 transform active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* --- JOB LIST AREA (Right) --- */}
          <div className="col-span-1 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Job Listings</h2>
              <p className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  Page <span className="text-blue-600 font-bold">{currentPage + 1}</span> of {totalPages || 1}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <BiLoaderAlt className="animate-spin text-blue-600" size={40} />
                <p className="text-gray-400 font-medium mt-4 animate-pulse">Fetching opportunities...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                 <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <BiSad size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
                 <p className="text-gray-500 mt-1 max-w-xs mx-auto">We couldn't find any matches for your search criteria.</p>
                 <button onClick={resetFilters} className="mt-6 text-blue-600 font-bold hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="space-y-5">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-3">
                <button 
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 0}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>

                <div className="hidden md:flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => { setCurrentPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${
                        currentPage === i 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {i + 1}
                    </button>
                    ))}
                </div>

                <button 
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages - 1}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-white shadow-sm transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}