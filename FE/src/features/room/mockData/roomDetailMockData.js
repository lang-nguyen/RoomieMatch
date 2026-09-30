const galleryImages = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80'
];

const amenities = [
  'Giường ngủ 1.4 x 2.0m',
  'Tủ quần áo âm tường',
  'Bàn học / làm việc',
  'Điều hòa inverter',
  'Bình nóng lạnh',
  'Máy giặt chung (miễn phí)',
  'Wi-Fi cáp quang',
  'Camera an ninh 24/7',
  'Chỗ để xe có mái che'
];

const costItems = [
  { label: 'Tiền thuê phòng', value: '5.000.000 VND', highlight: true },
  { label: 'Điện (giá nhà nước)', value: '3.000 VND / kWh' },
  { label: 'Nước', value: '100.000 VND / người' },
  { label: 'Internet', value: 'Miễn phí' },
  { label: 'Giữ xe', value: 'Miễn phí' },
  { label: 'Tiền cọc', value: '10.000.000 VND (2 tháng)', highlight: true }
];

const ratingBreakdown = [
  { label: 'Vị trí', value: 4.5 },
  { label: 'Giá cả', value: 4.0 },
  { label: 'Chủ phòng', value: 5.0 },
  { label: 'Vệ sinh', value: 4.8 }
];

const reviews = [
  {
    id: 1,
    name: 'Nguyễn Lan Anh',
    date: '12/05/2024',
    rating: 5,
    content: 'Phòng sạch sẽ, đúng như hình ảnh mô tả. Anh chủ rất thân thiện và hỗ trợ nhiệt tình từng vấn đề nhỏ. Vị trí rất đẹp, gần chợ và tiện di chuyển.'
  },
  {
    id: 2,
    name: 'Trần Minh Thắng',
    date: '10/05/2024',
    rating: 4,
    content: 'Phòng mới nâng cấp nên rất sạch và hiện đại. An ninh tốt, gần chợ, yên tĩnh về đêm. Mình rất thích không gian ở đây.'
  }
];

const relatedRooms = [
  {
    id: 11,
    title: 'Phòng trọ tiện nghi giá rẻ',
    price: '4.000.000 VND/tháng',
    location: 'Quận Bình Thạnh, TP.HCM',
    tags: ['1 người', 'Toilet riêng'],
    image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 12,
    title: 'Căn hộ Studio Quận 1',
    price: '6.500.000 VND/tháng',
    location: 'Quận 1, TP.HCM',
    tags: ['Studio', 'Full nội thất'],
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 13,
    title: 'Phòng trọ view đẹp Thảo Điền',
    price: '4.800.000 VND/tháng',
    location: 'TP. Thủ Đức, TP.HCM',
    tags: ['1 người', 'Toilet chung'],
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
  }
];

export const getRoomDetailMock = (room) => {
  return {
    breadcrumbs: ['Trang chủ', 'TP. Hồ Chí Minh', 'Thủ Đức', 'Thảo Điền'],
    address: '123 Đường Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
    badges: ['Còn phòng', 'Bài đăng đã xác minh'],
    views: 248,
    updatedAt: '20/05/2024',
    gallery: [room?.image, ...galleryImages].filter(Boolean),
    summary: [
      { label: 'Diện tích', value: '20 m²' },
      { label: 'Loại hình', value: 'Phòng trọ' },
      { label: 'Tối đa', value: '2 người' },
      { label: 'Vệ sinh', value: 'Riêng (trong phòng)' },
      { label: 'Nội thất', value: 'Cơ bản đầy đủ' }
    ],
    description:
      'Phòng trọ sạch sẽ, thoáng mát, nằm ở vị trí trung tâm Thảo Điền. Phòng mới được nâng cấp, có cửa sổ lớn đón ánh sáng tự nhiên, thiết kế thông minh tối ưu diện tích. Gần các trường đại học lớn (ĐH Văn Lang, ĐH Ngoại Thương...), chợ Thảo Điền và các trạm xe buýt chính. Khu vực an ninh, yên tĩnh - phù hợp cho sinh viên và người đi làm muốn không gian riêng tư, tiện nghi.',
    amenities,
    costs: costItems,
    deposit: '10.000.000 VND (2 tháng)',
    owner: {
      name: 'Lê Ngọc Thuận',
      role: 'Chủ phòng trọ',
      initials: 'L',
      note: 'Mình luôn sẵn sàng giải đáp thắc mắc và cho xem phòng 24/7. Gọi trước khi đến nhé!',
      contact: {
        phone: '090 909 0978',
        zalo: 'Nhắn tin Zalo',
        facebook: 'Nhắn tin Facebook',
        email: 'Gửi Email'
      }
    },
    reference: [
      { label: 'Ngày đăng', value: '15/05/2024' },
      { label: 'Tối thiểu thuê', value: '3 tháng' },
      { label: 'Thú cưng', value: 'Không cho phép' },
      { label: 'Hút thuốc', value: 'Không trong phòng' },
      { label: 'Yêu cầu', value: 'CMND/CCCD photo' }
    ],
    location: {
      address: '123 Đường Thảo Điền, P. Thảo Điền, TP. Thủ Đức',
      coords: '10.8012°N, 106.7364°E'
    },
    rating: {
      overall: 4.6,
      count: 12,
      breakdown: ratingBreakdown
    },
    reviews,
    relatedRooms
  };
};
