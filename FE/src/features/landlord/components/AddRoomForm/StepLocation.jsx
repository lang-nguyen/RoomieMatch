import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAddRoomForm } from '../../hooks/useAddRoomForm';
import { useGetDistrictsByProvinceNameQuery, useGetProvincesQuery } from '../../../../shared/api/provincesApi';
import styles from './StepForm.module.css';

const formatMoneyInput = (value) => String(value || '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const parseMoneyInput = (value) => value.replace(/\D/g, '');

const MoneyInput = ({ name, value, placeholder, onValueChange, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(formatMoneyInput(value));

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatMoneyInput(value));
    }
  }, [isFocused, value]);

  return (
    <input
      required={required}
      inputMode="numeric"
      name={name}
      value={displayValue}
      onFocus={() => {
        setIsFocused(true);
        setDisplayValue(String(value || ''));
      }}
      onBlur={() => {
        setIsFocused(false);
        setDisplayValue(formatMoneyInput(value));
      }}
      onChange={(event) => {
        const rawValue = parseMoneyInput(event.target.value);
        setDisplayValue(rawValue);
        onValueChange(name, rawValue);
      }}
      placeholder={placeholder}
      className={styles.input}
    />
  );
};

const StepLocation = () => {
  const { draft, updateDraft, goNext, goBack } = useAddRoomForm();
  const { data: provinceOptions = [] } = useGetProvincesQuery();
  const { data: districtOptions = [] } = useGetDistrictsByProvinceNameQuery(draft.city, { skip: !draft.city });

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateDraft({
      [name]: value,
      ...(name === 'city' ? { district: '' } : {}),
    });
  };

  const handleMoneyChange = (name, value) => {
    updateDraft({ [name]: value });
  };

  const handleNext = (event) => {
    event.preventDefault();
    goNext();
  };

  return (
    <form className={styles.formContainer} onSubmit={handleNext}>
      <h2 className={styles.sectionTitle}>Địa chỉ phòng trọ</h2>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tỉnh / Thành phố <span className={styles.required}>*</span></label>
          <select required name="city" value={draft.city || ''} onChange={handleChange} className={styles.select}>
            <option value="">Chọn tỉnh / thành phố</option>
            {provinceOptions.map((item) => <option key={item.value} value={item.label}>{item.label}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Quận / Huyện <span className={styles.required}>*</span></label>
          <select required name="district" value={draft.district || ''} onChange={handleChange} className={styles.select} disabled={!draft.city}>
            <option value="">Chọn quận / huyện</option>
            {districtOptions.map((item) => <option key={item.value} value={item.label}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Địa chỉ chi tiết <span className={styles.required}>*</span></label>
        <input required name="address" value={draft.address || ''} onChange={handleChange} placeholder="VD: 123/4A Lê Lợi" className={styles.input} />
      </div>

      <h2 className={styles.sectionTitle}>Giá tiền</h2>
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Giá thuê / tháng (VNĐ) <span className={styles.required}>*</span></label>
          <MoneyInput required name="price" value={draft.price} onValueChange={handleMoneyChange} placeholder="VD: 2.500.000" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tiền đặt cọc (VNĐ)</label>
          <MoneyInput name="deposit" value={draft.deposit} onValueChange={handleMoneyChange} placeholder="VD: 2.500.000" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tiền điện (VNĐ)</label>
          <MoneyInput name="electricity_price" value={draft.electricity_price} onValueChange={handleMoneyChange} placeholder="VD: 4.000" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tiền nước (VNĐ)</label>
          <MoneyInput name="water_price" value={draft.water_price} onValueChange={handleMoneyChange} placeholder="VD: 100.000" />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Wifi (VNĐ)</label>
          <MoneyInput name="internet_price" value={draft.internet_price} onValueChange={handleMoneyChange} placeholder="VD: 100.000" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Gửi xe (VNĐ)</label>
          <MoneyInput name="parking_price" value={draft.parking_price} onValueChange={handleMoneyChange} placeholder="VD: 150.000" />
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.backBtn} onClick={goBack}><ChevronLeft size={15} /> Quay lại</button>
        <button type="submit" className={styles.nextBtn}>Tiếp theo <ChevronRight size={15} /></button>
      </div>
    </form>
  );
};

export default StepLocation;
