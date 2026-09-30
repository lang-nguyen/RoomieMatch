import { useState } from 'react';

const RoomDetailGallery = ({ images }) => {
  const [mainImage, ...sideImages] = images;
  const [activeIndex, setActiveIndex] = useState(null);

  const openGallery = (index) => setActiveIndex(index);
  const closeGallery = () => setActiveIndex(null);
  const showPrev = () =>
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const showNext = () =>
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('room-detail-lightbox')) {
      closeGallery();
    }
  };
  return (
    <section className="room-detail-gallery">
      <div className="room-detail-gallery-main" onClick={() => openGallery(0)}>
        <img src={mainImage} alt="Ảnh phòng" />
        <span className="room-detail-gallery-count">📷 {images.length} ảnh</span>
      </div>
      <div className="room-detail-gallery-side">
        {sideImages.slice(0, 2).map((img, index) => (
          <div
            key={img}
            className="room-detail-gallery-thumb"
            onClick={() => openGallery(index + 1)}
          >
            <img src={img} alt={`Ảnh phòng ${index + 2}`} />
            {index === 1 && sideImages.length > 2 && (
              <div className="room-detail-gallery-more">+{sideImages.length - 2} ảnh</div>
            )}
          </div>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="room-detail-lightbox" onClick={handleOverlayClick}>
          <button type="button" className="room-detail-lightbox-close" onClick={closeGallery}>×</button>
          <button type="button" className="room-detail-lightbox-nav prev" onClick={showPrev}>‹</button>
          <img src={images[activeIndex]} alt="Ảnh phòng" className="room-detail-lightbox-image" />
          <button type="button" className="room-detail-lightbox-nav next" onClick={showNext}>›</button>
        </div>
      )}
    </section>
  );
};

export default RoomDetailGallery;
