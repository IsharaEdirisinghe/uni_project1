import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiUploadCloud, FiCheckCircle, FiSend, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

const ApplyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get Job details passed from JobDetailsPage
  const { jobId, jobTitle } = location.state || {};

  // Form State matching your Mongoose Schema
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
  });
  
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if accessed directly without a Job ID
  useEffect(() => {
    if (!jobId) {
      setError("No job selected. Redirecting to job board...");
      setTimeout(() => navigate('/'), 3000);
    }
  }, [jobId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Retrieve userId from local storage (assuming it was saved during login)
    const userId = localStorage.getItem('userId'); 
    const userName = localStorage.getItem('userName'); // Optional field in your schema

    if (!userId) {
      setError("User not authenticated. Please log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("jobId", jobId);
      data.append("userId", userId);
      data.append("userName", userName || ""); // matches schema
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("mobileNumber", formData.mobileNumber); // matches schema
      data.append("cv", cvFile); // The file to be handled by Multer on backend

      const response = await fetch("http://localhost:8080/api/apply", {
        method: "POST",
        body: data,
        // Headers are set automatically for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-popins">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Application Sent!</h2>
          <p className="text-gray-500 mt-3 mb-8 font-medium">
            Your application for <b>{jobTitle || "the position"}</b> has been successfully submitted.
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-20 font-popins">
      <main className="max-w-2xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <FiChevronLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-white">
          <div className="bg-blue-600 p-10 text-white">
            <h1 className="text-3xl font-extrabold">Apply Now</h1>
            <p className="text-blue-100 mt-1 font-medium italic">Position: {jobTitle || "Loading..."}</p>
          </div>

          {error && (
            <div className="mx-10 mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold">
              <FiAlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="John"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Doe"
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                placeholder="j.doe@example.com"
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
              <input
                name="mobileNumber"
                required
                value={formData.mobileNumber}
                onChange={handleInputChange}
                type="tel"
                placeholder="+94 77 123 4567"
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">CV / Resume (Required)</label>
              <div className="relative">
                <input 
                  type="file" 
                  id="cv-upload" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                <label 
                  htmlFor="cv-upload"
                  className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer group block ${
                    cvFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                >
                  <FiUploadCloud className={`mx-auto mb-3 ${cvFile ? 'text-green-500' : 'text-gray-300 group-hover:text-blue-500'}`} size={40} />
                  <p className="text-sm font-bold text-gray-700">{cvFile ? cvFile.name : "Upload your CV"}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">PDF format only (Max 5MB)</p>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !jobId}
              className="w-full bg-blue-600 text-white font-extrabold py-5 rounded-2xl hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <BiLoaderAlt className="animate-spin" /> : <><FiSend /> Submit Application</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplyForm;