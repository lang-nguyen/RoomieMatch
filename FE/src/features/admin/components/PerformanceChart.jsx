import { DashboardCard } from './DashboardCard';
import styles from './AdminDashboard.module.css';

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const PADDING = { top: 18, right: 20, bottom: 32, left: 36 };
const MAX_VALUE = 140;

const getPoint = (value, index, count) => {
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const x = PADDING.left + (plotWidth / Math.max(count - 1, 1)) * index;
  const y = PADDING.top + plotHeight - (value / MAX_VALUE) * plotHeight;

  return { x, y };
};

const buildPath = (points) =>
  points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');

const buildAreaPath = (points) => {
  if (!points.length) return '';

  const baseline = CHART_HEIGHT - PADDING.bottom;
  return `${buildPath(points)} L ${points[points.length - 1].x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(1)} ${baseline} Z`;
};

export const PerformanceChart = ({ performance, selectedYear, onYearChange }) => {
  const series = performance.seriesByYear[selectedYear] || [];
  const gridValues = [0, 35, 70, 105, 140];

  const action = (
    <div className={styles.chartHeaderRight}>
      <div className={styles.chartLegend}>
        {series.map((item) => (
          <span key={item.id} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <div className={styles.chartTabs}>
        {performance.years.map((year) => (
          <button
            key={year}
            type="button"
            className={`${styles.chartTab} ${selectedYear === year ? styles.chartTabActive : ''}`}
            onClick={() => onYearChange(year)}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardCard title={performance.title} icon="activity" action={action}>
      <div className={styles.chartWrap}>
        <svg className={styles.chartSvg} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Biểu đồ hiệu suất">
          {gridValues.map((value) => {
            const point = getPoint(value, 0, performance.labels.length);

            return (
              <g key={value}>
                <line
                  className={styles.chartGridLine}
                  x1={PADDING.left}
                  y1={point.y}
                  x2={CHART_WIDTH - PADDING.right}
                  y2={point.y}
                />
                <text className={styles.chartAxisLabel} x="4" y={point.y + 4}>
                  {value}%
                </text>
              </g>
            );
          })}

          {performance.labels.map((label, index) => {
            const point = getPoint(0, index, performance.labels.length);

            return (
              <text key={label} className={styles.chartAxisLabel} x={point.x - 7} y={CHART_HEIGHT - 8}>
                {label}
              </text>
            );
          })}

          {series.map((item) => {
            const points = item.points.map((value, index) => getPoint(value, index, item.points.length));

            return (
              <g key={item.id}>
                <path className={styles.chartArea} d={buildAreaPath(points)} fill={item.fillColor} />
                <path className={styles.chartLine} d={buildPath(points)} stroke={item.color} />
                {points.map((point, index) => (
                  <circle
                    key={`${item.id}-${performance.labels[index]}`}
                    className={styles.chartPoint}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    stroke={item.color}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </DashboardCard>
  );
};
