export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '123-456-7890',
    address: '123 Main St, City',
    role: 'user',
    status: 'active',
    lastLogin: '2024-03-05T14:30:00',
    createdAt: '2024-01-15T10:00:00',
    token: 'mock-token-123'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '098-765-4321',
    address: '456 Oak Ave, Town',
    role: 'user',
    status: 'active',
    lastLogin: '2024-03-04T09:15:00',
    createdAt: '2024-01-20T11:00:00',
    token: 'mock-token-456'
  },
  {
    id: 3,
    name: 'Dr. Sarah Wilson',
    email: 'vet@example.com',
    password: 'vet123',
    phone: '555-123-4567',
    address: 'PetEase Veterinary Clinic',
    role: 'vet',
    status: 'active',
    lastLogin: '2024-03-05T16:00:00',
    createdAt: '2024-01-10T08:00:00',
    token: 'mock-token-vet'
  },
  {
    id: 4,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '555-999-0000',
    address: 'PetEase HQ',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-03-05T17:00:00',
    createdAt: '2024-01-01T08:00:00',
    token: 'mock-token-admin'
  },
  {
    id: 5,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    phone: '555-111-2222',
    address: '789 Pine St, Village',
    role: 'user',
    status: 'suspended',
    lastLogin: '2024-02-28T10:00:00',
    createdAt: '2024-02-01T12:00:00',
    token: 'mock-token-789'
  }
];

export const mockPets = [
  {
    id: 1,
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    description: 'Friendly and energetic dog, loves to play fetch and go for walks. Great with kids and other pets.',
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
    status: 'available',
    ownerId: 1
  },
  {
    id: 2,
    name: 'Luna',
    type: 'cat',
    breed: 'Persian',
    age: 2,
    gender: 'female',
    description: 'Calm and affectionate cat, enjoys quiet environments and gentle petting. Perfect lap cat.',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    status: 'available',
    ownerId: 1
  },
  {
    id: 3,
    name: 'Buddy',
    type: 'dog',
    breed: 'Labrador',
    age: 5,
    gender: 'male',
    description: 'Well-trained and loyal companion. Loves swimming and outdoor activities.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    status: 'available',
    ownerId: 2
  },
  {
    id: 4,
    name: 'Bella',
    type: 'cat',
    breed: 'Siamese',
    age: 1,
    gender: 'female',
    description: 'Playful and curious kitten, very social and loves attention.',
    image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
    status: 'available',
    ownerId: 2
  },
  {
    id: 5,
    name: 'Charlie',
    type: 'dog',
    breed: 'Beagle',
    age: 4,
    gender: 'male',
    description: 'Energetic and friendly, great nose for tracking. Loves treats and adventures.',
    image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400',
    status: 'available',
    ownerId: 2
  },
  {
    id: 6,
    name: 'Milo',
    type: 'cat',
    breed: 'Maine Coon',
    age: 3,
    gender: 'male',
    description: 'Large and gentle giant, very friendly and sociable with everyone.',
    image: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=400',
    status: 'available',
    ownerId: 1
  }
];

export const mockMedicalHistory = [
  {
    id: 1,
    petId: 1,
    medication: 'Rabies Vaccine',
    date: '2024-01-15',
    notes: 'Annual rabies vaccination completed successfully'
  },
  {
    id: 2,
    petId: 1,
    medication: 'Deworming',
    date: '2024-02-20',
    notes: 'Routine deworming treatment administered'
  },
  {
    id: 3,
    petId: 2,
    medication: 'Flea Treatment',
    date: '2024-01-10',
    notes: 'Monthly flea and tick prevention applied'
  },
  {
    id: 4,
    petId: 2,
    medication: 'Distemper Vaccine',
    date: '2024-03-05',
    notes: 'Core vaccination updated'
  }
];

