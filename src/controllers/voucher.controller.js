const { VoucherService } = require('../services/voucher.service');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

class VoucherController {
  static createVoucher = asyncHandler(async (req, res) => {
    try {
      const voucher = await VoucherService.createVoucher(req.body);
      
      const response = {
        success: true,
        message: 'Voucher created successfully',
        data: voucher
      };
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to create voucher: ${error.message}`, 500);
    }
  });

  static getVouchers = asyncHandler(async (req, res) => {
    try {
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const vouchers = await VoucherService.getVouchers({ isActive });
      
      const response = {
        success: true,
        message: 'Vouchers retrieved successfully',
        data: vouchers
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve vouchers: ${error.message}`, 500);
    }
  });

  static getVoucherById = asyncHandler(async (req, res) => {
    try {
      const voucher = await VoucherService.getVoucherById(req.params.id);
      
      const response = {
        success: true,
        message: 'Voucher retrieved successfully',
        data: voucher
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve voucher: ${error.message}`, 500);
    }
  });

  static updateVoucher = asyncHandler(async (req, res) => {
    try {
      const voucher = await VoucherService.updateVoucher(req.params.id, req.body);
      
      const response = {
        success: true,
        message: 'Voucher updated successfully',
        data: voucher
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to update voucher: ${error.message}`, 500);
    }
  });

  static deleteVoucher = asyncHandler(async (req, res) => {
    try {
      await VoucherService.deleteVoucher(req.params.id);
      
      const response = {
        success: true,
        message: 'Voucher deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to delete voucher: ${error.message}`, 500);
    }
  });
}

module.exports = { VoucherController };


