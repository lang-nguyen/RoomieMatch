import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const provincesBaseQuery = fetchBaseQuery({
  baseUrl: 'https://provinces.open-api.vn/api',
});

const toOption = (item) => ({
  value: item.name,
  label: item.name,
});

export const provincesApi = createApi({
  reducerPath: 'provincesApi',
  baseQuery: provincesBaseQuery,
  endpoints: (builder) => ({
    getProvinces: builder.query({
      query: () => ({
        url: '/?depth=1',
      }),
      transformResponse: (response = []) => {
        const options = response.map(toOption);
        // Ensure an "All" option is always first to avoid mismatched city/district
        return [{ value: '', label: 'Tất cả' }, ...options];
      },
    }),
    getDistrictsByProvinceName: builder.query({
      async queryFn(provinceName, _queryApi, _extraOptions, baseQuery) {
        if (!provinceName) {
          return { data: [] };
        }

        const provincesResult = await baseQuery('/?depth=1');
        if (provincesResult.error) {
          return { error: provincesResult.error };
        }

        const province = (provincesResult.data || []).find((item) => item.name === provinceName);
        if (!province?.code) {
          return { data: [] };
        }

        const districtsResult = await baseQuery(`/p/${province.code}?depth=2`);
        if (districtsResult.error) {
          return { error: districtsResult.error };
        }

        const districts = districtsResult.data?.districts || [];
        return { data: districts.map(toOption) };
      },
    }),
  }),
});

export const {
  useGetProvincesQuery,
  useGetDistrictsByProvinceNameQuery,
} = provincesApi;
