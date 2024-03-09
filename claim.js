const fs = require("fs");
const { KeyPair, keyStores, connect, Near } = require("near-api-js");
const BigNumber = require("bignumber.js");
const fetch = require("node-fetch");
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const path = require('path');

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data';

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

function prettyConsole(text) {
    console.log(`[${moment().format('HH:mm:ss DD-MM-YYYY')}] ` + text)
}

async function checkIp() {
    try {
        const response = await fetch(`https://freeipapi.com/api/json`);
        const data = await response.json();
        return data.ipAddress;
    } catch (error) {
        prettyConsole(chalk.red('Error fetching IP details:', error));
        return error;
    }
}

async function ovpnReadConfig(folderPath) {
    try {
        const config = fs.readdirSync(folderPath)
            .filter(file => path.extname(file) === '.ovpn')
            .sort((a, b) => {
                // Mengambil angka dari nama file (tanpa ekstensi)
                const numA = parseInt(a.match(/\d+/), 10);
                const numB = parseInt(b.match(/\d+/), 10);

                // Membandingkan angka untuk menyortir secara numerik
                return numA - numB;
            });

        return config;
    } catch (error) {
        prettyConsole(chalk.red('Error :', error));
    }
}

async function Claim(accountId, profile) {

    const ovpnConfig = await ovpnReadConfig(folderPath)

    exec(`${ovpnPath} --command disconnect_all`);

    await sleep(7000)

    const ip = await checkIp()

    prettyConsole(chalk.cyan(`Current IP : ${ip}`))

    exec(`${ovpnPath} --command connect ${ovpnConfig[profile]}`);

    let isVpn = false;
    let vpn

    while (!isVpn) {
        vpn = await checkIp();
        if (ip !== vpn && vpn !== null) {
            isVpn = true;
        }
        await sleep(3000)
    };

    if (isVpn) {
        let browser
        prettyConsole(chalk.yellow(`Vpn Connected, IP : ${vpn}`))

        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--user-data-dir=${chromeUserPath}`,
                `--profile-directory=Profile ${profile}`,
            ]
        });

        const page = await browser.newPage();

        await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });

        let elementFound = false
        let checkElement = 0

        do {
            if (checkElement <= 5) {
                try {
                    // Click claim now
                    await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                    await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Button Claim Now'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Profile ${profile} Claim Now Button Show So Take Long Time, Switch To Next Account`))
                await browser.close()
                return
            }
        } while (elementFound === false)

        elementFound = false

        do {
            if (checkElement <= 5) {
                try {
                    // Click button launch
                    await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                    await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Button Launch'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Profile ${profile} Button Launch Show So Take Long Time, Switch To Next Account`))
                await browser.close()
                return
            }
        } while (elementFound === false)

        await sleep(3000)

        // Handle iframe
        const iframeSelector = '.payment-verification';
        await page.waitForSelector(iframeSelector)
        const iframeElementHandle = await page.$(iframeSelector);

        await sleep(3000)

        const iframe = await iframeElementHandle.contentFrame();

        prettyConsole(chalk.green(`Account : ${accountId}`))

        elementFound = false

        do {
            if (checkElement <= 5) {
                try {
                    // Click Storage
                    await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)').click();
                    });

                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Storage Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Profile ${profile} Fetch Storage Button Show So Take Long Time, Switch To Next Account`))
                await browser.close()
                return
            }
        } while (elementFound === false)

        let tweak = false

        do {
            if (checkElement <= 3) {
                try {
                    // Click Gas
                    await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)').click();
                    });

                    tweak = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Boost Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Profile ${profile} Fetch Boost Button Show So Take Long Time, Switch To Next Account`))
                await browser.close()
                return
            }
        } while (tweak === false)

        prettyConsole(chalk.green('Check Free Gas For Claiming...'))
        await sleep(10000)

        tweak = false

        do {
            if (checkElement <= 3) {
                try {
                    // Click Back
                    await page.waitForSelector('.popup-close');
                    await page.click('.popup-close');

                    tweak = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Back Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Profile ${profile} Fetch Back Button Show So Take Long Time, Switch To Next Account`))
                await browser.close()
                return
            }
        } while (tweak === false)

        await sleep(5000)

        // Claim $HOT
        const claimSelector = '#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'

        for (let x = 0; x <= 1; x++) {
            for (let i = 0; i <= 5; i++) {
                if (i === 5) {
                    prettyConsole(chalk.red(`Profile ${profile} Fetch Claim Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    return
                }

                try {
                    // Check Claim Disable Or Not
                    const isDisabled = await iframe.evaluate((selector) => {
                        const button = document.querySelector(selector);
                        return button.disabled;
                    }, claimSelector);

                    if (isDisabled) {
                        prettyConsole(chalk.red(`Profile ${profile} Balance ${chalk.yellow('$HOT')} Not Enough For Claim, Switch To Next Account`))
                        await browser.close()
                        return
                    }

                    await iframe.waitForSelector(claimSelector);
                    await iframe.evaluate((selector) => {
                        document.querySelector(selector).click();
                    }, claimSelector);

                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Claim Button'))
                }
            }

            prettyConsole(chalk.green(`Claiming ${chalk.yellow('$HOT')}`))

            for (let i = 0; i <= 10; i++) {
                if (x === 10) {
                    break
                }
                const detailUserResult = await getDetailUser(near, accountId);
                let miningProgressResult = miningProgress(detailUserResult);

                if (parseFloat(miningProgressResult) <= 0.0001) {
                    prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT')} Successfully!`))
                    const balance = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                        return parseFloat(element.textContent);
                    });

                    prettyConsole(chalk.green(`Balance : ${balance} ${chalk.yellow('$HOT')}`))
                    return;
                }

                miningProgressResult = miningProgress(detailUserResult);
                await sleep(10000)
            }

            // Tweak if not claimed with clicking boost
            prettyConsole(chalk.red(`Profile ${profile} Claiming ${chalk.yellow('$HOT')} So Take Long Time, Tweaking`))

            tweak = false
            checkElement = 0

            do {
                if (checkElement <= 3) {
                    try {
                        // Click Gas
                        await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)');
                        await iframe.evaluate(() => {
                            document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)').click();
                        });

                        tweak = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Boost Button'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Profile ${profile} Fetch Boost Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    return
                }
            } while (tweak === false)

            await sleep(3000)

            tweak = false

            do {
                if (checkElement <= 3) {
                    try {
                        // Click Back
                        await page.waitForSelector('.popup-close');
                        await page.click('.popup-close');

                        tweak = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Back Button'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Profile ${profile} Fetch Back Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    return
                }
            } while (tweak === false)

            prettyConsole(chalk.red(`Try To Re-Claim ${chalk.yellow('$HOT')}`))
        }

        await browser.close();

        exec(`${ovpnPath} --command disconnect ${ovpnConfig[profile]}`);

        const rest = (Math.random() * (45 - 30) + 30) * 1000
        prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
        await sleep(rest)
    }

    await waitForClaim();
}

