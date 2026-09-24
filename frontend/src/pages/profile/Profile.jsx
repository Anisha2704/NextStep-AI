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
import { validateFullName, validateGraduationYear } from '../../utils/profileValidation';

const pickFields = (value, fields) => Object.fromEntries(fields
  .filter((field) => value[field] !== undefined)
  .map((field) => [field, value[field]]));

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, saving, error } = useSelector((state) => state.user);

  const [basicInfo, setBasicInfo] = useState({});
  const [education, setEducation] = useState({});
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interests, setInterests] = useState([]);
  const [careerGoals, setCareerGoals] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

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
      setExperienceLevel(profile.experienceLevel || '');
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
    const nameError = validateFullName(basicInfo.name || '');
    if (nameError) {
      setValidationMessage(nameError);
      return;
    }
    setValidationMessage('');
    const profileFields = Object.fromEntries(Object.entries(basicInfo).filter(([key]) => key !== 'email'));
    const result = await dispatch(saveProfile(profileFields));
    if (saveProfile.fulfilled.match(result)) showSuccess('Basic information saved');
  };

  const saveEducation = async () => {
    const yearError = validateGraduationYear(education.graduationYear);
    if (yearError) {
      setValidationMessage(yearError);
      return;
    }
    setValidationMessage('');
    const educationFields = pickFields(education, ['level', 'college', 'degree', 'branch', 'currentYear', 'graduationYear', 'cgpa']);
    const result = await dispatch(saveProfile({ education: educationFields, experienceLevel }));
    if (saveProfile.fulfilled.match(result)) showSuccess('Education saved');
  };

  const saveInterests = async () => {
    const result = await dispatch(saveProfile({ interests }));
    if (saveProfile.fulfilled.match(result)) showSuccess('Interests saved');
  };

  const saveCareerGoals = async () => {
    const goals = pickFields(careerGoals, ['targetJobRole', 'targetIndustry', 'preferredWorkType', 'preferredLocation', 'description', 'preferredDomains']);
    const result = await dispatch(saveProfile({ careerGoals: goals }));
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
      {!profile?.profileInitialized && (
        <Alert type="info" message="Welcome! Add your education, skills, and career interests to personalize your recommendations. Save any section to start your profile." />
      )}
      {error && <Alert type="error" message={error} />}
      {validationMessage && <Alert type="error" message={validationMessage} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <ProfileHeader
        profile={profile}
        onSavePhoto={() => {
          const url = window.prompt('Enter profile photo URL:', basicInfo.profilePhoto || '');
          if (url !== null) {
            handleBasicChange('profilePhoto', url);
            dispatch(saveProfile({ profilePhoto: url }));
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
        experienceLevel={experienceLevel}
        onExperienceChange={setExperienceLevel}
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
