import DeliveryRiderProfile from '../models/DeliveryRiderProfile.js';
import { asyncHandler } from '../middleware/validation.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { deleteLocalFile } from '../middleware/upload.js';

/**
 * @desc    Get driver profile with user data and stats
 * @route   GET /api/driver-profile
 * @access  Private (Delivery Rider)
 */
export const getDriverProfile = asyncHandler(async (req, res) => {
  // Get driver profile with populated user data
  let profile = await DeliveryRiderProfile.findByUserId(req.user.id);

  // If no profile exists, create one with all fields initialized
  if (!profile) {
    profile = await DeliveryRiderProfile.create({
      userId: req.user.id,
      dateOfBirth: null,
      gender: null,
      address: {
        street: "",
        suburb: "",
        city: "",
        province: "",
        postalCode: "",
        country: "South Africa"
      },
      vehicle: {},
      documents: {},
      bankDetails: {},
      emergencyContact: null,
      workSchedule: [],
      currentLocation: null,
      serviceAreas: [],
      preferences: {
        maxDeliveriesPerDay: 20,
        preferredVehicleType: null,
        acceptCashPayments: true,
        autoAcceptOrders: false,
        notificationPreferences: {
          sms: true,
          email: true,
          push: true
        }
      }
    });
    // Re-fetch with populated user data
    profile = await DeliveryRiderProfile.findByUserId(req.user.id);
  }

  // Prepare stats
  const stats = {
    totalDeliveries: profile.stats?.totalDeliveries || 0,
    completedDeliveries: profile.stats?.completedDeliveries || 0,
    totalEarnings: profile.stats?.totalEarnings || 0,
    averageRating: profile.stats?.averageRating || null,
    completionRate: profile.stats?.completionRate || null,
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
 * @desc    Update driver profile
 * @route   PUT /api/driver-profile
 * @access  Private (Delivery Rider)
 */
export const updateDriverProfile = asyncHandler(async (req, res) => {
  const { dateOfBirth, gender, emergencyContact, address, preferredWorkAreas } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    // Create new profile if doesn't exist
    profile = await DeliveryRiderProfile.create({
      userId: req.user.id,
      dateOfBirth,
      gender,
      emergencyContact,
      address,
      preferredWorkAreas,
    });
  } else {
    // Update existing profile
    if (dateOfBirth !== undefined) {
      profile.dateOfBirth = dateOfBirth === null || dateOfBirth === "" ? undefined : dateOfBirth;
    }
    if (gender !== undefined) profile.gender = gender;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (address !== undefined) {
      if (address === null || Object.keys(address).length === 0) {
        profile.address = undefined;
      } else {
        profile.address = address;
      }
      profile.markModified('address'); // Mark nested object as modified
    }
    if (preferredWorkAreas !== undefined) profile.preferredWorkAreas = preferredWorkAreas;

    await profile.save();
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { profile },
  });
});

/**
 * @desc    Update vehicle information
 * @route   PUT /api/driver-profile/vehicle
 * @access  Private (Delivery Rider)
 */
export const updateVehicleInfo = asyncHandler(async (req, res) => {
  const { type, make, model, year, color, licensePlate, registrationNumber, insuranceNumber, insuranceExpiry, registrationExpiry } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  // Ensure vehicle object exists
  if (!profile.vehicle) {
    profile.vehicle = {};
  }

  // Update vehicle info
  if (type !== undefined) profile.vehicle.type = type;
  if (make !== undefined) profile.vehicle.make = make;
  if (model !== undefined) profile.vehicle.model = model;
  if (year !== undefined) profile.vehicle.year = year;
  if (color !== undefined) profile.vehicle.color = color;
  if (licensePlate !== undefined) profile.vehicle.licensePlate = licensePlate;
  if (registrationNumber !== undefined) profile.vehicle.registrationNumber = registrationNumber;
  if (insuranceNumber !== undefined) profile.vehicle.insuranceNumber = insuranceNumber;
  if (insuranceExpiry !== undefined) profile.vehicle.insuranceExpiry = insuranceExpiry;
  if (registrationExpiry !== undefined) profile.vehicle.registrationExpiry = registrationExpiry;

  profile.markModified('vehicle');
  await profile.save();

  res.json({
    success: true,
    message: 'Vehicle information updated successfully',
    data: { vehicle: profile.vehicle },
  });
});

/**
 * @desc    Upload/Update a specific document
 * @route   PUT /api/driver-profile/documents/:documentType
 * @access  Private (Delivery Rider)
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const { documentType } = req.params;

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
      documents: {},
    });
  }

  // Check if document can be uploaded/updated
  if (!profile.canUploadDocument(documentType)) {
    deleteLocalFile(req.file.path);
    return res.status(403).json({
      success: false,
      message: 'Cannot upload this document. Document is already verified. Contact admin if changes are needed.',
    });
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.path,
      `driver-documents/${req.user.id}`,
      'auto'
    );

    // Delete old document from Cloudinary if exists
    const oldDoc = profile.documents?.[documentType];
    if (oldDoc?.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(oldDoc.cloudinaryPublicId, uploadResult.resourceType);
      } catch (err) {
        console.error('Error deleting old document from Cloudinary:', err);
      }
    }

    // Prepare document data
    const documentData = {
      imageUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      ...req.body, // Include any additional fields like number, expiryDate, etc.
    };

    // Update document in database
    const updatedProfile = await profile.updateDocument(documentType, documentData);

    // Delete local file after successful upload
    deleteLocalFile(req.file.path);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: { 
        documentType,
        document: updatedProfile.documents?.[documentType] || {}
      },
    });
  } catch (error) {
    // Delete local file on error
    deleteLocalFile(req.file.path);
    
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Get all documents status
 * @route   GET /api/driver-profile/documents/status
 * @access  Private (Delivery Rider)
 */
export const getDocumentsStatus = asyncHandler(async (req, res) => {
  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  // If no profile exists, create one
  if (!profile) {
    profile = await DeliveryRiderProfile.create({
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
      documents: {},
    });
  }

  const documentsStatus = profile.getAllDocumentsStatus();
  const allVerified = profile.areAllDocumentsVerified();

  res.json({
    success: true,
    data: { 
      documents: documentsStatus,
      allVerified,
    },
  });
});

/**
 * @desc    Verify a driver's document (Admin only)
 * @route   PUT /api/driver-profile/documents/:documentType/verify
 * @access  Private (Admin)
 */
export const verifyDocument = asyncHandler(async (req, res) => {
  const { documentType } = req.params;
  const { driverId } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: driverId });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Driver profile not found',
    });
  }

  try {
    await profile.verifyDocument(documentType, req.user.id);

    res.json({
      success: true,
      message: 'Document verified successfully',
      data: { 
        documentType,
        document: profile.documents[documentType] 
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Reject a driver's document (Admin only)
 * @route   PUT /api/driver-profile/documents/:documentType/reject
 * @access  Private (Admin)
 */
export const rejectDocument = asyncHandler(async (req, res) => {
  const { documentType } = req.params;
  const { driverId, reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  let profile = await DeliveryRiderProfile.findOne({ userId: driverId });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Driver profile not found',
    });
  }

  try {
    await profile.rejectDocument(documentType, req.user.id, reason);

    res.json({
      success: true,
      message: 'Document rejected successfully',
      data: { 
        documentType,
        document: profile.documents[documentType] 
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc    Update availability schedule
 * @route   PUT /api/driver-profile/availability
 * @access  Private (Delivery Rider)
 */
export const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable, workingHours } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  // Ensure availability object exists
  if (!profile.availability) {
    profile.availability = {};
  }

  if (isAvailable !== undefined) profile.availability.isAvailable = isAvailable;
  if (workingHours !== undefined) profile.availability.workingHours = workingHours;

  profile.markModified('availability');
  await profile.save();

  res.json({
    success: true,
    message: 'Availability updated successfully',
    data: { availability: profile.availability },
  });
});

/**
 * @desc    Update current location
 * @route   PUT /api/driver-profile/location
 * @access  Private (Delivery Rider)
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
    });
  }

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  profile.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  profile.lastLocationUpdate = new Date();

  await profile.save();

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: { 
      currentLocation: profile.currentLocation,
      lastLocationUpdate: profile.lastLocationUpdate,
    },
  });
});

/**
 * @desc    Get driver statistics
 * @route   GET /api/driver-profile/stats
 * @access  Private (Delivery Rider)
 */
export const getDriverStats = asyncHandler(async (req, res) => {
  const profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Driver profile not found',
    });
  }

  res.json({
    success: true,
    data: {
      totalDeliveries: profile.stats.totalDeliveries,
      successfulDeliveries: profile.stats.successfulDeliveries,
      canceledDeliveries: profile.stats.canceledDeliveries,
      totalEarnings: profile.stats.totalEarnings,
      averageRating: profile.stats.averageRating,
      totalRatings: profile.stats.totalRatings,
      onTimeDeliveryRate: profile.stats.onTimeDeliveryRate,
      totalDistance: profile.stats.totalDistance,
    },
  });
});

/**
 * @desc    Update preferred work areas
 * @route   PUT /api/driver-profile/work-areas
 * @access  Private (Delivery Rider)
 */
export const updateWorkAreas = asyncHandler(async (req, res) => {
  const { preferredWorkAreas } = req.body;

  if (!preferredWorkAreas || !Array.isArray(preferredWorkAreas)) {
    return res.status(400).json({
      success: false,
      message: 'Preferred work areas must be an array',
    });
  }

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  profile.preferredWorkAreas = preferredWorkAreas;
  await profile.save();

  res.json({
    success: true,
    message: 'Preferred work areas updated successfully',
    data: { preferredWorkAreas: profile.preferredWorkAreas },
  });
});

/**
 * @desc    Get bank account details
 * @route   GET /api/driver-profile/bank-account
 * @access  Private (Delivery Rider)
 */
export const getBankAccount = asyncHandler(async (req, res) => {
  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  res.json({
    success: true,
    data: { bankDetails: profile.bankDetails || {} },
  });
});

/**
 * @desc    Update bank account details
 * @route   PUT /api/driver-profile/bank-account
 * @access  Private (Delivery Rider)
 */
export const updateBankAccount = asyncHandler(async (req, res) => {
  const { accountHolderName, accountNumber, bankName, branchCode, accountType } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  // Ensure bankDetails object exists
  if (!profile.bankDetails) {
    profile.bankDetails = {};
  }

  // Update bank account details
  if (accountHolderName !== undefined) profile.bankDetails.accountHolderName = accountHolderName;
  if (accountNumber !== undefined) profile.bankDetails.accountNumber = accountNumber;
  if (bankName !== undefined) profile.bankDetails.bankName = bankName;
  if (branchCode !== undefined) profile.bankDetails.branchCode = branchCode;
  if (accountType !== undefined) profile.bankDetails.accountType = accountType;

  profile.markModified('bankDetails');
  await profile.save();

  res.json({
    success: true,
    message: 'Bank account updated successfully',
    data: { bankDetails: profile.bankDetails },
  });
});

/**
 * @desc    Toggle online/offline status
 * @route   PUT /api/driver-profile/status
 * @access  Private (Delivery Rider)
 */
export const toggleOnlineStatus = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  if (typeof isAvailable !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isAvailable must be a boolean value',
    });
  }

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
      availability: {},
    });
  }

  profile.availability = profile.availability || {};
  profile.availability.isAvailable = isAvailable;
  await profile.save();

  res.json({
    success: true,
    message: `Status updated to ${isAvailable ? 'online' : 'offline'}`,
    data: { 
      isAvailable: profile.availability.isAvailable,
      availability: profile.availability,
    },
  });
});
