import CustomDropdown from '../../homepage/components/CustomDropdown';

const RoomSearch = ({
  searchParams,
  cityOptions,
  districtOptions,
  typeOptions,
  sortOptions,
  onChange,
  onSearch,
  tags,
  className = "room-search-card",
  hideSearchButton = false
}) => {
  return (
      <div className={className}>
        <div className="room-search-row">
          <div className="room-search-field">
            <label className="room-search-label" htmlFor="keyword">Từ khóa</label>
            <input
              id="keyword"
              name="keyword"
              type="text"
              placeholder="Tìm theo khu vực, tên phòng..."
              value={searchParams.keyword}
              onChange={onChange}
              className="room-search-input"
            />
          </div>

          <div className="room-search-field">
            <label className="room-search-label">Tỉnh / Thành phố</label>
            <CustomDropdown
              name="city"
              value={searchParams.city}
              onChange={onChange}
              options={cityOptions}
                placeholder="Tỉnh / Thành phố"
            />
          </div>

          <div className="room-search-field">
            <label className="room-search-label">Quận / Huyện</label>
            <CustomDropdown
              name="district"
              value={searchParams.district}
              onChange={onChange}
              options={districtOptions}
                placeholder="Quận / Huyện"
            />
          </div>

          <div className="room-search-field">
            <label className="room-search-label">Loại phòng</label>
            <CustomDropdown
              name="type"
              value={searchParams.type}
              onChange={onChange}
              options={typeOptions}
              placeholder="Tất cả loại hình"
            />
          </div>

          <div className="room-search-field">
            <label className="room-search-label">Sắp xếp theo</label>
            <CustomDropdown
              name="sort"
              value={searchParams.sort}
              onChange={onChange}
              options={sortOptions}
              placeholder="Mới nhất"
            />
          </div>

          {!hideSearchButton && (
            <button type="button" className="room-search-button" onClick={onSearch}>
              Tìm kiếm
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="room-search-tags">
            {tags.map((tag) => (
              <span key={tag} className="room-search-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
  );
};

export default RoomSearch;
