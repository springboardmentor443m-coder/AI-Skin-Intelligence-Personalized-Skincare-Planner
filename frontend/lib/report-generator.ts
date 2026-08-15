interface AnalysisReportData {
  analysis: any
  analyzedAt?: string
}

export function generateAnalysisReport() {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem('latest_skin_analysis')

  if (!stored) {
    alert('No skin analysis report is available yet. Please analyze your skin first.')
    return
  }

  let data: AnalysisReportData

  try {
    data = JSON.parse(stored)
  } catch {
    alert('Unable to read the saved analysis report.')
    return
  }

  const analysis = data.analysis

  const recommendations = analysis?.recommendations || []
  const weeklyPlan = analysis?.weekly_plan || {}

  const analyzedDate = data.analyzedAt
    ? new Date(data.analyzedAt).toLocaleString()
    : 'Not available'

  const recommendationRows = recommendations
    .map((rec: any) => {
      return `
        <tr>
          <td>${escapeHtml(rec.product_name || rec.product_type || 'Skincare Product')}</td>
          <td>${escapeHtml(rec.priority || 'Recommended')}</td>
          <td>${escapeHtml(rec.description || '')}</td>
          <td>${escapeHtml(
            rec.ingredients ||
            rec.key_ingredients ||
            rec.ingredient ||
            '—'
          )}</td>
          <td>${escapeHtml(
            rec.price !== undefined && rec.price !== null
              ? `₹${rec.price}`
              : '—'
          )}</td>
          <td>${escapeHtml(
            rec.rating !== undefined && rec.rating !== null
              ? `${rec.rating}/5`
              : '—'
          )}</td>
        </tr>
      `
    })
    .join('')

  const weeklyRows = Object.entries(weeklyPlan)
    .map(([day, routine]: [string, any]) => {
      return `
        <tr>
          <td><strong>${escapeHtml(day)}</strong></td>
          <td>${escapeHtml(routine?.morning || '—')}</td>
          <td>${escapeHtml(routine?.night || '—')}</td>
          <td>${escapeHtml(routine?.tip || '—')}</td>
        </tr>
      `
    })
    .join('')

  const conditions =
    analysis?.conditions?.length > 0
      ? analysis.conditions.map((c: string) => escapeHtml(c)).join(', ')
      : 'None detected'

  const reportWindow = window.open('', '_blank')

  if (!reportWindow) {
    alert('Please allow pop-ups to generate your report.')
    return
  }

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Skin Intelligence - Analysis Report</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, Helvetica, sans-serif;
            color: #3b2f2f;
            background: #fffaf7;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
          }

          .header {
            background: linear-gradient(
              135deg,
              #fff8f3,
              #f8e9e2
            );
            border: 1px solid #f3e3da;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 28px;
          }

          .brand {
            color: #d89c8b;
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;
          }

          h1 {
            margin: 10px 0;
            font-size: 32px;
          }

          h2 {
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 22px;
          }

          .meta {
            color: #8a736f;
            font-size: 13px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-bottom: 30px;
          }

          .summary-card {
            background: white;
            border: 1px solid #f3e3da;
            border-radius: 16px;
            padding: 20px;
          }

          .label {
            color: #8a736f;
            font-size: 12px;
            margin-bottom: 8px;
          }

          .value {
            font-size: 20px;
            font-weight: bold;
          }

          .conditions {
            background: #fff8f3;
            border: 1px solid #f3e3da;
            border-radius: 16px;
            padding: 18px;
            margin-bottom: 30px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #f3e3da;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 30px;
          }

          th {
            background: #f8e9e2;
            text-align: left;
            padding: 12px;
            font-size: 12px;
          }

          td {
            padding: 12px;
            border-top: 1px solid #f3e3da;
            vertical-align: top;
            font-size: 12px;
            line-height: 1.5;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #f3e3da;
            color: #8a736f;
            font-size: 11px;
            line-height: 1.6;
          }

          @media print {
            body {
              background: white;
              padding: 20px;
            }

            .header {
              break-inside: avoid;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
            }
          }

          @media (max-width: 700px) {
            body {
              padding: 20px;
            }

            .summary {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <div class="brand">AI Skin Intelligence</div>

            <h1>Personalized Skin Analysis Report</h1>

            <div class="meta">
              Generated: ${escapeHtml(analyzedDate)}
            </div>
          </div>

          <h2>Analysis Summary</h2>

          <div class="summary">

            <div class="summary-card">
              <div class="label">Skin Type</div>
              <div class="value">
                ${escapeHtml(analysis?.skin_type || 'Not available')}
              </div>
            </div>

            <div class="summary-card">
              <div class="label">Confidence</div>
              <div class="value">
                ${
                  analysis?.confidence !== undefined
                    ? `${Number(analysis.confidence).toFixed(2)}%`
                    : 'Not available'
                }
              </div>
            </div>

            <div class="summary-card">
              <div class="label">Detected Conditions</div>
              <div class="value">
                ${escapeHtml(conditions)}
              </div>
            </div>

          </div>

          <h2>Personalized Recommendations</h2>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Priority</th>
                <th>Recommendation</th>
                <th>Ingredients</th>
                <th>Price</th>
                <th>Rating</th>
              </tr>
            </thead>

            <tbody>
              ${
                recommendationRows ||
                `
                  <tr>
                    <td colspan="6">
                      No recommendations available.
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>

          <h2>Personalized 7-Day Ritual</h2>

          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Morning Routine</th>
                <th>Night Routine</th>
                <th>Daily Tip</th>
              </tr>
            </thead>

            <tbody>
              ${
                weeklyRows ||
                `
                  <tr>
                    <td colspan="4">
                      No weekly plan available.
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>

          <div class="footer">
            <strong>AI Skin Intelligence</strong><br />
            This report summarizes the AI-generated skin analysis,
            recommendations, and personalized skincare routine.
            It is intended for informational purposes and does not
            replace professional medical advice.
          </div>

        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print()
            }, 500)
          }
        </script>

      </body>
    </html>
  `)

  reportWindow.document.close()
}

function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}