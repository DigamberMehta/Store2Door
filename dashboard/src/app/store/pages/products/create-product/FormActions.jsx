import { useNavigate } from "react-router-dom";

const FormActions = ({ loading, isEdit = false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate("/store/products")}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 font-medium shadow-lg shadow-green-500/30"
        >
          {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Product" : "Create Product")}
        </button>
      </div>
    </div>
  );
};

export default FormActions;

