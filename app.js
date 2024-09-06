const puppeteer = require('puppeteer');
const { solveRecaptcha } = require('2captcha');
const { apiKey } = require('./config');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navegue até a página de login
  await page.goto('https://pasino.com/page/login');

  // Obtenha o código do reCAPTCHA
  const recaptchaSiteKey = await page.evaluate(() => {
    return document.querySelector('.g-recaptcha').getAttribute('data-sitekey');
  });

  // Solicite a solução do reCAPTCHA ao 2Captcha
  const captchaId = await solveRecaptcha(apiKey, 'https://pasino.com/page/login', recaptchaSiteKey);

  // Aguardando a solução do reCAPTCHA
  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 5000));
    result = await solveRecaptcha(apiKey, captchaId);
  } while (result.status === 'processing');

  // Preencha o reCAPTCHA com o token
  await page.evaluate((token) => {
    document.querySelector('#g-recaptcha-response').innerHTML = token;
  }, result.solution);

  // Preencha o formulário de login
  await page.type('#login-email-input', 'YOUR_EMAIL'); // Substitua pelo seu e-mail
  await page.type('#login-password-input', 'YOUR_PASSWORD'); // Substitua pela sua senha

  // Clique no botão de login
  await page.click('span.baseButton__label > div.style_fade__2ndNh.style_playShow__21Z_G');

  // Continue com suas outras ações no Puppeteer

  await browser.close();
})();
