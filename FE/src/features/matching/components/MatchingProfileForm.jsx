import { useMemo, useState } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { emptyProfileForm } from '../models/matchingModels';
import { useUploadAvatarMutation } from '../../user/api/userApi';

const requiredFields = ['avatar', 'intro', 'habits', 'target_city', 'target_district', 'budget'];

const MatchingProfileForm = ({ initialData, onSubmit }) => {
  const [formValues, setFormValues] = useState(() => initialData || emptyProfileForm);
  const [touched, setTouched] = useState({});
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const errors = useMemo(() => {
    const errorMessages = {
      avatar: 'Vui lòng tải lên ảnh đại diện',
      intro: 'Vui lòng nhập thông tin giới thiệu',
      habits: 'Vui lòng nhập thói quen',
      target_city: 'Vui lòng nhập tỉnh/thành phố',
      target_district: 'Vui lòng nhập quận/huyện',
      budget: 'Vui lòng nhập ngân sách',
    };

    return requiredFields.reduce((result, field) => {
      if (!String(formValues[field] || '').trim()) {
        result[field] = errorMessages[field] || 'Vui lòng nhập đầy đủ thông tin';
      } else if (field === 'budget') {
        const budgetRegex = /^\d+-\d+$/;
        if (!budgetRegex.test(formValues.budget.trim())) {
          result[field] = 'Ngân sách phải nhập đúng định dạng min-max (VD: 1000000-5000000)';
        }
      }

      return result;
    }, {});
  }, [formValues]);

  const updateField = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const markTouched = (field) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadAvatar(file).unwrap();
      updateField('avatar', response.avatar_url);
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      alert('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      markTouched('avatar');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(requiredFields.reduce((result, field) => ({ ...result, [field]: true }), {}));

    if (Object.keys(errors).length > 0) return;

    const payload = {
      account_id: 0,
      image: formValues.avatar,
      introduce: formValues.intro,
      habit: formValues.habits.split(',').map((h) => h.trim()).filter(Boolean),
      target_city: formValues.target_city,
      target_district: formValues.target_district,
      budget: formValues.budget.trim(),
      is_matching: true,
    };

    onSubmit(payload);
  };

  const getFieldClassName = (field) =>
    touched[field] && errors[field] ? 'matching-field is-invalid' : 'matching-field';

  return (
    <form className="matching-profile-form matching-panel-pop" onSubmit={handleSubmit}>
      <h2>Hồ sơ tìm bạn</h2>

      <label className={`matching-upload ${touched.avatar && errors.avatar ? 'is-invalid' : ''} ${isUploadingAvatar ? 'is-uploading' : ''}`}>
        {formValues.avatar ? (
          <img src={formValues.avatar} alt="Ảnh hồ sơ cá nhân" style={{ opacity: isUploadingAvatar ? 0.5 : 1 }} />
        ) : (
          <>
            <Camera size={58} strokeWidth={2.4} />
            <strong>{isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh hồ sơ cá nhân'}</strong>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} disabled={isUploadingAvatar} />
      </label>

      <label className={getFieldClassName('intro')}>
        <span className="matching-field-legend">Giới thiệu</span>
        <textarea
          name="intro"
          value={formValues.intro}
          placeholder="Nhập thông tin giới thiệu cơ bản về bản thân"
          onBlur={() => markTouched('intro')}
          onChange={(event) => updateField('intro', event.target.value)}
        />
      </label>

      <label className={getFieldClassName('habits')}>
        <span className="matching-field-legend">Thói quen</span>
        <input
          name="habits"
          value={formValues.habits}
          placeholder="Nhập thói quen của bản thân"
          onBlur={() => markTouched('habits')}
          onChange={(event) => updateField('habits', event.target.value)}
        />
      </label>

      <label className={getFieldClassName('target_city')}>
        <span className="matching-field-legend">Tỉnh/Thành phố</span>
        <input
          name="target_city"
          value={formValues.target_city}
          placeholder="VD: Thành Phố Hồ Chí Minh"
          onBlur={() => markTouched('target_city')}
          onChange={(event) => updateField('target_city', event.target.value)}
        />
      </label>

      <label className={getFieldClassName('target_district')}>
        <span className="matching-field-legend">Quận/Huyện</span>
        <input
          name="target_district"
          value={formValues.target_district}
          placeholder="VD: Quận 1"
          onBlur={() => markTouched('target_district')}
          onChange={(event) => updateField('target_district', event.target.value)}
        />
      </label>

      <label className={getFieldClassName('budget')}>
        <span className="matching-field-legend">Ngân sách</span>
        <input
          name="budget"
          value={formValues.budget}
          placeholder="Nhập ngân sách dạng min-max (VD: 1000000-5000000)"
          onBlur={() => markTouched('budget')}
          onChange={(event) => updateField('budget', event.target.value)}
        />
      </label>

      {Object.keys(touched).length > 0 && Object.keys(errors).length > 0 && (
        <div className="matching-form-error">
          <p>Vui lòng kiểm tra lại thông tin:</p>
          <ul>
            {Object.entries(errors)
              .filter(([field]) => touched[field])
              .map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
          </ul>
        </div>
      )}

      <button className="matching-confirm-button" type="submit">
        <CheckCircle2 size={22} />
        Xác nhận
      </button>
    </form>
  );
};

export default MatchingProfileForm;
