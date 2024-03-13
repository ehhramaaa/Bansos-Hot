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
            return
        }
    }
}

const upgradeSpeed = async (iframe, balance, varElement, x) => {
    let level
    let price
    // Check Price Upgrade Speed
    varElement = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:first-of-type');
            return parseFloat(element.textContent)
        })
    }

    await checkElement(varElement, x, 'Check Price Upgrade Speed')

    prettyConsole(chalk.green(`Price Upgrade Speed :${price} ${chalk.yellow('$HOT🔥')}`))

    // Check Level Speed
    varElement = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
        level = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
            return element.textContent
        })
    }

    await checkElement(varElement, x, 'Check Level Speed')

    if (balance >= price) {
        if (!level.includes('5')) {
            // Click For Upgrade
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1)');
                await iframe.evaluate(() => {
                    document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1)').click();
                })
            }

            await checkElement(varElement, x, 'Click For Upgrade')

            await sleep(3000)

            // Confirm Upgrade
            varElement = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                })
            }

            await checkElement(varElement, x, 'Confirm Upgrade')

            // Make Sure Upgraded
            varElement = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                await iframe.evaluate(() => {
                    const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                    return element.textContent
                })
            }

            const upgraded = await checkElement(varElement, x, 'Make Sure Upgrade')

            if (upgraded) {
                // Click Got it
                varElement = async (x) => {
                    await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                    account = await iframe.evaluate(() => {
                        document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                    })
                }

                await checkElement(varElement, x, 'Click Got it')

                await sleep(3000)

                // Check Level Speed
                varElement = async (x) => {
                    await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
                    level = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(3) > div:nth-child(1) > div > div > p:nth-child(3)');
                        return element.textContent
                    })
                }

                await checkElement(varElement, x, 'Check Level Speed')

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

