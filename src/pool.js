const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");
const child_process = require("child_process");

const initPuppeteerPool = ({
    max = 2,
    min = 0,
    idleTimeoutMillis = 30000,
    maxUses = 50,
    testOnBorrow = true,
    puppeteerArgs = {},
    validator = () => Promise.resolve(true),
    ...otherConfig
} = {}) => {
    const factory = {
        create: () => {
            return puppeteer.launch(puppeteerArgs).then(instance => {
                instance.isDisconected = false;
                instance.useCount = 0;
                instance.startDate = new Date();
                const pid = instance.process().pid;
                instance.on("disconnected", function() {
                    instance.isDisconected = true;
                });

                instance.clearInterval = setInterval(function() {
                    if (instance.isDisconected) {
                        try {
                            process.kill(pid, "SIGKILL");
                        } catch (e) {
                        } finally {
                            clearInterval(instance.clearInterval);
                        }
                    }
                }, 1000);

                return instance;
            });
        },
        destroy: instance => {
            return instance.close();
        },
        validate: instance => {
            return validator(instance).then(valid => {
                const dateValidate = new Date() - instance.startDate > 60 * 1000;
                const isValid = valid && !dateValidate && !instance.isDisconected && (maxUses <= 0 || instance.useCount < maxUses);
                return Promise.resolve(isValid);
            });
        }
    };
    const config = {
        max,
        min,
        idleTimeoutMillis,
        testOnBorrow,
        ...otherConfig
    };
    const pool = genericPool.createPool(factory, config);

    pool.use = fn => {
        let resource;
        let pages;
        return pool
            .acquire()
            .then(async r => {
                resource = r;
                resource.useCount += 1;
                pages = (await resource.pages()).length;
                return r;
            })
            .then(fn)
            .then(
                async result => {
                    if (pages !== (await resource.pages()).length) {
                        pool.destroy(resource);
                    } else {
                        pool.release(resource);
                    }
                    return result;
                },
                async err => {
                    if (pages !== (await resource.pages()).length) {
                        pool.destroy(resource);
                    } else {
                        pool.release(resource);
                    }
                    throw err;
                }
            );
    };

    return pool;
};

initPuppeteerPool.default = initPuppeteerPool;

module.exports = initPuppeteerPool;
