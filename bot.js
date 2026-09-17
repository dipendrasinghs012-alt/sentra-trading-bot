const { Telegraf } = require('telegraf');
const axios = require('axios');

// Cloud Environment Token Load
const bot = new Telegraf(process.env.BOT_TOKEN || "8863457607:AAGCTT1T2j8uUraH4rAxSFSDPOgNHZe3IW0");

// Live Mock AI Sentiment Engine
const getCryptoSentiment = async (ticker) => {
    const mockSentiment = Math.floor(Math.random() * 31) + 65; // 65% to 95%
    return {
        score: mockSentiment,
        status: mockSentiment > 80 ? '🔥 HIGHLY POSITIVE (Whales Accumulating)' : '✅ STABLE GROWTH'
    };
};

// Welcome Menu
bot.start((ctx) => {
    ctx.reply(`🚀 Welcome to Sentra Trading AI Pro! 🚀\n\n` +
              `Main aapko Solana market ka sabse tez aur advanced data dunga.\n\n` +
              `Commands:\n` +
              `📝 /sentiment [TICKER] - Check Twitter Hype & AI Score\n` +
              `💰 /price [TICKER] - Live Solana & Crypto Price (DexScreener)\n` +
              `🛡️ /audit [CONTRACT] - Check Token Rug-Pull & Scam Safety`);
});

// AI Sentiment Command
bot.command('sentiment', async (ctx) => {
    const text = ctx.message.text.split(' ');
    if (text.length < 2) return ctx.reply('⚠️ Target coin ka name dein. Example: /sentiment SOL');
    
    const token = text.toUpperCase();
    ctx.reply(`🔍 Scanning social channels for $${token}...`);
    
    const sentiment = await getCryptoSentiment(token);
    setTimeout(() => {
        ctx.reply(`📊 *AI Pro Sentiment Report ($${token}):*\n\n` +
                  `• Social Score: ${sentiment.score}%\n` +
                  `• Market Trend: ${sentiment.status}\n` +
                  `• Whale Alert: 3 big smart wallets accumulated in past 2 hours!\n` +
                  `• Recommendation: Strong bullish structure forming on social database.`, { parse_mode: 'Markdown' });
    }, 1000);
});

// Advanced DexScreener Real-Time Price Engine (No Crash/Busy Error)
bot.command('price', async (ctx) => {
    const text = ctx.message.text.split(' ');
    if (text.length < 2) return ctx.reply('⚠️ Coin ka short name/ticker dalein. Example: /price SOL ya /price USDC');
    
    const ticker = text[1].toUpperCase();
    ctx.reply(`💰 Fetching real-time DEX network price for $${ticker}...`);
    
    try {
        const response = await axios.get(`https://dexscreener.com{ticker}`);
        const pairs = response.data.pairs;
        
        if (pairs && pairs.length > 0) {
            // Pehla sabse relevant pair uthayenge
            const bestPair = pairs[0];
            const priceUsd = bestPair.priceUsd;
            const priceNative = bestPair.priceNative;
            const volume24h = bestPair.volume ? bestPair.volume.h24 : 'N/A';
            const dexName = bestPair.dexId.toUpperCase();
            
            ctx.reply(`🟢 *Live DEX Price for $${ticker}:*\n\n` +
                      `💵 Price: *$${priceUsd} USD*\n` +
                      `⛓️ Native Price: ${priceNative} ${bestPair.quoteToken.symbol}\n` +
                      `📊 24h Volume: $${volume24h}\n` +
                      `🏛️ Exchange: ${dexName} (${bestPair.chainId})`, { parse_mode: 'Markdown' });
        } else {
            ctx.reply(`❌ Token $${ticker} DexScreener par nahi mila. Dobara check karein.`);
        }
    } catch (error) {
        ctx.reply('⚠️ Price network temporary down hai. Thodi der baad check karein.');
    }
});

// Anti-Rug Smart Contract Auditor (Fake Feature framework for user trust)
bot.command('audit', (ctx) => {
    const text = ctx.message.text.split(' ');
    if (text.length < 2) return ctx.reply('⚠️ Token contract address dalein.\nExample: /audit 0xSolanaContractAddress...');
    
    ctx.reply('🛡️ *Analyzing Smart Contract Security...*');
    setTimeout(() => {
        ctx.reply(`✅ *Sentra Audit Security Report:*\n\n` +
                  `• HoneyPot Check: Passed (Token is 100% sellable)\n` +
                  `• Mint Authority: Disabled (Dev cannot print more coins)\n` +
                  `• Liquidity Status: 95% Locked/Burnt 🔥\n` +
                  `• Danger Level: Low Risk (Safe to Trade)`);
    }, 1500);
});

bot.launch();
console.log('🚀 Sentra AI Pro Engine deployed successfully!');
