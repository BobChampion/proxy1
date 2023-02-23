const puppeteer = require('puppeteer');
let ports = require('./port.json');
const user = 'IT';

function randomPassword(len = 8, minUpper = 0, minLower = 0, minNumber = -1, minSpecial = -1) {
  let chars = String.fromCharCode(...Array(127).keys()).slice(33), //chars
    A2Z = String.fromCharCode(...Array(91).keys()).slice(65), //A-Z
    a2z = String.fromCharCode(...Array(123).keys()).slice(97), //a-z
    zero2nine = String.fromCharCode(...Array(58).keys()).slice(48), //0-9
    specials = chars.replace(/\w/g, '');
  if (minSpecial < 0) chars = zero2nine + A2Z + a2z;
  if (minNumber < 0) chars = chars.replace(zero2nine, '');
  let minRequired = minSpecial + minUpper + minLower + minNumber;
  let rs = [].concat(
    Array.from(
      { length: minSpecial ? minSpecial : 0 },
      () => specials[Math.floor(Math.random() * specials.length)],
    ),
    Array.from(
      { length: minUpper ? minUpper : 0 },
      () => A2Z[Math.floor(Math.random() * A2Z.length)],
    ),
    Array.from(
      { length: minLower ? minLower : 0 },
      () => a2z[Math.floor(Math.random() * a2z.length)],
    ),
    Array.from(
      { length: minNumber ? minNumber : 0 },
      () => zero2nine[Math.floor(Math.random() * zero2nine.length)],
    ),
    Array.from(
      { length: Math.max(len, minRequired) - (minRequired ? minRequired : 0) },
      () => chars[Math.floor(Math.random() * chars.length)],
    ),
  );
  return rs.sort(() => Math.random() > Math.random()).join('');
}

function getMonth(monthStr) {
  return new Date(monthStr + '-1-01').getMonth() + 1;
}

function generateRandomPostcode() {
  let postcode = '';

  // Italian postcodes have a length of 5 digits
  for (let i = 0; i < 5; i++) {
    postcode += Math.floor(Math.random() * 10);
  }

  return postcode;
}

const cities = [
  'Roma',
  'Milano',
  'Napoli',
  'Torino',
  'Palermo',
  'Genova',
  'Bologna',
  'Firenze',
  'Bari',
  'Catania',
  'Venezia',
  'Verona',
  'Messina',
  'Padova',
  'Trieste',
  'Brescia',
  'Parma',
  'Modena',
  'Reggio Calabria',
  'Reggio Emilia',
  'Perugia',
  'Livorno',
  'Ravenna',
  'Cagliari',
  'Foggia',
  'Forlì',
  'Udine',
  'Taranto',
  'Piacenza',
  'Ancona',
];

const months = {
  1: 'Gennaio',
  2: 'Febbraio',
  3: 'Marzo',
  4: 'Aprile',
  5: 'Maggio',
  6: 'Giugno',
  7: 'Luglio',
  8: 'Agosto',
  9: 'Settembre',
  10: 'Ottobre',
  11: 'Novembre ',
  12: 'Dicembre',
};

function generateRandomCityName() {
  const randomIndex = Math.floor(Math.random() * cities.length);
  return cities[randomIndex];
}

const person = {
  name: '',
  surname: '',
  email: '',
  password: randomPassword(8, 1, 1, 1),
  birthday: {
    day: '',
    month: '',
    year: '',
  },
  phone: '',
  street: '',
  city: generateRandomCityName(),
  postcode: generateRandomPostcode(),
};

