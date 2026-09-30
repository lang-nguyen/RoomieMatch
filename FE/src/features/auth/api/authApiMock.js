import { baseApi } from '../../../shared/api/baseApi';
import { buildUser, findUserByLogin } from './authMockData';

export const authApiMock = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			queryFn: async (credentials) => {
				const user = findUserByLogin(credentials || {});

				if (!user) {
					return {
						error: {
							status: 401,
							data: {
								message: 'Email hoặc mật khẩu không đúng',
							},
						},
					};
				}

				return {
					data: {
						user: buildUser(user),
						access_token: `mock-access-token-${user.account_type}`,
					},
				};
			},
		}),
		register: builder.mutation({
			queryFn: async (userData) => {
				const accountType = userData?.account_type === 'landlord' ? 'landlord' : 'tenant';
				const createdUser = {
					id: Date.now(),
					display_name: userData?.display_name || 'Demo User',
					email: userData?.email || 'demo@roomie.local',
					account_type: accountType,
				};

				return {
					data: {
						user: buildUser(createdUser),
						access_token: `mock-access-token-${accountType}`,
					},
				};
			},
		}),
		logout: builder.mutation({
			queryFn: async () => ({
				data: {
					success: true,
				},
			}),
		}),
	}),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApiMock;
