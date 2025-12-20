// Seed script for inserting sample hotel data into MongoDB
// Usage: node scripts/seedHotels.js [--fresh]
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Hotel = require('../src/models/Hotel');

const hotels = [
  {
    name: 'Sơn Trà Ocean View Resort',
    city: 'Đà Nẵng',
    address: '34 Trường Sa, Ngũ Hành Sơn, Đà Nẵng',
    description:
      'Khu nghỉ dưỡng 5 sao với bãi biển riêng và hồ bơi vô cực nhìn ra biển Đông.',
    pricePerNight: 3200000,
    currency: 'VND',
    rating: 4.7,
    reviewCount: 812,
    distanceFromCenterKm: 6.5,
    imageUrls: [
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-resort-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-resort-2.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-resort-3.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-resort-4.jpg'
    ],
    tags: ['Resort', 'Biển', 'Gia đình'],
    amenities: [
      'Bữa sáng miễn phí',
      'Hồ bơi vô cực',
      'Spa toàn diện',
      'Đưa đón sân bay',
      'Bãi biển riêng'
    ],
    roomTypes: [
      {
        id: 'deluxe-ocean-view',
        name: 'Phòng Deluxe Hướng Biển',
        description: 'Phòng sang trọng với ban công hướng biển, giường king size',
        pricePerNight: 3200000,
        totalRooms: 15,
        maxGuests: 2,
        bedType: 'Giường King',
        size: 35,
        amenities: ['WiFi miễn phí', 'Ban công riêng', 'TV 55 inch', 'Minibar', 'Két an toàn'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-deluxe.jpg']
      },
      {
        id: 'family-suite-garden',
        name: 'Suite Gia Đình Hướng Vườn',
        description: 'Suite rộng rãi dành cho gia đình với 2 phòng ngủ',
        pricePerNight: 5500000,
        totalRooms: 8,
        maxGuests: 4,
        bedType: '1 Giường King + 2 Giường Đơn',
        size: 65,
        amenities: ['WiFi miễn phí', 'Phòng khách riêng', 'Bếp nhỏ', 'TV 65 inch', '2 Phòng tắm'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-suite.jpg']
      },
      {
        id: 'superior-room',
        name: 'Phòng Superior',
        description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi',
        pricePerNight: 2400000,
        totalRooms: 20,
        maxGuests: 2,
        bedType: 'Giường Queen',
        size: 28,
        amenities: ['WiFi miễn phí', 'TV 43 inch', 'Máy pha cà phê', 'Két an toàn'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/son-tra-superior.jpg']
      }
    ]
  },
  {
    name: 'Saigon Central Luxury Hotel',
    city: 'TP. Hồ Chí Minh',
    address: '88 Lý Tự Trọng, Quận 1, TP.HCM',
    description:
      'Khách sạn sang trọng giữa trung tâm quận 1 với dịch vụ concierge 24/7.',
    pricePerNight: 2450000,
    currency: 'VND',
    rating: 4.5,
    reviewCount: 1094,
    distanceFromCenterKm: 0.7,
    imageUrls: [
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/saigon-central-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/saigon-central-2.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/saigon-central-3.jpg'
    ],
    tags: ['Sang trọng', 'Công tác'],
    amenities: [
      'Phòng gym 24/7',
      'Hồ bơi trên mái',
      'Concierge',
      'Phòng hội nghị',
      'Dịch vụ giặt là'
    ],
    roomTypes: [
      {
        id: 'executive-city-view',
        name: 'Phòng Executive Hướng Thành Phố',
        description: 'Phòng cao cấp với góc làm việc và view thành phố',
        pricePerNight: 2450000,
        totalRooms: 25,
        maxGuests: 2,
        bedType: 'Giường King',
        size: 32,
        amenities: ['WiFi tốc độ cao', 'Bàn làm việc', 'TV 50 inch', 'Máy pha cà phé Nespresso', 'Minibar'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/saigon-executive.jpg']
      },
      {
        id: 'business-suite',
        name: 'Suite Doanh Nhân',
        description: 'Suite với phòng làm việc riêng và phòng khách',
        pricePerNight: 4200000,
        totalRooms: 10,
        maxGuests: 3,
        bedType: 'Giường King',
        size: 55,
        amenities: ['WiFi tốc độ cao', 'Phòng làm việc riêng', 'TV 65 inch', 'Bồn tắm massage', 'Butler service'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/saigon-suite.jpg']
      },
      {
        id: 'standard-room-sg',
        name: 'Phòng Standard',
        description: 'Phòng tiêu chuẩn hiện đại với đầy đủ tiện nghi',
        pricePerNight: 1800000,
        totalRooms: 30,
        maxGuests: 2,
        bedType: 'Giường Queen',
        size: 26,
        amenities: ['WiFi miễn phí', 'TV 43 inch', 'Két an toàn', 'Máy sấy tóc'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/saigon-standard.jpg']
      }
    ]
  },
  {
    name: 'Sapa Mountain Retreat',
    city: 'Sa Pa',
    address: 'Thôn Ý Linh Hồ, Sapa, Lào Cai',
    description:
      'Không gian nghỉ dưỡng hòa mình với thiên nhiên, view ruộng bậc thang tuyệt đẹp.',
    pricePerNight: 1850000,
    currency: 'VND',
    rating: 4.8,
    reviewCount: 536,
    distanceFromCenterKm: 2.1,
    imageUrls: [
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/sapa-retreat-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/sapa-retreat-2.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/sapa-retreat-3.jpg'
    ],
    tags: ['Thiên nhiên', 'Caphe sáng'],
    amenities: [
      'Tour trekking',
      'Bồn tắm nước nóng',
      'Nhà hàng địa phương',
      'Lửa trại buổi tối',
      'Xe đưa đón thị trấn'
    ],
    roomTypes: [
      {
        id: 'bungalow-mountain',
        name: 'Bungalow Hướng Núi',
        description: 'Bungalow gỗ ấm áp với view ruộng bậc thang',
        pricePerNight: 1850000,
        totalRooms: 12,
        maxGuests: 2,
        bedType: 'Giường Queen',
        size: 30,
        amenities: ['Lò sưởi', 'Ban công riêng', 'Bồn tắm nước nóng', 'WiFi', 'Trà địa phương'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/sapa-bungalow.jpg']
      },
      {
        id: 'family-villa',
        name: 'Villa Gia Đình',
        description: 'Villa rộng rãi cho gia đình với bếp nhỏ',
        pricePerNight: 3200000,
        totalRooms: 6,
        maxGuests: 4,
        bedType: '2 Giường Queen',
        size: 50,
        amenities: ['Lò sưởi', 'Bếp nhỏ', 'Phòng khách', 'Sân hiên rộng', '2 Phòng tắm'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/sapa-villa.jpg']
      },
      {
        id: 'standard-garden',
        name: 'Phòng Standard View Vườn',
        description: 'Phòng ấm cúng với view vườn trà',
        pricePerNight: 1200000,
        totalRooms: 18,
        maxGuests: 2,
        bedType: 'Giường Double',
        size: 22,
        amenities: ['Lò sưởi', 'WiFi', 'Nước nóng', 'Trà miễn phí'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/sapa-standard.jpg']
      }
    ]
  },
  {
    name: 'Ha Long Bay Cruise Suites',
    city: 'Hạ Long',
    address: 'Cảng Tuần Châu, Hạ Long, Quảng Ninh',
    description:
      'Trải nghiệm du thuyền cao cấp qua vịnh Hạ Long với phòng suite hướng vịnh.',
    pricePerNight: 4100000,
    currency: 'VND',
    rating: 4.6,
    reviewCount: 623,
    distanceFromCenterKm: 8.4,
    imageUrls: [
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/halong-cruise-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/halong-cruise-2.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/halong-cruise-3.jpg'
    ],
    tags: ['Du thuyền', 'Lãng mạn'],
    amenities: [
      'Bữa tối trên boong',
      'Chef riêng',
      'Kayak',
      'Spa trên tàu',
      'Lớp yoga bình minh'
    ],
    roomTypes: [
      {
        id: 'presidential-suite',
        name: 'Suite Tổng Thống Hướng Vịnh',
        description: 'Suite cao cấp nhất với ban công riêng và jacuzzi',
        pricePerNight: 8500000,
        totalRooms: 4,
        maxGuests: 2,
        bedType: 'Giường King Premium',
        size: 45,
        amenities: ['Jacuzzi riêng', 'Ban công rộng', 'Butler 24/7', 'Minibar cao cấp', 'Hệ thống âm thanh Bose'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/halong-presidential.jpg']
      },
      {
        id: 'deluxe-bay-view',
        name: 'Deluxe Suite Hướng Vịnh',
        description: 'Suite sang trọng với view vịnh Hạ Long tuyệt đẹp',
        pricePerNight: 4100000,
        totalRooms: 10,
        maxGuests: 2,
        bedType: 'Giường King',
        size: 35,
        amenities: ['Ban công riêng', 'Bồn tắm đứng', 'TV Smart', 'Két an toàn', 'Áo choàng cao cấp'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/halong-deluxe.jpg']
      },
      {
        id: 'superior-cabin',
        name: 'Superior Cabin',
        description: 'Cabin ấm cúng với cửa sổ lớn hướng vịnh',
        pricePerNight: 2800000,
        totalRooms: 16,
        maxGuests: 2,
        bedType: 'Giường Queen',
        size: 25,
        amenities: ['Cửa sổ lớn', 'Phòng tắm riêng', 'WiFi', 'TV', 'Minibar'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/halong-superior.jpg']
      }
    ]
  },
  {
    name: 'Hanoi Old Quarter Boutique Hotel',
    city: 'Hà Nội',
    address: '12 Hàng Bồ, Hoàn Kiếm, Hà Nội',
    description:
      'Khách sạn boutique ấm cúng ngay khu phố cổ với quầy bar sân thượng.',
    pricePerNight: 1450000,
    currency: 'VND',
    rating: 4.4,
    reviewCount: 954,
    distanceFromCenterKm: 0.3,
    imageUrls: [
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/hanoi-boutique-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/hanoi-boutique-2.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/hanoi-boutique-3.jpg'
    ],
    tags: ['Boutique', 'Đôi bạn'],
    amenities: [
      'Bar sân thượng',
      'Xe đạp miễn phí',
      'Tour ẩm thực',
      'Dịch vụ phòng 24/7',
      'Trà chiều'
    ],
    roomTypes: [
      {
        id: 'deluxe-old-quarter',
        name: 'Deluxe Phố Cổ',
        description: 'Phòng thiết kế Đông Dương với view phố cổ',
        pricePerNight: 1450000,
        totalRooms: 15,
        maxGuests: 2,
        bedType: 'Giường Queen',
        size: 28,
        amenities: ['WiFi tốc độ cao', 'Máy pha cà phê', 'TV Smart', 'Minibar', 'Bàn làm việc'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/hanoi-deluxe.jpg']
      },
      {
        id: 'rooftop-suite',
        name: 'Suite Sân Thượng',
        description: 'Suite với access riêng lên rooftop bar',
        pricePerNight: 2800000,
        totalRooms: 6,
        maxGuests: 2,
        bedType: 'Giường King',
        size: 40,
        amenities: ['Access rooftop riêng', 'Bồn tắm', 'Phòng khách', 'TV 55 inch', 'Welcome drink'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/hanoi-suite.jpg']
      },
      {
        id: 'standard-hanoi',
        name: 'Phòng Standard',
        description: 'Phòng ấm cúng phong cách Hà Nội xưa',
        pricePerNight: 980000,
        totalRooms: 22,
        maxGuests: 2,
        bedType: 'Giường Double',
        size: 20,
        amenities: ['WiFi miễn phí', 'TV', 'Điều hòa', 'Nước nóng', 'Tủ lạnh nhỏ'],
        images: ['https://res.cloudinary.com/demo/image/upload/v1734630000/travelnow/hanoi-standard.jpg']
      }
    ]
  }
];

async function seedHotels() {
  try {
    await connectDB();

    const shouldWipe = process.argv.includes('--fresh');
    if (shouldWipe) {
      const deleted = await Hotel.deleteMany({});
      console.log(`Đã xóa ${deleted.deletedCount} khách sạn cũ.`);
    }

    const existingNames = hotels.map((hotel) => hotel.name);
    await Hotel.deleteMany({ name: { $in: existingNames } });

    const inserted = await Hotel.insertMany(
      hotels.map((hotel) => ({
        ...hotel,
        imageUrl: hotel.imageUrls?.[0] || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    console.log(`Đã chèn ${inserted.length} khách sạn.`);
  } catch (error) {
    console.error('Lỗi khi seed khách sạn:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB.');
  }
}

seedHotels();