const levels = [
    {
        hot_price: 0,
        id: 10,
        mission: "",
        value: 10,
    },
    {
        hot_price: 0,
        id: 11,
        mission: "invite_friend",
        value: 12,
    },
    {
        hot_price: 0,
        id: 12,
        mission: "download_app",
        value: 15,
    },
    {
        hot_price: 0,
        id: 13,
        mission: "deposit_1NEAR",
        value: 18,
    },
    {
        hot_price: 0,
        id: 14,
        mission: "deposit_1USDT",
        value: 20,
    },
    {
        hot_price: 0,
        id: 15,
        mission: "deposit_NFT",
        value: 25,
    },
    {
        hot_price: 0,
        id: 20,
        mission: "",
        value: 720000000000,
    },
    {
        hot_price: 200000,
        id: 21,
        mission: "",
        value: 1080000000000,
    },
    {
        hot_price: 500000,
        id: 22,
        mission: "",
        value: 1440000000000,
    },
    {
        hot_price: 1000000,
        id: 23,
        mission: "",
        value: 2160000000000,
    },
    {
        hot_price: 4000000,
        id: 24,
        mission: "",
        value: 4320000000000,
    },
    {
        hot_price: 10000000,
        id: 25,
        mission: "",
        value: 8640000000000,
    },
    {
        hot_price: 0,
        id: 0,
        mission: "",
        value: 10000,
    },
    {
        hot_price: 200000,
        id: 1,
        mission: "",
        value: 15000,
    },
    {
        hot_price: 1000000,
        id: 2,
        mission: "",
        value: 20000,
    },
    {
        hot_price: 2000000,
        id: 3,
        mission: "",
        value: 25000,
    },
    {
        hot_price: 5000000,
        id: 4,
        mission: "",
        value: 30000,
    },
    {
        hot_price: 15000000,
        id: 5,
        mission: "",
        value: 50000,
    },
];
const storeFireplace = [
    {
        id: 0,
        title: "Fireplace",
        text: "Better Fireplace boosts mining speed",
        description: "Increase passive mining speed",
    },
    {
        id: 1,
        title: "Stone Fireplace",
        text: "Better Fireplace boosts mining speed",
        description: "Increase passive mining speed",
    },
    {
        id: 2,
        title: "Gas Fireplace",
        text: "Better Fireplace boosts mining speed",
        description: "Increase passive mining speed",
    },
    {
        id: 3,
        title: "Neon Fireplace",
        text: "Better Fireplace boosts mining speed",
        description: "Increase passive mining speed",
    },
    {
        id: 4,
        title: "Neon Multy-fireplace",
        text: "Better Fireplace boosts mining speed",
        description: "Increase passive mining speed",
    },
    {
        id: 5,
        title: "Neon Multy-fireplace",
        text: "Better Fireplace boosts mining speed",
        description: "Increase passive mining speed",
    },
    {
        id: 10,
        title: "Basic Wood",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
        mission_text: "",
    },
    {
        id: 11,
        title: "Neon Wood",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
        mission_text: "Invite a referral",
    },
    {
        id: 12,
        title: "Titanium Wood",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
        mission_text: "Download the mobile app and import your account",
    },
    {
        id: 13,
        title: "Jedi Wood",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
        mission_text: "Send 0.5+ NEAR from .near account, created at HERE Wallet",
    },
    {
        id: 14,
        title: "Uranium Boxes",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
        mission_text: "Deposit 1+ USDT on your account",
    },
    {
        id: 15,
        title: "Uranium Boxes",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Boost mining speed by\n1.5x.. 2x.. 3x times!",
        mission_text: "Coming soon...",
    },
    {
        id: 19,
        title: "Super Fuel",
        text: "Better wood give you a multiplier to HOT mining. Mining speed is Wood Ã— Fireplace",
        description: "Temporary booster for contest. Gives 5x!",
    },
    {
        id: 20,
        title: "Wooden Storage",
        text: "Better storage holds more HOT and you can claim it less often",
        description: "Increase the fill\ntime to claim less often",
    },
    {
        id: 21,
        title: "Metal Storage",
        text: "Better storage holds more HOT and you can claim it less often",
        description: "Increase the fill\ntime to claim less often",
    },
    {
        id: 22,
        title: "Modular Storage",
        text: "Better storage holds more HOT and you can claim it less often",
        description: "Increase the fill\ntime to claim less often",
    },
    {
        id: 23,
        title: "Liquid Storage",
        text: "Better storage holds more HOT and you can claim it less often",
        description: "Increase the fill\ntime to claim less often",
    },
    {
        id: 24,
        title: "Titanium Storage",
        text: "Better storage holds more HOT and you can claim it less often",
        description: "Increase the fill\ntime to claim less often",
    },
    {
        id: 25,
        title: "Titanium Storage",
        text: "Better storage holds more HOT and you can claim it less often",
        description: "Increase the fill\ntime to claim less often",
    },
];

