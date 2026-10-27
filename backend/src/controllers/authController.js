import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'idurar_crm_super_secret_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// @desc   Auth admin & get token
// @route  POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase(), removed: false });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!admin.enabled) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    res.json({
      success: true,
      result: {
        token: generateToken(admin._id),
        current: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      message: 'Successfully logged in',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get current logged in admin
// @route  GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      result: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
