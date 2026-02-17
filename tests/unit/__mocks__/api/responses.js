/**
 * Базовые моки API ответов для тестирования
 */

// Авторизация
export const authResponses = {
  loginSuccess: {
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: 'user',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    },
    status: 200,
    message: 'Login successful'
  },

  loginError: {
    response: {
      data: {
        message: 'Invalid credentials'
      },
      status: 401
    }
  },

  registerSuccess: {
    data: {
      message: 'Registration successful. Please check your email for verification.'
    },
    status: 201
  },

  registerError: {
    response: {
      data: {
        message: 'User with this email already exists',
        errors: {
          email: ['Email already taken']
        }
      },
      status: 409
    }
  }
}

// Пользователь
export const userResponses = {
  profileSuccess: {
    data: {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
      address: {
        street: '123 Test St',
        city: 'Test City',
        country: 'Test Country',
        zipCode: '12345'
      },
      preferences: {
        language: 'en',
        currency: 'USD',
        notifications: true
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    },
    status: 200
  },

  updateProfileSuccess: {
    data: {
      message: 'Profile updated successfully'
    },
    status: 200
  },

  profileError: {
    response: {
      data: {
        message: 'Profile not found'
      },
      status: 404
    }
  }
}

// Контакты
export const contactsResponses = {
  contactsListSuccess: {
    data: [
      {
        id: 1,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '+1234567891',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        phone: '+1234567892',
        isDefault: false,
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ],
    status: 200
  },

  createContactSuccess: {
    data: {
      id: 3,
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      phone: '+1234567893',
      isDefault: false,
      createdAt: '2024-01-16T00:00:00.000Z'
    },
    status: 201
  },

  deleteContactSuccess: {
    data: {
      message: 'Contact deleted successfully'
    },
    status: 200
  }
}

// Автомобили
export const carsResponses = {
  carsListSuccess: {
    data: [
      {
        id: 1,
        name: 'Economy Sedan',
        type: 'economy',
        capacity: 4,
        luggage: 2,
        pricePerKm: 2.5,
        pricePerHour: 25,
        image: '/images/cars/economy.jpg',
        features: ['AC', 'Music', 'USB'],
        description: 'Comfortable economy car for city trips',
        isAvailable: true
      },
      {
        id: 2,
        name: 'Business Class',
        type: 'business',
        capacity: 4,
        luggage: 3,
        pricePerKm: 4.0,
        pricePerHour: 40,
        image: '/images/cars/business.jpg',
        features: ['AC', 'WiFi', 'Leather seats', 'Premium audio'],
        description: 'Premium business class vehicle',
        isAvailable: true
      },
      {
        id: 3,
        name: 'Luxury SUV',
        type: 'luxury',
        capacity: 6,
        luggage: 4,
        pricePerKm: 6.0,
        pricePerHour: 60,
        image: '/images/cars/luxury.jpg',
        features: ['AC', 'WiFi', 'Massage seats', '4WD', 'Mini bar'],
        description: 'Ultimate luxury experience',
        isAvailable: false
      }
    ],
    status: 200
  },

  carDetailsSuccess: {
    data: {
      id: 1,
      name: 'Economy Sedan',
      type: 'economy',
      capacity: 4,
      luggage: 2,
      pricePerKm: 2.5,
      pricePerHour: 25,
      image: '/images/cars/economy.jpg',
      gallery: [
        '/images/cars/economy-1.jpg',
        '/images/cars/economy-2.jpg',
        '/images/cars/economy-3.jpg'
      ],
      features: ['AC', 'Music', 'USB'],
      specifications: {
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        fuel: 'Hybrid',
        transmission: 'Automatic'
      },
      description: 'Comfortable economy car for city trips',
      isAvailable: true,
      availableLocations: ['Airport', 'City Center', 'Hotel']
    },
    status: 200
  }
}

// Заказы
export const ordersResponses = {
  ordersListSuccess: {
    data: [
      {
        id: 1,
        type: 'one-way',
        status: 'completed',
        pickupLocation: {
          address: 'Airport Terminal 1',
          lat: 51.1,
          lng: 45.3,
          type: 'airport'
        },
        dropoffLocation: {
          address: 'Grand Hotel Downtown',
          lat: 51.2,
          lng: 45.4,
          type: 'hotel'
        },
        pickupDate: '2024-01-15',
        pickupTime: '14:30',
        passengers: 2,
        luggage: 1,
        car: {
          id: 1,
          name: 'Economy Sedan',
          type: 'economy'
        },
        price: 85.50,
        currency: 'USD',
        distance: 25.3,
        duration: 35,
        driver: {
          name: 'Michael Johnson',
          phone: '+1234567890',
          rating: 4.8
        },
        createdAt: '2024-01-14T10:00:00.000Z',
        completedAt: '2024-01-15T15:05:00.000Z'
      },
      {
        id: 2,
        type: 'round-trip',
        status: 'pending',
        pickupLocation: {
          address: 'City Center Plaza',
          lat: 51.15,
          lng: 45.35,
          type: 'landmark'
        },
        dropoffLocation: {
          address: 'Business District Office',
          lat: 51.25,
          lng: 45.45,
          type: 'office'
        },
        returnLocation: {
          address: 'City Center Plaza',
          lat: 51.15,
          lng: 45.35,
          type: 'landmark'
        },
        pickupDate: '2024-01-20',
        pickupTime: '09:00',
        returnDate: '2024-01-20',
        returnTime: '17:00',
        passengers: 1,
        luggage: 0,
        car: {
          id: 2,
          name: 'Business Class',
          type: 'business'
        },
        price: 120.00,
        currency: 'USD',
        createdAt: '2024-01-16T08:00:00.000Z'
      }
    ],
    status: 200
  },

  createOrderSuccess: {
    data: {
      id: 3,
      message: 'Order created successfully',
      orderNumber: 'ORD-2024-001',
      estimatedArrival: '2024-01-20T09:05:00.000Z'
    },
    status: 201
  },

  orderDetailsSuccess: {
    data: {
      id: 1,
      type: 'one-way',
      status: 'completed',
      orderNumber: 'ORD-2024-001',
      pickupLocation: {
        address: 'Airport Terminal 1, Gate 5',
        lat: 51.1,
        lng: 45.3,
        type: 'airport',
        notes: 'Meet at arrivals hall'
      },
      dropoffLocation: {
        address: 'Grand Hotel Downtown, Main Entrance',
        lat: 51.2,
        lng: 45.4,
        type: 'hotel'
      },
      pickupDate: '2024-01-15',
      pickupTime: '14:30',
      actualPickupTime: '14:32',
      passengers: 2,
      luggage: 1,
      specialRequirements: ['Child seat', 'Non-smoking'],
      car: {
        id: 1,
        name: 'Economy Sedan',
        type: 'economy',
        licensePlate: 'ABC-123',
        color: 'Silver'
      },
      price: 85.50,
      currency: 'USD',
      distance: 25.3,
      duration: 35,
      actualDuration: 37,
      route: [
        { lat: 51.1, lng: 45.3 },
        { lat: 51.15, lng: 45.35 },
        { lat: 51.2, lng: 45.4 }
      ],
      driver: {
        id: 1,
        name: 'Michael Johnson',
        phone: '+1234567890',
        rating: 4.8,
        photo: '/images/drivers/driver-1.jpg'
      },
      payment: {
        method: 'card',
        status: 'completed',
        transactionId: 'txn_123456789'
      },
      createdAt: '2024-01-14T10:00:00.000Z',
      startedAt: '2024-01-15T14:32:00.000Z',
      completedAt: '2024-01-15T15:09:00.000Z'
    },
    status: 200
  },

  cancelOrderSuccess: {
    data: {
      message: 'Order cancelled successfully',
      refund: {
        amount: 85.50,
        currency: 'USD',
        processingTime: '3-5 business days'
      }
    },
    status: 200
  }
}

// Адреса (Google Places API)
export const addressResponses = {
  autocompleteSuccess: {
    data: {
      predictions: [
        {
          place_id: 'ChIJ1234567890',
          description: 'Airport Terminal 1, City Airport',
          structured_formatting: {
            main_text: 'Airport Terminal 1',
            secondary_text: 'City Airport'
          },
          types: ['airport', 'establishment']
        },
        {
          place_id: 'ChIJ0987654321',
          description: 'Grand Hotel Downtown, Main Street',
          structured_formatting: {
            main_text: 'Grand Hotel Downtown',
            secondary_text: 'Main Street'
          },
          types: ['lodging', 'establishment']
        }
      ],
      status: 'OK'
    },
    status: 200
  },

  placeDetailsSuccess: {
    data: {
      result: {
        place_id: 'ChIJ1234567890',
        name: 'Airport Terminal 1',
        formatted_address: 'Airport Terminal 1, City Airport, City, Country',
        geometry: {
          location: {
            lat: 51.1,
            lng: 45.3
          }
        },
        types: ['airport', 'establishment'],
        international_phone_number: '+1 234-567-8900',
        website: 'https://cityairport.com'
      },
      status: 'OK'
    },
    status: 200
  }
}

// Ошибки
export const errorResponses = {
  unauthorized: {
    response: {
      data: {
        message: 'Unauthorized access'
      },
      status: 401
    }
  },

  forbidden: {
    response: {
      data: {
        message: 'Access forbidden'
      },
      status: 403
    }
  },

  notFound: {
    response: {
      data: {
        message: 'Resource not found'
      },
      status: 404
    }
  },

  validationError: {
    response: {
      data: {
        message: 'Validation failed',
        errors: {
          email: ['Email is required'],
          password: ['Password must be at least 8 characters']
        }
      },
      status: 422
    }
  },

  serverError: {
    response: {
      data: {
        message: 'Internal server error'
      },
      status: 500
    }
  },

  networkError: {
    message: 'Network Error',
    code: 'ECONNABORTED'
  }
} 