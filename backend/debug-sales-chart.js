import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";
import User from "./models/User.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas");

  const user = await User.findOne({ email: "digambermehta2603@gmail.com" });
  const storeId = user.storeId;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get last 7 days
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  console.log("Today:", today.toISOString());
  console.log("Last 7 days start:", last7Days.toISOString());

  // Get sales data
  const last7DaysSales = await Order.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: last7Days },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        totalSales: { $sum: "$total" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  console.log("\n=== AGGREGATION RESULT ===");
  console.log(JSON.stringify(last7DaysSales, null, 2));

  // Format sales chart data (last 7 days)
  const salesChartData = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  console.log("\n=== FORMATTED CHART DATA ===");
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayData = last7DaysSales.find((d) => d._id === dateStr);

    const chartPoint = {
      label: daysOfWeek[date.getDay()],
      date: dateStr,
      value: dayData?.totalSales || 0,
      orders: dayData?.totalOrders || 0,
    };

    console.log(chartPoint);
    salesChartData.push(chartPoint);
  }

  process.exit(0);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
