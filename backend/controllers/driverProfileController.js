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
  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id }).populate('userId', 'name email phone avatar');

  // If no profile exists, create one with all fields initialized
  if (!profile) {
    profile = await DeliveryRiderProfile.create({
      userId: req.user.id,
      dateOfBirth: null,
      gender: null,
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      vehicle: {
        type: null,
        make: "",
        model: "",
        year: null,
        color: "",
        licensePlate: "",
        registrationNumber: "",
        insuranceNumber: "",
        insuranceExpiry: null,
        registrationExpiry: null,
      },
      documents: {
        drivingLicense: {
          number: "",
          expiryDate: null,
          isVerified: false,
          imageUrl: "",
        },
        nationalId: {
          number: "",
          isVerified: false,
          imageUrl: "",
        },
        backgroundCheck: {
          status: "pending",
          completedAt: null,
          expiryDate: null,
        },
      },
      bankDetails: {
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        accountType: "checking",
        isVerified: false,
      },
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
        address: "",
      },
      isAvailable: false,
      workSchedule: [],
      currentLocation: null,
      serviceAreas: [],
      stats: {
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        totalEarnings: 0,
        totalTips: 0,
        averageRating: null,
        totalRatings: 0,
        completionRate: 100,
        averageDeliveryTime: null,
        onTimeDeliveryRate: 100,
      },
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
    profile = await DeliveryRiderProfile.findOne({ userId: req.user.id }).populate('userId', 'name email phone avatar');
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
    deleteLocalFile(req.file.path);
    return res.status(404).json({
      success: false,
      message: 'Profile not found. Please complete your profile first.',
    });
  }

  // Check if document is already verified (prevent re-upload of verified documents)
  // Exception: profilePhoto can be updated unlimited times without verification blocking
  const currentDoc = profile.documents?.[documentType];
  if (currentDoc?.isVerified && documentType !== 'profilePhoto') {
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
    // profilePhoto is auto-verified and needs no admin approval
    const isProfilePhoto = documentType === 'profilePhoto';
    const documentData = {
      imageUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      isVerified: isProfilePhoto, // Auto-verify profile photo
      status: isProfilePhoto ? 'verified' : 'pending', // Profile photo is instantly verified
      uploadedAt: new Date(),
      rejectionReason: null, // Clear any previous rejection reason
      ...req.body, // Include any additional fields like number, expiryDate, etc.
    };

    // Update document in database
    if (!profile.documents) {
      profile.documents = {};
    }
    profile.documents[documentType] = {
      ...profile.documents[documentType],
      ...documentData
    };
    profile.markModified('documents');
    await profile.save();

    // Delete local file after successful upload
    deleteLocalFile(req.file.path);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: { 
        documentType,
        document: profile.documents[documentType]
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

  // If no profile exists, return default documents status
  if (!profile) {
    const defaultDocs = {};
    // profilePhoto is handled separately via profile upload
    const docTypes = [
      'vehiclePhoto', 'idDocument', 'workPermit', 'driversLicence',
      'proofOfBankingDetails', 'proofOfAddress', 'vehicleLicense', 
      'thirdPartyInsurance', 'vehicleAssessment', 'carrierAgreement'
    ];
    
    docTypes.forEach(docType => {
      defaultDocs[docType] = {
        uploaded: false,
        status: 'not_uploaded',
        canReupload: true,
        isVerified: false,
        imageUrl: null
      };
    });

    return res.json({
      success: true,
      data: { 
        documents: defaultDocs,
        allVerified: false,
      },
    });
  }

  // Prepare documents status for all document types
  // profilePhoto is handled separately via profile upload
  const docTypes = [
    'vehiclePhoto', 'idDocument', 'workPermit', 'driversLicence',
    'proofOfBankingDetails', 'proofOfAddress', 'vehicleLicense', 
    'thirdPartyInsurance', 'vehicleAssessment', 'carrierAgreement'
  ];

  const documentsStatus = {};
  
  docTypes.forEach(docType => {
    const doc = profile.documents?.[docType];
    documentsStatus[docType] = {
      uploaded: !!doc?.imageUrl,
      status: doc?.status || 'not_uploaded',
      canReupload: doc?.status !== 'verified', // Can't reupload verified docs
      isVerified: doc?.isVerified || false,
      imageUrl: doc?.imageUrl || null,
      rejectionReason: doc?.rejectionReason || null,
      uploadedAt: doc?.uploadedAt || null,
    };
  });

  // Check if all required documents are verified
  // profilePhoto is optional and handled separately
  const requiredDocs = [
    'vehiclePhoto', 'idDocument', 'driversLicence',
    'proofOfBankingDetails', 'proofOfAddress', 'vehicleLicense',
    'thirdPartyInsurance', 'vehicleAssessment', 'carrierAgreement'
  ];
  
  const allVerified = requiredDocs.every(docType => 
    documentsStatus[docType]?.isVerified === true
  );

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
 * @desc    Update availability schedule (daily shift times)
 * @route   PUT /api/driver-profile/availability
 * @access  Private (Delivery Rider)
 */
export const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable, workSchedule } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
    });
  }

  if (isAvailable !== undefined) profile.isAvailable = isAvailable;
  
  // Handle workSchedule - array of shift time strings (e.g., ["07:00 AM - 08:00 AM"])
  // User can change these daily as needed
  if (workSchedule !== undefined) {
    profile.set('workSchedule', workSchedule);
    profile.markModified('workSchedule');
  }

  await profile.save();

  res.json({
    success: true,
    message: 'Availability updated successfully',
    data: { isAvailable: profile.isAvailable, workSchedule: profile.workSchedule },
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
 * @desc    Update preferred work areas (service areas)
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
    });
  }

  // Store as serviceAreas (simple array of area names)
  profile.set('serviceAreas', preferredWorkAreas);
  profile.markModified('serviceAreas');
  await profile.save();

  res.json({
    success: true,
    message: 'Preferred work areas updated successfully',
    data: { serviceAreas: profile.serviceAreas },
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
  const { accountHolderName, accountNumber, bankName, branchCode, routingNumber, accountType } = req.body;

  let profile = await DeliveryRiderProfile.findOne({ userId: req.user.id });

  if (!profile) {
    profile = await DeliveryRiderProfile.create({ 
      userId: req.user.id,
      vehicle: {},
      bankDetails: {},
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
  if (routingNumber !== undefined) profile.bankDetails.routingNumber = routingNumber;
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
    });
  }

  profile.isAvailable = isAvailable;
  await profile.save();

  res.json({
    success: true,
    message: `Status updated to ${isAvailable ? 'online' : 'offline'}`,
    data: { 
      isAvailable: profile.isAvailable,
    },
  });
});
