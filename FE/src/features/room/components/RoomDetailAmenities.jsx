const ICON_MAP = {
  // Utility / Điện nước internet
  'Wifi': '📶',
  'Wi-Fi': '📶',
  'Wi-Fi cáp quang': '📶',
  'Internet': '📶',
  'Điều hòa': '❄️',
  'Máy lạnh': '❄️',
  'Điều hòa inverter': '❄️',
  'Bình nóng lạnh': '🚿',
  'Nước nóng': '🚿',
  'Máy giặt': '🧺',
  'Máy giặt chung (miễn phí)': '🧺',
  'Máy giặt riêng': '🧺',
  // Furniture / Nội thất
  'Giường': '🛏️',
  'Giường ngủ': '🛏️',
  'Giường đôi': '🛏️',
  'Tủ quần áo': '🧥',
  'Tủ': '🧥',
  'Bàn học': '🪑',
  'Bàn làm việc': '🪑',
  'Bàn học / làm việc': '🪑',
  'Ghế': '🪑',
  'Sofa': '🛋️',
  'Kệ sách': '📚',
  'Ti vi': '📺',
  'TV': '📺',
  'Tủ lạnh': '🧊',
  'Lò vi sóng': '🍳',
  'Nồi cơm điện': '🍚',
  'Bếp': '🍳',
  'Bếp riêng': '🍳',
  // Space / Không gian
  'Ban công': '🌅',
  'Cửa sổ': '🪟',
  'Nhà vệ sinh riêng': '🚽',
  'WC riêng': '🚽',
  'Phòng tắm riêng': '🚿',
  'Phòng bếp riêng': '🍳',
  'Gác lửng': '🏠',
  // Building / Tòa nhà
  'Thang máy': '🛗',
  'Camera an ninh': '📹',
  'Camera an ninh 24/7': '📹',
  'Bảo vệ': '👮',
  'Bảo vệ 24/7': '👮',
  'An ninh 24/7': '👮',
  'Chỗ để xe': '🏍️',
  'Chỗ để xe có mái che': '🏍️',
  'Chỗ để xe máy': '🏍️',
  'Chỗ để ô tô': '🚗',
  'Bãi đỗ xe': '🚗',
  // Policy / Chính sách
  'Thú cưng': '🐾',
  'Cho phép nuôi thú cưng': '🐾',
  'Giờ giấc tự do': '🔑',
  'Tự do giờ giấc': '🔑',
  'Ra vào 24/7': '🔑',
  'Không có giờ giới nghiêm': '🔑',
  'Hồ bơi': '🏊',
  'Gym': '💪',
  'Phòng gym': '💪',
  // Generic fallback đã có icon riêng
  'Giường ngủ 1.4 x 2.0m': '🛏️',
  'Tủ quần áo âm tường': '🧥',
};

const CATEGORY_LABELS = {
  utility: 'Tiện ích cơ bản',
  furniture: 'Nội thất',
  space: 'Không gian',
  building: 'Tòa nhà',
  policy: 'Chính sách',
};

const CATEGORY_ORDER = ['utility', 'furniture', 'space', 'building', 'policy'];

const getIcon = (name) => ICON_MAP[name] || '✅';

const RoomDetailAmenities = ({ items }) => {
  if (!items || items.length === 0) return null;

  // items là mảng { id, name, category }
  // Group by category nếu có category, else show flat
  const hasCategories = items.some((item) => item.category);

  if (hasCategories) {
    const grouped = {};
    items.forEach((item) => {
      const cat = item.category || 'utility';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    const orderedCategories = [
      ...CATEGORY_ORDER.filter((c) => grouped[c]),
      ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
    ];

    return (
      <section className="room-detail-section">
        <h2 className="room-detail-section-title">Tiện ích sẵn có</h2>
        {orderedCategories.map((cat) => (
          <div key={cat} className="room-detail-amenity-group">
            <p className="room-detail-amenity-category">{CATEGORY_LABELS[cat] || cat}</p>
            <div className="room-detail-amenities">
              {grouped[cat].map((item) => (
                <div key={item.id || item.name} className="room-detail-amenity">
                  <span className="room-detail-amenity-icon">{getIcon(item.name)}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Fallback: flat list (items là string[] hoặc {name} only)
  return (
    <section className="room-detail-section">
      <h2 className="room-detail-section-title">Tiện ích sẵn có</h2>
      <div className="room-detail-amenities">
        {items.map((item) => {
          const name = typeof item === 'string' ? item : item.name;
          const key = (typeof item === 'object' && item.id) ? item.id : name;
          return (
            <div key={key} className="room-detail-amenity">
              <span className="room-detail-amenity-icon">{getIcon(name)}</span>
              <span>{name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoomDetailAmenities;
