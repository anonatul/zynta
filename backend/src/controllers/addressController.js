const Address = require('../models/Address');

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { name, street, city, state, zip, phone, isDefault } = req.body;
    
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }
    
    const address = await Address.create({
      user: req.user.id,
      name,
      street,
      city,
      state,
      zip,
      phone,
      isDefault: isDefault || false
    });
    
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { name, street, city, state, zip, phone, isDefault } = req.body;
    
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    if (isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }
    
    Object.assign(address, { name, street, city, state, zip, phone, isDefault });
    await address.save();
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};