export const mockAppointments = [
  {
    id: 1,
    userId: 1,
    userName: 'John Doe',
    userPhone: '123-456-7890',
    type: 'consultation',
    date: '2024-03-11',
    time: '10:00 AM',
    status: 'confirmed',
    pets: [{ id: 1, name: 'Max', breed: 'Golden Retriever' }],
    notes: 'Regular checkup',
    attended: false,
    createdAt: '2024-03-01T08:00:00'
  },
  {
    id: 2,
    userId: 1,
    userName: 'John Doe',
    userPhone: '123-456-7890',
    type: 'anti-rabies',
    date: '2024-03-15',
    time: '02:00 PM',
    status: 'confirmed',
    pets: [{ id: 2, name: 'Luna', breed: 'Persian' }],
    notes: 'Annual vaccination',
    attended: false,
    createdAt: '2024-03-02T09:00:00'
  },
  {
    id: 3,
    userId: 2,
    userName: 'Jane Smith',
    userPhone: '098-765-4321',
    type: 'spay',
    date: '2024-03-18',
    time: '09:00 AM',
    status: 'pending',
    pets: [{ id: 4, name: 'Bella', breed: 'Siamese' }],
    notes: 'Spay surgery scheduled',
    attended: false,
    createdAt: '2024-03-03T10:00:00'
  },
  {
    id: 4,
    userId: 2,
    userName: 'Jane Smith',
    userPhone: '098-765-4321',
    type: 'consultation',
    date: '2024-03-08',
    time: '11:00 AM',
    status: 'completed',
    pets: [{ id: 3, name: 'Buddy', breed: 'Labrador' }],
    notes: 'Follow-up checkup',
    attended: true,
    createdAt: '2024-02-28T14:00:00'
  },
  {
    id: 5,
    userId: 1,
    userName: 'John Doe',
    userPhone: '123-456-7890',
    type: 'consultation',
    date: '2024-03-20',
    time: '03:00 PM',
    status: 'pending',
    pets: [{ id: 1, name: 'Max', breed: 'Golden Retriever' }],
    notes: 'Skin irritation check',
    attended: false,
    createdAt: '2024-03-04T11:00:00'
  }
];

export const mockAdoptionRequests = [
  {
    id: 1,
    petId: 1,
    petName: 'Max',
    adopterId: 2,
    adopterName: 'Jane Smith',
    adopterEmail: 'jane@example.com',
    adopterPhone: '098-765-4321',
    ownerId: 1,
    ownerName: 'John Doe',
    status: 'pending',
    message: 'I have a big yard and would love to give Max a great home!',
    rejectionReason: null,
    createdAt: '2024-03-01T10:00:00'
  },
  {
    id: 2,
    petId: 2,
    petName: 'Luna',
    adopterId: 5,
    adopterName: 'Bob Johnson',
    adopterEmail: 'bob@example.com',
    adopterPhone: '555-111-2222',
    ownerId: 1,
    ownerName: 'John Doe',
    status: 'pending',
    message: 'I live alone and would love a calm cat companion.',
    rejectionReason: null,
    createdAt: '2024-03-03T14:00:00'
  },
  {
    id: 3,
    petId: 6,
    petName: 'Milo',
    adopterId: 2,
    adopterName: 'Jane Smith',
    adopterEmail: 'jane@example.com',
    adopterPhone: '098-765-4321',
    ownerId: 1,
    ownerName: 'John Doe',
    status: 'approved',
    message: 'Maine Coons are my favorite breed!',
    rejectionReason: null,
    createdAt: '2024-02-20T09:00:00'
  },
  {
    id: 4,
    petId: 3,
    petName: 'Buddy',
    adopterId: 1,
    adopterName: 'John Doe',
    adopterEmail: 'john@example.com',
    adopterPhone: '123-456-7890',
    ownerId: 2,
    ownerName: 'Jane Smith',
    status: 'pending',
    message: 'I would love to adopt Buddy for my family.',
    rejectionReason: null,
    createdAt: '2024-03-05T11:00:00'
  }
];

export const mockMessages = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: 'Hi, I am interested in adopting Max. Is he still available?',
    isSent: true,
    createdAt: '2024-03-01T10:00:00'
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    content: 'Yes, Max is still available! Would you like to schedule a visit?',
    isSent: false,
    createdAt: '2024-03-01T10:15:00'
  }
];

export const mockConversations = [
  {
    id: 1,
    user: { id: 2, name: 'Jane Smith' },
    lastMessage: 'Yes, Max is still available! Would you like to schedule a visit?',
    updatedAt: '2024-03-01T10:15:00'
  }
];

export const mockNotifications = [
  {
    id: 1,
    userId: 1,
    title: 'Adoption Request Received',
    message: 'Your adoption request for Max has been received and is pending review.',
    isRead: false,
    createdAt: '2024-03-01T09:00:00'
  },
  {
    id: 2,
    userId: 1,
    title: 'Appointment Confirmed',
    message: 'Your consultation appointment for March 11 has been confirmed.',
    isRead: false,
    createdAt: '2024-03-01T08:00:00'
  },
  {
    id: 3,
    userId: 1,
    title: 'New Message',
    message: 'You have a new message from Jane Smith.',
    isRead: true,
    createdAt: '2024-02-28T15:00:00'
  }
];

