// Import the Telegram Bot API library
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // Load environment variables from .env

// Retrieve the bot token from the environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;

// Debugging logs
console.log('Environment variables loaded.');
console.log('Bot token:', token);

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });
console.log('Bot has started polling...');

// Sample data for your products
const products = [
  { id: 1, name: "Cliplink Black Sweatshirt", price: 50000, description: "Clip sweatshirt is made with the finest of fabrics.", image: "https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/80/462134/1.jpg?9574" },
  { id: 2, name: "Varsity Jacket", price: 33500, description: "White/Black Varsity Jacket With Joggers", image: "https://ng.jumia.is/unsafe/fit-in/150x150/filters:fill(white)/product/62/495795/1.jpg?4301" },
  { id: 3, name: "Hoodie", price: 33250, description: "Red And Black Jacket Hoodie With Black Jogger", image: "https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/36/464824/1.jpg?0021" },
];

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `👋 Hello ${msg.chat.first_name},\n\nWelcome to *Ola-ecommerce Bot*! 🛍️\nWe offer high-quality products at affordable prices. Use the following commands to explore:\n\n` +
    `/products - View our available products\n/help - Get assistance\n/contact - Contact our support team\n\n` +
    `Feel free to reach out for any inquiries. Happy shopping!`,
    { parse_mode: "Markdown" }
  );
});

// Handle the /products command
bot.onText(/\/products/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "🛒 *Our Products:*\nBrowse our high-quality items below.", { parse_mode: "Markdown" });

  products.forEach((product) => {
    const caption = `🛒 *${product.name}*\n💵 Price: ₦${product.price.toLocaleString()}\n📖 *Description:*\n${product.description}`;
    bot.sendPhoto(chatId, product.image, {
      caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: `🛍️ Buy ${product.name}`, callback_data: `buy_${product.id}` }],
        ],
      },
    });
  });
});

// Handle product purchase flow
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("buy_")) {
    const productId = parseInt(data.split("_")[1]);
    const product = products.find((p) => p.id === productId);

    if (product) {
      bot.sendMessage(
        chatId,
        `🛍️ You selected *${product.name}*.\n\n💵 *Price:* ₦${product.price.toLocaleString()}\n📦 Please confirm your order.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Confirm Order", callback_data: `confirm_${product.id}` }],
              [{ text: "❌ Cancel", callback_data: "cancel" }],
            ],
          },
        }
      );
    }
  } else if (data === "cancel") {
    bot.sendMessage(chatId, "❌ Your order has been canceled. Browse our products using /products.");
  }
});

// Handle order confirmation and shipping details
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("confirm_")) {
    const productId = parseInt(data.split("_")[1]);
    const product = products.find((p) => p.id === productId);

    if (product) {
      bot.sendMessage(
        chatId,
        `✅ *Order Confirmation:*\n\nYou selected *${product.name}* for ₦${product.price.toLocaleString()}.\n\n📋 Please provide your shipping details in the following format:\n\n` +
        `*Name:* Johnson Olayemi\n*Address:* 123 Main Street, Lagos\n*Phone:* +2348063856166`,
        { parse_mode: "Markdown" }
      );

      // Collect and display shipping details
      bot.once("message", (msg) => {
        const shippingDetails = msg.text;
        bot.sendMessage(
          chatId,
          `🎉 *Order Confirmed!*\n\n📦 *Product:* ${product.name}\n💵 *Total Price:* ₦${product.price.toLocaleString()}\n📍 *Shipping Details:*\n${shippingDetails}\n\n` +
          `🔗 Please proceed to payment using the link below:`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "💳 Pay Now", url: "http://wa.me/2348063856166" }],
              ],
            },
          }
        );
      });
    }
  }
});

// Handle the /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `ℹ️ *Help Menu:*\n\nUse the following commands to interact with the bot:\n` +
    `/start - Start the bot\n/products - View our available products\n/contact - Contact our support team\n/help - Show this help message\n\n` +
    `If you have further questions, please use /contact to reach our support team.`,
    { parse_mode: "Markdown" }
  );
});

// Handle the /contact command
bot.onText(/\/contact/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📞 *Contact Us:*\n\nFor inquiries, please reach out via:\n` +
    `📧 Email: support@Ola-ecommerce.com\n📱 Phone: +2348063856166\n\n` +
    `We are here to assist you!`,
    { parse_mode: "Markdown" }
  );

  // Add "Thanks for purchasing our products" message
  bot.sendMessage(
    chatId,
    `🙏 *Thank You!*\n\nThank you for purchasing our products. We appreciate your trust in us and will ensure timely delivery of your order. Feel free to contact us if you have any questions.\n\n` +
    `Have a great day! 😊`,
    { parse_mode: "Markdown" }
  );
});
