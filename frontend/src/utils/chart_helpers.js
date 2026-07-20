import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

export const BRAND = {
  ink: '#2D3250',
  slate: '#7077A1',
  amber: '#F6B17A',
  inkFaint: 'rgba(45, 50, 80, 0.08)',
  slateFaint: 'rgba(112, 119, 161, 0.16)',
  amberFaint: 'rgba(246, 177, 122, 0.22)',
};

export const baseFont = {
  family: 'Inter, sans-serif',
  size: 12,
};

/** Shared tooltip + legend + grid styling so every chart in the app looks related. */
export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: baseFont, color: BRAND.ink, usePointStyle: true, boxHeight: 8 },
    },
    tooltip: {
      backgroundColor: BRAND.ink,
      titleFont: { family: 'Plus Jakarta Sans', weight: '600', size: 12 },
      bodyFont: baseFont,
      padding: 10,
      cornerRadius: 8,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: baseFont, color: BRAND.slate },
    },
    y: {
      grid: { color: BRAND.inkFaint },
      ticks: { font: baseFont, color: BRAND.slate },
      beginAtZero: true,
    },
  },
};

/** Builds a line chart dataset for a skin-score trend over time, with an amber gradient fill. */
export function buildScoreTrendDataset(canvasCtx, labels, values, label = 'Skin health score') {
  let gradient = BRAND.amberFaint;
  if (canvasCtx) {
    gradient = canvasCtx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(246, 177, 122, 0.35)');
    gradient.addColorStop(1, 'rgba(246, 177, 122, 0)');
  }
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: BRAND.ink,
        backgroundColor: gradient,
        pointBackgroundColor: BRAND.amber,
        pointBorderColor: BRAND.ink,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
        borderWidth: 2,
      },
    ],
  };
}

/** Builds a horizontal-friendly bar dataset comparing routine adherence across days/weeks. */
export function buildAdherenceBarDataset(labels, values) {
  return {
    labels,
    datasets: [
      {
        label: 'Routine adherence (%)',
        data: values,
        backgroundColor: values.map((v) => (v >= 80 ? BRAND.amber : v >= 50 ? BRAND.slate : BRAND.ink)),
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };
}

/** Builds the three-way skin metric breakdown (hydration / barrier / tone) as a doughnut. */
export function buildBreakdownDoughnut(hydration, barrier, tone) {
  return {
    labels: ['Hydration', 'Barrier strength', 'Tone evenness'],
    datasets: [
      {
        data: [hydration, barrier, tone],
        backgroundColor: [BRAND.ink, BRAND.slate, BRAND.amber],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
}
