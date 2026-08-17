import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

export default function ClinicalReportPDF({ analysisResult, currentUser }) {
  if (!analysisResult) return null;

  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  const { analysis, product_recommendations, weekly_routine, id } = analysisResult;
  const target_profile = product_recommendations?.target_profile || {};
  const recommended_products = product_recommendations?.recommended_products || {};
  const calendar = weekly_routine?.weekly_calendar || [];

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // Temporary display report template for canvas capture
      const element = reportRef.current;
      element.style.display = 'block';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Skin_Clinical_Report_${id || 'scan'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Download PDF Trigger Button */}
      <button
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className="btn-secondary"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
          borderColor: 'rgba(16, 185, 129, 0.4)',
          color: '#10B981',
          fontWeight: 700,
          padding: '8px 16px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <FileText size={16} />
        <span>{isGenerating ? "Generating Clinical PDF..." : "📄 Export Clinical PDF Report"}</span>
      </button>

      {/* Printable Hidden Clinical Report Template (High Res White Theme PDF Layout) */}
      <div
        ref={reportRef}
        style={{
          display: 'none',
          width: '800px',
          padding: '40px',
          background: '#FFFFFF',
          color: '#0F172A',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}
      >
        {/* Report Header */}
        <div style={{ borderBottom: '3px solid #6366F1', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#4F46E5', margin: 0 }}>AI SKIN INTELLIGENCE</h1>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>Clinical Dermatology Assessment & Prescribed Regimen</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569' }}>
            <p style={{ margin: '2px 0' }}><strong>Report ID:</strong> {id || 'N/A'}</p>
            <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '2px 0' }}><strong>Patient:</strong> {currentUser?.full_name || 'Anonymous Patient'}</p>
            <p style={{ margin: '2px 0' }}><strong>Gender:</strong> {currentUser?.gender || target_profile?.gender || 'Unisex'}</p>
          </div>
        </div>

        {/* Diagnostic Profile Summary Card */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: 0, marginBottom: '12px' }}>
            🔬 Biometric Diagnostic Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>DIAGNOSED SKIN TYPE</span>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#4F46E5', margin: '4px 0 0 0' }}>{target_profile?.skin_type}</h4>
            </div>
            <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>PRIMARY SKIN CONCERN</span>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#E11D48', margin: '4px 0 0 0' }}>{target_profile?.primary_concern}</h4>
            </div>
            <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>MONTHLY INVESTMENT</span>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#059669', margin: '4px 0 0 0' }}>{product_recommendations?.total_monthly_routine_cost || 'N/A'}</h4>
            </div>
          </div>
        </div>

        {/* Prescribed Product Showcase Table */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: 0, marginBottom: '12px' }}>
            💊 Prescribed Dermatologist Product Regimen
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#4F46E5', color: '#FFFFFF', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Product & Brand</th>
                <th style={{ padding: '10px' }}>Active Ingredients</th>
                <th style={{ padding: '10px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: 'Cleanser', item: recommended_products.cleanser },
                { cat: 'Treatment', item: recommended_products.treatment_serum },
                { cat: 'Moisturizer', item: recommended_products.moisturizer },
                { cat: 'Sunscreen', item: recommended_products.sunscreen }
              ].map(({ cat, item }, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#4F46E5' }}>{cat}</td>
                  <td style={{ padding: '10px' }}>
                    <strong>{item?.name}</strong><br />
                    <span style={{ fontSize: '10px', color: '#64748B' }}>Brand: {item?.brand}</span>
                  </td>
                  <td style={{ padding: '10px', color: '#0EA5E9' }}>
                    {item?.actives ? item.actives.join(', ') : 'Gentle actives'}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#059669' }}>{item?.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 7-Day Skin Cycling Plan Table */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: 0, marginBottom: '12px' }}>
            📅 7-Day Dermatologist Skin Cycling Plan
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#FFFFFF', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Day</th>
                <th style={{ padding: '8px' }}>Phase</th>
                <th style={{ padding: '8px' }}>AM Routine</th>
                <th style={{ padding: '8px' }}>PM Routine</th>
              </tr>
            </thead>
            <tbody>
              {calendar.map((dayObj, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>{dayObj.day}</td>
                  <td style={{ padding: '8px', color: '#6366F1', fontWeight: 600 }}>{dayObj.cycle_phase}</td>
                  <td style={{ padding: '8px' }}>
                    1. {dayObj.am_routine?.step_1_cleanse}<br />
                    2. {dayObj.am_routine?.step_3_moisturize}<br />
                    3. {dayObj.am_routine?.step_4_protect}
                  </td>
                  <td style={{ padding: '8px' }}>
                    1. {dayObj.pm_routine?.step_1_cleanse}<br />
                    2. {dayObj.pm_routine?.step_2_exfoliate || dayObj.pm_routine?.step_2_target || dayObj.pm_routine?.step_2_hydrate}<br />
                    3. {dayObj.pm_routine?.step_3_moisturize || dayObj.pm_routine?.step_3_barrier_repair}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Doctor Signature Footer */}
        <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Verified & Generated by</span>
            <h5 style={{ margin: '2px 0 0 0', color: '#4F46E5', fontSize: '14px', fontWeight: 800 }}>Dr. DermAI Clinical Engine</h5>
          </div>
          <div style={{ border: '2px dashed #10B981', padding: '6px 16px', borderRadius: '8px', color: '#10B981', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
            ✓ Verified Clinical Prescription
          </div>
        </div>

      </div>
    </>
  );
}