const mainnetConfig = {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
};

const near = new Near(mainnetConfig);

const miningProgress = (detailUser) => {
    const currentTime = Date.now();

    const timeSinceLastClaimHours =
        (currentTime - detailUser.last_claim / 1e6) / (1000 * 60 * 60);
    const hotPerHourInt = getHotPerHourInt(detailUser);
    const earnedHOT = timeSinceLastClaimHours * hotPerHourInt;

    return earnedHOT.toFixed(6);
};

const earned = (detailUser) => {
    const hotPerHourInt = getHotPerHourInt(detailUser);
    const earned = (storageCapacityMs(detailUser) / 3600000) * hotPerHourInt;

    return earned;
};

const storageCapacityMs = (detailUser) => {
    const storageBooster = getBooster(detailUser.storage);
    return Math.floor(parseInt(storageBooster.value + "0") / 1e6);
};

const getHotPerHourInt = (detailUser) => {
    const fireplaceBooster = getBooster(detailUser.firespace);
    const woodBooster = getBooster(detailUser.boost);
    return new BigNumber(woodBooster.value * fireplaceBooster.value).dividedBy(
        1e7
    );
};

const getDetailUser = async (near, accountId) => {
    const argument = {
        account_id: accountId,
    };

    const result = await near.connection.provider.query({
        account_id: "game.hot.tg",
        finality: "optimistic",
        request_type: "call_function",
        method_name: "get_user",
        args_base64: Buffer.from(JSON.stringify(argument)).toString("base64"),
    });

    const detailUser = JSON.parse(Buffer.from(result.result).toString());

    return detailUser;
};

