const ChatMessage = require('../models/ChatMessage');
const Knowledge = require('../models/Knowledge');
const Hotel = require('../models/Hotel');
const Voucher = require('../models/Voucher');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user.id : null;
    console.log('Chat request from userId:', userId);

    // 1. Lưu tin nhắn của user (nếu đã đăng nhập)
    if (userId) {
      await ChatMessage.create({ userId, message, sender: 'user' });
    }
    
    let reply = "";
    
    // --- SỬA LỖI: Khai báo relevantDocs ở đây để dùng được trong khối catch ---
    let relevantDocs = []; 
    // ------------------------------------------------------------------------

    if (process.env.GEMINI_API_KEY) {
      try {
        // 2. Tạo embedding cho câu hỏi
        const embeddingResult = await embeddingModel.embedContent(message);
        const userEmbedding = embeddingResult.embedding.values;

        // 3. Tìm kiếm Vector Search
        // Lưu ý: Không dùng 'const' ở đây nữa, gán trực tiếp vào biến đã khai báo bên trên
        relevantDocs = await Knowledge.aggregate([
          {
            "$vectorSearch": {
              "index": "vector_index", 
              "path": "embedding",
              "queryVector": userEmbedding,
              "numCandidates": 100,
              "limit": 5 
            }
          },
          {
            "$project": {
              "_id": 0,
              "content": 1,
              "topic": 1,
              "score": { "$meta": "vectorSearchScore" }
            }
          }
        ]);

        // 4. Thu thập dữ liệu động (Dynamic Data)
        let dynamicData = "";
        const lowerMessage = message.toLowerCase();

        // Thống kê số lượng khách sạn
        if (lowerMessage.includes('số') && (lowerMessage.includes('khách sạn') || lowerMessage.includes('hotel'))) {
          const hotelCount = await Hotel.countDocuments();
          dynamicData += `TravelNow hiện có ${hotelCount} khách sạn trên toàn quốc.\n`;
        }

        // Thống kê giá
        if (lowerMessage.includes('giá') || lowerMessage.includes('phòng') || lowerMessage.includes('đắt') || lowerMessage.includes('rẻ')) {
          const priceStats = await Hotel.aggregate([
            { $group: { _id: null, minPrice: { $min: "$pricePerNight" }, maxPrice: { $max: "$pricePerNight" } } }
          ]);
          if (priceStats.length > 0) {
            dynamicData += `Giá phòng dao động từ ${priceStats[0].minPrice.toLocaleString()}đ đến ${priceStats[0].maxPrice.toLocaleString()}đ mỗi đêm.\n`;
          }
        }

        // Voucher/Ưu đãi
        if (lowerMessage.includes('ưu đãi') || lowerMessage.includes('voucher') || lowerMessage.includes('khuyến mãi')) {
          const activeVouchers = await Voucher.find({ isActive: true, validTo: { $gte: new Date() } }).limit(5);
          if (activeVouchers.length > 0) {
            dynamicData += `Các ưu đãi hiện có: ${activeVouchers.map(v => `${v.code}: ${v.description} (${v.discountPercentage}% giảm)`).join(', ')}.\n`;
          } else {
            dynamicData += "Hiện tại không có ưu đãi đặc biệt.\n";
          }
        }

        // Danh sách thành phố
        if (lowerMessage.includes('địa điểm') || lowerMessage.includes('thành phố') || lowerMessage.includes('ở đâu')) {
          const cities = await Hotel.distinct('city');
          dynamicData += `Chúng tôi có khách sạn tại các thành phố: ${cities.join(', ')}.\n`;
        }

        // Tìm khách sạn theo thành phố cụ thể
        const cityMatch = lowerMessage.match(/(?:ở|tại|trong)\s*([a-zA-Z\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]+)(?:\s|$)/i);
        if (cityMatch) {
          const city = cityMatch[1].trim();
          const hotelsInCity = await Hotel.find({ city: new RegExp(city, 'i') }).limit(5).select('name pricePerNight rating');
          if (hotelsInCity.length > 0) {
            dynamicData += `Khách sạn tại ${city}: ${hotelsInCity.map(h => `${h.name} (${h.pricePerNight.toLocaleString()}đ, ${h.rating}⭐)`).join(', ')}.\n`;
          }
        }

        // Tìm thông tin chi tiết 1 khách sạn
        const hotelMatch = lowerMessage.match(/(?:khách sạn|hotel)\s*([a-zA-Z\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]+)/i);
        if (hotelMatch) {
          const hotelName = hotelMatch[1].trim();
          const hotel = await Hotel.findOne({ name: new RegExp(hotelName, 'i') }).select('name city address pricePerNight rating amenities description');
          if (hotel) {
            dynamicData += `Thông tin về ${hotel.name}: Địa chỉ: ${hotel.address}, ${hotel.city}. Giá: ${hotel.pricePerNight.toLocaleString()}đ/đêm. Rating: ${hotel.rating}/5. ${hotel.description || ''}\n`;
          }
        }

        // 5. Xây dựng Context
        let context = "";
        if (relevantDocs.length > 0) {
          context = relevantDocs.map(doc => `- ${doc.topic}: ${doc.content}`).join("\n");
        }
        if (dynamicData) {
          context += "\n" + dynamicData;
        }

        // 6. Tạo Prompt
        const prompt = `
          Bạn là trợ lý ảo của TravelNow. Nhiệm vụ của bạn là trả lời khách hàng một cách NGẮN GỌN, SÚC TÍCH (tối đa 2-3 câu).
          
          Thông tin tham khảo:
          ---
          ${context}
          ---
          
          Yêu cầu:
          1. Trả lời thẳng vào vấn đề, không dài dòng.
          2. Dùng giọng điệu thân thiện, chuyên nghiệp.
          3. Nếu thông tin có trong phần tham khảo, hãy dùng nó. Nếu không, hãy trả lời dựa trên kiến thức chung về TravelNow.
          4. Giữ câu trả lời trong vòng 2-3 câu.
          
          Câu hỏi: ${message}
        `;

        // Hàm retry: Đã thêm xử lý lỗi 429 (Too Many Requests)
        const generateWithRetry = async (prompt, retries = 2) => {
          for (let i = 0; i <= retries; i++) {
            try {
              const result = await chatModel.generateContent(prompt);
              const response = await result.response;
              return response.text();
            } catch (error) {
              // Retry nếu lỗi 503 (Service Unavailable) hoặc 429 (Quota Exceeded)
              if ((error.status === 503 || error.status === 429) && i < retries) {
                console.log(`Retry ${i + 1} after error ${error.status}`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2s rồi thử lại
              } else {
                throw error;
              }
            }
          }
        };

        reply = await generateWithRetry(prompt);

      } catch (aiError) {
        console.error("Gemini/Vector Search Error:", aiError);
        
        // --- FALLBACK LOGIC ---
        // Nếu API lỗi (hết quota), trả về thông tin thô tìm được từ DB (nếu có)
        if (relevantDocs.length > 0) {
          reply = `Hiện tại kết nối AI đang gián đoạn, nhưng tôi tìm thấy thông tin này liên quan: "${relevantDocs[0].content.substring(0, 300)}..."`;
        } else {
          reply = "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau ít phút.";
        }
      }
    }

    // Fallback cuối cùng nếu reply vẫn rỗng
    if (!reply) {
       reply = "Xin lỗi, tôi chưa hiểu câu hỏi của bạn hoặc hệ thống đang bảo trì.";
    }

    // 7. Lưu câu trả lời của bot
    if (userId) {
      await ChatMessage.create({ userId, message: reply, sender: 'bot' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching history for userId:', userId);
    const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 });
    console.log('Found messages:', messages.length);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}