const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cron = require('node-cron');

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data';
let scheduledTask;

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

const changeCronSchedule = (minute) => {
    const currentMinute = moment().format('mm')
    let schedule

    if (currentMinute > minute) {
        schedule = minute
    } else {
        schedule = Math.abs(minute - currentMinute)
    }

    if (schedule === currentMinute) {
        schedule = parseInt(currentMinute / 2)
    }

    console.log(chalk.cyan(`\n<=============================[Rest until minute ${schedule} in o'clock]=============================>`))

    // Hapus jadwal cron yang sudah ada jika ada
    if (scheduledTask) {
        scheduledTask.stop();
    }

    // Buat jadwal cron baru
    scheduledTask = cron.schedule(`${schedule} * * * *`, () => {
        main();
    });
};

const upgradeSpeed = async (iframe, balance, checkElement, elementFound) => {
    elementFound = false
    let level

    elementFound = false
    let price

    // Check Price Upgrade Speed
    do {
        if (checkElement <= 5) {
            try {
                await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
                price = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
                    return parseFloat(element.textContent)
                })

                elementFound = true
                checkElement = 0
            } catch (error) {
                prettyConsole(chalk.yellow('Still Fetch Price Upgrade Speed'))
                checkElement++
            }
        } else {
            prettyConsole(chalk.red(`Price Upgrade Speed Show So Take Long Time, Switch Upgrade Storage`))
            return
        }
    } while (elementFound === false)

    prettyConsole(chalk.green(`Price Upgrade Speed :${price} ${chalk.yellow('$HOT🔥')}`))

    if (balance >= price) {
        elementFound = false

        // Click For Upgrade
        do {
            if (checkElement <= 5) {
                try {
                    await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1)').click();
                    })

                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Boost Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Boost Button Show So Take Long Time, Switch Upgrade Storage`))
                return
            }
        } while (elementFound === false)

        elementFound = false

        await sleep(3000)

        // Confirm Upgrade
        do {
            if (checkElement <= 5) {
                try {
                    await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                    await iframe.evaluate(() => {
                        document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                    })

                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Confirm Upgrade Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Confirm Upgrade Button Show So Take Long Time, Switch To Next Account`))
                return
            }
        } while (elementFound === false)

        elementFound = false

        let upgraded = false
        // Make Sure Upgraded
        do {
            if (checkElement <= 5) {
                try {
                    await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                    await iframe.evaluate(() => {
                        const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                        return element.textContent
                    })

                    elementFound = true
                    upgraded = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Make Sure Upgrade Successfully'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Make Sure Upgrade Successfully Button Show So Take Long Time, Switch To Upgrade Storage`))
                return
            }
        } while (elementFound === false)

        if (upgraded) {
            elementFound = false

            // Click Got it
            do {
                if (checkElement <= 5) {
                    try {
                        await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                        account = await iframe.evaluate(() => {
                            document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                        })

                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Make Sure Upgrade Successfully Button'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Make Sure Upgrade Successfully Button Show So Take Long Time, Switch To Upgrade Storage`))
                    return
                }
            } while (elementFound === false)

            await sleep(3000)

            // Check Level Speed
            do {
                if (checkElement <= 5) {
                    try {
                        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
                        level = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
                            return element.textContent
                        })

                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Level Speed'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Level Speed Show So Take Long Time, Switch Upgrade Storage`))
                    return
                }
            } while (elementFound === false)

            prettyConsole(chalk.green(`Upgrade Level Speed Successfully, Current Level Speed :${level}`))

            balance = balance - price
        } else {
            prettyConsole(chalk.red(`Upgrade Level Speed Failed!`))
        }
    } else {
        prettyConsole(chalk.yellow(`Balance $HOT🔥 Not Enough For Upgrade Speed`))
    }
}

