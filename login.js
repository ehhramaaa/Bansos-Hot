const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

async function readTxtFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            // Assuming each line of the file contains a token
            const text = data.split('\r\n');

            resolve(text);
        });
    });
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

async function checkElement(element, message) {
    let checkElement = false
    let trycheckElement = 0
    do {
        if (trycheckElement <= 5) {
            try {
                await element()
                checkElement = true
            } catch (error) {
                prettyConsole(chalk.yellow(`Still Fetch ${message}`))
                trycheckElement++
            }
        } else {
            prettyConsole(chalk.red(`Profile ${x} ${message} Show So Take Long Time, Switch To Next Account`))
            return
        }
    } while (checkElement === false)
}

async function main(wallet, x) {
    let isVpn = false;
    let isConnected = false;
    let tryConnectBrowser = 0
    let vpn, browser, varElement;

    while (!isVpn) {
        vpn = await checkIp();
        // Add a condition to check if the VPN connection is established
        if (vpn !== ip) {
            isVpn = true;
            prettyConsole(chalk.green(`VPN connected successfully!, IP : ${vpn}`));
        }

        // You may want to add a delay here to avoid continuous checking and reduce resource usage
        await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust the delay as needed
    }

    if (isVpn) {
        do {
            if (tryConnectBrowser <= 5) {
                try {
                    if (x === 0) {
                        browser = await puppeteer.launch({
                            headless: false,
                            args: [
                                `--user-data-dir=${chromeUserPath}`,
                                `--profile-directory=Default`,
                            ]
                        });
                    } else {
                        browser = await puppeteer.launch({
                            headless: false,
                            args: [
                                `--user-data-dir=${chromeUserPath}`,
                                `--profile-directory=Profile ${x}`,
                            ]
                        });
                    }

                    const browserConnected = await browser.isConnected()

                    if (browserConnected) {
                        isConnected = true;
                    }

                    tryConnectBrowser++
                } catch (error) {
                    prettyConsole(chalk.red(error.message))
                    tryConnectBrowser++
                }
            } else {
                prettyConsole(chalk.red(`Try Hard To Launch Browser!, Switch Next Profile`))
                return 'Browser Not Connected'
            }
        } while (!isConnected)

        await sleep(3000)

        prettyConsole(chalk.green(`Profile :${x}`))


        const page = await browser.newPage();

        varElement = async () => {
            await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
        }

        await checkElement(varElement, 'Goto Link')

        // Click claim now
        varElement = async () => {
            await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
            await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
        }

        await checkElement(varElement, "Click Claim")

        // Click button launch
        varElement = async () => {
            await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
            await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
        }

        await checkElement(varElement, "Click Launch")

        await sleep(3000)

        const iframeSelector = '.payment-verification';
        let iframeElementHandle

        varElement = async () => {
            await page.waitForSelector(iframeSelector)
            iframeElementHandle = await page.$(iframeSelector);
        }

        await checkElement(varElement, "Select Iframe")

        await sleep(3000)

        const iframe = await iframeElementHandle.contentFrame();

        await sleep(3000)

        // Click Login
        varElement = async () => {
            await iframe.waitForSelector('#root > div > button');
            await iframe.evaluate(() => {
                document.querySelector('#root > div > button').click();
            })
        }

        await checkElement(varElement, 'Click Login')

        // Input Wallet
        varElement = async () => {
            await iframe.waitForSelector('#root > div > div:nth-child(3) > label > textarea');
            await iframe.evaluate(() => {
                document.querySelector('#root > div > div:nth-child(3) > label > textarea').focus();
            });
        }

        await checkElement(varElement, "Input Wallet")

        await page.keyboard.type(wallet[x]);

        await sleep(3000)

        // Confirm Wallet
        varElement = async () => {
            await iframe.waitForSelector('#root > div > div:nth-child(4) > button');
            await iframe.evaluate(() => {
                document.querySelector('#root > div > div:nth-child(4) > button').click();
            })
        }

        await checkElement(varElement, "Confirm Wallet")

        // Select Account
        varElement = async () => {
            await iframe.waitForSelector('#root > div > button');
            await iframe.evaluate(() => {
                document.querySelector('#root > div > button').click();
            })
        }

        await checkElement(varElement, "Select Account")
        
        let account

        // Get Account Name
        varElement = async () => {
            await iframe.waitForSelector('#root > div > div > div > div:nth-child(1) > p');
            account = await iframe.evaluate(() => {
                const element = document.querySelector('#root > div > div > div > div:nth-child(1) > p');
                return element.textContent
            })
        }
        
        await checkElement(varElement, "Account Name")

        prettyConsole(chalk.green(`Account :${account}`))
    }
}


(async () => {
    prettyConsole(chalk.green('Auto Login Bansos Hot'))


    const ovpnConfig = await ovpnReadConfig(folderPath)
    const wallet = await readTxtFile('./wallet.txt')

    for (let x = 0; x < wallet.length; x++) {
        exec(`${ovpnPath} --command disconnect_all`);

        await sleep(7000)

        const ip = await checkIp()
        prettyConsole(chalk.magenta(`Current IP : ${ip}`))

        exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);

        // Wait for VPN connection to be established
        await new Promise(resolve => setTimeout(resolve, 5000));

        const callback = await main(wallet[x], x)

        if (callback !== 'Browser Not Connected') {
            await browser.close()

            exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
            const rest = 10000
            prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${rest} second`))
            await sleep(rest)
        }
    }
})();