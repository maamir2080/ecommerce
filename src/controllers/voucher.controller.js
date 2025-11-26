const { VoucherService } = require('../services/voucher.service');
const { asyncHandler } = require('../middleware/errorHandler');

class VoucherController {
  static createVoucher = asyncHandler(async (req, res) => {
    const voucher = await VoucherService.createVoucher(req.body);
    
    const response = {
      success: true,
      message: 'Voucher created successfully',
      data: voucher
    };
    
    res.status(201).json(response);
  });

  static getVouchers = asyncHandler(async (req, res) => {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const vouchers = await VoucherService.getVouchers({ isActive });
    
    const response = {
      success: true,
      message: 'Vouchers retrieved successfully',
      data: vouchers
    };
    
    res.status(200).json(response);
  });

  static getVoucherById = asyncHandler(async (req, res) => {
    const voucher = await VoucherService.getVoucherById(req.params.id);
    
    const response = {
      success: true,
      message: 'Voucher retrieved successfully',
      data: voucher
    };
    
    res.status(200).json(response);
  });

  static updateVoucher = asyncHandler(async (req, res) => {
    const voucher = await VoucherService.updateVoucher(req.params.id, req.body);
    
    const response = {
      success: true,
      message: 'Voucher updated successfully',
      data: voucher
    };
    
    res.status(200).json(response);
  });

  static deleteVoucher = asyncHandler(async (req, res) => {
    await VoucherService.deleteVoucher(req.params.id);
    
    const response = {
      success: true,
      message: 'Voucher deleted successfully'
    };
    
    res.status(200).json(response);
  });
}

module.exports = { VoucherController };