const upgradeStorage = async (iframe, balance, checkElement, elementFound) => {
    elementFound = false
    let level

    elementFound = false
    let price

    // Check Price Upgrade Storage
    do {
        if (checkElement <= 5) {
            try {
                await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
                price = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
                    return parseFloat(element.textContent)
                })

                elementFound = true
                checkElement = 0
            } catch (error) {
                prettyConsole(chalk.yellow('Still Fetch Price Upgrade Storage'))
                checkElement++
            }
        } else {
            prettyConsole(chalk.red(`Price Upgrade Speed Show So Take Long Time, Switch To Next Profile`))
            return
        }
    } while (elementFound === false)

    prettyConsole(chalk.green(`Price Upgrade Storage :${price} ${chalk.yellow('$HOT🔥')}`))

    if (balance >= price) {
        elementFound = false

        // Click For Upgrade
        do {
            if (checkElement <= 5) {
                try {
                    await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div');
                    account = await iframe.evaluate(() => {
                        document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div').click();
                    })

                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Upgrade Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Upgrade Button Show So Take Long Time, Switch To Next Profile`))
                return
            }
        } while (elementFound === false)

        elementFound = false

        await sleep(3000)

        // Confirm Upgrade
        do {
            if (checkElement <= 5) {
                try {
                    await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                    account = await iframe.evaluate(() => {
                        document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                    })

                    elementFound = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Confirm Upgrade Button'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Confirm Upgrade Button Show So Take Long Time, Switch To Next Account`))
                return
            }
        } while (elementFound === false)

        elementFound = false

        let upgraded = false
        // Make Sure Upgraded
        do {
            if (checkElement <= 5) {
                try {
                    await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                    await iframe.evaluate(() => {
                        const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                        return element.textContent
                    })

                    elementFound = true
                    upgraded = true
                    checkElement = 0
                } catch (error) {
                    prettyConsole(chalk.yellow('Still Fetch Make Sure Upgrade Successfully'))
                    checkElement++
                }
            } else {
                prettyConsole(chalk.red(`Make Sure Upgrade Successfully Button Show So Take Long Time, Switch To Upgrade Storage`))
                return
            }
        } while (elementFound === false)

        await sleep(3000)

        if (upgraded) {
            elementFound = false

            // Check Level Storage
            do {
                if (checkElement <= 5) {
                    try {
                        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
                        level = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
                            return element.textContent
                        })

                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Level Storage'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Level Storage Show So Take Long Time, Switch To Next Profile`))
                    return
                }
            } while (elementFound === false)

            prettyConsole(chalk.green(`Upgrade Level Storage Successfully, Current Level Storage :${level}`))
        } else {
            prettyConsole(chalk.red(`Upgrade Level Storage Failed!`))
        }

    } else {
        prettyConsole(chalk.yellow(`Balance $HOT🔥 Not Enough For Upgrade Storage`))
    }
}