export const mockAvailableDates = [
  '2024-03-11',
  '2024-03-18',
  '2024-03-25'
];

export const mockAnnouncements = [
  {
    id: 1,
    title: 'New Spay/Neuter Service Available',
    content: 'We are now offering spay and neuter services every Monday and Wednesday. Book your appointment today!',
    serviceType: 'spay',
    availableDates: ['2024-03-18', '2024-03-20', '2024-03-25'],
    status: 'pending',
    createdAt: '2024-03-01T09:00:00',
    createdBy: 'Dr. Sarah Wilson',
    createdById: 3,
    reviewedBy: null,
    reviewedAt: null
  },
  {
    id: 2,
    title: 'Extended Consultation Hours',
    content: 'Consultation hours now extended until 6 PM on weekdays.',
    serviceType: 'consultation',
    availableDates: [],
    status: 'approved',
    createdAt: '2024-02-28T10:00:00',
    createdBy: 'Dr. Sarah Wilson',
    createdById: 3,
    reviewedBy: 'Admin User',
    reviewedAt: '2024-02-28T11:00:00'
  },
  {
    id: 3,
    title: 'Emergency Services Now Available',
    content: 'We now offer 24/7 emergency veterinary services. Call our hotline for urgent cases.',
    serviceType: 'general',
    availableDates: [],
    status: 'approved',
    createdAt: '2024-02-25T08:00:00',
    createdBy: 'Dr. Sarah Wilson',
    createdById: 3,
    reviewedBy: 'Admin User',
    reviewedAt: '2024-02-25T09:00:00'
  }
];

export const mockAppointmentLogs = [
  {
    id: 1,
    appointmentId: 4,
    action: 'completed',
    performedBy: 'Dr. Sarah Wilson',
    notes: 'Checkup completed successfully. Pet is healthy.',
    timestamp: '2024-03-08T11:30:00'
  },
  {
    id: 2,
    appointmentId: 1,
    action: 'confirmed',
    performedBy: 'Dr. Sarah Wilson',
    notes: 'Appointment confirmed by vet staff',
    timestamp: '2024-03-01T09:00:00'
  }
];

export const mockAdoptionWaivers = [
  {
    id: 1,
    adoptionRequestId: 1,
    waiverDocument: 'waiver-001.pdf',
    uploadedBy: 'Dr. Sarah Wilson',
    uploadedAt: '2024-03-05T14:00:00',
    ownerSignature: true,
    adopterSignature: true,
    witnessSignature: true
  }
];

export const mockUserReports = [
  {
    id: 1,
    reportedUserId: 5,
    reportedUserName: 'Bob Johnson',
    reportedBy: 'Jane Smith',
    reporterId: 2,
    reason: 'Inappropriate behavior in messages',
    description: 'User sent offensive messages regarding pet adoption.',
    status: 'pending',
    createdAt: '2024-03-01T14:00:00',
    resolvedAt: null,
    resolvedBy: null
  },
  {
    id: 2,
    reportedUserId: 1,
    reportedUserName: 'John Doe',
    reportedBy: 'Jane Smith',
    reporterId: 2,
    reason: 'Spam',
    description: 'User repeatedly sent spam messages.',
    status: 'resolved',
    createdAt: '2024-02-28T10:00:00',
    resolvedAt: '2024-02-28T15:00:00',
    resolvedBy: 'Admin User',
    resolution: 'Warning issued to user'
  }
];

export const mockSystemAnnouncements = [
  {
    id: 1,
    title: 'System Maintenance Scheduled',
    content: 'PetEase will undergo scheduled maintenance on March 15, 2024 from 2:00 AM to 4:00 AM. Services will be temporarily unavailable.',
    type: 'maintenance',
    priority: 'high',
    status: 'active',
    createdAt: '2024-03-01T08:00:00',
    createdBy: 'Admin User',
    expiresAt: '2024-03-15T04:00:00'
  },
  {
    id: 2,
    title: 'New Feature: Pet Medical Records',
    content: 'We have added a new feature allowing you to view complete medical history of your pets.',
    type: 'feature',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-02-20T10:00:00',
    createdBy: 'Admin User',
    expiresAt: null
  }
];