const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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

const userAgent = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.3',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.3',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Agency/93.8.2357.5',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.3',
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.3',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Viewer/99.9.8853.8',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.3',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.3',
    'Mozilla/5.0 (Linux; U; Android 13; sk-sk; Xiaomi 11T Pro Build/TKQ1.220829.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.5615.136 Mobile Safari/537.36 XiaoMi/MiuiBrowser/14.4.0-g',
    'Mozilla/5.0 (Linux; Android 14; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.280 Mobile Safari/537.36 OPR/80.4.4244.7786',
    'Mozilla/5.0 (Linux; Android 10; SNE-LX1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.280 Mobile Safari/537.36 OPR/80.4.4244.7786',
    'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/22.0 Chrome/111.0.5563.116 Mobile Safari/537.3',
    'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S916B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.3',
    'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.3',
    'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.3',
    'Mozilla/5.0 (Linux; Android 11; moto e20 Build/RONS31.267-94-14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.3',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
]

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data';

(async () => {
        prettyConsole(chalk.green('Bot For Claim $HOT Every 2 Hours Random(45-59) Minute'))
        const ovpnConfig = await ovpnReadConfig(folderPath)
        const wallet = await readTxtFile('./wallet.txt')
        
        loginloop:for(let x = 0; x < wallet.length; x++){
            exec(`${ovpnPath} --command disconnect_all`);
            await sleep(7000)
            const ip = await checkIp()
            exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);
        
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
                prettyConsole(chalk.yellow(`Vpn Connected, IP : ${vpn}`))
                let browser
                if(x === 0){
                    browser = await puppeteer.launch({
                        headless: false,
                        args: [
                            `--user-data-dir=${chromeUserPath}`,
                            `--user-agent=${userAgent[x]}`
                        ]
                    });
                }else{
                    browser = await puppeteer.launch({
                        headless: false,
                        args: [
                            `--user-data-dir=${chromeUserPath}`,
                            `--profile-directory=Profile ${x}`,
                            `--user-agent=${userAgent[x]}`
                        ]
                    });
                }
    
        
                const page = await browser.newPage();
        
                await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
        
                // Click claim now
                await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
        
                // Click button launch
                await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                
                await sleep(3000)
                
                // Handle iframe
                const iframeSelector = '.payment-verification';
                await page.waitForSelector(iframeSelector)
                const iframeElementHandle = await page.$(iframeSelector);
        
                await sleep(3000)
        
                const iframe = await iframeElementHandle.contentFrame();
        
                await sleep(3000)

                let login = false
                let tryLogin = 0
                do{
                    if(tryLogin <= 5){
                        try {
                            // Click Login
                            await iframe.waitForSelector('#root > div > button');
                            await iframe.evaluate(() => {
                                document.querySelector('#root > div > button').click();
                            })

                            login = true
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Fetch Account'))
                            tryLogin++
                        }
                    }else{
                        prettyConsole(chalk.red(`Profile ${x} Login Button Show So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        continue loginloop
                    }
                }while(login === false)

                // Input Wallet
                await iframe.waitForSelector('#root > div > div:nth-child(3) > label > textarea');
                await iframe.evaluate(() => {
                    document.querySelector('#root > div > div:nth-child(3) > label > textarea').focus();
                });

                await page.keyboard.type(wallet[x]);

                await sleep(1000)
                
                // Confirm Wallet
                await iframe.waitForSelector('#root > div > div:nth-child(4) > button');
                await iframe.evaluate(() => {
                    document.querySelector('#root > div > div:nth-child(4) > button').click();
                })

                let select = false
                let fetch = 0

                do{
                    if(fetch <= 5){
                        try {
                            // Select Account
                            await iframe.waitForSelector('#root > div > button');
                            await iframe.evaluate(() => {
                                document.querySelector('#root > div > button').click();
                            })
    
                            select = true
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Fetch Account'))
                            fetch++
                        }
                    }else{
                        prettyConsole(chalk.red(`Profile ${x} Fetching Account So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        continue loginloop
                    }
                }while(select === false)
                
                select = false
                fetch = 0
                let account
        
                do{
                    if(fetch <= 5){
                        try {
                            // Get Account Name
                            await iframe.waitForSelector('#root > div > div > div > div:nth-child(1) > p');
                            account = await iframe.evaluate(() => {
                                const element = document.querySelector('#root > div > div > div > div:nth-child(1) > p');
                                return element.textContent
                            })

                            select = true
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Import Account'))
                            fetch++
                        }
                    }else{
                        prettyConsole(chalk.red(`Profile ${x} Importing Account So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        continue loginloop
                    }
                }while(select === false)

                prettyConsole(chalk.green(`Account :${account}`))
        
                await browser.close()
    
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = 10000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${rest} second`))
                await sleep(rest)
            }
        }
    
    })();