async function main() {

    const minute = Math.floor(Math.random() * (15 - 1 + 1)) + 1

    console.log(chalk.cyan(`\n<==================================[${moment().format('HH:mm:ss DD-MM-YYYY')}]==================================>`))

    const ovpnConfig = await ovpnReadConfig(folderPath)

    mainLoop: for (let x = 0; x <= 20; x++) {
        exec(`${ovpnPath} --command disconnect_all`);

        await sleep(7000)

        const ip = await checkIp()
        prettyConsole(chalk.magenta(`Current IP : ${ip}`))

        exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);

        // Wait for VPN connection to be established
        await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust the delay as needed

        let isVpn = false;
        let isConnected = false;
        let tryConnectBrowser = 0
        let vpn, browser;

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
            do{
                if(tryConnectBrowser <= 5){
                    try {
                        if (x === 0) {
                            browser = await puppeteer.launch({
                                headless: true,
                                args: [
                                    `--user-data-dir=${chromeUserPath}`,
                                    `--profile-directory=Default`,
                                ]
                            });
                        } else {
                            browser = await puppeteer.launch({
                                headless: true,
                                args: [
                                    `--user-data-dir=${chromeUserPath}`,
                                    `--profile-directory=Profile ${x}`,
                                ]
                            });
                        }
    
                        const browserConnected = await browser.isConnected()
        
                        if(browserConnected){
                            isConnected = true;
                        }

                        tryConnectBrowser++
                    } catch (error) {
                        prettyConsole(chalk.red(error.message))
                        tryConnectBrowser++
                    }
                }else{
                    prettyConsole(chalk.red(`Try Hard To Launch Browser!, Switch Next Profile`))
                    continue mainLoop
                }
            }while(!isConnected)
            
            await sleep(3000)
            
            prettyConsole(chalk.green(`Profile :${x}`))

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);

            await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });


            let elementFound = false
            let checkElement = 0

            // Click claim now
            do {
                if (checkElement <= 5) {
                    try {
                        await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                        await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Button Claim Now'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Claim Now Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            } while (elementFound === false)

            elementFound = false

            // Click button launch
            do {
                if (checkElement <= 5) {
                    try {
                        await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                        await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Button Launch'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Button Launch Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            } while (elementFound === false)

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
            do {
                if (checkElement <= 5) {
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
                } else {
                    prettyConsole(chalk.red(`Account Name Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            } while (elementFound === false)

            prettyConsole(chalk.green(`Account :${account}`))

            elementFound = false
            let storage = 0
            const threshold = 93;

            await sleep(5000)

            // Check Storage
            do {
                if (checkElement <= 5) {
                    try {
                        await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                        storage = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                            const height = window.getComputedStyle(element).getPropertyValue("height").match(/\d+(\.\d+)?/);
                            return Math.floor(parseFloat(height[0]))
                        });

                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Storage'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Fetch Storage So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            } while (elementFound === false)

            prettyConsole(chalk.green(`Storage :${storage}%`))

            elementFound = false

            // Click Storage
            do {
                if (checkElement <= 5) {
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
                } else {
                    prettyConsole(chalk.red(`Fetch Storage Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            } while (elementFound === false)

            elementFound = false
            let balance

            // Check Balance
            do {
                if (checkElement <= 5) {
                    try {
                        await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                        balance = await iframe.evaluate(() => {
                            const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                            return parseFloat(element.textContent)
                        });

                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Balance'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Fetch Balance So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    continue mainLoop
                }
            } while (elementFound === false)

            prettyConsole(chalk.green(`Balance :${balance} ${chalk.yellow('$HOT🔥')}`))

            if (storage >= threshold) {
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

                await sleep(10000)

                elementFound = false
                let gasFree

                // Check Gas Free Amount
                do {
                    if (checkElement <= 3) {
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
                    } else {
                        prettyConsole(chalk.red(`Fetch Gas Amount So Take Long Time, Switch To Next Account`))
                        await browser.close()
                        elementFound = 'error'
                        continue mainLoop
                    }
                } while (elementFound === false)

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
                let reClaim = 0

                // Claim $HOT🔥
                const claimSelector = '#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
                do {
                    if (reClaim <= 3) {
                        elementFound = false

                        // Click Claim
                        do {
                            if (checkElement <= 5) {
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
                            } else {
                                prettyConsole(chalk.red(`Fetch Claim Button Show So Take Long Time, Switch To Next Account`))
                                await browser.close()
                                elementFound = 'error'
                                continue mainLoop
                            }
                        } while (elementFound === false)

                        prettyConsole(chalk.green(`Claiming ${chalk.yellow('$HOT🔥')}`))

                        let balanceAfter = 0

                        // Check Balance After Claim And Reclaim If Not Claimed
                        elementFound = false
                        do {
                            if (checkElement <= 10) {
                                if (balanceAfter <= balance) {
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

                                    if (checkElement === 5) {
                                        prettyConsole(chalk.yellow(`Still Claiming ${chalk.yellow('$HOT🔥')}`))
                                    }


                                    checkElement++
                                } else {
                                    prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT🔥')} Successfully!`))
                                    prettyConsole(chalk.green(`Balance :${balanceAfter} ${chalk.yellow('$HOT🔥')}`))
                                    elementFound = true
                                    claimed = true
                                }
                            } else {
                                // Tweak if not claimed with clicking boost
                                prettyConsole(chalk.red(`Claiming ${chalk.yellow('$HOT🔥')} So Take Long Time, Tweaking`))

                                let tweak = false
                                checkElement = 0

                                // Click Gas
                                do {
                                    if (checkElement <= 3) {
                                        try {
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
                                        prettyConsole(chalk.red(`Fetch Boost Button Show So Take Long Time, Switch To Next Account`))
                                        await browser.close()
                                        elementFound = 'error'
                                        continue mainLoop
                                    }
                                } while (tweak === false)

                                await sleep(5000)

                                tweak = false

                                // Click Back
                                do {
                                    if (checkElement <= 3) {
                                        try {
                                            await page.waitForSelector('.btn-icon.popup-close');
                                            await page.click('.btn-icon.popup-close');

                                            tweak = true
                                            checkElement = 0
                                        } catch (error) {
                                            prettyConsole(chalk.yellow('Still Fetch Back Button'))
                                            checkElement++
                                        }
                                    } else {
                                        prettyConsole(chalk.red(`Fetch Back Button Show So Take Long Time, Switch To Next Account`))
                                        await browser.close()
                                        elementFound = 'error'
                                        continue mainLoop
                                    }
                                } while (tweak === false)

                                prettyConsole(chalk.red(`Try To Re-Claim ${chalk.yellow('$HOT🔥')}`))
                                reClaim++
                                elementFound = true
                            }
                        } while (elementFound === false)

                        balance = balanceAfter
                    } else {
                        prettyConsole(chalk.red(`After Reclaim ${reClaim}x Still Not Claimed, Switch To Upgrade`))
                        claimed = true
                    }
                } while (claimed === false)
            } else {
                prettyConsole(chalk.yellow(`You Can Claim $HOT🔥 If Storage >= ${threshold}% `))
            }

            // Upgrade
            elementFound = false
            checkElement = 0

            // Click Boost
            do {
                if (checkElement <= 5) {
                    try {
                        await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                        account = await iframe.evaluate(() => {
                            document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                        })

                        elementFound = true
                        checkElement = 0
                    } catch (error) {
                        prettyConsole(chalk.yellow('Still Fetch Boost Button'))
                        checkElement++
                    }
                } else {
                    prettyConsole(chalk.red(`Boost Button Show So Take Long Time, Switch To Next Account`))
                    await browser.close()
                    elementFound = 'error'
                    return elementFound
                }
            } while (elementFound === false)

            await upgradeSpeed(iframe, balance, checkElement, elementFound)
            await upgradeStorage(iframe, balance, checkElement, elementFound)

            await browser.close()

            exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
            const rest = (Math.random() * (30 - 15) + 15) * 1000
            prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
            await sleep(rest)
        }
    }

    changeCronSchedule(minute);
}

(async () => {
    await main()
})()