const miningEarned = async (detailUser) => {
    const remainingMiningResult = earned(detailUser);

    return remainingMiningResult;
};

const getBooster = (e) => {
    let booster = levels.find((t) => t.id === e);
    if (!booster) return null;
    let additionalInfo = storeFireplace.find((t) => t.id === e);
    return additionalInfo ? { ...additionalInfo, ...booster } : booster;
};

const processAccount = async (accountId, privateKey, profile, accountStorageFull) => {
    const mineAndUpdate = async () => {
        try {
            const detailUserResult = await getDetailUser(near, accountId);
            let miningEarnedMust = await miningEarned(detailUserResult);
            let miningProgressResult = miningProgress(detailUserResult);

            if (parseFloat(miningProgressResult) >= parseFloat(miningEarnedMust * (1 - (Math.floor(Math.random() * (20 - 10 + 1)) + 10) / 100))) {
                if (!accountStorageFull.some(acc => acc.account === accountId)) {
                    accountStorageFull.push({ account: accountId, profileChrome: profile, key: privateKey });
                }

                setTimeout(mineAndUpdate, (Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 1000);
                return
            }

            miningProgressResult = miningProgress(detailUserResult);


            setTimeout(mineAndUpdate, (Math.floor(Math.random() * (10 - 5 + 1)) + 5) * 1000);
        } catch (error) {
            prettyConsole(chalk.red(error));
        }
    }

    await mineAndUpdate();
    return;
};

const get_ProfileInfo = (PRIVATE_KEY) => new Promise((resolve, reject) => {
    const keyPair = KeyPair.fromString(PRIVATE_KEY);
    const publicKey = keyPair.getPublicKey().toString();
    fetch('https://api.nearblocks.io/v1/keys/' + publicKey, {
        method: 'GET',
        headers: {
            'authority': 'api.nearblocks.io',
            'accept': '*/*',
            'accept-language': 'id',
            'content-type': 'application/json',
            'network': 'mainnet',
            'origin': 'https://tgapp.herewallet.app',
            'platform': 'web',
            'referer': 'https://tgapp.herewallet.app',
            'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cors-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
    })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err))
});

const claimingProcess = async (accountStorageFull) => {
    for (const account of accountStorageFull) {
        prettyConsole(chalk.cyan(account.account))
    }

    const claiming = async () => {
        try {
            if (accountStorageFull.length > 0) {
                const account = accountStorageFull.shift();
                await Claim(account.account, account.profileChrome);

                setTimeout(claiming, 5000);
                return
            }

            setTimeout(claiming, 5000);
            return
        } catch (error) {
            prettyConsole(chalk.red(error));
        }
    }

    await claiming();
    return;
};

const filePath = './account.txt';

const accountStorageFull = []

const fileContents = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);

// Read the accounts file
const accountsData = fileContents.map(line => {
    const [key, profile] = line.split(':');
    return { key, profile };
});

const promises = accountsData.map(async (account) => {
    if (account) {
        const { key: privateKey, profile } = account;
        const get_accountId = await get_ProfileInfo(privateKey);
        const accountId = get_accountId.keys[0].account_id;
        await processAccount(accountId, privateKey, parseInt(profile), accountStorageFull);
    }

    await sleep(3000)
});

// Execute all promises
Promise.all(promises)
    .then(() => {
        console.log("All accounts processed successfully")
        claimingProcess(accountStorageFull);
    })
    .catch((error) => console.error("Error processing accounts:", error));