import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../api/authApiMock';
import { clearError, selectAuthError, setCredentials, setError } from '../slice';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    password_confirm: '',
    account_type: 'tenant',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector(selectAuthError);
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setSuccessMessage('');

    if (formData.password !== formData.password_confirm) {
      dispatch(setError('Mật khẩu không khớp'));
      return;
    }

    try {
      const response = await register({
        display_name: formData.display_name,
        email: formData.email,
        password: formData.password,
        account_type: formData.account_type,
      }).unwrap();
      dispatch(setCredentials(response));
      setSuccessMessage('Tạo tài khoản thành công. Đang chuyển trang...');
      timeoutRef.current = setTimeout(() => navigate('/'), 900);
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, 'Tạo tài khoản thất bại')));
    }
  };

  return {
    formData,
    setFormData,
    error,
    successMessage,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
