import { useEffect, useMemo, useState } from 'react';
import { MATCHING_STEPS } from '../models/matchingModels';
import {
  useGetMatchingProfileQuery,
  useGetRoommateSuggestionsQuery,
  useGetMatchingHistoryQuery,
  useGetRejectedRoommatesQuery,
  useCreateMatchingProfileMutation,
  useRejectRoommateMutation,
  useAcceptRoommateMutation,
} from '../api/matchingApi';
import { useUpdateUserProfileMutation } from '../../user/api/userApi';

export const useMatchingFlow = () => {
  const [step, setStep] = useState(MATCHING_STEPS.ONBOARDING);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasContactInfo, setHasContactInfo] = useState(false);
  const [currentUserContact, setCurrentUserContact] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showContactCard, setShowContactCard] = useState(false);
  const [matchActionError, setMatchActionError] = useState(null);

  // RTK Query Hooks
  const { data: userProfileData, isLoading: isLoadingProfile, isError: isProfileError } = useGetMatchingProfileQuery();
  const { data: suggestionsData, isLoading: isLoadingSuggestions, error: suggestionsError } = useGetRoommateSuggestionsQuery();
  const { data: matchHistoryData } = useGetMatchingHistoryQuery();
  const { data: skippedUsersData } = useGetRejectedRoommatesQuery();

  const [createProfileMutation] = useCreateMatchingProfileMutation();
  const [rejectRoommateMutation] = useRejectRoommateMutation();
  const [acceptRoommateMutation] = useAcceptRoommateMutation();
  const [updateUserProfileMutation] = useUpdateUserProfileMutation();

  const matchingUsers = suggestionsData?.matches || [];
  
  const [matchHistory, setMatchHistory] = useState([]);
  const [skippedUsers, setSkippedUsers] = useState([]);

  useEffect(() => {
    if (matchHistoryData) {
      setMatchHistory(matchHistoryData.data || matchHistoryData || []);
    }
  }, [matchHistoryData]);

  useEffect(() => {
    if (skippedUsersData) {
      setSkippedUsers(skippedUsersData.data || skippedUsersData || []);
    }
  }, [skippedUsersData]);

  const isLoading = isLoadingSuggestions || isLoadingProfile;

  useEffect(() => {
    if (userProfileData) {
      const profile = userProfileData.data || userProfileData;
      
      // Kiểm tra xem profile có dữ liệu hợp lệ không (ví dụ có introduce hoặc target_city)
      if (profile && Object.keys(profile).length > 0 && (profile.introduce || profile.target_city || profile.account_id)) {
        setHasProfile(true);
        setHasContactInfo(true);
        setCurrentUserContact({
          email: profile.email || '',
          phone: profile.phone || '',
          socials: {
            facebook: profile.facebook || '',
            instagram: profile.instagram || '',
            twitter: profile.twitter || '',
          },
          name: profile.full_name || profile.name || profile.display_name || '',
          avatar: profile.avatar_url || profile.avatar || profile.image || '',
          joinedAt: profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : '',
        });
        
        setCurrentProfile({
          avatar: profile.image || '',
          intro: profile.introduce || '',
          habits: Array.isArray(profile.habit) ? profile.habit.join(', ') : '',
          target_city: profile.target_city || '',
          target_district: profile.target_district || '',
          budget: profile.budget || '',
        });

        setStep(MATCHING_STEPS.MATCHING);
      } else {
        setShowProfileForm(true);
      }
    } else if (isProfileError) {
      // Nếu API trả về lỗi (ví dụ 404 chưa có profile), mở form cập nhật
      setShowProfileForm(true);
    }
  }, [userProfileData, isProfileError]);

  const activeUser = useMemo(() => {
    if (!matchingUsers.length) return null;
    return matchingUsers[activeIndex] || null;
  }, [activeIndex, matchingUsers]);

  const availableUsers = useMemo(() => matchingUsers.slice(activeIndex), [activeIndex, matchingUsers]);

  const completeProfile = async (profile) => {
    try {
      await createProfileMutation(profile).unwrap();
      setHasProfile(true);
      setShowProfileForm(false);

      if (hasContactInfo && step === MATCHING_STEPS.ONBOARDING) {
        setStep(MATCHING_STEPS.SUCCESS);
      } else if (step === MATCHING_STEPS.ONBOARDING) {
        setShowContactForm(true);
      }
    } catch (error) {
      console.error('Failed to create matching profile:', error);
    }
  };

  const completeContactInfo = async (contactInfo) => {
    try {
      await updateUserProfileMutation({
        email: contactInfo.email,
        phone: contactInfo.phone,
        facebook: contactInfo.socials?.facebook || '',
        instagram: contactInfo.socials?.instagram || '',
        twitter: contactInfo.socials?.twitter || '',
      }).unwrap();
    } catch (error) {
      console.error('Failed to update user profile with contact info:', error);
    }

    setHasContactInfo(true);
    setCurrentUserContact((previous) => ({
      ...(previous || {}),
      email: contactInfo.email,
      phone: contactInfo.phone,
      socials: contactInfo.socials,
    }));
    setShowContactForm(false);

    if (hasProfile && step === MATCHING_STEPS.ONBOARDING) {
      setStep(MATCHING_STEPS.SUCCESS);
    } else if (step === MATCHING_STEPS.ONBOARDING) {
      setShowProfileForm(true);
    }
  };

  const startMatching = () => {
    setStep(MATCHING_STEPS.MATCHING);
    setIsRevealed(false);
    setShowContactCard(false);
  };

  const revealCard = (selectedOffset = 0) => {
    if (isRevealed || isFlipping) return;

    setIsFlipping(true);
    setActiveIndex((index) => index + selectedOffset);
    window.setTimeout(() => {
      setIsRevealed(true);
      setIsFlipping(false);
    }, 520);
  };

  const showActiveUserContact = async () => {
    if (!activeUser) return;
    
    const targetId = activeUser.account_id || activeUser.accountId || String(activeUser.id).replace('m-', '');
    
    try {
      await acceptRoommateMutation(targetId).unwrap();
      
      setShowContactCard(true);
      setMatchHistory(prev => {
        if (prev.some(u => (u.account_id || u.id) === (activeUser.account_id || activeUser.id))) return prev;
        return [activeUser, ...prev];
      });
    } catch (error) {
      console.error('Failed to accept roommate:', error);
      if (error?.status === 402) {
        setMatchActionError(error);
      }
    }
  };

  const skipActiveUser = async () => {
    if (!activeUser || isSkipping) return;

    const skippedUser = activeUser;
    setIsSkipping(true);
    setShowContactCard(false);

    const targetId = skippedUser.account_id || skippedUser.accountId || String(skippedUser.id).replace('m-', '');

    try {
      console.log('Rejecting roommate with ID:', targetId);
      await rejectRoommateMutation(targetId).unwrap();
      
      setSkippedUsers(prev => {
        if (prev.some(u => (u.account_id || u.id) === (skippedUser.account_id || skippedUser.id))) return prev;
        return [skippedUser, ...prev];
      });
    } catch (error) {
      console.error('Failed to reject roommate:', error);
    }

    window.setTimeout(() => {
      setActiveIndex((index) => index + 1);
      setIsSkipping(false);
      setIsRevealed(false);
    }, 520);
  };

  const hideFocusedCard = () => {
    setIsRevealed(false);
    setShowContactCard(false);
    setIsSkipping(false);
  };

  return {
    isLoading,
    step,
    showProfileForm,
    showContactForm,
    hasProfile,
    hasContactInfo,
    currentUserContact,
    currentProfile,
    activeUser,
    availableUsers,
    matchHistory,
    skippedUsers,
    isRevealed,
    isFlipping,
    isSkipping,
    showContactCard,
    setShowProfileForm,
    setShowContactForm,
    setShowContactCard,
    completeProfile,
    completeContactInfo,
    startMatching,
    revealCard,
    showActiveUserContact,
    skipActiveUser,
    hideFocusedCard,
    suggestionsError,
    matchActionError,
    clearMatchActionError: () => setMatchActionError(null)
  };
};
