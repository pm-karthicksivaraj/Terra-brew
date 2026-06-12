import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/price_ticker_model.dart';

class TickerFormDialog extends StatefulWidget {
  final PriceTickerModel? ticker;
  final Future<void> Function(Map<String, dynamic> data) onSubmit;

  const TickerFormDialog({
    super.key,
    this.ticker,
    required this.onSubmit,
  });

  @override
  State<TickerFormDialog> createState() => _TickerFormDialogState();
}

class _TickerFormDialogState extends State<TickerFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _commodityCtl = TextEditingController();
  final _priceCtl = TextEditingController();
  final _currencyCtl = TextEditingController();
  final _unitCtl = TextEditingController();
  final _sourceCtl = TextEditingController();
  final _changeCtl = TextEditingController();
  final _changePercentCtl = TextEditingController();
  bool _isLoading = false;

  bool get _isEditing => widget.ticker != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) {
      _commodityCtl.text = widget.ticker!.commodity;
      _priceCtl.text = widget.ticker!.price.toString();
      _currencyCtl.text = widget.ticker!.currency;
      _unitCtl.text = widget.ticker!.unit;
      _sourceCtl.text = widget.ticker!.source;
      _changeCtl.text = widget.ticker!.change.toString();
      _changePercentCtl.text = widget.ticker!.changePercent.toString();
    } else {
      _currencyCtl.text = '\$';
      _unitCtl.text = '/kg';
    }
  }

  @override
  void dispose() {
    _commodityCtl.dispose();
    _priceCtl.dispose();
    _currencyCtl.dispose();
    _unitCtl.dispose();
    _sourceCtl.dispose();
    _changeCtl.dispose();
    _changePercentCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _isEditing ? 'Edit Price Ticker' : 'Add Price Ticker',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _commodityCtl,
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Commodity is required' : null,
                  decoration: _inputDecoration('Commodity', 'Arabica Coffee'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _priceCtl,
                  keyboardType: TextInputType.number,
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Price is required' : null,
                  decoration: _inputDecoration('Price', '4.52'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _currencyCtl,
                        decoration: _inputDecoration('Currency', '\$'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _unitCtl,
                        decoration: _inputDecoration('Unit', '/kg'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _sourceCtl,
                  decoration:
                      _inputDecoration('Source', 'ICE Futures'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _changeCtl,
                        keyboardType:
                            const TextInputType.numberWithOptions(signed: true),
                        decoration:
                            _inputDecoration('Change', '0.12'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _changePercentCtl,
                        keyboardType:
                            const TextInputType.numberWithOptions(signed: true),
                        decoration:
                            _inputDecoration('Change %', '2.72'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            _isEditing ? 'Update' : 'Create',
                            style: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
      hintStyle: const TextStyle(fontSize: 13, color: AppColors.textTertiary),
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await widget.onSubmit({
        'commodity': _commodityCtl.text,
        'price': double.tryParse(_priceCtl.text) ?? 0,
        'currency': _currencyCtl.text,
        'unit': _unitCtl.text,
        'source': _sourceCtl.text,
        'change': double.tryParse(_changeCtl.text) ?? 0,
        'changePercent': double.tryParse(_changePercentCtl.text) ?? 0,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
