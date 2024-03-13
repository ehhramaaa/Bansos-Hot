const puppeteer = require('puppeteer');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const { exec } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cron = require('node-cron');
const os = require('os')

const folderPath = 'C:\\Program Files\\OpenVPN\\config';
const ovpnPath = '"C:\\Program Files\\OpenVPN\\bin\\openvpn-gui.exe"';
const chromeUserPath = `${os.homedir()}\\AppData\\Local\\Google\\Chrome\\User Data`;
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

async function checkElement(element, x, message) {
    let checkElement = false
    let trycheckElement = 0

    while (checkElement === false) {
        if (trycheckElement <= 3) {
            try {
                if (message === 'Connecting Browser') {
                    const browser = await element(x)
                    const browserConnected = await browser.isConnected()

                    if (browserConnected) {
                        checkElement = true
                        return checkElement
                    }
                } else {
                    await element(x)
                    checkElement = true
                    return checkElement
                }
            } catch (error) {
                prettyConsole(chalk.yellow(`Still Fetch ${message}`))
                trycheckElement++
            }
        } else {
            prettyConsole(chalk.red(`Profile ${x} ${message} Show So Take Long Time, Switch To Next Account`))
            checkElement = true
            return false
        }
    }
}

const upgradeSpeed = async (iframe, balance, x) => {
    let level
    let price
    let isContinue
    // Check Price Upgrade Speed
    const priceUpgrade = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
            return parseFloat(element.textContent)
        })
    }

    isContinue = await checkElement(priceUpgrade, x, 'Check Price Upgrade Speed')

    if (!isContinue) {
        return false
    }

    prettyConsole(chalk.green(`Price Upgrade Speed :${price} ${chalk.yellow('$HOT🔥')}`))

    // Check Level Speed
    const levelSpeed = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
        level = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
            return element.textContent
        })
    }

    isContinue = await checkElement(levelSpeed, x, 'Check Level Speed')

    if (!isContinue) {
        return false
    }

    if (balance >= price) {
        if (!level.includes('5')) {
            // Click For Upgrade
            const upgradeClick = async (x) => {
                await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1)');
                await iframe.evaluate(() => {
                    document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1)').click();
                })
            }

            isContinue = await checkElement(upgradeClick, x, 'Click For Upgrade')

            if (!isContinue) {
                return false
            }

            await sleep(3000)

            // Confirm Upgrade
            const confirmUpgrade = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                })
            }

            isContinue = await checkElement(confirmUpgrade, x, 'Confirm Upgrade')

            if (!isContinue) {
                return false
            }

            // Make Sure Upgraded
            const makeSureUpgrade = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                await iframe.evaluate(() => {
                    const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                    return element.textContent
                })
            }

            const upgraded = await checkElement(makeSureUpgrade, x, 'Make Sure Upgrade')

            if (upgraded) {
                // Click Got it
                const gotIt = async (x) => {
                    await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                    account = await iframe.evaluate(() => {
                        document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                    })
                }

                isContinue = await checkElement(gotIt, x, 'Click Got it')

                if (!isContinue) {
                    return false
                }

                await sleep(3000)

                // Check Level Speed
                const levelSpeed = async (x) => {
                    await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
                    level = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
                        return element.textContent
                    })
                }

                isContinue = await checkElement(levelSpeed, x, 'Check Level Speed')

                if (!isContinue) {
                    return false
                }

                prettyConsole(chalk.green(`Upgrade Level Speed Successfully, Current Level Speed :${level}`))

                balance = balance - price
            } else {
                prettyConsole(chalk.red(`Upgrade Level Speed Failed!`))
            }
        } else {
            prettyConsole(chalk.yellow(`Your Level Is 5, Only Claiming Not Upgrading`))
        }
    } else {
        prettyConsole(chalk.yellow(`Balance $HOT🔥 Not Enough For Upgrade Speed`))
    }
}

