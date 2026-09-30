export const mockRooms = [
  {
    id: 1,
    title: 'Phòng trọ mới xây, sạch sẽ, gần chợ Thảo Điền',
    price: 9500000,
    area: 45,
    bedrooms: 2,
    type: 'Phòng trọ',
    city: 'TP. Hồ Chí Minh',
    district: 'Thành phố Thủ Đức',
    ward: 'Phường Thảo Điền',
    verified: true,
    timeAgo: '1 giờ trước',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    title: 'Căn hộ mini full nội thất, ban công rộng',
    price: 7200000,
    area: 28,
    bedrooms: 1,
    type: 'Chung cư mini',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 2',
    ward: 'Phường An Phú',
    verified: true,
    timeAgo: '2 giờ trước',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    title: 'Studio cao cấp, view công viên, gym & spa',
    price: 6200000,
    area: 25,
    bedrooms: 1,
    type: 'Phòng trọ',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Phú Mỹ',
    verified: false,
    timeAgo: '3 giờ trước',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 4,
    title: 'Phòng mới tinh, gần đại học, full nội thất',
    price: 4500000,
    area: 20,
    bedrooms: 1,
    type: 'Phòng trọ',
    city: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng',
    verified: true,
    timeAgo: '1 ngày trước',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 5,
    title: 'Chung cư mini gần trung tâm, an ninh tốt',
    price: 5200000,
    area: 27,
    bedrooms: 1,
    type: 'Chung cư mini',
    city: 'Đà Nẵng',
    district: 'Quận Hải Châu',
    ward: 'Phường Thạch Thang',
    verified: true,
    timeAgo: '2 ngày trước',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 6,
    title: 'Phòng trọ cao cấp, đầy đủ tiện nghi',
    price: 6800000,
    area: 30,
    bedrooms: 1,
    type: 'Phòng trọ',
    city: 'Bình Dương',
    district: 'Thành phố Thủ Dầu Một',
    ward: 'Phường Phú Cường',
    verified: false,
    timeAgo: '3 ngày trước',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
  }
];

export const roomStats = [
  { label: 'Tin đăng', value: '2.541' },
  { label: 'Đã xác minh', value: '98%' },
  { label: 'Đánh giá tốt', value: '4.9★' }
];

export const cityOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Bình Dương', label: 'Bình Dương' }
];

export const districtOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'Thảo Điền', label: 'Phường Thảo Điền' },
  { value: 'Cầu Giấy', label: 'Quận Cầu Giấy' },
  { value: 'Hải Châu', label: 'Quận Hải Châu' },
  { value: 'Thủ Đức', label: 'Thủ Đức' }
];

export const typeOptions = [
  { value: '', label: 'Tất cả loại phòng' },
  { value: 'phong_tro', label: 'Phòng trọ' },
  { value: 'can_ho_mini', label: 'Căn hộ mini' },
  { value: 'studio', label: 'Studio' },
  { value: 'ky_tuc_xa', label: 'Ký túc xá' },
  { value: 'nha_nguyen_can', label: 'Nhà nguyên căn' },
];

export const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' }
];

export const defaultSearchParams = {
  keyword: '',
  city: '',
  district: '',
  type: '',
  sort: 'newest'
};
