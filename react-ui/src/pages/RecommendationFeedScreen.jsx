// Auto-generated imports
import React from 'react';
import Actionable_Recommendation_Card from '../components/Actionable_Recommendation_Card';
import Text from '../components/Text';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function RecommendationFeedScreen() {
  return (
    <main>
      <Text className="text-2xl font-bold">Your Recommendations</Text>
      <Button label="Refresh" onClick="handleRefreshRecommendations" className="px-4 py-2 bg-blue-500 text-white rounded" />
      <Text className="text-lg text-gray-700">Here are some personalized recommendations for you:</Text>
      <Actionable_Recommendation_Card recommendationId="rec-001" type="financial" className="bg-white shadow-md rounded-lg p-4">
        <None className="justify-between items-start mb-2">
          <Text className="text-xl font-semibold">Optimize Your Savings Account</Text>
          <Icon name="lightbulb" className="text-yellow-500 text-2xl" />
        </None>
        <None className="space-y-2">
          <Text className="text-gray-600">Consider moving funds to a high-yield savings account to earn more interest.</Text>
          <Button label="View High-Yield Options" onClick="handleViewOptions" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" />
          <Button label="Dismiss" onClick="handleDismissRecommendation" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" />
        </None>
      </Actionable_Recommendation_Card>
      <Actionable_Recommendation_Card recommendationId="rec-002" type="security" className="bg-white shadow-md rounded-lg p-4">
        <None className="justify-between items-start mb-2">
          <Text className="text-xl font-semibold">Update Your Password</Text>
          <Icon name="lock" className="text-red-500 text-2xl" />
        </None>
        <None className="space-y-2">
          <Text className="text-gray-600">It's been over 90 days since your last password change. Update it for better security.</Text>
          <Button label="Change Password Now" onClick="handleChangePassword" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" />
          <Button label="Remind Me Later" onClick="handleRemindLater" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" />
        </None>
      </Actionable_Recommendation_Card>
      <Text className="text-sm text-gray-500">Recommendations powered by AI</Text>
    </main>
  );
}
