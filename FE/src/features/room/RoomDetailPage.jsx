import { Link, useParams } from 'react-router-dom';
import Footer from '../../shared/components/Footer';
import RoomDetailHeader from './components/RoomDetailHeader';
import RoomDetailGallery from './components/RoomDetailGallery';
import RoomDetailHighlights from './components/RoomDetailHighlights';
import RoomDetailDescription from './components/RoomDetailDescription';
import RoomDetailAmenities from './components/RoomDetailAmenities';
import RoomDetailCosts from './components/RoomDetailCosts';
import RoomDetailLocation from './components/RoomDetailLocation';
import RoomDetailReviews from './components/RoomDetailReviews';
import RoomDetailRelated from './components/RoomDetailRelated';
import RoomDetailSidebar from './components/RoomDetailSidebar';
import RoomDetailNotFound from './components/RoomDetailNotFound';
import './RoomDetailPage.css';
import { useGetPostByIdQuery } from '../homepage/api/postsApi';

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const { data: responseData, isLoading, isError } = useGetPostByIdQuery(roomId);

  if (isLoading) {
    return <div className="room-detail-page"><main className="room-detail-content">Đang tải...</main><Footer /></div>;
  }

  if (isError || !responseData) {
    return (
      <div className="room-detail-page">
        <main className="room-detail-content">
          <RoomDetailNotFound />
        </main>
        <Footer />
      </div>
    );
  }

  const apiData = responseData.room ? responseData : { room: responseData, landlord: {} };
  const room = apiData.room;
  const landlord = apiData.landlord || {};
  const createdAt = apiData.created_at ? new Date(apiData.created_at) : null;
  const createdAtLabel = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString('vi-VN')
    : 'Đang cập nhật';
  const actualViews = apiData.views_count || 0;

  const detail = {
    breadcrumbs: ['Trang chủ', room.city || 'TP. Hồ Chí Minh', room.district || 'N/A', room.ward || 'N/A'],
    address: room.full_address || `${room.street || ''}, ${room.ward || ''}, ${room.district || ''}, ${room.city || ''}`,
    badges: [apiData.is_vip ? 'Tin nổi bật' : '', apiData.status === 'active' ? 'Còn phòng' : ''].filter(Boolean),
    views: actualViews,
    updatedAt: createdAtLabel,
    gallery: apiData.images && apiData.images.length > 0
      ? apiData.images.map((img) => img.image_url)
      : ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80'],
    summary: [
      { label: 'Diện tích', value: `${room.area || 0} m²` },
      { label: 'Loại hình', value: room.room_type || 'Phòng trọ' },
      { label: 'Tối đa', value: `${room.max_people || 1} người` },
      { label: 'Hiện tại', value: `${room.current_people || 0} người` },
    ],
    title: apiData.title || room.title,
    description: apiData.description || room.description || 'Không có mô tả.',
    amenities: apiData.amenities ? apiData.amenities.map((a) => a.name) : [],
    costs: [
      { label: 'Giá phòng', value: `${room.price ? room.price.toLocaleString() : 0} VND`, highlight: true },
      { label: 'Tiền điện', value: `${room.electricity_price ? room.electricity_price.toLocaleString() : 0} VND` },
      { label: 'Tiền nước', value: `${room.water_price ? room.water_price.toLocaleString() : 0} VND` },
      { label: 'Tiền internet', value: `${room.internet_price ? room.internet_price.toLocaleString() : 'Miễn phí'} VND` },
      { label: 'Tiền giữ xe', value: `${room.parking_price ? room.parking_price.toLocaleString() : 'Miễn phí'} VND` },
    ],
    deposit: `${room.deposit ? room.deposit.toLocaleString() : 0} VND`,
    location: {
      address: room.full_address || '',
      coords: `${room.latitude || 0}, ${room.longitude || 0}`,
    },
    owner: {
      name: landlord.display_name || 'Chủ trọ',
      role: 'Chủ phòng trọ',
      initials: (landlord.display_name || 'C').charAt(0),
      note: 'Vui lòng liên hệ trực tiếp để biết thêm chi tiết.',
      contact: {
        phone: landlord.contact_phone || 'N/A',
      },
    },
    reference: [
      { label: 'Ngày đăng', value: createdAtLabel },
      { label: 'Mã phòng', value: room.room_code || `ROOM-${room.room_id || roomId}` },
    ],
    relatedRooms: [],
  };

  return (
    <div className="room-detail-page">
      <main className="room-detail-content">
        <div className="room-detail-container">
          <RoomDetailHeader
            title={detail.title}
            breadcrumbs={detail.breadcrumbs}
            address={detail.address}
            badges={detail.badges}
            views={detail.views}
            updatedAt={detail.updatedAt}
          />

          <div className="room-detail-grid">
            <div className="room-detail-main">
              <RoomDetailGallery images={detail.gallery} />
              <RoomDetailHighlights items={detail.summary} />
              <RoomDetailDescription text={detail.description} />
              <RoomDetailAmenities items={detail.amenities} />
              <RoomDetailCosts items={detail.costs} />
              <RoomDetailLocation address={detail.location.address} coords={detail.location.coords} />
              <RoomDetailReviews roomId={room.room_id || roomId} />
              <RoomDetailRelated rooms={detail.relatedRooms} ownerName={detail.owner.name} />
            </div>

            <RoomDetailSidebar
              price={room.price ? `${room.price.toLocaleString('vi-VN')} VND / tháng` : 'Thỏa thuận'}
              deposit={detail.deposit}
              owner={detail.owner}
              contact={detail.owner.contact}
              reference={detail.reference}
              postId={apiData.post_id || roomId}
              roomId={room.room_id || roomId}
              postStatus={apiData.status}
            />
          </div>

          <Link to="/find-room" className="room-detail-back bottom">← Quay lại danh sách phòng</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RoomDetailPage;
