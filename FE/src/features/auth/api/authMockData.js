const MOCK_PASSWORD = '123456';

const ROLE_LABELS = {
  tenant: 'Khách thuê',
  landlord: 'Chủ trọ',
};

const MOCK_USERS = [
  {
    id: 1,
    username: 'tenant',
    display_name: 'Demo Tenant',
    email: 'tenant@roomie.local',
    password: MOCK_PASSWORD,
    account_type: 'tenant',
  },
  {
    id: 2,
    username: 'landlord',
    display_name: 'Demo Landlord',
    email: 'landlord@roomie.local',
    password: MOCK_PASSWORD,
    account_type: 'landlord',
  },
  {
    id: 3,
    username: 'admin',
    display_name: 'Demo Admin',
    email: 'admin@roomie.local',
    password: MOCK_PASSWORD,
    account_type: 'admin',
  },
];

const buildUser = (user) => ({
  id: user.id,
  username: user.username || String(user.email || '').split('@')[0],
  display_name: user.display_name,
  email: user.email,
  account_type: user.account_type,
  role: ROLE_LABELS[user.account_type] || ROLE_LABELS.tenant,
});

const findUserByLogin = ({ username, email, password, account_type }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedUsername = String(username || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');

  // Prefer email (backend contract). If email provided try exact match first.
  if (normalizedEmail) {
    const exactByEmail = MOCK_USERS.find((user) => user.email === normalizedEmail);
    if (exactByEmail) {
      return exactByEmail.password === normalizedPassword ? exactByEmail : null;
    }
  }

  // Fallback: allow login by username (legacy/UX convenience)
  if (normalizedUsername) {
    const exactByUsername = MOCK_USERS.find((user) => user.username === normalizedUsername || user.email === normalizedUsername);
    if (exactByUsername) {
      return exactByUsername.password === normalizedPassword ? exactByUsername : null;
    }
  }

  // If neither exact match, try heuristic based on account_type or token word in login identifier.
  const loginValue = normalizedEmail || normalizedUsername;
  if (!loginValue) return null;

  if (account_type === 'landlord' || loginValue.includes('landlord')) {
    return normalizedPassword === MOCK_PASSWORD ? MOCK_USERS[1] : null;
  }

  if (account_type === 'tenant' || loginValue.includes('tenant')) {
    return normalizedPassword === MOCK_PASSWORD ? MOCK_USERS[0] : null;
  }

  if (account_type === 'admin' || loginValue.includes('admin')) {
    return normalizedPassword === MOCK_PASSWORD ? MOCK_USERS[2] : null;
  }

  return normalizedPassword === MOCK_PASSWORD ? MOCK_USERS[0] : null;
};

export { MOCK_PASSWORD, ROLE_LABELS, MOCK_USERS, buildUser, findUserByLogin };