const upgradeStorage = async (iframe, balance, x) => {
    let level
    let price
    let isContinue

    // Check Price Upgrade Storage
    const checkPrice = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
            return parseFloat(element.textContent)
        })
    }

    isContinue = await checkElement(checkPrice, x, 'Check Price Upgrade Storage')

    if (!isContinue) {
        return false
    }

    prettyConsole(chalk.green(`Price Upgrade Storage :${price} ${chalk.yellow('$HOT🔥')}`))

    // Check Level Storage
    const checkLevel = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
        level = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
            return element.textContent
        })
    }

    isContinue = await checkElement(checkLevel, x, 'Check Level Storage')

    if (!isContinue) {
        return false
    }

    if (balance >= price) {
        if (!level.includes('5')) {
            // Click For Upgrade
            const clickUpgrade = async (x) => {
                await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div');
                account = await iframe.evaluate(() => {
                    document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div').click();
                })
            }

            isContinue = await checkElement(clickUpgrade, x, 'Click For Upgrade')

            if (!isContinue) {
                return false
            }

            await sleep(3000)

            // Confirm Upgrade
            const confirmUpgrade = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                account = await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                })
            }

            isContinue = await checkElement(confirmUpgrade, x, 'Confirm Upgrade')

            if (!isContinue) {
                return false
            }

            // Make Sure Upgraded
            const makeSureUpgrade = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                await iframe.evaluate(() => {
                    const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                    return element.textContent
                })
            }

            const upgraded = await checkElement(makeSureUpgrade, x, 'Make Sure Upgraded')
            
            await sleep(3000)
            
            if (upgraded) {
                // Check Level Storage
                const checkLevel = async (x) => {
                    await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
                    level = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
                        return element.textContent
                    })
                }
                
                const isContinue = await checkElement(checkLevel, x, 'Make Sure Upgraded')

                if (!isContinue) {
                    return false
                }

                prettyConsole(chalk.green(`Upgrade Level Storage Successfully, Current Level Storage :${level}`))
            } else {
                prettyConsole(chalk.red(`Upgrade Level Storage Failed!`))
            }
        } else {
            prettyConsole(chalk.yellow(`Your Level Is 5, Only Claiming Not Upgrading`))
        }
    } else {
        prettyConsole(chalk.yellow(`Balance $HOT🔥 Not Enough For Upgrade Storage`))
    }
}