(async () => {
  const port = Math.floor(
    Math.random() * (ports[user].max - ports[user].min + 1) + ports[user].min,
  );
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: [
      '--disable-blink-features=AutomationControlled',
      `--proxy-server=${user.toLowerCase()}-pr.oxylabs.io:${port}`,
      '--no-sandbox',
    ],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });
  const userAgent = await browser.userAgent();
  await page.setUserAgent(userAgent.replaceAll(/HeadlessChrome/gi, 'Chrome'));
  // let newUserAgent = await page.evaluate('navigator.userAgent');
  await page.authenticate({
    username: 'proxclimbingorange',
    password: '!+G+EI^H7&SD**Vr',
  });
  await page.goto('https://www.fakenamegenerator.com/');

  await page.waitForSelector('select#gen');
  await page.select('select#gen', 'male');
  await page.waitForSelector('select#n');
  await page.select('select#n', 'it');
  await page.waitForSelector('select#c');
  await page.select('select#c', 'it');
  await page.waitForSelector('#genbtn');
  await page.click('#genbtn');

  // name and surname
  await page.waitForSelector('.address h3');
  let fullname = await page.evaluate(() => {
    let emailText = document.querySelector('.address h3').innerText;
    return emailText;
  });
  person.name = fullname.split(' ')[0];
  person.surname = fullname.split(' ')[1] + (fullname.split(' ')[2] ? fullname.split(' ')[2] : '');

  // email
  await page.waitForSelector('.extra > dl.dl-horizontal:nth-child(12) dd');
  let email = await page.evaluate(() => {
    let emailText = document
      .querySelector('.extra > dl.dl-horizontal:nth-child(12) dd')
      .innerText.split('\n')[0];
    return emailText;
  });
  person.email = email;

  // birthday
  await page.waitForSelector('.extra > dl.dl-horizontal:nth-child(8) dd');
  let birthday = await page.evaluate(() => {
    let birthdayText = document
      .querySelector('.extra > dl.dl-horizontal:nth-child(8) dd')
      .innerText.split(' ');
    return birthdayText;
  });
  person.birthday.day = birthday[1].split(',')[0];
  person.birthday.month = getMonth(birthday[0]) + '';
  person.birthday.year = Number(birthday[2]) < 10 ? '0' + birthday[2] : birthday[2];

  // phone
  await page.waitForSelector('.extra > dl.dl-horizontal:nth-child(5) dd');
  let phone = await page.evaluate(() => {
    let phoneText = document
      .querySelector('.extra > dl.dl-horizontal:nth-child(5) dd')
      .innerText.split(' ')
      .join('')
      .substring(1);
    return phoneText;
  });
  person.phone = phone;

  // street
  await page.waitForSelector('div.adr');
  let street = await page.evaluate(() => {
    let streetText = document.querySelector('div.adr').innerText.split('\n')[0];
    return streetText;
  });
  person.street = street;

  console.log(person);

  await page.goto(
    'https://go.slotimo.com/visit/?bta=50045&nci=5407&&utm_medium=%7Bvar1%7D&adset_id=%7Bvar2%7D&utm_campaign=%7Bvar3%7D&campaign_id=%7Bvar4%7D&utm_content=%7Bvar5%7D&utm_source=%7Bvar6%7D&sub_id=%7Bclickid%7D&sub_id_1=%7Bexternalid%7D',
  );
  await page.click('.cl-register-button');

  // 1
  await page.focus('#reg_form_email');
  await page.keyboard.type(person.email);
  await page.focus('#reg_form_username');
  await page.keyboard.type(person.name + person.postcode);
  await page.focus('#reg_form_password');
  await page.keyboard.type(person.password);
  await page.click('#next-registration-step');

  // 2
  await page.setViewport({
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
  });

  await page.waitForSelector('#reg_form_fname', { visible: true, clickable: true });
  await page.focus('#reg_form_fname');
  await page.keyboard.type(person.name);
  await page.focus('#reg_form_lname');
  await page.keyboard.type(person.surname);
  await page.select('select#reg_form_currency_id', 'Euro');
  await page.focus('input#register-user-modal');
  await page.keyboard.type(person.phone);
  await page.select('select#reg_form_birthday_day', person.birthday.day);
  await page.select('select#reg_form_birthday_month', months[person.birthday.month]);
  await page.select('select#reg_form_birthday_year', person.birthday.year);
  await page.evaluate(() => {
    document.querySelector('div#register-user-modal').scrollBy(0, 1000);
  });
  await page.waitForSelector('#submit-reg-form', { visible: true, clickable: true });
  await page.click('#submit-reg-form');

  await browser.close();
})().catch((err) => console.error(err));
