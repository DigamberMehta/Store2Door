import CustomerProfile from "../models/CustomerProfile.js";
import { asyncHandler } from "../middleware/validation.js";

/**
 * @desc    Get customer profile with user data and stats
 * @route   GET /api/customer-profile
 * @access  Private (Customer)
 */
export const getCustomerProfile = asyncHandler(async (req, res) => {
  // Get customer profile with populated user data
  let profile = await CustomerProfile.findByUserId(req.user.id);

  // If no profile exists, create one
  if (!profile) {
    profile = await CustomerProfile.create({
      userId: req.user.id,
    });
    // Re-fetch with populated user data
    profile = await CustomerProfile.findByUserId(req.user.id);
  }

  // Prepare stats
  const stats = {
    totalOrders: profile.totalOrders,
    totalSpent: profile.totalSpent,
    averageRating: profile.averageRating,
    memberSince: profile.createdAt,
  };

  res.json({
    success: true,
    data: {
      user: req.user, // From auth middleware
      profile: profile,
      stats: stats,
    },
  });
});

/**
 * @desc    Update customer profile
 * @route   PUT /api/customer-profile
 * @access  Private (Customer)
 */
export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const { dateOfBirth, gender, emergencyContact, preferences } = req.body;

  let profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    // Create new profile if doesn't exist
    profile = await CustomerProfile.create({
      userId: req.user.id,
      dateOfBirth,
      gender,
      emergencyContact,
      preferences,
    });
  } else {
    // Update existing profile
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (emergencyContact !== undefined)
      profile.emergencyContact = emergencyContact;
    if (preferences !== undefined) {
      profile.preferences = { ...profile.preferences, ...preferences };
    }

    await profile.save();
  }

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: { profile },
  });
});

/**
 * @desc    Get all customer addresses
 * @route   GET /api/customer-profile/addresses
 * @access  Private (Customer)
 */
export const getCustomerAddresses = asyncHandler(async (req, res) => {
  const profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Customer profile not found",
    });
  }

  res.json({
    success: true,
    data: {
      addresses: profile.addresses,
      defaultAddress: profile.defaultAddress,
    },
  });
});

/**
 * @desc    Add new delivery address
 * @route   POST /api/customer-profile/addresses
 * @access  Private (Customer)
 */
export const addCustomerAddress = asyncHandler(async (req, res) => {
  const {
    label,
    street,
    city,
    state,
    zipCode,
    country,
    latitude,
    longitude,
    instructions,
    isDefault,
  } = req.body;

  let profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    // Create profile if doesn't exist
    profile = await CustomerProfile.create({ userId: req.user.id });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    profile.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddress = {
    label,
    street,
    city,
    state,
    zipCode,
    country: country || "US",
    latitude,
    longitude,
    instructions,
    isDefault: isDefault || profile.addresses.length === 0, // First address is default
  };

  profile.addresses.push(newAddress);
  await profile.save();

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: {
      address: profile.addresses[profile.addresses.length - 1],
      addresses: profile.addresses,
    },
  });
});

/**
 * @desc    Update delivery address
 * @route   PUT /api/customer-profile/addresses/:addressId
 * @access  Private (Customer)
 */
export const updateCustomerAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    label,
    street,
    city,
    state,
    zipCode,
    country,
    latitude,
    longitude,
    instructions,
    isDefault,
  } = req.body;

  const profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Customer profile not found",
    });
  }

  const address = profile.addresses.id(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    profile.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // Update address fields
  if (label !== undefined) address.label = label;
  if (street !== undefined) address.street = street;
  if (city !== undefined) address.city = city;
  if (state !== undefined) address.state = state;
  if (zipCode !== undefined) address.zipCode = zipCode;
  if (country !== undefined) address.country = country;
  if (latitude !== undefined) address.latitude = latitude;
  if (longitude !== undefined) address.longitude = longitude;
  if (instructions !== undefined) address.instructions = instructions;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await profile.save();

  res.json({
    success: true,
    message: "Address updated successfully",
    data: {
      address,
      addresses: profile.addresses,
    },
  });
});

