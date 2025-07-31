
import React, { useState, useEffect } from 'react';

export default function Actionable_Recommendation_Card({ recommendationId, type }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulate fetching recommendation data based on recommendationId and type
    // In a real application, this would be an API call
    const fetchRecommendation = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (recommendationId === 'rec-001' && type === 'financial') {
          setRecommendation({
            title: 'Review Your Investment Portfolio',
            description: 'Your current investment portfolio could benefit from rebalancing to align with market changes and your risk tolerance. Consider diversifying your assets.',
            actions: [
              { label: 'View Portfolio', handler: () => alert('Navigating to portfolio...') },
              { label: 'Get Expert Advice', handler: () => alert('Connecting with an advisor...') }
            ]
          });
        } else if (recommendationId === 'rec-002' && type === 'health') {
          setRecommendation({
            title: 'Increase Daily Water Intake',
            description: 'Staying hydrated is crucial for overall health. Aim for at least 8 glasses of water per day to improve energy levels and metabolism.',
            actions: [
              { label: 'Set Reminder', handler: () => alert('Setting water reminder...') },
              { label: 'Learn More', handler: () => alert('Opening hydration guide...') }
            ]
          });
        } else {
          setRecommendation(null);
          setError('Recommendation not found.');
        }
      } catch (err) {
        setError('Failed to load recommendation.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [recommendationId, type]);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4">
        <p>Loading recommendation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4">
        <p>No recommendation available for ID: {recommendationId} and Type: {type}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
      <p className="text-gray-700 mb-4">{recommendation.description}</p>
      <div className="flex space-x-2">
        {recommendation.actions.map((action, index) => (
          <button
            key={index}
            onClick={action.handler}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
