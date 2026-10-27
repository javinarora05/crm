import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';

// Helper to compute invoice financial totals
const calculateTotals = (items = [], taxRate = 0) => {
  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const lineTotal = Number((qty * price).toFixed(2));
    return {
      product: item.product || undefined,
      itemName: item.itemName,
      description: item.description || '',
      quantity: qty,
      price: price,
      total: lineTotal,
    };
  });

  const subTotal = Number(
    processedItems.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)
  );
  const taxPercent = Number(taxRate) || 0;
  const taxTotal = Number(((subTotal * taxPercent) / 100).toFixed(2));
  const total = Number((subTotal + taxTotal).toFixed(2));

  return { processedItems, subTotal, taxPercent, taxTotal, total };
};

// @desc   Get all invoices
// @route  GET /api/v1/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const { status, paymentStatus, client, page = 1, limit = 50 } = req.query;
    const filter = { removed: false };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (client) filter.client = client;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .populate('client', 'name company email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      result: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single invoice
// @route  GET /api/v1/invoices/:id
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, removed: false })
      .populate('client', 'name company email phone country address')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.json({
      success: true,
      result: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Create invoice
// @route  POST /api/v1/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const { client, date, expiredDate, items, taxRate, currency, notes, status } = req.body;

    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client is required',
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Invoice must have at least one line item',
      });
    }

    // Verify client exists
    const clientExists = await Client.findOne({ _id: client, removed: false });
    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: 'Specified client does not exist',
      });
    }

    const currentYear = new Date(date || Date.now()).getFullYear();

    // Find next invoice sequential number for current year
    const lastInvoice = await Invoice.findOne({ year: currentYear }).sort({ number: -1 });
    const nextNumber = lastInvoice ? lastInvoice.number + 1 : 1;

    const { processedItems, subTotal, taxPercent, taxTotal, total } = calculateTotals(
      items,
      taxRate
    );

    const initialStatus = status || 'pending';
    const initialPaymentStatus = initialStatus === 'paid' ? 'paid' : 'unpaid';

    const invoice = await Invoice.create({
      number: nextNumber,
      year: currentYear,
      client,
      date: date || new Date(),
      expiredDate: expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      items: processedItems,
      subTotal,
      taxRate: taxPercent,
      taxTotal,
      total,
      currency: currency || 'USD',
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      notes: notes || '',
      createdBy: req.admin._id,
    });

    const populatedInvoice = await Invoice.findById(invoice._id).populate(
      'client',
      'name company email phone'
    );

    res.status(201).json({
      success: true,
      result: populatedInvoice,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update invoice
// @route  PUT /api/v1/invoices/:id
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, removed: false });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const { client, date, expiredDate, items, taxRate, currency, notes, status, paymentStatus } =
      req.body;

    if (client) invoice.client = client;
    if (date) invoice.date = date;
    if (expiredDate) invoice.expiredDate = expiredDate;
    if (currency) invoice.currency = currency;
    if (notes !== undefined) invoice.notes = notes;
    if (status) {
      invoice.status = status;
      if (status === 'paid') invoice.paymentStatus = 'paid';
    }
    if (paymentStatus) invoice.paymentStatus = paymentStatus;

    if (items || taxRate !== undefined) {
      const itemsToUse = items || invoice.items;
      const rateToUse = taxRate !== undefined ? taxRate : invoice.taxRate;
      const { processedItems, subTotal, taxPercent, taxTotal, total } = calculateTotals(
        itemsToUse,
        rateToUse
      );
      invoice.items = processedItems;
      invoice.subTotal = subTotal;
      invoice.taxRate = taxPercent;
      invoice.taxTotal = taxTotal;
      invoice.total = total;
    }

    const updated = await invoice.save();
    const populated = await Invoice.findById(updated._id).populate(
      'client',
      'name company email phone'
    );

    res.json({
      success: true,
      result: populated,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update invoice status
// @route  PATCH /api/v1/invoices/:id/status
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const invoice = await Invoice.findOne({ _id: req.params.id, removed: false });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    if (status) {
      invoice.status = status;
      if (status === 'paid') {
        invoice.paymentStatus = 'paid';
      }
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        invoice.status = 'paid';
      }
    }

    await invoice.save();

    res.json({
      success: true,
      result: invoice,
      message: 'Invoice status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete invoice (soft delete)
// @route  DELETE /api/v1/invoices/:id
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, removed: false });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    invoice.removed = true;
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