/**
 * @desc    Delete delivery address
 * @route   DELETE /api/customer-profile/addresses/:addressId
 * @access  Private (Customer)
 */
export const deleteCustomerAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Customer profile not found",
    });
  }

  const address = profile.addresses.id(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  const wasDefault = address.isDefault;

  // Remove the address
  profile.addresses.pull(addressId);

  // If deleted address was default, make the first remaining address default
  if (wasDefault && profile.addresses.length > 0) {
    profile.addresses[0].isDefault = true;
  }

  await profile.save();

  res.json({
    success: true,
    message: "Address deleted successfully",
    data: { addresses: profile.addresses },
  });
});

/**
 * @desc    Set default address
 * @route   PUT /api/customer-profile/addresses/:addressId/default
 * @access  Private (Customer)
 */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Customer profile not found",
    });
  }

  const address = profile.addresses.id(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found",
    });
  }

  // Unset all default addresses
  profile.addresses.forEach((addr) => {
    addr.isDefault = false;
  });

  // Set this address as default
  address.isDefault = true;

  await profile.save();

  res.json({
    success: true,
    message: "Default address updated successfully",
    data: {
      addresses: profile.addresses,
      defaultAddress: profile.defaultAddress,
    },
  });
});

/**
 * @desc    Update customer preferences
 * @route   PUT /api/customer-profile/preferences
 * @access  Private (Customer)
 */
export const updateCustomerPreferences = asyncHandler(async (req, res) => {
  const {
    preferredCategories,
    dietaryRestrictions,
    spiceLevel,
    deliveryInstructions,
    communicationPreferences,
  } = req.body;

  let profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await CustomerProfile.create({ userId: req.user.id });
  }

  // Update preferences
  const updatedPreferences = { ...profile.preferences };

  if (preferredCategories !== undefined)
    updatedPreferences.preferredCategories = preferredCategories;
  if (dietaryRestrictions !== undefined)
    updatedPreferences.dietaryRestrictions = dietaryRestrictions;
  if (spiceLevel !== undefined) updatedPreferences.spiceLevel = spiceLevel;
  if (deliveryInstructions !== undefined)
    updatedPreferences.deliveryInstructions = deliveryInstructions;
  if (communicationPreferences !== undefined) {
    updatedPreferences.communicationPreferences = {
      ...updatedPreferences.communicationPreferences,
      ...communicationPreferences,
    };
  }

  profile.preferences = updatedPreferences;
  await profile.save();

  res.json({
    success: true,
    message: "Preferences updated successfully",
    data: { preferences: profile.preferences },
  });
});

/**
 * @desc    Get customer order statistics
 * @route   GET /api/customer-profile/stats
 * @access  Private (Customer)
 */
export const getCustomerStats = asyncHandler(async (req, res) => {
  const profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.json({
      success: true,
      data: {
        totalOrders: 0,
        totalSpent: 0,
        averageRating: null,
      },
    });
  }

  res.json({
    success: true,
    data: {
      totalOrders: profile.totalOrders,
      totalSpent: profile.totalSpent,
      averageRating: profile.averageRating,
      memberSince: profile.createdAt,
    },
  });
});

/**
 * @desc    Update last known location
 * @route   PUT /api/customer-profile/location
 * @access  Private (Customer)
 */
export const updateLastKnownLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required",
    });
  }

  let profile = await CustomerProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await CustomerProfile.create({ userId: req.user.id });
  }

  profile.lastKnownLocation = {
    latitude,
    longitude,
    timestamp: new Date(),
  };

  await profile.save();

  res.json({
    success: true,
    message: "Location updated successfully",
    data: { lastKnownLocation: profile.lastKnownLocation },
  });
});
