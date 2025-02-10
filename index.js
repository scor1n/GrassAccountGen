const ffi = require('ffi-napi');
const uuidv4 = require('uuid').v4;
const fs = require('fs');

// Fill the following information
const catchallDomain = 'catchall.com';
const capSolverApiKey = 'YOUR_CAPSOL'; // https://dashboard.capsolver.com/passport/register?inviteCode=6XKugRuEv4Hb
const referralCode = 'EV08HjfB81lPdgM'; // Referal code from grass
const amount = 10; // Amount of accounts to generate

// Do not modify
const tlsClientLibrary = ffi.Library('./tls-client/tls-client-windows-64-1.8.0.dll', {
    request: ['string', ['string']]
});
let sessionId = uuidv4();

GenerateGrassAccounts(amount);

async function GenerateGrassAccounts(amount) {
    let proxies = GetProxies();
    for (let i = 0; i < amount; i++) {
        sessionId = uuidv4();
        let proxy = proxies[Math.floor(Math.random() * proxies.length)];
        let splitproxy = proxy.split(':');
        let ipport = splitproxy[0] + ':' + splitproxy[1];
        let userpass = splitproxy[2] + ':' + splitproxy[3];
        ipport = ipport.replace(/\s/g, '');
        userpass = userpass.replace(/\s/g, '');
        let fullproxy = 'http://' + userpass + '@' + ipport;
        let username = GenerateUsername();
        let password = GeneratePassword();
        let captchaToken = await GetCaptchaToken();
        let url = 'https://api.getgrass.io/register';
        let headers = {
            'sec-ch-ua-platform': '"Windows"',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
            'Content-Type': 'application/json',
            'sec-ch-ua-mobile': '?0',
            'Origin': 'https://app.getgrass.io',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://app.getgrass.io/register',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
        };
        let body = {
            "email": username,
            "password": password,
            "role": "USER",
            "referralCode": referralCode,
            "marketingEmailConsent": false,
            "recaptchaToken": captchaToken,
            "listIds": [15]
        };
        let response = PostRequest(url, headers, JSON.stringify(body), fullproxy);
        if (response.status !== 200) {
            console.log('Error registering account');
            console.log(response);
            return;
        } 
        else 
        {
            console.log('Account registered');
            SaveLoginInfo(username, password, proxy);
            proxies = proxies.filter(p => p !== proxy);
        }
    }
}

async function GetCaptchaToken() {
    // get captcha token from capsolver
    var url = 'https://api.capsolver.com/createTask';
    var headers = {
        'Content-Type': 'application/json',
    };
    var body = {
        'clientKey': capSolverApiKey,
        'task': {
            "type": "ReCaptchaV2EnterpriseTaskProxyLess",
            "websiteURL": "https://app.getgrass.io/register",
            "websiteKey": "6LeeT-0pAAAAAFJ5JnCpNcbYCBcAerNHlkK4nm6y",
            "isInvisible": false,
        }
    };
    var response = PostRequest(url, headers, JSON.stringify(body));
    var responsebody = response.body;
    var json = JSON.parse(responsebody);
    if (json['errorId'] === 1) { 
        console.log('Error creating captcha task');
        console.log(json);
        return '';
    }
    var taskId = json['taskId'];
    var captchaToken = '';
    while (true) {
        url = 'https://api.capsolver.com/getTaskResult';
        body = {
            'clientKey': capSolverApiKey,
            'taskId': taskId,
        };
        response = PostRequest(url, headers, JSON.stringify(body));
        responsebody = response.body;
        json = JSON.parse(responsebody);
        if (json['status'] === 'ready') {
            captchaToken = json['solution']['gRecaptchaResponse'];
            break;
        } else if (json['errorId'] === 1) {
            console.log('Error getting captcha token');
            console.log(json);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return captchaToken;
}

function GenerateUsername() {
    let username = '';
    let chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
        username += chars[Math.floor(Math.random() * chars.length)];
    }
    username += `@${catchallDomain}`;
    return username;
}

function GeneratePassword() {
    let password = '';
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 11; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    password += '!';
    return password;
}

function GetProxies() {
    let proxies = fs.readFileSync('./input/proxies.txt', 'utf8').split('\n');
    return proxies;
}

function SaveLoginInfo(username, password, proxy) {
    let data = `${username},${password},${proxy}\n`;
    fs.appendFileSync('./output/logins.txt', data);
}

function PostRequest(url, headers, body, proxy) {
    var requestPayload = {
        tlsClientIdentifier: 'chrome_133',
        followRedirects: false,
        timeoutSeconds: 30,
        sessionId: sessionId,
        headers: headers,
        headerOrder: [
            'accept',
            'accept-encoding',
            'authorization',
            'connection',
            'content-length',
            'content-type',
            'host',
            'user-agent',
        ],
        requestUrl: url,
        requestMethod: 'POST',
        requestBody: body
    };
    if (proxy != undefined && proxy.host != undefined) {
        requestPayload = {
            tlsClientIdentifier: 'chrome_133',
            followRedirects: false,
            timeoutSeconds: 30,
            sessionId: sessionId,
            proxyUrl: proxy,
            headers: headers,
            headerOrder: [
                'accept',
                'accept-encoding',
                'authorization',
                'connection',
                'content-length',
                'content-type',
                'host',
                'user-agent',
            ],
            requestUrl: url,
            requestMethod: 'POST',
            requestBody: body
        };
    }
    var response = tlsClientLibrary.request(JSON.stringify(requestPayload));
    return JSON.parse(response);
};
