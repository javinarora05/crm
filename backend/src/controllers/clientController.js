import Client from '../models/Client.js';

// @desc   Get all clients with search and filter
// @route  GET /api/v1/clients
export const getClients = async (req, res, next) => {
  try {
    const { q, status, page = 1, limit = 50 } = req.query;

    const filter = { removed: false };

    if (status && ['lead', 'active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Client.countDocuments(filter);
    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      result: clients,
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

// @desc   Get single client
// @route  GET /api/v1/clients/:id
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, removed: false });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }
    res.json({
      success: true,
      result: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Create new client
// @route  POST /api/v1/clients
export const createClient = async (req, res, next) => {
  try {
    const { name, company, email, phone, country, address, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields',
      });
    }

    const client = await Client.create({
      name,
      company,
      email: email.toLowerCase(),
      phone,
      country,
      address,
      status: status || 'active',
      createdBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      result: client,
      message: 'Client created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update client
// @route  PUT /api/v1/clients/:id
export const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, removed: false });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const { name, company, email, phone, country, address, status, enabled } = req.body;

    if (name !== undefined) client.name = name;
    if (company !== undefined) client.company = company;
    if (email !== undefined) client.email = email.toLowerCase();
    if (phone !== undefined) client.phone = phone;
    if (country !== undefined) client.country = country;
    if (address !== undefined) client.address = address;
    if (status !== undefined) client.status = status;
    if (enabled !== undefined) client.enabled = enabled;

    const updatedClient = await client.save();

    res.json({
      success: true,
      result: updatedClient,
      message: 'Client updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete client (soft delete)
// @route  DELETE /api/v1/clients/:id
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, removed: false });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    client.removed = true;
    await client.save();

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
