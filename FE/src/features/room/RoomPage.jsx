import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Footer from '../../shared/components/Footer';
import RoomHero from './components/RoomHero';
import RoomRecommended from './components/RoomRecommended';
import RoomSearch from './components/RoomSearch';
import RoomList from './components/RoomList';
import { useGetPostsQuery } from '../homepage/api/postsApi';
import { useGetDistrictsByProvinceNameQuery, useGetProvincesQuery } from '../../shared/api/provincesApi';
import {
  cityOptions as fallbackCityOptions,
  districtOptions as fallbackDistrictOptions,
  typeOptions,
  sortOptions,
  roomStats,
  defaultSearchParams
} from './mockData/roomMockData';
import '../homepage/Homepage.css';
import './RoomPage.css';

const PAGE_SIZE = 15;

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
  id: post.post_id || post.room_id,
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
  image: post.thumbnail || post.image || post.cover_image,
  status: post.status,
});

const RoomPage = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const roomListRef = useRef(null);

  const initialSearchParams = useMemo(() => {
    return {
      ...defaultSearchParams,
      city: urlSearchParams.get('city') || defaultSearchParams.city || '',
      district: urlSearchParams.get('district') || defaultSearchParams.district || '',
      type: urlSearchParams.get('type') || defaultSearchParams.type || '',
      price: urlSearchParams.get('price') || defaultSearchParams.price || '',
      sort: urlSearchParams.get('sort') || defaultSearchParams.sort || 'newest',
      keyword: urlSearchParams.get('keyword') || defaultSearchParams.keyword || ''
    };
  }, []);

  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [appliedFilters, setAppliedFilters] = useState(initialSearchParams);
  const [currentPage, setCurrentPage] = useState(parseInt(urlSearchParams.get('page')) || 1);

  useEffect(() => {
    // Debounce keyword search
    const timer = setTimeout(() => {
      setAppliedFilters(prev => ({
        ...prev,
        keyword: searchParams.keyword
      }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams.keyword]);



  const { data: provinceOptions = [] } = useGetProvincesQuery();
  const { data: districtOptions = [] } = useGetDistrictsByProvinceNameQuery(searchParams.city, {
    skip: !searchParams.city,
  });

  const queryParams = useMemo(() => ({
    page: currentPage,
    page_size: PAGE_SIZE,
    sort_by: appliedFilters.sort || 'newest',
    ...(appliedFilters.city ? { city: appliedFilters.city } : {}),
    ...(appliedFilters.district ? { district: appliedFilters.district } : {}),
    room_type: appliedFilters.type || undefined,
    keyword: appliedFilters.keyword || undefined,
  }), [appliedFilters.city, appliedFilters.district, appliedFilters.keyword, appliedFilters.sort, appliedFilters.type, currentPage]);

  const { data, isLoading, isFetching } = useGetPostsQuery(queryParams);
  const { data: recommendedData } = useGetPostsQuery({ page: 1, page_size: 3 });

  useEffect(() => {
    if (hash === '#room-list' && !isLoading && data) {
      if (roomListRef.current) {
        roomListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [hash, isLoading, data]);

  const rooms = useMemo(() => (data?.items || []).map(mapPostToRoom), [data]);
  const totalRooms = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;
  const recommendedRooms = useMemo(() => (recommendedData?.items || []).map(mapPostToRoom), [recommendedData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newParams = {
      ...searchParams,
      [name]: value,
      ...(name === 'city' ? { district: '' } : {})
    };
    
    setSearchParams(newParams);
    
    // Auto search for dropdowns immediately
    if (name !== 'keyword') {
      setAppliedFilters(newParams);
      setCurrentPage(1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      const cleaned = Object.fromEntries(Object.entries(searchParams).filter(([_, v]) => v !== ''));
      cleaned.page = page;
      setUrlSearchParams(cleaned);
      setCurrentPage(page);
      if (roomListRef.current) {
        roomListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const activeTags = useMemo(() => {
    const tags = [];
    if (appliedFilters.keyword) tags.push(`"${appliedFilters.keyword}"`);
    if (appliedFilters.city) tags.push(appliedFilters.city);
    if (appliedFilters.district) tags.push(appliedFilters.district);
    if (appliedFilters.type) tags.push(appliedFilters.type);
    return tags;
  }, [appliedFilters]);

  return (
    <div className="room-page">

      <RoomHero
        location=""
        title="Khám phá"
        emphasis="không gian"
        subtitle="Hơn 2.500 phòng trọ, căn hộ và KTX đang chờ bạn khám phá."
        stats={roomStats}
      />

      <RoomRecommended rooms={recommendedRooms} />

      <section className="room-search" style={{ position: 'sticky', top: '70px', zIndex: 100 }}>
        <RoomSearch
          searchParams={searchParams}
          cityOptions={provinceOptions.length > 0 ? provinceOptions : fallbackCityOptions}
          districtOptions={districtOptions.length > 0 ? districtOptions : fallbackDistrictOptions}
          typeOptions={typeOptions}
          sortOptions={sortOptions}
          onChange={handleInputChange}
          tags={activeTags}
          hideSearchButton={true}
        />
      </section>

      <div id="room-list" ref={roomListRef} style={{ scrollMarginTop: '180px' }}>
        <RoomList
          rooms={rooms}
          totalRooms={totalRooms}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          isLoading={isLoading || isFetching}
        />
      </div>

      <Footer />
    </div>
  );
};

export default RoomPage;
