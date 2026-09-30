import { useState } from 'react';
import {
  useGetLandlordProfileQuery,
  useGetLandlordStatsQuery,
  useGetLandlordVerificationQuery,
  useUpdateLandlordProfileMutation,
  useUploadLandlordAvatarMutation,
} from '../api/landlordApi';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

const normalizeOptionalText = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const normalizeDateValue = (value) => {
  if (value === undefined || value === null || value === '') return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);

  const localFormatMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (localFormatMatch) {
    const [, day, month, year] = localFormatMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return raw;
};

export const useLandlordProfile = () => {
  const { data, isLoading, isError } = useGetLandlordProfileQuery();
  const { data: statsData } = useGetLandlordStatsQuery({ range: '30d' });
  const { data: verification } = useGetLandlordVerificationQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateLandlordProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadLandlordAvatarMutation();

  const profile = data?.profile
    ? {
        ...data.profile,
        cccd_verified: verification?.status === 'approved',
        scores: {
          saved: statsData?.total_favorites ?? 0,
          reviews: statsData?.total_reviews ?? 0,
          tenants: statsData?.total_tenants ?? 0,
          views: statsData?.total_views ?? 0,
        },
      }
    : null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const startEditing = () => {
    if (profile) setFormData({ ...profile });
    setIsEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(null);
    setErrorMessage('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      const payload = {
        full_name: normalizeOptionalText(formData.full_name || formData.display_name),
        phone: normalizeOptionalText(formData.phone),
        gender: ['male', 'female', 'other'].includes(formData.gender) ? formData.gender : null,
        avatar_url: normalizeOptionalText(formData.avatar_url || formData.avatar),
        facebook: normalizeOptionalText(formData.facebook),
        bio: normalizeOptionalText(formData.bio),
        date_of_birth: normalizeDateValue(formData.date_of_birth || formData.dob),
        address: normalizeOptionalText(formData.address || formData.location),
        hometown: normalizeOptionalText(formData.hometown),
      };

      await updateProfile(payload).unwrap();
      setSuccessMessage('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      setFormData(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Cập nhật thất bại'));
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    try {
      await uploadAvatar(file).unwrap();
      setSuccessMessage('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Cập nhật ảnh đại diện thất bại'));
    }
  };

  return {
    profile,
    isLoading,
    isError,
    isEditing,
    formData,
    isUpdating,
    successMessage,
    errorMessage,
    startEditing,
    cancelEditing,
    handleChange,
    handleSave,
    handleAvatarUpload,
    isUploadingAvatar,
  };
};
