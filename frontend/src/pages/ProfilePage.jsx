import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/constants';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page-section">
      <div className="page-header">
        <h2>Profile</h2>
        <p>Your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-row">
          <span>Name</span>
          <strong>{user?.name}</strong>
        </div>
        <div className="profile-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="profile-row">
          <span>Account Created</span>
          <strong>{user?.created_at ? formatDate(user.created_at) : '-'}</strong>
        </div>
      </div>
    </div>
  );
}
