import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { userAPI } from "../../../../services/admin/api";
import { Search, Filter, Download, UserPlus, RefreshCw, X } from "lucide-react";
import UserStatsCards from "../../components/users/UserStatsCards";
import UserFilters from "../../components/users/UserFilters";
import UserTable from "../../components/users/UserTable";
import Pagination from "../../components/users/Pagination";
import TableSkeleton from "../../components/users/TableSkeleton";

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const tabs = [
    { id: "all", label: "All Users", role: "" },
    { id: "customer", label: "Customers", role: "customer" },
    { id: "store_manager", label: "Store Managers", role: "store_manager" },
    { id: "delivery_rider", label: "Delivery Riders", role: "delivery_rider" },
    { id: "admin", label: "Admins", role: "admin" },
  ];

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      const activeTabData = tabs.find((t) => t.id === activeTab);
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm || filters.search,
        isActive: filters.isActive,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...params,
      };

      // Tab role takes priority over filter role
      if (activeTabData.role) {
        queryParams.role = activeTabData.role;
      }

      const response = await userAPI.getAll(queryParams);

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await userAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers({ ...newFilters, page: 1 });
  };

  const handleResetFilters = (resetFilters) => {
    setFilters(resetFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers({ ...resetFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchUsers({ page });
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await userAPI.toggleStatus(userId);
      if (response.success) {
        toast.success(response.message);
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle user status");
    }
  };

  const handleEdit = (user) => {
    // TODO: Implement edit modal
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      const response = await userAPI.delete(userId);
      if (response.success) {
        toast.success("User deactivated successfully");
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to deactivate user");
    }
  };

  const handleViewDetails = (userId) => {
    // TODO: Implement view details modal or navigate to detail page
    toast.info("View details functionality coming soon");
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
    toast.success("Data refreshed");
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setShowFilters(false);
    // Reset role filter when changing tabs
    setFilters((prev) => ({ ...prev, role: "" }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers({ page: 1 });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers({ page: 1, search: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all platform users and their activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters
                  ? "text-white bg-green-600 hover:bg-green-700"
                  : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-green-600 border-green-600"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <UserStatsCards stats={stats} />

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        {showFilters && (
          <UserFilters
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        )}

        {/* Users Table */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <UserTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewDetails={handleViewDetails}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
