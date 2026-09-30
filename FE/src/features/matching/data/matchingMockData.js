import recommendedPhoto from '../../../assets/tempt.jpg';

const fallbackAvatar =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22%3E%3Cdefs%3E%3ClinearGradient id=%22a%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop stop-color=%22%23ffad7a%22/%3E%3Cstop offset=%221%22 stop-color=%22%23b53f10%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22160%22 height=%22160%22 rx=%2280%22 fill=%22%23fff4e7%22/%3E%3Ccircle cx=%2280%22 cy=%2276%22 r=%2248%22 fill=%22url(%23a)%22/%3E%3Cpath d=%22M50 64 30 34l38 16zm60 0 20-30-38 16z%22 fill=%22%23b53f10%22/%3E%3Ccircle cx=%2265%22 cy=%2274%22 r=%226%22 fill=%22%23201814%22/%3E%3Ccircle cx=%2295%22 cy=%2274%22 r=%226%22 fill=%22%23201814%22/%3E%3Cpath d=%22M70 96c7 7 14 7 22 0%22 fill=%22none%22 stroke=%22%23201814%22 stroke-width=%225%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M80 82 68 91h24z%22 fill=%22%23fff4e7%22/%3E%3C/svg%3E';

export const currentUserContact = {
  id: 'current-user',
  name: 'Người dùng',
  joinedAt: 'Chưa cập nhật',
  avatar: fallbackAvatar,
  email: '',
  phone: '',
  socials: {
    facebook: '',
    instagram: '',
    twitter: '',
  },
};

export const matchingUsers = [
  {
    id: 'u-01',
    name: 'PHAM NGOC THIEN',
    area: 'Phường Đông Hòa, TP. HCM',
    description: 'Mình là sinh viên năm cuối, hay nấu ăn tại phòng. Hiện tại đang nuôi một em mèo.',
    habits: 'học khuya, thích yên tĩnh',
    budget: '2 - 4 triệu/tháng',
    joinedAt: '15/01/2024',
    avatar: recommendedPhoto,
    contact: {
      email: 'ngocthien@roomie.local',
      phone: '0369645270',
      socials: {
        facebook: 'https://facebook.com/ngocthien',
        instagram: 'https://instagram.com/ngocthien',
        twitter: 'https://x.com/ngocthien',
      },
    },
  },
  {
    id: 'u-02',
    name: 'MINH ANH',
    area: 'Quận Bình Thạnh, TP. HCM',
    description: 'Thích phòng gọn gàng, làm việc hybrid và ưu tiên khu vực gần tuyến xe bus.',
    habits: 'ngủ sớm, nấu ăn nhẹ, thích đọc sách',
    budget: '3 - 5 triệu/tháng',
    joinedAt: '02/02/2024',
    avatar: recommendedPhoto,
    contact: {
      email: 'minhanh@roomie.local',
      phone: '0901234567',
      socials: {
        facebook: 'https://facebook.com/minhanh',
        instagram: 'https://instagram.com/minhanh',
        twitter: '',
      },
    },
  },
  {
    id: 'u-03',
    name: 'GIA HUY',
    area: 'Quận 7, TP. HCM',
    description: 'Đang tìm bạn ở cùng lâu dài, tôn trọng không gian riêng và chi phí rõ ràng.',
    habits: 'tập gym buổi tối, ít tiệc tùng',
    budget: '2.5 - 4.5 triệu/tháng',
    joinedAt: '20/03/2024',
    avatar: recommendedPhoto,
    contact: {
      email: 'giahuy@roomie.local',
      phone: '0934567890',
      socials: {
        facebook: '',
        instagram: 'https://instagram.com/giahuy',
        twitter: 'https://x.com/giahuy',
      },
    },
  },
];

export const matchHistory = [
  {
    id: 'm-01',
    name: 'Lan Huong',
    area: 'Thủ Đức',
    joinedAt: '08/02/2024',
    avatar: fallbackAvatar,
    contact: {
      email: 'lanhuong@roomie.local',
      phone: '0912345678',
      socials: {
        facebook: 'https://facebook.com/lanhuong',
        instagram: 'https://instagram.com/lanhuong',
        twitter: '',
      },
    },
  },
  {
    id: 'm-02',
    name: 'Quoc Bao',
    area: 'Quận 10',
    joinedAt: '19/02/2024',
    avatar: fallbackAvatar,
    contact: {
      email: 'quocbao@roomie.local',
      phone: '0987654321',
      socials: {
        facebook: 'https://facebook.com/quocbao',
        instagram: '',
        twitter: 'https://x.com/quocbao',
      },
    },
  },
];

export const skippedUsers = [
  {
    id: 's-01',
    name: 'Hoang Nam',
    area: 'Gò Vấp',
    avatar: fallbackAvatar,
  },
];
