export const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value || 0)} đ`;

export const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);

export const normalizeText = (value) => String(value || '').trim().toLowerCase();

export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const directKeys = ['items', 'content', 'results', 'records', 'data', 'posts'];
  for (const key of directKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  if (value.data && typeof value.data === 'object') {
    for (const key of directKeys) {
      if (Array.isArray(value.data[key])) return value.data[key];
    }
  }

  return [];
};

export const paginate = (items, page, pageSize) => {
  const list = toArray(items);
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    items: list.slice(start, start + pageSize),
  };
};

export const labelFromOptions = (options, value, fallback = value) =>
  options.find((option) => option.value === value)?.label || fallback;
