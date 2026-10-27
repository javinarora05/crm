import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';

// @desc   Get dashboard stats & overview
// @route  GET /api/v1/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalClients = await Client.countDocuments({ removed: false });
    const activeClients = await Client.countDocuments({ removed: false, status: 'active' });
    const totalProducts = await Product.countDocuments({ removed: false });
    const totalInvoices = await Invoice.countDocuments({ removed: false });

    // Financial aggregations
    const paidAggregation = await Invoice.aggregate([
      { $match: { removed: false, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = paidAggregation[0]?.total || 0;

    const unpaidAggregation = await Invoice.aggregate([
      { $match: { removed: false, paymentStatus: { $ne: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalUnpaid = unpaidAggregation[0]?.total || 0;

    // Recent 5 invoices
    const recentInvoices = await Invoice.find({ removed: false })
      .populate('client', 'name company email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 clients
    const recentClients = await Client.find({ removed: false })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      result: {
        summary: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalUnpaid: Number(totalUnpaid.toFixed(2)),
          totalClients,
          activeClients,
          totalProducts,
          totalInvoices,
        },
        recentInvoices,
        recentClients,
      },
    });
  } catch (error) {
    next(error);
  }
};
