import { useMemo } from 'react';
import { useGetAnalyticsQuery } from '../api/adminApi';
import { AdminIcon } from './adminIconMap';
import { formatCurrency, formatNumber } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const CHART_WIDTH = 720;
const CHART_HEIGHT = 260;
const PAD = 34;

const buildLinePoints = (points) => {
  const max = Math.max(...points, 1);
  const step = (CHART_WIDTH - PAD * 2) / Math.max(points.length - 1, 1);

  return points
    .map((value, index) => {
      const x = PAD + index * step;
      const y = CHART_HEIGHT - PAD - (value / max) * (CHART_HEIGHT - PAD * 2);
      return `${x},${y}`;
    })
    .join(' ');
};

const buildAreaPath = (points) => {
  const line = buildLinePoints(points).split(' ');
  const firstX = line[0]?.split(',')[0] || PAD;
  const lastX = line[line.length - 1]?.split(',')[0] || CHART_WIDTH - PAD;

  return `M ${line.join(' L ')} L ${lastX},${CHART_HEIGHT - PAD} L ${firstX},${CHART_HEIGHT - PAD} Z`;
};

const LineChart = ({ data }) => (
  <div className={styles.analyticsChart}>
    <svg className={styles.chartSvg} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img">
      {[0, 1, 2, 3].map((line) => {
        const y = PAD + line * ((CHART_HEIGHT - PAD * 2) / 3);
        return <line key={line} className={styles.chartGridLine} x1={PAD} x2={CHART_WIDTH - PAD} y1={y} y2={y} />;
      })}
      {data.series.map((series) => (
        <polyline key={series.label} points={buildLinePoints(series.points)} className={styles.chartLine} stroke={series.color} />
      ))}
      {data.labels.map((label, index) => {
        const x = PAD + index * ((CHART_WIDTH - PAD * 2) / Math.max(data.labels.length - 1, 1));
        return (
          <text key={label} className={styles.chartAxisLabel} x={x} y={CHART_HEIGHT - 8} textAnchor="middle">
            {label}
          </text>
        );
      })}
    </svg>
  </div>
);