const upgradeStorage = async (iframe, balance, varElement, x) => {
    let level
    let price

    // Check Price Upgrade Storage
    varElement = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
        price = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:first-of-type');
            return parseFloat(element.textContent)
        })
    }

    await checkElement(varElement, x, 'Check Price Upgrade Storage')


    prettyConsole(chalk.green(`Price Upgrade Storage :${price} ${chalk.yellow('$HOT🔥')}`))

    // Check Level Storage
    varElement = async (x) => {
        await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
        level = await iframe.evaluate(() => {
            const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
            return element.textContent
        })
    }

    await checkElement(varElement, x, 'Check Level Storage')

    if (balance >= price) {
        if (!level.includes('5')) {
            // Click For Upgrade
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div');
                account = await iframe.evaluate(() => {
                    document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div').click();
                })
            }

            await checkElement(varElement, x, 'Click For Upgrade')

            await sleep(3000)

            // Confirm Upgrade
            varElement = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button');
                account = await iframe.evaluate(() => {
                    document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > button').click();
                })
            }

            await checkElement(varElement, x, 'Confirm Upgrade')

            // Make Sure Upgraded
            varElement = async (x) => {
                await iframe.waitForSelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                await iframe.evaluate(() => {
                    const element = document.querySelector('body > div:nth-child(9) > div > div.react-modal-sheet-content > div > img');
                    return element.textContent
                })
            }

            const upgraded = await checkElement(varElement, x, 'Make Sure Upgraded')

            await sleep(3000)

            if (upgraded) {
                // Check Level Storage
                varElement = async (x) => {
                    await iframe.waitForSelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
                    level = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div.sc-fHekdT.bVCZSw > div > div:nth-child(2) > div > div > div > p:nth-child(3)');
                        return element.textContent
                    })
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

    for (let x = 0; x <= 21; x++) {
        exec(`${ovpnPath} --command disconnect_all`);

        await sleep(7000)

        const ip = await checkIp()
        prettyConsole(chalk.magenta(`Current IP : ${ip}`))

        exec(`${ovpnPath} --command connect ${ovpnConfig[x]}`);

        // Wait for VPN connection to be established
        await new Promise(resolve => setTimeout(resolve, 5000));

        let isVpn = false;
        let vpn, browser, varElement

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
            varElement = async (x) => {
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

            await checkElement(varElement, x, 'Connecting Browser')

            await sleep(3000)

            prettyConsole(chalk.green(`Profile :${x}`))

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);

            // Goto Link
            varElement = async (x) => {
                await page.goto('https://web.telegram.org/k/#@herewalletbot', { waitUntil: ['networkidle2', 'domcontentloaded'] });
            }

            await checkElement(varElement, x, 'Goto Link')

            // Click Claim Now
            varElement = async (x) => {
                await page.waitForSelector('a.anchor-url[href="https://t.me/herewalletbot/app"]')
                await page.click('a.anchor-url[href="https://t.me/herewalletbot/app"]')
            }

            await checkElement(varElement, x, 'Click Claim Now')

            // Click Button Launch
            varElement = async (x) => {
                await page.waitForSelector('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
                await page.click('body > div.popup.popup-peer.popup-confirmation.active > div > div.popup-buttons > button:nth-child(1)')
            }

            await checkElement(varElement, x, 'Click Button Launch')

            await sleep(3000)

            // Handle iframe
            const iframeSelector = '.payment-verification';
            let iframeElementHandle
            varElement = async (x) => {
                await page.waitForSelector(iframeSelector)
                iframeElementHandle = await page.$(iframeSelector);
            }

            await checkElement(varElement, x, 'Handle iframe')

            await sleep(3000)

            const iframe = await iframeElementHandle.contentFrame();
            let account
            
            // Get Account Name
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(1) > p');
                account = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div > div > div:nth-child(1) > p');
                    return element.textContent
                })
            }

            prettyConsole(chalk.green(`Account :${account}`))
            
            let near
            await checkElement(varElement, x, 'Get Account Name')
            
            // Get Near Balance
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(6) > div:nth-child(3) > div > div:nth-child(2) > p:nth-child(2)');
                near = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div > div > div:nth-child(6) > div:nth-child(3) > div > div:nth-child(2) > p:nth-child(2)');
                    return element.textContent
                })
            }
            
            await checkElement(varElement, x, 'Get Near Balance')
            
            prettyConsole(chalk.green(`Near Balance :${near}`))

            let storage = 0
            const threshold = 93;

            await sleep(5000)

            // Check Storage
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                storage = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1) > div');
                    const height = window.getComputedStyle(element).getPropertyValue("height").match(/\d+(\.\d+)?/);
                    return Math.floor(parseFloat(height[0]))
                });
            }

            await checkElement(varElement, x, 'Check Storage')

            prettyConsole(chalk.green(`Storage :${storage}%`))

            // Click Storage
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)');
                await iframe.evaluate(() => {
                    document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)').click();
                });
            }

            await checkElement(varElement, x, 'Click Storage')

            let balance

            // Check Balance
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                balance = await iframe.evaluate(() => {
                    const element = document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(4) > p:nth-child(3)');
                    return parseFloat(element.textContent)
                });
            }

            await checkElement(varElement, x, 'Check Balance')

            prettyConsole(chalk.green(`Balance :${balance} ${chalk.yellow('$HOT🔥')}`))

            if (storage >= threshold) {
                // Click Gas
                varElement = async (x) => {
                    await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(1)').click();
                    });
                }

                await checkElement(varElement, x, 'Click Gas')

                // Click Tab Gas
                varElement = async (x) => {
                    await iframe.waitForSelector('#root > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(3)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div:nth-child(4) > div:nth-child(1) > div > div:nth-child(3)').click();
                    });
                }

                await checkElement(varElement, x, 'Click Tab Gas')

                // Wait For Counting Gas Amount
                await sleep(10000)

                let gasFree

                // Check Gas Free Amount
                varElement = async (x) => {
                    await iframe.waitForSelector('#root > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > h3');
                    gasFree = await iframe.evaluate(() => {
                        const element = document.querySelector('#root > div > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(1) > h3');
                        return parseFloat(element.textContent)
                    });
                }

                await checkElement(varElement, x, 'Check Gas Free Amount')

                prettyConsole(chalk.green(`Gas Free :${gasFree}`))

                // Click Back
                varElement = async (x) => {
                    await page.waitForSelector('.popup-close');
                    await page.click('.popup-close');
                }

                await checkElement(varElement, x, 'Click Back')

                // Click Storage
                varElement = async (x) => {
                    await iframe.waitForSelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)');
                    await iframe.evaluate(() => {
                        document.querySelector('#root > div > div > div > div:nth-child(4) > div:nth-child(2)').click();
                    });
                }

                await checkElement(varElement, x, 'Click Storage')


                await sleep(3000)

                let claimed = false
                let reClaim = 0

                // Claim $HOT🔥
                do {
                    if (reClaim <= 5) {
                        // Click Claim
                        varElement = async (x) => {
                            const claimSelector = '#root > div > div:nth-child(3) > div > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > button'
                            await iframe.waitForSelector(claimSelector);
                            await iframe.evaluate((selector) => {
                                document.querySelector(selector).click();
                            }, claimSelector);
                        }

                        await checkElement(varElement, x, 'Click Claim')

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
                                varElement = async (x) => {
                                    await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                                    account = await iframe.evaluate(() => {
                                        document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                                    })
                                }

                                await checkElement(varElement, x, 'Click Boost')

                                await sleep(5000)

                                tweak = false

                                // Click Back
                                varElement = async (x) => {
                                    await page.waitForSelector('.btn-icon.popup-close');
                                    await page.click('.btn-icon.popup-close');
                                }

                                await checkElement(varElement, x, 'Click Back')

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
            varElement = async (x) => {
                await iframe.waitForSelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)');
                account = await iframe.evaluate(() => {
                    document.querySelector('#root > div > div:nth-child(3) > div > div:nth-child(4) > div > div:nth-child(3)').click();
                })
            }

            await checkElement(varElement, x, 'Click Boost')

            await upgradeSpeed(iframe, balance, varElement, x)
            // await upgradeStorage(iframe, balance, varElement, x)

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