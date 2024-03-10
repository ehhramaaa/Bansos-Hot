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
    console.log(`[${moment().format('HH:mm:ss')}] ` + text)
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
let scheduledTask;

const changeCronSchedule = (second, minute) => {
    const currentSecond = moment().format('ss')
    const currentMinute= moment().format('mm')
    // Hapus jadwal cron yang sudah ada jika ada
    if (scheduledTask) {
        scheduledTask.destroy();
    }

    // Buat jadwal cron baru
    scheduledTask = cron.schedule(`${currentSecond}/${second} ${currentMinute}/${minute} * * * *`, () => {
        claim();
    });
};


async function claim(second, minute){

    console.log(chalk.cyan(`\n<==================================[${moment().format('HH:mm:ss DD-MM-YYYY')}]==================================>`))
    
    const ovpnConfig = await ovpnReadConfig(folderPath)
    
    mainLoop : for(let x = 0; x <= 20; x++){
        exec(`${ovpnPath} --command disconnect_all`);
        
        await sleep(7000)
        
        const ip = await checkIp()
        prettyConsole(chalk.magenta(`Current IP : ${ip}`))
        
        exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);
    
        let isVpn = false;
        let isConnected = false
        let vpn, browser, page
    
        while (!isVpn) {
            vpn = await checkIp();
            if (ip !== vpn && vpn !== null) {
                isVpn = true;
            }
            await sleep(3000)
        };
        
        if (isVpn) {
            prettyConsole(chalk.green(`Vpn Connected, IP : ${vpn}`))

            while (!isConnected) {
                try {
                    if(x === 0){
                        browser = await puppeteer.launch({
                            args: [
                                `--user-data-dir=${chromeUserPath}`,
                                `--profile-directory=Default`,
                            ]
                        });
                    }else{
                        browser = await puppeteer.launch({
                            args: [
                                `--user-data-dir=${chromeUserPath}`,
                                `--profile-directory=Profile ${x}`,
                            ]
                        });
                    }
            
                    page = await browser.newPage();

                    page.on('disconnected', () => {
                        console.log('Page disconnected. Attempting to reconnect...');
                        isConnected = false;
                    });
            
                    isConnected = true;
                    
                } catch (error) {
                    prettyConsole(chalk.red(error.message))
                }
            }

            prettyConsole(chalk.green(`Profile :${x}`))
            
            await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });

            let elementFound = false
            let checkElement = 0
    
            // Click claim now
            do{
                if(checkElement <= 5){
                    try {
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

            // Click button launch
            do{
                if(checkElement <= 5){
                    try {
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

            // Get Account Name
            do{
                if(checkElement <= 5){
                    try {
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

            // Click Storage
            do{
                if(checkElement <= 5){
                    try {
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
            let storage = 0
            const threshold = 93;

            await sleep(1000)

            // Check Storage
            do{
                if(checkElement <= 5){
                    try {
                        await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(1) > div:nth-child(2)');
                        storage = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(1) > div:nth-child(2)');
                            const widthStr = window.getComputedStyle(element).getPropertyValue("width");
                            return parseFloat(widthStr.replace("%", ""))
                        });
                
                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Storage'))
                        checkElement++
                    }
                }else{
                    prettyConsole(chalk.red(`Profile ${x} Fetch Storage So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            }while(elementFound === false)
            
            if(storage >= 100){
                prettyConsole(chalk.green(`Storage :Full`))
            }else{
                prettyConsole(chalk.green(`Storage :${storage}%`))
            }

            if(storage >= threshold){
                elementFound = false
                let balanceBefore
    
                // Check Balance
                do{
                    if(checkElement <= 5){
                        try {
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
    
                prettyConsole(chalk.green(`Balance :${balanceBefore} $HOT🔥`))

                elementFound = false

                // Click Gas
                do {
                    if (checkElement <= 3) {
                        try {
                            await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)');
                            await iframe.evaluate(() => {
                                document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)').click();
                            });
        
                            elementFound = true
                            checkElement = 0
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Fetch Gas Button'))
                            checkElement++
                        }
                    } else {
                        prettyConsole(chalk.red(`Profile ${profile} Fetch Gas Button Show So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        elementFound = 'error'
                        continue mainLoop
                    }
                } while (elementFound === false)

                prettyConsole(chalk.cyan(`Wait Gas Free Counting...`))

                await sleep(10000)

                elementFound = false
                let gasFree
    
                // Check Gas Free Amount
                do{
                    if(checkElement <= 3){
                        try {
                            await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div:nth-child(1) > h3');
                            gasFree = await iframe.evaluate(() => {
                                const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div:nth-child(1) > h3');
                                return parseFloat(element.textContent)
                            });
                    
                            elementFound = true
                            checkElement = 0
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Fetch Gas Amount'))
                            checkElement++
                        }
                    }else{
                        prettyConsole(chalk.red(`Profile ${x} Fetch Gas Amount So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        elementFound = 'error'
                        continue mainLoop
                    }
                }while(elementFound === false)

                prettyConsole(chalk.green(`Gas Free :${gasFree}`))

                elementFound = false

                // Click Back
                do {
                    if (checkElement <= 3) {
                        try {
                            await page.waitForSelector('.popup-close');
                            await page.click('.popup-close');
    
                            elementFound = true
                            checkElement = 0
                        } catch (error) {
                            prettyConsole(chalk.yellow('Still Fetch Back Button'))
                            checkElement++
                        }
                    } else {
                        prettyConsole(chalk.red(`Profile ${profile} Fetch Back Button Show So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        elementFound = 'error'
                        continue mainLoop
                    }
                } while (elementFound === false)

                await sleep(3000)
        
                let claimed = false
                
                // Claim $HOT🔥
                do {
                    const claimSelector = '#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
                    
                    elementFound = false
                    
                    do{
                        if(checkElement <= 5){
                            try {
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
        
                    prettyConsole(chalk.green(`Claiming ${chalk.yellow('$HOT🔥')}`))
        
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
                                    prettyConsole(chalk.red(error.message))
                                }
    
                                await sleep(15000)
    
                                if(checkElement === 5){
                                    prettyConsole(chalk.yellow('Still Claiming $HOT🔥'))
                                }
                                
                                
                                checkElement++
                            }else{
                                prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT🔥')} Successfully!`))
                                prettyConsole(chalk.green(`Balance :${balanceAfter} ${chalk.yellow('$HOT🔥')}`))
                                elementFound = true
                                claimed = true
                            }
                        }else{
                            // Tweak if not claimed with clicking boost
                            prettyConsole(chalk.red(`Profile ${x} Claiming ${chalk.yellow('$HOT🔥')} So Take Long Time, Tweaking`))
                            
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
    
                            prettyConsole(chalk.red(`Try To Re-Claim ${chalk.yellow('$HOT🔥')}`))
                        }
                    }while(elementFound === false)
                } while (claimed === false)
            }else{
                prettyConsole(chalk.yellow(`Storage Still ${storage}%, You Can Claim $HOT🔥 If Storage >= ${threshold}% `))
            }
    
            await browser.close()

            exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
            const rest = (Math.random() * (45 - 30) + 30) * 1000
            prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest/1000)} second\n`))
            await sleep(rest)
        }
    }

    changeCronSchedule(second, minute);
}

(async () => {
    const second = Math.floor(Math.random() * (59 - 1 + 1)) + 1
    const minute = Math.floor(Math.random() * (59 - 45 + 1)) + 45

    await claim(second, minute)

    prettyConsole(`Rest For ${minute} Minute ${second} Second`)
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