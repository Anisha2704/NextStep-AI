import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, saveProfile } from '../../store/slices/userSlice';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BasicInfoForm from '../../components/profile/BasicInfoForm';
import EducationForm from '../../components/profile/EducationForm';
import SkillsManager from '../../components/profile/SkillsManager';
import InterestsSelector from '../../components/profile/InterestsSelector';
import CareerGoalForm from '../../components/profile/CareerGoalForm';
import ProjectsManager from '../../components/profile/ProjectsManager';
import CertificationManager from '../../components/profile/CertificationManager';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/ui/Alert';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, saving, error } = useSelector((state) => state.user);

  const [basicInfo, setBasicInfo] = useState({});
  const [education, setEducation] = useState({});
  const [interests, setInterests] = useState([]);
  const [careerGoals, setCareerGoals] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setBasicInfo({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        profilePhoto: profile.profilePhoto || '',
      });
      setEducation(profile.education || {});
      setInterests(profile.interests || []);
      setCareerGoals(profile.careerGoals || {});
    }
  }, [profile]);

  const refreshProfile = () => dispatch(fetchProfile());

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const saveBasicInfo = async () => {
    const result = await dispatch(saveProfile(basicInfo));
    if (saveProfile.fulfilled.match(result)) showSuccess('Basic information saved');
  };

  const saveEducation = async () => {
    const result = await dispatch(saveProfile({ education }));
    if (saveProfile.fulfilled.match(result)) showSuccess('Education saved');
  };

  const saveInterests = async () => {
    const result = await dispatch(saveProfile({ interests }));
    if (saveProfile.fulfilled.match(result)) showSuccess('Interests saved');
  };

  const saveCareerGoals = async () => {
    const result = await dispatch(saveProfile({ careerGoals }));
    if (saveProfile.fulfilled.match(result)) showSuccess('Career goals saved');
  };

  const handleBasicChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (field, value) => {
    setEducation((prev) => ({ ...prev, [field]: value }));
  };

  const handleCareerChange = (field, value) => {
    setCareerGoals((prev) => ({ ...prev, [field]: value }));
  };

  if (loading && !profile) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {error && <Alert type="error" message={error} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <ProfileHeader
        profile={profile}
        onSavePhoto={() => {
          const url = window.prompt('Enter profile photo URL:', basicInfo.profilePhoto || '');
          if (url !== null) {
            handleBasicChange('profilePhoto', url);
            dispatch(saveProfile({ ...basicInfo, profilePhoto: url }));
          }
        }}
      />

      <BasicInfoForm
        data={basicInfo}
        onChange={handleBasicChange}
        onSave={saveBasicInfo}
        saving={saving}
      />

      <EducationForm
        data={education}
        onChange={handleEducationChange}
        onSave={saveEducation}
        saving={saving}
      />

      <SkillsManager skills={profile?.skills || []} onRefresh={refreshProfile} />

      <InterestsSelector
        interests={interests}
        onChange={setInterests}
        onSave={saveInterests}
        saving={saving}
      />

      <CareerGoalForm
        data={careerGoals}
        onChange={handleCareerChange}
        onSave={saveCareerGoals}
        saving={saving}
      />

      <ProjectsManager projects={profile?.projects || []} onRefresh={refreshProfile} />

      <CertificationManager
        certifications={profile?.certifications || []}
        onRefresh={refreshProfile}
      />
    </div>
  );
};

export default Profile;
