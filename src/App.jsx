import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.jsx";
import JobDetails from "./JobDetails.jsx";
import ApplyForm from "./ApplyForm.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/apply/:id" element={<ApplyForm />} />
      </Routes>
    </BrowserRouter>
  );
}
