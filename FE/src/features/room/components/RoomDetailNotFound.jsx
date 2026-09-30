import { Link } from 'react-router-dom';

const RoomDetailNotFound = ({
  title = 'Tin phòng không còn khả dụng',
  message = 'Bài đăng này có thể đã được thuê, đã hết hạn hoặc đã được chủ trọ gỡ khỏi danh sách công khai.',
}) => {
  return (
    <div className="room-detail-container">
      <h1 className="room-detail-title">{title}</h1>
      <p className="room-detail-subtitle">{message}</p>
      <Link to="/find-room" className="room-detail-back">Quay lại danh sách phòng</Link>
    </div>
  );
};

export default RoomDetailNotFound;
