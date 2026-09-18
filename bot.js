require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Token from Railway environment variable
const bot = new Telegraf(process.env.SentraTrading_bot);

if (!process.env.SentraTrading_bot) {
    console.error('❌ SentraTrading_bot env variable not set. Set it before starting the bot.');
    process.exit(1);
}

// Known Solana mint addresses for common tickers
const KNOWN_MINTS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    BONK: 'DezXAZ8z7PnrnMcgzRpi4vHYwiQ5S2X6C9sJCvQ5c6U5'
};

function resolveMint(input) {
    const upper = input.toUpperCase();
    return KNOWN_MINTS[upper] || input;
}

// ---------- Welcome Menu ----------
bot.start((ctx) => {
    ctx.reply(`🚀 Welcome to Sentra Trading AI Pro! 🚀\n\n` +
              `Real-time analytical data for the Solana market.\n\n` +
              `Available Commands:\n` +
              `📝 /sentiment [TICKER/MINT] - Market-behavior sentiment (live DEX data)\n` +
              `💰 /price [TICKER/MINT] - Fetch Live DEX & Crypto Prices\n` +
              `🛡️ /audit [MINT ADDRESS] - Real Solana token safety scan (RugCheck)`);
});

// ---------- /price ----------
bot.command('price', async (ctx) => {
    const parts = ctx.message.text.trim().split(/\s+/);
    if (parts.length < 2) {
        return ctx.reply('⚠️ Please provide a coin ticker or mint address.\nExample: /price SOL');
    }

    const rawInput = parts[1].trim();
    const mint = resolveMint(rawInput);
    const displaySymbol = rawInput.toUpperCase();

    ctx.reply('💰 Fetching live pool data from DexScreener...');

    try {
        const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        const pairs = response.data && response.data.pairs;

        if (pairs && pairs.length > 0) {
            const pair = pairs[0];
            const price = pair.priceUsd || '0.00';
            const baseSymbol = pair.baseToken ? pair.baseToken.symbol : displaySymbol;
            const volume24h = pair.volume ? (pair.volume.h24 || 0) : 0;

            return ctx.reply(`🟢 *Live DEX Price:*\n\n` +
                             `💵 Token: *$${baseSymbol.toUpperCase()}*\n` +
                             `💰 Price: *$${price} USD*\n` +
                             `🏛️ Platform: ${pair.dexId ? pair.dexId.toUpperCase() : 'N/A'}\n` +
                             `📊 24h Vol: $${Number(volume24h).toLocaleString()}`, { parse_mode: 'Markdown' });
        } else {
            return ctx.reply(`❌ No live price data found for *$${displaySymbol}*. Check the ticker or mint address.`, { parse_mode: 'Markdown' });
        }
    } catch (error) {
        console.error('DexScreener API Error (price):', error.message);
        return ctx.reply('⚠️ Could not fetch market data right now. Please try again shortly.');
    }
});

// ---------- /sentiment (real market-behavior proxy, no external key needed) ----------
bot.command('sentiment', async (ctx) => {
    const parts = ctx.message.text.trim().split(/\s+/);
    if (parts.length < 2) {
        return ctx.reply('⚠️ Please provide a target coin ticker or mint address.\nExample: /sentiment SOL');
    }

    const rawInput = parts[1].trim();
    const mint = resolveMint(rawInput);
    const displaySymbol = rawInput.toUpperCase();

    ctx.reply(`🔍 Analyzing live market behavior for $${displaySymbol}...`);

    try {
        const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
        const pairs = response.data && response.data.pairs;

        if (!pairs || pairs.length === 0) {
            return ctx.reply(`❌ No market data found for *$${displaySymbol}* to analyze.`, { parse_mode: 'Markdown' });
        }

        // Use the most liquid pair
        const pair = pairs.reduce((best, p) => {
            const liq = p.liquidity ? p.liquidity.usd || 0 : 0;
