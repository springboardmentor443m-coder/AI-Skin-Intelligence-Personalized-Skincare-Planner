/**
 * Export Clinical Skin Diagnostic PDF Report
 */
export function generateClinicalPDFReport({
  userName = 'Patient Profile',
  userEmail = '',
  predictionResult = null,
  skinProfile = null,
  healthScore = 85,
  date = new Date().toLocaleDateString(),
}) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download/print your Clinical PDF Report.')
    return
  }

  const diseaseName = predictionResult?.disease || 'Skin Diagnostic Check'
  const confidence = predictionResult?.confidence || '94.5%'
  const imageSrc = predictionResult?.image || ''
  const recommendation = predictionResult?.recommendation || {}

  const skinTypeStr = skinProfile?.skin_type ? ` • Skin Type: ${skinProfile.skin_type}` : ''
  const emailStr = userEmail ? ` (${userEmail})` : ''

  const dosList = recommendation?.dos?.map((d) => `<li>✓ ${d}</li>`).join('') || '<li>✓ Gentle daily cleanser & SPF</li>'
  const dontsList = recommendation?.donts?.map((d) => `<li>✕ ${d}</li>`).join('') || '<li>✕ Avoid harsh physical scrubs</li>'
  const morningRoutine = recommendation?.skincare_routine?.morning?.map((m) => `<li>• ${m}</li>`).join('') || '<li>• Gentle Cleanser</li><li>• SPF 30+</li>'
  const nightRoutine = recommendation?.skincare_routine?.night?.map((n) => `<li>• ${n}</li>`).join('') || '<li>• Gentle Cleanser</li><li>• Moisturizer</li>'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Clinical Skin Analysis Report - ${userName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 30px;
            color: #0f172a;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #10b981;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
          }
          .brand span {
            color: #10b981;
          }
          .patient-info {
            text-align: right;
            font-size: 12px;
            color: #64748b;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
          }
          .title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #10b981;
            margin-bottom: 8px;
          }
          .disease-name {
            font-size: 24px;
            font-weight: 800;
            margin: 4px 0;
            color: #0f172a;
          }
          .score-badge {
            display: inline-block;
            background: #d1fae5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
          }
          .image-preview {
            width: 100%;
            height: 180px;
            object-fit: contain;
            background: #090d16;
            border-radius: 12px;
          }
          ul {
            margin: 0;
            padding-left: 18px;
            font-size: 12px;
            line-height: 1.6;
            color: #334155;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">AI Skin <span>Intelligence</span></div>
            <div style="font-size:11px; color:#64748b;">Clinical Diagnostic Summary</div>
          </div>
          <div class="patient-info">
            <div><strong>Patient:</strong> ${userName}${emailStr}${skinTypeStr}</div>
            <div><strong>Date:</strong> ${date}</div>
            <div><strong>Overall Health Score:</strong> ${healthScore} / 100</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="title">AI Medical Detection</div>
            <div class="disease-name">${diseaseName}</div>
            <div style="margin-top:8px;">
              <span class="score-badge">Model Confidence: ${confidence}</span>
            </div>
            <p style="font-size:12px; color:#475569; margin-top:12px; line-height:1.5;">
              ${recommendation?.description || 'Detected skin condition analysis overview.'}
            </p>
          </div>

          <div class="card" style="text-align:center;">
            <div class="title">Scanned Image</div>
            ${imageSrc ? `<img src="${imageSrc}" class="image-preview" alt="Scan" />` : '<div style="padding:40px; color:#94a3b8; font-size:12px;">No scan image recorded</div>'}
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="title" style="color:#059669;">Clinical Do's</div>
            <ul>${dosList}</ul>
          </div>
          <div class="card">
            <div class="title" style="color:#e11d48;">Clinical Don'ts</div>
            <ul>${dontsList}</ul>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="title">Morning Care Routine</div>
            <ul>${morningRoutine}</ul>
          </div>
          <div class="card">
            <div class="title">Night Care Routine</div>
            <ul>${nightRoutine}</ul>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px; border-left:4px solid #0284c7;">
          <div class="title" style="color:#0284c7;">Dermatologist Advice</div>
          <p style="font-size:12px; color:#334155; margin:0; line-height:1.5;">
            ${recommendation?.when_to_consult_doctor || 'Consult a certified dermatologist if irritation or lesions persist.'}
          </p>
        </div>

        <div class="footer">
          This document is generated by AI Skin Intelligence Platform for informational and skincare planning purposes.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
