import styles from './StatsCharts.module.css';

const buildPath = (items, key, width, height, maxValue) =>
  items
    .map((item, index) => {
      const x = (index / Math.max(1, items.length - 1)) * width;
      const y = height - (item[key] / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

export const WeeklyLineChart = ({ data = [] }) => {
  const width = 660;
  const height = 220;
  const maxValue = Math.max(...data.map((item) => item.views), 700);
  const viewsPath = buildPath(data, 'views', width, height, maxValue);
  const contactsPath = buildPath(data, 'contacts', width, height, maxValue);
  const areaPath = `${viewsPath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className={styles.lineChart}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={(height / 5) * line}
            y2={(height / 5) * line}
            className={styles.gridLine}
          />
        ))}
        <path d={areaPath} className={styles.area} />
        <path d={viewsPath} className={styles.viewsLine} />
        <path d={contactsPath} className={styles.contactsLine} />
        {data.map((item, index) => {
          const x = (index / Math.max(1, data.length - 1)) * width;
          const y = height - (item.views / maxValue) * height;
          const contactY = height - (item.contacts / maxValue) * height;
          return (
            <g key={item.day}>
              <circle cx={x} cy={y} r="5" className={styles.viewsDot} />
              <circle cx={x} cy={contactY} r="4" className={styles.contactsDot} />
            </g>
          );
        })}
      </svg>
      <div className={styles.axis}>
        {data.map((item) => <span key={item.day}>{item.day}</span>)}
      </div>
    </div>
  );
};

export const DonutChart = ({ data = [], total = 0 }) => {
  const circumference = 157;
  const segments = data.reduce(
    (acc, item) => {
      const dash = (item.value / total) * circumference;
      acc.items.push({ ...item, dash, offset: acc.offset });
      acc.offset -= dash;
      return acc;
    },
    { offset: 25, items: [] },
  ).items;

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 64 64" className={styles.donut}>
        {segments.map((item) => (
          <circle
            key={item.label}
            cx="32"
            cy="32"
            r="25"
            fill="none"
            stroke={item.color}
            strokeWidth="10"
            strokeDasharray={`${item.dash} ${circumference - item.dash}`}
            strokeDashoffset={item.offset}
          />
        ))}
      </svg>
      <div className={styles.donutCenter}>
        <strong>{total}</strong>
        <span>phòng</span>
      </div>
    </div>
  );
};

export const BarChart = ({ data = [] }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  const columnCount = Math.max(data.length, 1);
  const desktopGap = data.length <= 3 ? 34 : data.length <= 5 ? 24 : 16;
  const mobileGap = data.length <= 3 ? 14 : 10;

  return (
    <div
      className={styles.barChart}
      style={{
        '--bar-columns': columnCount,
        '--bar-gap': `${desktopGap}px`,
        '--bar-gap-mobile': `${mobileGap}px`,
      }}
    >
      {data.map((item) => (
        <div key={item.label} className={styles.barCol}>
          <div className={styles.barTrack}>
            <span style={{ height: `${(item.value / max) * 100}%` }} />
          </div>
          <span className={styles.barLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
