const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");

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
                instance.useCount = 0;
                return instance;
            })
        },
        destroy: instance => {
            return instance.close();
        },
        validate: instance => {
            return validator(instance).then(valid => Promise.resolve(valid && (maxUses <= 0 || instance.useCount < maxUses)));
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
    const genericAcquire = pool.acquire.bind(pool);
    pool.acquire = () =>
        genericAcquire().then(instance => {
            instance.useCount += 1;
            return instance;
        });
    pool.use = fn => {
        let resource;
        return pool
            .acquire()
            .then(r => {
                resource = r;
                return resource;
            })
            .then(fn)
            .then(
                result => {
                    pool.release(resource);
                    return result;
                },
                err => {
                    pool.release(resource);
                    throw err;
                }
            );
    };

    return pool;
};

initPuppeteerPool.default = initPuppeteerPool;

module.exports = initPuppeteerPool;
