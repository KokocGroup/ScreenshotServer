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
                console.log("Create: ", pid);
                instance.on("disconnected", function() {
                    this.isDisconected = true;
                });
                return instance;
            });
        },
        destroy: instance => {
            return new Promise((resolve, reject) => {
                const pid = instance.process().pid;
                console.log("Destroy: ", pid);
                instance.close()
            });
        },
        validate: instance => {
            return validator(instance).then(valid => {
                const dateValidate = (new Date() - instance.startDate) > (60 * 1000)
                const isValid = valid && dateValidate && !instance.isDisconected && (maxUses <= 0 || instance.useCount < maxUses);
                console.log("Validate: ", instance.process().pid, isValid);
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
        let pid;
        return pool
            .acquire()
            .then(r => {
                resource = r;
                resource.useCount += 1;
                pid = resource.process().pid
                return r;
            })
            .then(fn)
            .then(
                result => {
                    pool.release(resource);
                    return result;
                },
                err => {
                    pool.release(resource);
                    console.error(`pid ${pid}: `, err.stack)
                    throw err;
                }
            );
    };

    return pool;
};

initPuppeteerPool.default = initPuppeteerPool;

module.exports = initPuppeteerPool;
