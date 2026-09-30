import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetLandlordRoomsQuery, useDeleteRoomMutation } from '../api/landlordApi';
import { setRoomFilters, setRoomsPage, selectRoomFilters, selectRoomsPage } from '../slice';

const PAGE_SIZE = 6;

export const useLandlordRooms = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectRoomFilters);
  const currentPage = useSelector(selectRoomsPage);

  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  const { data, isLoading, isFetching, refetch } = useGetLandlordRoomsQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: filters.search,
    status: filters.status,
    area: filters.area,
    roomType: filters.roomType,
    postedDate: filters.postedDate,
  });

  const rooms = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;

  const handleSearchChange = useCallback(
    (search) => dispatch(setRoomFilters({ search })),
    [dispatch],
  );

  const handleStatusChange = useCallback(
    (status) => dispatch(setRoomFilters({ status })),
    [dispatch],
  );

  const handleFilterChange = useCallback(
    (updates) => dispatch(setRoomFilters(updates)),
    [dispatch],
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        dispatch(setRoomsPage(page));
      }
    },
    [dispatch, totalPages],
  );

  const handleDelete = async (id) => {
    try {
      await deleteRoom({ id }).unwrap();
      refetch();
    } catch {
      // error handled by caller
    }
  };

  return {
    rooms,
    total,
    totalPages,
    currentPage,
    filters,
    isLoading,
    isFetching,
    isDeleting,
    handleSearchChange,
    handleStatusChange,
    handleFilterChange,
    handlePageChange,
    handleDelete,
    refetch,
  };
};
