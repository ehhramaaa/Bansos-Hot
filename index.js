const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cron = require('node-cron');

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

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data';

async function claim(){
    
    const ovpnConfig = await ovpnReadConfig(folderPath)
    
    mainLoop : for(let x = 1; x <= 20; x++){
        exec(`${ovpnPath} --command disconnect_all`);
        
        await sleep(7000)
        
        const ip = await checkIp()
        prettyConsole(chalk.blue(`Current IP : ${ip}`))
        
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
            let browser
            prettyConsole(chalk.yellow(`Vpn Connected, IP : ${vpn}`))
            if(x === 0){
                browser = await puppeteer.launch({
                    headless: false,
                    args: [
                        `--user-data-dir=${chromeUserPath}`,
                    ]
                });
            }else{
                browser = await puppeteer.launch({
                    headless: false,
                    args: [
                        `--user-data-dir=${chromeUserPath}`,
                        `--profile-directory=Profile ${x}`,
                    ]
                });
            }
    
            const page = await browser.newPage();
    
            await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });

            let elementFound = false
            let checkElement = 0
    
            do{
                if(checkElement <= 5){
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
                }else{
                    prettyConsole(chalk.red(`Profile ${x} Claim Now Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            }while(elementFound === false)

            elementFound = false

            do{
                if(checkElement <= 5){
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
                }else{
                    prettyConsole(chalk.red(`Profile ${x} Button Launch Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            }while(elementFound === false)

            await sleep(3000)
    
            // Handle iframe
            const iframeSelector = '.payment-verification';
            await page.waitForSelector(iframeSelector)
            const iframeElementHandle = await page.$(iframeSelector);
    
            await sleep(3000)
    
            const iframe = await iframeElementHandle.contentFrame();
    
            elementFound = false
            let account

            do{
                if(checkElement <= 5){
                    try {
                        // Get Account Name
                        await iframe.waitForSelector('#root > div > div > div > div:nth-child(1) > p');
                        account = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div > div > div:nth-child(1) > p');
                            return element.textContent
                        })
            
                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Account Name'))
                        checkElement++
                    }
                }else{
                    prettyConsole(chalk.red(`Profile ${x} Account Name Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            }while(elementFound === false)

            prettyConsole(chalk.green(`Account :${account}`))
            
            elementFound = false

            do{
                if(checkElement <= 5){
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
                }else{
                    prettyConsole(chalk.red(`Profile ${x} Fetch Storage Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            }while(elementFound === false)

            elementFound = false
            let balanceBefore

            do{
                if(checkElement <= 5){
                    try {
                        // Check Balance
                        await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                        balanceBefore = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                            return parseFloat(element.textContent)
                        });
                
                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Balance'))
                        checkElement++
                    }
                }else{
                    prettyConsole(chalk.red(`Profile ${x} Fetch Balance So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            }while(elementFound === false)

            prettyConsole(chalk.green(`Balance :${balanceBefore}`))
    
            let claimed = false
            
            do {
                // Claim $HOT
                const claimSelector = '#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
                
                elementFound = false
                
                do{
                    if(checkElement <= 5){
                        try {
                            // Check Claim Disable Or Not
                            const isDisabled = await iframe.evaluate((selector) => {
                                const button = document.querySelector(selector);
                                return button.disabled;
                            }, claimSelector);

                            if (isDisabled) {
                                prettyConsole(chalk.red(`Profile ${x} Balance ${chalk.yellow('$HOT')} Not Enough For Claim, Switch To Next Account`))
                                await browser.close()
                                elementFound = 'error'
                                continue mainLoop
                            }

                            await iframe.waitForSelector(claimSelector);
                            await iframe.evaluate((selector) => {
                                document.querySelector(selector).click();
                            }, claimSelector);

                            elementFound = true
                            checkElement = 0
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Fetch Claim Button'))
                            checkElement++
                        }
                    }else{
                        prettyConsole(chalk.red(`Profile ${x} Fetch Claim Button Show So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        elementFound = 'error'
                        continue mainLoop
                    }
                }while(elementFound === false)
    
                prettyConsole(chalk.green(`Claiming ${chalk.yellow('$HOT')}`))
    
                let balanceAfter = 0
                
                do{
                    elementFound = false

                    if(checkElement <= 10){
                        if(balanceAfter <= balanceBefore){
                            try {
                                // Check balance for makesure is claimed
                                balanceAfter = await iframe.evaluate(() => {
                                    const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                                    return parseFloat(element.textContent);
                                });
                            } catch (error) {
                                prettyConsole(chalk.red(error))
                            }

                            await sleep(15000)

                            if(checkElement === 5){
                                prettyConsole(chalk.yellow('Still Claiming $HOT'))
                            }
                            
                            
                            checkElement++
                        }else{
                            prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT')} Successfully!`))
                            prettyConsole(chalk.green(`Balance ${chalk.yellow('$HOT')} ${balanceAfter}`))
                            elementFound = true
                            claimed = true
                        }
                    }else{
                        // Tweak if not claimed with clicking boost
                        prettyConsole(chalk.red(`Profile ${x} Claiming ${chalk.yellow('$HOT')} So Take Long Time, Tweaking`))
                        
                        let tweak = false
                        checkElement = 0

                        do{
                            if(checkElement <= 3){
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
                            }else{
                                prettyConsole(chalk.red(`Profile ${x} Fetch Boost Button Show So Take Long Time, Switch To Next Account`))
                                await browser.close()
                                elementFound = 'error'
                                continue mainLoop
                            }
                        }while(tweak === false)

                        await sleep(3000)

                        tweak = false

                        do{
                            if(checkElement <= 3){
                                try {
                                    // Click Back
                                    await iframe.waitForSelector('.btn-icon.popup-close');
                                    await iframe.evaluate(() => {
                                        document.querySelector('.btn-icon.popup-close').click();
                                    });

                                    tweak = true
                                    checkElement = 0
                                } catch (error) {
                                    prettyConsole(chalk.yellow('Still Fetch Back Button'))
                                    checkElement++
                                }
                            }else{
                                prettyConsole(chalk.red(`Profile ${x} Fetch Back Button Show So Take Long Time, Switch To Next Account`))
                                await browser.close()
                                elementFound = 'error'
                                continue mainLoop
                            }
                        }while(tweak === false)

                        prettyConsole(chalk.red(`Try To Re-Claim ${chalk.yellow('$HOT')}`))
                    }
                }while(elementFound === false)
            } while (claimed === false)
    
            await browser.close()

            exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
            const rest = (Math.random() * (45 - 30) + 30) * 1000
            prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest/1000)} second\n`))
            await sleep(rest)
        }
    }
}

(async () => {
    prettyConsole(chalk.green('Bot For Claim $HOT Every 2 Hours Random(45-59) Minute'))

    // TODO Buat Agar Claimnya Sesuai Dengan Jamnya - 10% random
    await claim()
    cron.schedule(`${Math.floor(Math.random() * (59 - 45 + 1)) + 45} */2 * * *`, () => {
        claim()
    });
})()


// Fitur Upgrade Level Storage And Fire For Next Update Code

            // // Click Boost
            // await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
            // await iframe.evaluate(() => {
            //     document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
            // });
    
            // // Check Price Of Upgrade Storage
            // await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
            // const priceUpgradeStorage = await iframe.evaluate(() => {
            //     const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
            //     return parseFloat(element.textContent);
            // });
    
            // // Check Price Of Upgrade Stone
            // await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
            // const priceUpgradeStone = await iframe.evaluate(() => {
            //     const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
            //     return parseFloat(element.textContent);
            // });
    
            // if(balanceAfter > priceUpgradeStone){
            //     // Upgrade Stone
            // }