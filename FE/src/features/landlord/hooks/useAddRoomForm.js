import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddRoomMutation, useGetLandlordRoomByIdQuery, useUpdateRoomMutation } from '../api/landlordApi';
import {
  setAddRoomStep,
  setAddRoomDraft,
  replaceAddRoomDraft,
  clearAddRoomDraft,
  setError as setLandlordError,
  clearError,
  selectAddRoomStep,
  selectAddRoomDraft,
  selectLandlordError,
} from '../slice';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import { clearAddRoomImageFiles, getAddRoomImageFiles } from '../utils/addRoomImageFiles';

const TOTAL_STEPS = 4;
const numberOrNull = (value) => value === undefined || value === null || value === '' || Number.isNaN(Number(value)) ? null : Number(value);
const intOr = (value, fallback) => Number.isNaN(Number.parseInt(value, 10)) ? fallback : Number.parseInt(value, 10);
const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';
const buildRoomPayload = (draft) => {
  const street = draft.address || draft.street || '';
  return {
    title: draft.name || draft.title || '', room_type: draft.room_type || null, area: numberOrNull(draft.area),
    max_people: intOr(draft.capacity, 1), current_people: intOr(draft.current_people, 0), bedroom_count: draft.bedroom_count === 'Studio' ? 1 : intOr(draft.bedroom_count, 1),
    description: draft.description || null, city: draft.city || null, district: draft.district || null, ward: draft.ward || null, street,
    full_address: [street, draft.ward, draft.district, draft.city].filter(Boolean).join(', ') || null,
    latitude: numberOrNull(draft.lat || draft.latitude), longitude: numberOrNull(draft.lng || draft.longitude), price: intOr(draft.price, 0), deposit: numberOrNull(draft.deposit),
    electricity_price: numberOrNull(draft.electricity_price), water_price: numberOrNull(draft.water_price), internet_price: numberOrNull(draft.internet_price), parking_price: numberOrNull(draft.parking_price),
    status: draft.status || 'available', contact_name: draft.contact_name || null, contact_phone: draft.contact_phone || null, contact_social: draft.contact_social || null, amenities: draft.amenities || [],
  };
};

const validateDraft = (draft) => {
  const requiredFields = [
    { key: 'name', step: 0, message: 'Vui lòng nhập tên phòng trọ.' },
    { key: 'room_type', step: 0, message: 'Vui lòng chọn loại phòng.' },
    { key: 'area', step: 0, message: 'Vui lòng nhập diện tích phòng.' },
    { key: 'city', step: 2, message: 'Vui lòng chọn tỉnh/thành phố.' },
    { key: 'district', step: 2, message: 'Vui lòng chọn quận/huyện.' },
    { key: 'address', fallbackKey: 'street', step: 2, message: 'Vui lòng nhập địa chỉ phòng.' },
    { key: 'price', step: 2, message: 'Vui lòng nhập giá thuê.' },
  ];

  return requiredFields.find((field) => isBlank(draft[field.key]) && (!field.fallbackKey || isBlank(draft[field.fallbackKey]))) || null;
};

export const useAddRoomForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const currentStep = useSelector(selectAddRoomStep);
  const draft = useSelector(selectAddRoomDraft);
  const formError = useSelector(selectLandlordError);
  const [addRoom, addState] = useAddRoomMutation();
  const [updateRoom, updateState] = useUpdateRoomMutation();
  const { data: editRoom } = useGetLandlordRoomByIdQuery({ id: roomId }, { skip: !roomId });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!roomId || !editRoom) return;
    if (draft?.__sourceRoomId === String(roomId)) return;

    dispatch(setAddRoomStep(0));
    dispatch(replaceAddRoomDraft({
      __sourceRoomId: String(roomId),
      name: editRoom.title,
      room_type: editRoom.room_type,
      area: editRoom.area,
      capacity: editRoom.max_people,
      current_people: editRoom.current_people,
      bedroom_count: editRoom.bedroom_count,
      description: editRoom.description,
      city: editRoom.city,
      district: editRoom.district,
      ward: editRoom.ward,
      street: editRoom.street,
      address: editRoom.street,
      latitude: editRoom.latitude,
      longitude: editRoom.longitude,
      price: editRoom.price,
      deposit: editRoom.deposit,
      electricity_price: editRoom.electricity_price,
      water_price: editRoom.water_price,
      internet_price: editRoom.internet_price,
      parking_price: editRoom.parking_price,
      status: editRoom.status,
      contact_name: editRoom.contact_name,
      contact_phone: editRoom.contact_phone,
      contact_social: editRoom.contact_social,
      amenities: editRoom.amenities || [],
      existing_images: editRoom.image_items || [],
      image_files_meta: [],
    }));
    clearAddRoomImageFiles();
  }, [dispatch, draft?.__sourceRoomId, editRoom, roomId]);

  const updateDraft = (data) => { dispatch(clearError()); dispatch(setAddRoomDraft(data)); };
  const goNext = () => { dispatch(clearError()); currentStep < TOTAL_STEPS - 1 && dispatch(setAddRoomStep(currentStep + 1)); };
  const goBack = () => { dispatch(clearError()); currentStep > 0 && dispatch(setAddRoomStep(currentStep - 1)); };
  const goToStep = (step) => dispatch(setAddRoomStep(step));
  const handleSubmit = async ({ publish = false } = {}) => {
    dispatch(clearError());
    if (!draft) {
      dispatch(setLandlordError('Vui lòng nhập thông tin phòng trọ trước khi lưu.'));
      dispatch(setAddRoomStep(0));
      return;
    }
    const invalid = validateDraft(draft);
    if (invalid) {
      dispatch(setLandlordError(invalid.message));
      dispatch(setAddRoomStep(invalid.step));
      return;
    }
    try {
      const request = roomId ? updateRoom({ id: roomId, payload: buildRoomPayload(draft), images: getAddRoomImageFiles() }) : addRoom({ payload: buildRoomPayload(draft), images: getAddRoomImageFiles(), publish });
      await request.unwrap();
      setSuccessMessage(roomId ? 'Cập nhật phòng trọ thành công!' : publish ? 'Thêm phòng và gửi bài đăng chờ duyệt thành công!' : 'Thêm phòng trọ thành công!');
      clearAddRoomImageFiles(); dispatch(clearAddRoomDraft()); window.setTimeout(() => navigate(publish ? '/landlord/posts' : '/landlord/rooms'), 600);
    } catch (requestError) { dispatch(setLandlordError(getApiErrorMessage(requestError, roomId ? 'Cập nhật phòng thất bại' : 'Thêm phòng thất bại'))); }
  };
  const handleCancel = () => { clearAddRoomImageFiles(); dispatch(clearError()); dispatch(clearAddRoomDraft()); navigate('/landlord/rooms'); };
  return { currentStep, totalSteps: TOTAL_STEPS, draft: draft ?? {}, isSubmitting: addState.isLoading || updateState.isLoading, isEditing: Boolean(roomId), error: formError, successMessage, updateDraft, goNext, goBack, goToStep, handleSubmit, handleCancel };
};
