import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobView from './HomePage'; // Your new HomePage
import JobDetails from './JobDetails';
import ApplyForm from './ApplyForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JobView />} />
        {/* Path updated to match your new HomePage link */}
        <Route path="/jobDetails" element={<JobDetails />} />
        <Route path="/apply" element={<ApplyForm />} />
      </Routes>
    </Router>
  );
}

export default App;