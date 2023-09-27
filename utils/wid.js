const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199];

function sumDigits(n) {
    let sum = 0;
    while (n > 0) {
        sum += n % 10;
        n = Math.floor(n / 10);
    }
    return sum;
}

function sumDigits0(n) {
    while (n >= 10) n = sumDigits(n);
    return n;
}

function checkSum(c) {
    let sum = 7;
    for(let i=0; i<15; i++) {
        const a = 1*c[i];
        // if(isNaN(a) || a < 0 || a > 9) return -2537;
        sum += PRIMES[i]*a;
    }
    return sumDigits0(sum);
}

function _createWid(count) {
    let n = count + 253775311357;

    let ret = "";
    for(let i=0; i<15; i++) {
        const d = n%10;
        n = Math.floor(n/10);
        ret = d + ret;
        // console.log(d);
    }

    return ret + checkSum(ret);

}

const nextCount = require("../app/api/models/counters");

async function createWid() {
    let cnt = await nextCount("wid");
    return _createWid(cnt);
}

const createOrderNo = function () {

    const r = Math.floor(1000*Math.random());
    const rand = r < 100 ? "0"+r : r < 10 ? "00"+r : ""+r;

    const now = Date.now();

    const cc = now+rand;
    // console.log(cc);
    return cc.substring(cc.length-16);

};

function stdCustomerNumber(number) {
    if(!number || number.length !== 16) return number;
    return [
        number.substring(0, 4),
        number.substring(4, 8),
        number.substring(8, 12),
        number.substring(12, 16),
    ].join("-");
}

module.exports = {
    createWid,
    createOrderNo,
    stdCustomerNumber
};
