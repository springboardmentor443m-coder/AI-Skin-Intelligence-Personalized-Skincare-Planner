import { useState } from "react";

import RecommendationForm from "../components/recommendation/RecommendationForm";
import RecommendationResult from "../components/recommendation/RecommendationResult";
import ChatBox from "../components/chat/ChatBox";

function RecommendationPage() {

  const [recommendation, setRecommendation] = useState(null);

  return (
    <div className="app">

      <h1>Skin Care Recommendation</h1>

      {/* Recommendation Form */}
      <RecommendationForm
        onRecommendation={setRecommendation}
      />

      {/* Recommendation Result */}
      {recommendation && (
        <>
          <RecommendationResult
            recommendation={recommendation}
          />

          {/* Chat */}
          <ChatBox
            recommendation={recommendation}
          />
        </>
      )}

    </div>
  );
}

export default RecommendationPage;