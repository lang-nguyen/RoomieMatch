import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../../shared/components/Footer';
import RoomCard from './components/RoomCard';
import Sidebar from './components/Sidebar';
import CustomDropdown from './components/CustomDropdown';
import RoomSearch from '../room/components/RoomSearch';
import { citiesData, faqData } from './mockData';
import { useGetPostsQuery } from './api/postsApi';
import { useGetDistrictsByProvinceNameQuery, useGetProvincesQuery } from '../../shared/api/provincesApi';
import { getApiErrorMessage } from '../../shared/utils/getApiErrorMessage';
import './Homepage.css';

const typeOptions = [
  { value: 'phong_don', label: 'Phòng đơn' },
  { value: 'ghep', label: 'Ở ghép' },
  { value: 'can_ho', label: 'Căn hộ' }
];

const priceOptions = [
  { value: '3000000', label: 'Dưới 3 triệu' },
  { value: '5000000', label: 'Dưới 5 triệu' },
  { value: '10000000', label: 'Dưới 10 triệu' }
];

const amenityOptions = [
  { value: 'wifi', label: 'Có Wifi' },
  { value: 'air_con', label: 'Điều hoà' },
  { value: 'parking', label: 'Chỗ để xe' }
];

const fallbackCityOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Bình Dương', label: 'Bình Dương' }
];

const fallbackDistrictOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'Thảo Điền', label: 'Thảo Điền' },
  { value: 'Cầu Giấy', label: 'Cầu Giấy' },
  { value: 'Hải Châu', label: 'Hải Châu' }
];

const HOME_POST_PREVIEW_LIMIT = 3;
const DEFAULT_ROOM_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22 viewBox=%220 0 800 600%22%3E%3Crect width=%22800%22 height=%22600%22 fill=%23f3f4f6%22/%3E%3Cpath d=%22M160 410l120-120 90 90 120-120 170 170v70H160z%22 fill=%23d1d5db%22/%3E%3Ccircle cx=%22585%22 cy=%22210%22 r=%2240%22 fill=%23e5e7eb%22/%3E%3Ctext x=%22400%22 y=%22330%22 text-anchor=%22middle%22 font-family=%22Arial,%20sans-serif%22 font-size=%2230%22 fill=%239ca3af%22%3EKhông có ảnh%3C/text%3E%3C/svg%3E';

