import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { TripPlannerPage } from '../pages/TripPlannerPage';
import { BookingReviewPage } from '../pages/BookingReviewPage';
import { BookingConfirmationPage } from '../pages/BookingConfirmationPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<SearchResultsPage />} />
      <Route path="/planner" element={<TripPlannerPage />} />
      <Route path="/booking/review" element={<BookingReviewPage />} />
      <Route path="/booking/confirmation/:id" element={<BookingConfirmationPage />} />
      <Route path="/bookings" element={<MyBookingsPage />} />
    </Routes>
  );
};
