const CustomFitRecord = require('../models/CustomFitRecord');

// @desc    Get all confirmed custom-fit checkout records for Admin "User Custom Fit" section
// @route   GET /api/custom-fits/admin
// @access  Private/Admin
exports.getAdminCustomFits = async (req, res) => {
  try {
    const { search = '', status = 'all' } = req.query;

    const query = {
      'confirmation.confirmed': true,
      'confirmation.policyAccepted': true,
      'order.paymentStatus': 'Paid'
    };

    if (status && status !== 'all') {
      query.tailoringStatus = status;
    }

    if (search && String(search).trim() !== '') {
      const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [
        { 'customer.name': regex },
        { 'customer.email': regex },
        { 'customer.phone': regex },
        { 'order.orderId': regex },
        { 'order.paymentId': regex },
        { 'product.name': regex },
        { 'product.productId': regex }
      ];
    }

    const records = await CustomFitRecord.find(query)
      .populate('customer.userId', 'name email phone address createdAt')
      .populate('product.productRef', 'name image price discount category tier gender role')
      .populate('order.orderRef', 'orderId paymentId orderStatus paymentStatus totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error('Error fetching admin custom-fit records:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to load custom fit records'
    });
  }
};

// @desc    Update tailoring status for a confirmed custom-fit record
// @route   PATCH /api/custom-fits/admin/:id/status
// @access  Private/Admin
exports.updateCustomFitStatus = async (req, res) => {
  try {
    const { tailoringStatus } = req.body;
    const validStatuses = ['Pending Tailoring', 'In Tailoring', 'Quality Check', 'Completed'];

    if (!validStatuses.includes(tailoringStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tailoring status'
      });
    }

    const record = await CustomFitRecord.findByIdAndUpdate(
      req.params.id,
      { tailoringStatus },
      { new: true, runValidators: true }
    )
      .populate('customer.userId', 'name email phone address createdAt')
      .populate('product.productRef', 'name image price discount category tier gender role')
      .populate('order.orderRef', 'orderId paymentId orderStatus paymentStatus totalAmount createdAt');

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Custom fit record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (err) {
    console.error('Error updating custom-fit tailoring status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update tailoring status'
    });
  }
};

