const RoomPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages < 1) {
    return null;
  }

  return (
    <div className="room-pagination">
      <button
        type="button"
        className="room-pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            type="button"
            className={`room-pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        className="room-pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default RoomPagination;
