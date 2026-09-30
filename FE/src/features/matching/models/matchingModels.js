export const MATCHING_STEPS = {
  ONBOARDING: 'onboarding',
  SUCCESS: 'success',
  MATCHING: 'matching',
};

export const SOCIAL_PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    placeholder: 'Nhập link facebook tại đây',
    iconLabel: 'f',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    placeholder: 'Nhập link instagram tại đây',
    iconLabel: '◎',
  },
  {
    id: 'twitter',
    label: 'X/Twitter',
    placeholder: 'Nhập link X/Twitter tại đây',
    iconLabel: 'X',
  },
];

export const emptyProfileForm = {
  avatar: '',
  intro: '',
  habits: '',
  target_city: '',
  target_district: '',
  budget: '',
};

export const emptyContactForm = {
  email: '',
  phone: '',
  socials: {
    facebook: '',
    instagram: '',
    twitter: '',
  },
};
