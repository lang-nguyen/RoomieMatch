import { useMemo, useState } from 'react';
import { Link2, Mail, Phone, Send } from 'lucide-react';
import { emptyContactForm, SOCIAL_PLATFORMS } from '../models/matchingModels';

const ContactInfoForm = ({ currentUser, onSubmit }) => {
  const [formValues, setFormValues] = useState({
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    socials: {
      facebook: currentUser?.socials?.facebook || '',
      instagram: currentUser?.socials?.instagram || '',
      twitter: currentUser?.socials?.twitter || '',
    },
  });
  const [activeSocial, setActiveSocial] = useState('');
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const nextErrors = {};

    if (!formValues.email.trim()) nextErrors.email = 'Email là bắt buộc';
    if (!formValues.phone.trim()) nextErrors.phone = 'Số điện thoại là bắt buộc';

    if (activeSocial && !formValues.socials[activeSocial].trim()) {
      nextErrors[activeSocial] = 'Vui lòng nhập link mạng xã hội';
    }

    return nextErrors;
  }, [activeSocial, formValues]);

  const updateField = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateSocial = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      socials: {
        ...previous.socials,
        [field]: value,
      },
    }));
  };

  const toggleSocial = (field) => {
    setActiveSocial((previous) => (previous === field ? '' : field));
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({
      email: true,
      phone: true,
      ...Object.fromEntries(SOCIAL_PLATFORMS.map((platform) => [platform.id, true])),
    });

    if (Object.keys(errors).length > 0) return;
    onSubmit(formValues);
  };

  const getInputClassName = (field) =>
    touched[field] && errors[field]
      ? 'matching-contact-input matching-surface-control is-invalid'
      : 'matching-contact-input matching-surface-control';

  const selectedPlatform = SOCIAL_PLATFORMS.find((platform) => platform.id === activeSocial);

  return (
    <form className="matching-contact-form matching-panel-pop" onSubmit={handleSubmit}>
      <h2>Thông tin liên hệ</h2>

      <div className="matching-contact-person">
        <img src={currentUser?.avatar} alt={currentUser?.name || 'Người dùng'} />
        <strong>{currentUser?.name || 'Người dùng'}</strong>
        <span>Tham gia ngày: {currentUser?.joinedAt || 'Chưa cập nhật'}</span>
      </div>

      <div className="matching-contact-row">
        <label className={getInputClassName('email')}>
          <Mail size={28} />
          <input
            value={formValues.email}
            placeholder="Email"
            onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </label>

        <label className={getInputClassName('phone')}>
          <Phone size={28} />
          <input
            value={formValues.phone}
            placeholder="Số điện thoại"
            onBlur={() => setTouched((previous) => ({ ...previous, phone: true }))}
            onChange={(event) => updateField('phone', event.target.value)}
          />
        </label>
      </div>

      {selectedPlatform ? (
        <div className="matching-social-active-row">
          <button
            className={`matching-social-tile matching-surface-control matching-social-${selectedPlatform.id} is-active`}
            type="button"
            aria-label={`Mở nhập ${selectedPlatform.label}`}
            onClick={() => toggleSocial(selectedPlatform.id)}
          >
            <span>{selectedPlatform.iconLabel}</span>
          </button>

          <div className="matching-social-input-panel">
            <label>{selectedPlatform.label}</label>
            <div className={getInputClassName(selectedPlatform.id)}>
              <Link2 size={24} />
              <input
                value={formValues.socials[selectedPlatform.id]}
                placeholder={selectedPlatform.placeholder}
                onBlur={() => setTouched((previous) => ({ ...previous, [selectedPlatform.id]: true }))}
                onChange={(event) => updateSocial(selectedPlatform.id, event.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="matching-social-toggle-grid">
          {SOCIAL_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              className={`matching-social-tile matching-surface-control matching-social-${platform.id}`}
              type="button"
              aria-label={`Mở nhập ${platform.label}`}
              onClick={() => toggleSocial(platform.id)}
            >
              <span>{platform.iconLabel}</span>
            </button>
          ))}
        </div>
      )}

      {Object.keys(touched).length > 0 && Object.keys(errors).length > 0 && (
        <p className="matching-form-error">Vui lòng điền các thông tin đang hiển thị.</p>
      )}

      <button className="matching-confirm-button" type="submit">
        <Send size={20} />
        Xác nhận
      </button>
    </form>
  );
};

export default ContactInfoForm;
