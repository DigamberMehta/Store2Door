import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { userAPI } from "../../../../../services/admin/api";
import { DeleteConfirmModal } from "../../../components/users/delete";
import UserBasicInfo from "../../../components/users/detail/UserBasicInfo";
import UserStatsCard from "../../../components/users/detail/UserStatsCard";
import CustomerProfileSection from "../../../components/users/detail/CustomerProfileSection";
import DeliveryRiderProfileSection from "../../../components/users/detail/DeliveryRiderProfileSection";
import StoreManagerSection from "../../../components/users/detail/StoreManagerSection";
import RecentActivitySection from "../../../components/users/detail/RecentActivitySection";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getById(id);

      if (response.success) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await userAPI.toggleStatus(id);
      if (response.success) {
        toast.success(response.message);
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle user status");
    }
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeletingUser(true);
      const response = await userAPI.delete(id);
      if (response.success) {
        toast.success("User deactivated successfully");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to deactivate user");
    } finally {
      setDeletingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-500 mb-4">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const {
    user,
    profile,
    stats,
    recentOrders,
    recentDeliveries,
    recentStoreOrders,
  } = userData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                User Details
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                View and manage user information
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                user.isActive
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-green-600 bg-green-50 hover:bg-green-100"
              }`}
            >
              {user.isActive ? (
                <>
                  <ToggleLeft className="w-3.5 h-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="w-3.5 h-3.5" />
                  Activate
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <UserBasicInfo user={user} />

        {/* Statistics */}
        <UserStatsCard stats={stats} role={user.role} />

        {/* Role-Specific Profile */}
        {user.role === "customer" && (
          <CustomerProfileSection profile={profile} />
        )}
        {user.role === "delivery_rider" && (
          <DeliveryRiderProfileSection profile={profile} />
        )}
        {user.role === "store_manager" && (
          <StoreManagerSection storeData={user.storeId} />
        )}

        {/* Recent Activity */}
        <RecentActivitySection
          orders={recentOrders}
          deliveries={recentDeliveries}
          storeOrders={recentStoreOrders}
          role={user.role}
          userId={id}
        />
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deletingUser) {
            setDeleteModalOpen(false);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They will no longer be able to access the platform."
        itemName={
          userData?.user ? `${userData.user.name} (${userData.user.email})` : ""
        }
        loading={deletingUser}
      />
    </div>
  );
};

export default UserDetailPage;