const formatRelativeTime = (createdAt) => {
  if (!createdAt) return 'Vừa đăng';

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return 'Vừa đăng';

  const diffInSeconds = Math.floor((Date.now() - createdDate.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Vừa đăng';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ngày trước`;
};

const mapPostToRoom = (post) => ({
  id: post.post_id,
  title: post.title,
  price: Number(post.price) || 0,
  area: Number(post.area) || 0,
  bedrooms: Number(post.bedroom_count) || 0,
  type: post.room_type || 'Phòng trọ',
  city: post.city || '',
  district: post.district || '',
  ward: post.ward || '',
  featured: Boolean(post.is_vip),
  boostDaysLeft: Number(post.boost_days_left) || 0,
  timeAgo: formatRelativeTime(post.created_at),
  image: post.thumbnail || post.image || post.cover_image || DEFAULT_ROOM_IMAGE,
  status: post.status,
});

const Homepage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    city: '',
    district: '',
    type: '',
    price: ''
  });

  const [appliedFilters, setAppliedFilters] = useState(searchParams);
  const { data: provinceOptions = [] } = useGetProvincesQuery();
  const { data: districtOptions = [] } = useGetDistrictsByProvinceNameQuery(searchParams.city, {
    skip: !searchParams.city,
  });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPostsQuery({
    page: 1,
    page_size: 3,
    sort_by: 'newest',
  });

  const [openFaq, setOpenFaq] = useState(null);

  const rooms = useMemo(() => (data?.items || []).map(mapPostToRoom), [data]);

  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    if (appliedFilters.city) {
      result = result.filter((room) =>
        [room.city, room.district, room.ward].some((field) =>
          (field || '').toLowerCase().includes(appliedFilters.city.toLowerCase())
        )
      );
    }

    if (appliedFilters.district) {
      result = result.filter((room) =>
        [room.district, room.ward].some((field) =>
          (field || '').toLowerCase().includes(appliedFilters.district.toLowerCase())
        )
      );
    }

    if (appliedFilters.type) {
      result = result.filter((room) =>
        room.type.toLowerCase().includes(appliedFilters.type.toLowerCase())
      );
    }

    if (appliedFilters.price) {
      const limit = parseInt(appliedFilters.price, 10);
      if (limit) {
        result = result.filter((room) => room.price <= limit);
      }
    }

    return result;
  }, [rooms, appliedFilters]);

  const previewRooms = useMemo(
    () => filteredRooms.slice(0, HOME_POST_PREVIEW_LIMIT),
    [filteredRooms]
  );

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSearch = () => {
    const cleaned = Object.fromEntries(Object.entries(searchParams).filter(([_, v]) => v !== ''));
    const query = new URLSearchParams(cleaned).toString();
    navigate(`/find-room?${query}#room-list`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'city' ? { district: '' } : {}),
    }));
  };

  const errorMessage = isError ? getApiErrorMessage(error, 'Không tải được danh sách bài đăng') : '';

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Hero background" className="hero-bg" />

          <div className="hero-content">
            <h1 className="hero-title">Tìm Phòng Trọ Ưng Ý Nhanh Chóng & Dễ Dàng</h1>
            <p className="hero-subtitle">SmartRoom kết nối người thuê với phòng đang trống theo thời<br />gian thực - không tin ảo - minh bạch chi phí</p>

            <div className="home-search-wrapper" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
              <RoomSearch
                searchParams={searchParams}
                cityOptions={provinceOptions.length > 0 ? provinceOptions : fallbackCityOptions}
                districtOptions={districtOptions.length > 0 ? districtOptions : fallbackDistrictOptions}
                typeOptions={typeOptions}
                sortOptions={[{ value: 'newest', label: 'Mới nhất' }, { value: 'price_asc', label: 'Giá thấp đến cao' }, { value: 'price_desc', label: 'Giá cao đến thấp' }]}
                onChange={handleInputChange}
                onSearch={handleSearch}
                tags={[]}
                className="room-search-card"
              />
            </div>
          </div>
        </section>

        <main className="main-content">
          <div className="content-container">
            <div className="left-column">
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Phòng trọ mới đăng</h2>
                  <Link to="/find-room" className="view-all">Xem tất cả &gt;</Link>
                </div>

                {isLoading ? (
                  <div className="rooms-state rooms-loading">Đang tải danh sách phòng trọ...</div>
                ) : isError ? (
                  <div className="rooms-state rooms-error">
                    <p>{errorMessage}</p>
                    <button type="button" className="retry-button" onClick={() => refetch()}>
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <div className="rooms-grid">
                    {previewRooms.length > 0 ? (
                      previewRooms.map(room => (
                        <RoomCard key={room.id} room={room} />
                      ))
                    ) : (
                      <p className="no-results">
                        {isFetching ? 'Đang cập nhật dữ liệu...' : 'Không tìm thấy phòng trọ phù hợp.'}
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="section cities-section">
                <div className="section-header">
                  <div className="title-with-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    <h2 className="section-title">Phòng trọ theo các tỉnh thành khác</h2>
                  </div>
                  <Link to="/find-room" className="view-all">Xem tất cả</Link>
                </div>
                <div className="cities-grid">
                  {citiesData.map(city => (
                    <div key={city.id} className="city-card" onClick={() => navigate(`/find-room?city=${encodeURIComponent(city.name)}`)} style={{ cursor: 'pointer' }}>
                      <img src={city.image} alt={city.name} className="city-image" />
                      <div className="city-card-overlay">
                        <h3 className="city-card-name">{city.name}</h3>
                        <p className="city-card-count">Xem ngay {city.count} phòng trống tại đây</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section faq-section">
                <div className="faq-header">
                  <div className="wavy-line left"></div>
                  <div className="faq-title-container">
                    <div className="faq-icon-circle">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <h2 className="faq-title">Câu hỏi thường gặp về SmartRoom</h2>
                  </div>
                  <div className="wavy-line right"></div>
                </div>

                <div className="faq-list">
                  {faqData.map((faq) => (
                    <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'open' : ''}`} onClick={() => toggleFaq(faq.id)}>
                      <div className="faq-question-row">
                        <div className="faq-question-left">
                          <div className="faq-q-icon">
                            {faq.icon === 'verified' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            {faq.icon === 'help' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                            {faq.icon === 'users' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                            {faq.icon === 'chat' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>}
                          </div>
                          <span className="faq-question">{faq.question}</span>
                        </div>
                        <svg className="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                      {openFaq === faq.id && (
                        <div className="faq-answer">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="right-column">
              <Sidebar />
            </div>
          </div>
        </main>
      <Footer />
    </div>
   );
};

export default Homepage;