async function main() {
    console.log(chalk.cyan(`\n<==================================[${moment().format('HH:mm:ss DD-MM-YYYY')}]==================================>`))

    const minute = Math.floor(Math.random() * (15 - 1 + 1)) + 1
    const ovpnConfig = await ovpnReadConfig(folderPath)

    mainLoop: for (let x = 0; x <= 21; x++) {
        exec(`${ovpnPath} --command disconnect_all`);

        await sleep(7000)

        const ip = await checkIp()
        prettyConsole(chalk.magenta(`Current IP : ${ip}`))

        exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);

        // Wait for VPN connection to be established
        await new Promise(resolve => setTimeout(resolve, 5000));

        let isVpn = false;
        let vpn, browser, isContinue

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
            // Connect Browser
            const connectBrowser = async (x) => {
                let launchOptions = {
                    headless: true,
                    args: [
                        `--user-data-dir=${chromeUserPath}`,
                        x === 0 ? '--profile-directory=Default' : `--profile-directory=Profile ${x}`
                    ]
                };

                browser = await puppeteer.launch(launchOptions);

                await sleep(3000)

                return browser
            }

            isContinue = await checkElement(connectBrowser, x, 'Connecting Browser')

            if (!isContinue) {
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            await sleep(3000)

            prettyConsole(chalk.green(`Profile :${x}`))

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);

            // Goto Link
            const gotoLink = async (x) => {
                await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
            }

            isContinue = await checkElement(gotoLink, x, 'Goto Link')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            await sleep(3000)
            
            // Click Claim Now
            const claimNow = async (x) => {
                await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
            }

            isContinue = await checkElement(claimNow, x, 'Click Claim Now')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            await sleep(3000)
            
            // Click Button Launch
            const buttonLaunch = async (x) => {
                await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                await sleep(3000)
                await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
            }

            isContinue = await checkElement(buttonLaunch, x, 'Click Button Launch')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            await sleep(3000)

            // Handle iframe
            const iframeSelector = '.payment-verification';
            let iframeElementHandle
            const handleFrame = async (x) => {
                await page.waitForSelector(iframeSelector)
                iframeElementHandle = await page.$(iframeSelector);
            }

            isContinue = await checkElement(handleFrame, x, 'Handle iframe')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            await sleep(3000)

            const iframe = await iframeElementHandle.contentFrame();

            let account

            // Get Account Name
            const getAccountName = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(1) > p');
                account = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div > div > div:nth-child(1) > p');
                    return element.textContent
                })
            }

            isContinue = await checkElement(getAccountName, x, 'Get Account Name')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            prettyConsole(chalk.green(`Account :${account}`))

            let near

            // Get Near Balance
            const nearBalance = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(6) > div.sc-cMdePl.cDBmgc > div > div:nth-child(2) > p:nth-child(2)');
                near = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div > div > div:nth-child(6) > div.sc-cMdePl.cDBmgc > div > div:nth-child(2) > p:nth-child(2)');
                    return element.textContent
                })
            }

            isContinue = await checkElement(nearBalance, x, 'Get Near Balance')

            if (!isContinue) {
                prettyConsole(chalk.green(`Are You Have UWON? If U Have, Chage Selector At Line 565 And 566`))
            }

            prettyConsole(chalk.green(`Near Balance :${near}`))

            let storage = 0
            const threshold = 93;

            await sleep(5000)

            // Check Storage
            const checkStorage = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                storage = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                    const height = window.getComputedStyle(element).getPropertyValue("height").match(/\d+(\.\d+)?/);
                    return Math.floor(parseFloat(height[0]))
                });
            }

            isContinue = await checkElement(checkStorage, x, 'Check Storage')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            prettyConsole(chalk.green(`Storage :${storage}%`))

            // Click Storage
            const clickStorage = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)');
                await iframe.evaluate(() => {
                    document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)').click();
                });
            }

            isContinue = await checkElement(clickStorage, x, 'Click Storage')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            let balance

            // Check Balance
            const checkBalance = async (x) => {
                await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                balance = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                    return parseFloat(element.textContent)
                });
            }

            isContinue = await checkElement(checkBalance, x, 'Check Balance')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            prettyConsole(chalk.green(`Balance :${balance} ${chalk.yellow('$HOT🔥')}`))

            if (storage >= threshold) {
                // Click Gas
                const clickGas = async (x) => {
                    await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)').click();
                    });
                }

                isContinue = await checkElement(clickGas, x, 'Click Gas')

                if (!isContinue) {
                    await browser.close()
                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                    await sleep(rest)
                    continue mainLoop
                }

                // Click Tab Gas
                const tabGas = async (x) => {
                    await iframe.waitForSelector('#root > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(3)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(3)').click();
                    });
                }

                isContinue = await checkElement(tabGas, x, 'Click Tab Gas')

                if (!isContinue) {
                    await browser.close()
                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                    await sleep(rest)
                    continue mainLoop
                }

                // Wait For Counting Gas Amount
                await sleep(10000)

                let gasFree

                // Check Gas Free Amount
                const checkGas = async (x) => {
                    await iframe.waitForSelector('#root > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > h3');
                    gasFree = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > h3');
                        return parseFloat(element.textContent)
                    });
                }

                isContinue = await checkElement(checkGas, x, 'Check Gas Free Amount')

                if (!isContinue) {
                    await browser.close()
                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                    await sleep(rest)
                    continue mainLoop
                }

                prettyConsole(chalk.green(`Gas Free :${gasFree}`))

                // Click Back
                const clickBack = async (x) => {
                    await page.waitForSelector('.popup-close');
                    await page.click('.popup-close');
                }

                isContinue = await checkElement(clickBack, x, 'Click Back')

                if (!isContinue) {
                    await browser.close()
                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                    await sleep(rest)
                    continue mainLoop
                }

                // Click Storage
                const clickStorage = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)').click();
                    });
                }

                isContinue = await checkElement(clickStorage, x, 'Click Storage')

                if (!isContinue) {
                    await browser.close()
                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                    await sleep(rest)
                    continue mainLoop
                }

                await sleep(3000)

                let claimed = false
                let reClaim = 0

                // Claim $HOT🔥
                do {
                    if (reClaim <= 5) {
                        // Click Claim
                        const clickClaim = async (x) => {
                            const claimSelector = '#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
                            await iframe.waitForSelector(claimSelector);
                            await iframe.evaluate((selector) => {
                                document.querySelector(selector).click();
                            }, claimSelector);
                        }

                        isContinue = await checkElement(clickClaim, x, 'Click Claim')

                        if (!isContinue) {
                            await browser.close()
                            exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                            const rest = (Math.random() * (30 - 15) + 15) * 1000
                            prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                            await sleep(rest)
                            continue mainLoop
                        }

                        prettyConsole(chalk.green(`Claiming ${chalk.yellow('$HOT🔥')}`))

                        let balanceAfter = 0
                        let makeSure = false
                        let tryMakeSure = 0

                        // Check Balance After Claim And Reclaim If Not Claimed
                        do {
                            if (tryMakeSure <= 5) {
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


                                    tryMakeSure++
                                } else {
                                    prettyConsole(chalk.green(`Claim ${chalk.yellow('$HOT🔥')} Successfully!`))
                                    prettyConsole(chalk.green(`Balance :${balanceAfter} ${chalk.yellow('$HOT🔥')}`))
                                    makeSure = true
                                    claimed = true
                                }
                            } else {
                                // Tweak if not claimed with clicking boost
                                prettyConsole(chalk.red(`Claiming ${chalk.yellow('$HOT🔥')} So Take Long Time, Tweaking`))

                                // Click Boost
                                const clickBoost = async (x) => {
                                    await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                                    account = await iframe.evaluate(() => {
                                        document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                                    })
                                }

                                isContinue = await checkElement(clickBoost, x, 'Click Boost')

                                if (!isContinue) {
                                    await browser.close()
                                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                                    await sleep(rest)
                                    continue mainLoop
                                }

                                await sleep(5000)

                                tweak = false

                                // Click Back
                                const clickBack = async (x) => {
                                    await page.waitForSelector('.btn-icon.popup-close');
                                    await page.click('.btn-icon.popup-close');
                                }

                                isContinue = await checkElement(clickBack, x, 'Click Back')

                                if (!isContinue) {
                                    await browser.close()
                                    exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                                    const rest = (Math.random() * (30 - 15) + 15) * 1000
                                    prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                                    await sleep(rest)
                                    continue mainLoop
                                }

                                prettyConsole(chalk.red(`Try To Re-Claim ${chalk.yellow('$HOT🔥')}`))
                                reClaim++
                                makeSure = true
                            }
                        } while (makeSure === false)

                        balance = balanceAfter
                    } else {
                        prettyConsole(chalk.red(`After Reclaim ${reClaim}x Still Not Claimed, Switch To Upgrade`))
                        claimed = true
                    }
                } while (claimed === false)
            } else {
                prettyConsole(chalk.yellow(`You Can Claim $HOT🔥 If Storage >= ${threshold}% `))
            }

            // Click Boost
            const clickBoost = async (x) => {
                await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                account = await iframe.evaluate(() => {
                    document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                })
            }

            isContinue = await checkElement(clickBoost, x, 'Click Boost')

            if (!isContinue) {
                await browser.close()
                exec(`${ovpnPath} --command disconnect ${ovpnConfig[x]}`);
                const rest = (Math.random() * (30 - 15) + 15) * 1000
                prettyConsole(chalk.green(`VPN Disconnect, Take rest for ${Math.floor(rest / 1000)} second\n`))
                await sleep(rest)
                continue mainLoop
            }

            await upgradeSpeed(iframe, balance, x)

            // await upgradeStorage(iframe, balance, x)

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