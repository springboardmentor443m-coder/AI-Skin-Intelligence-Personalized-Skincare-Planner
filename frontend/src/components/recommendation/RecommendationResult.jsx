function RecommendationResult({ recommendation }) {
  return (
    <section className="recommendation-result">

      <h2>Your Recommendation</h2>

      {/* Skin Summary */}
      <div className="recommendation-section summary-section">
        <h3>Skin Summary</h3>
        <p>{recommendation.skin_summary}</p>
      </div>

      {/* Morning Routine */}
      <div className="recommendation-section">
        <h3>Morning Routine</h3>

        <div className="routine-list">
          {recommendation.morning_routine.map((item, index) => (
            <div className="routine-card" key={index}>

              <div className="step-number">
                {item.step}
              </div>

              <div className="routine-content">
                <h4>{item.action}</h4>
                <p>{item.reason}</p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Night Routine */}
      <div className="recommendation-section">
        <h3>Night Routine</h3>

        <div className="routine-list">
          {recommendation.night_routine.map((item, index) => (
            <div className="routine-card" key={index}>

              <div className="step-number">
                {item.step}
              </div>

              <div className="routine-content">
                <h4>{item.action}</h4>
                <p>{item.reason}</p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Recommended Products */}
      <div className="recommendation-section">
        <h3>Recommended Products</h3>

        <div className="product-grid">
          {recommendation.recommended_products.map(
            (product, index) => (
              <div className="product-card" key={index}>

                <h4>{product.product_type}</h4>

                <p>{product.reason}</p>

              </div>
            )
          )}
        </div>
      </div>

      {/* Diet */}
      <div className="recommendation-section">
        <h3>Diet Recommendations</h3>

        <ul className="recommendation-list">
          {recommendation.diet_recommendations.map(
            (item, index) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>
      </div>

      {/* Lifestyle */}
      <div className="recommendation-section">
        <h3>Lifestyle Recommendations</h3>

        <ul className="recommendation-list">
          {recommendation.lifestyle_recommendations.map(
            (item, index) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>
      </div>

      {/* Warnings */}
      <div className="recommendation-section warnings-section">
        <h3>Important Warnings</h3>

        <ul className="recommendation-list">
          {recommendation.warnings.map(
            (item, index) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>
      </div>

    </section>
  );
}

export default RecommendationResult;