const StackedBarChart = ({ data }) => {
  const totals = data.labels.map((_, index) => data.series.reduce((sum, series) => sum + series.points[index], 0));
  const max = Math.max(...totals, 1);
  const barGap = 16;
  const barWidth = (CHART_WIDTH - PAD * 2 - barGap * (data.labels.length - 1)) / data.labels.length;

  return (
    <div className={styles.analyticsChart}>
      <svg className={styles.chartSvg} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img">
        {data.labels.map((label, index) => {
          const x = PAD + index * (barWidth + barGap);
          let yCursor = CHART_HEIGHT - PAD;

          return (
            <g key={label}>
              {data.series.map((series) => {
                const height = (series.points[index] / max) * (CHART_HEIGHT - PAD * 2);
                yCursor -= height;
                return (
                  <rect
                    key={series.label}
                    x={x}
                    y={yCursor}
                    width={barWidth}
                    height={height}
                    rx="5"
                    fill={series.color}
                    opacity="0.88"
                  />
                );
              })}
              <text className={styles.chartAxisLabel} x={x + barWidth / 2} y={CHART_HEIGHT - 8} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const AreaChart = ({ data }) => (
  <div className={styles.analyticsChart}>
    <svg className={styles.chartSvg} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img">
      <defs>
        <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D45B13" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#D45B13" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => {
        const y = PAD + line * ((CHART_HEIGHT - PAD * 2) / 3);
        return <line key={line} className={styles.chartGridLine} x1={PAD} x2={CHART_WIDTH - PAD} y1={y} y2={y} />;
      })}
      <path d={buildAreaPath(data.points)} fill="url(#revenueArea)" />
      <polyline points={buildLinePoints(data.points)} className={styles.chartLine} stroke="#D45B13" />
      {data.labels.map((label, index) => {
        const x = PAD + index * ((CHART_WIDTH - PAD * 2) / Math.max(data.labels.length - 1, 1));
        return (
          <text key={label} className={styles.chartAxisLabel} x={x} y={CHART_HEIGHT - 8} textAnchor="middle">
            {label}
          </text>
        );
      })}
    </svg>
  </div>
);

const DistributionBlock = ({ title, items }) => {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className={styles.distributionBlock}>
      <h3>{title}</h3>
      {items.map((item, index) => {
        const radius = 28;
        const circumference = 2 * Math.PI * radius;
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const dash = (percentage / 100) * circumference;

        return (
          <div key={item.name} className={styles.distributionRow}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={radius} className={styles.ringTrack} />
              <circle
                cx="36"
                cy="36"
                r={radius}
                className={styles.ringValue}
                style={{
                  strokeDasharray: `${dash} ${circumference - dash}`,
                  stroke: ['#D45B13', '#4F6EF7', '#22c55e', '#f59e0b'][index % 4],
                }}
              />
              <text x="36" y="40" textAnchor="middle" className={styles.ringText}>
                {percentage}%
              </text>
            </svg>
            <div>
              <strong>{item.name}</strong>
              <span>{item.value} phòng ({percentage}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const emptyAnalytics = {
  monthlyUsers: { labels: [], series: [{ points: [0] }, { points: [0] }, { points: [0] }] },
  monthlyPosts: { labels: [], series: [{ points: [0] }, { points: [0] }, { points: [0] }] },
  categoriesDistribution: { area: [], roomType: [], priceRange: [] },
  revenue: { labels: [], total: 0, points: [0] },
  complaints: { labels: [], points: [0], colors: [] },
};

export const AnalyticsTab = () => {
  const { data = emptyAnalytics, isLoading, isError } = useGetAnalyticsQuery();
  const topMetrics = useMemo(
    () => [
      { label: 'Tổng doanh thu', value: formatCurrency(data.revenue.total), icon: 'dollar-sign' },
      { label: 'Tổng số phòng', value: formatNumber(data.totalRooms || 0), icon: 'home' },
      { label: 'Người dùng hiện tại', value: formatNumber(data.monthlyUsers.series[0].points.at(-1)), icon: 'users' },
      { label: 'Tỷ lệ xử lý khiếu nại', value: `${data.complaints.points[0]}%`, icon: 'check' },
    ],
    [data]
  );

  if (isLoading) return <div className={styles.loadingState}>Đang tải báo cáo...</div>;
  if (isError) return <div className={styles.emptyState}>Không thể lấy dữ liệu báo cáo từ máy chủ.</div>;

  return (
    <div className={styles.featureStack}>
      <section className={styles.featureStatsGrid}>
        {topMetrics.map((metric) => (
          <article key={metric.label} className={styles.featureStatCard}>
            <span className={styles.featureStatIcon}>
              <AdminIcon name={metric.icon} size={18} />
            </span>
            <div>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.analyticsGrid}>
        <article className={styles.featurePanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Tăng trưởng người dùng</h2>
              <p>Tổng, mới và bị khóa theo từng tháng</p>
            </div>
            <div className={styles.chartLegend}>
              {data.monthlyUsers.series.map((series) => (
                <span key={series.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: series.color }} />
                  {series.label}
                </span>
              ))}
            </div>
          </div>
          <LineChart data={data.monthlyUsers} />
        </article>

        <article className={styles.featurePanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Trạng thái bài đăng</h2>
              <p>Bài đã duyệt, đang chờ và bị từ chối</p>
            </div>
          </div>
          <StackedBarChart data={data.monthlyPosts} />
        </article>

        <article className={`${styles.featurePanel} ${styles.analyticsWide}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Doanh thu theo tháng</h2>
              <p>{formatCurrency(data.revenue.total)} trong năm hiện tại</p>
            </div>
          </div>
          <AreaChart data={data.revenue} />
        </article>

        <article className={styles.featurePanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Phân bổ phòng trọ</h2>
              <p>Khu vực, loại phòng và mức giá nổi bật</p>
            </div>
          </div>
          <div className={styles.distributionGrid}>
            <DistributionBlock title="Khu vực" items={[...(data.categoriesDistribution.area || [])].sort((a,b)=>b.value-a.value).slice(0,3)} />
            <DistributionBlock title="Loại phòng" items={[...(data.categoriesDistribution.roomType || [])].sort((a,b)=>b.value-a.value).slice(0,3)} />
            <DistributionBlock title="Mức giá" items={data.categoriesDistribution.priceRange} />
          </div>
        </article>

        <article className={styles.featurePanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Khiếu nại</h2>
              <p>Tỷ lệ xử lý theo trạng thái</p>
            </div>
          </div>
          <div className={styles.complaintBreakdown}>
            {data.complaints.labels.map((label, index) => (
              <div key={label} className={styles.progressRow}>
                <span>{label}</span>
                <strong>{data.complaints.points[index]}%</strong>
                <div className={styles.progressTrack}>
                  <span style={{ width: `${data.complaints.points[index]}%`, background: data.complaints.colors[index] }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

