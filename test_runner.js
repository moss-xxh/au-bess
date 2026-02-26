/**
 * Phase 1 Enhanced v2 完整测试
 * 运行: node test_runner.js
 */
const fs = require('fs');
const vm = require('vm');

// ====== 模拟浏览器环境 ======
const storage = {};
const sandbox = {
  localStorage: {
    getItem: k => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: k => { delete storage[k]; }
  },
  navigator: { language: 'zh-CN' },
  window: {},
  console, Date, JSON, Math, parseInt, parseFloat, String, Number, Array, Object, RegExp,
};
vm.createContext(sandbox);

const authCode = fs.readFileSync(__dirname + '/js/auth.js', 'utf8');
vm.runInContext(authCode + `
;this.__TRANSLATIONS=TRANSLATIONS;this.__getLang=getLang;this.__getTrans=getTrans;
this.__switchLang=switchLang;this.__toggleLang=toggleLang;
this.__getCurrentUser=getCurrentUser;this.__getUserName=getUserName;
this.__getOperators=getOperators;this.__getStationsByRole=getStationsByRole;
this.__assignStation=assignStation;this.__getLeaseRemaining=getLeaseRemaining;
this.__formatAUD=formatAUD;this.__stations=stations;
this.__verifyCredentials=verifyCredentials;this.__verifyMFA=verifyMFA;
this.__users=users;
`, sandbox);

const { __TRANSLATIONS: TRANSLATIONS, __getLang: getLang, __getTrans: getTrans,
  __switchLang: switchLang, __toggleLang: toggleLang,
  __getStationsByRole: getStationsByRole, __assignStation: assignStation,
  __getLeaseRemaining: getLeaseRemaining, __formatAUD: formatAUD,
  __getUserName: getUserName, __getOperators: getOperators,
  __stations: stations, __verifyCredentials: verifyCredentials,
  __verifyMFA: verifyMFA, __users: users } = sandbox;

let pass = 0, fail = 0;
function test(name, condition) {
  if (condition) { console.log('✅ ' + name); pass++; }
  else { console.log('❌ ' + name); fail++; }
}

// ====== i18n ======
console.log('\n--- i18n Tests ---');
test('TRANSLATIONS.en exists', !!TRANSLATIONS.en);
test('TRANSLATIONS.zh exists', !!TRANSLATIONS.zh);
test('EN: login_title', TRANSLATIONS.en.login_title === 'Account Login');
test('ZH: login_title', TRANSLATIONS.zh.login_title === '账号登录');
test('EN: mfa_title', TRANSLATIONS.en.mfa_title === 'Two-Factor Authentication');
test('ZH: mfa_title', TRANSLATIONS.zh.mfa_title === '双重身份验证');
test('EN: remember_me', TRANSLATIONS.en.remember_me === 'Remember me');
test('ZH: remember_me', TRANSLATIONS.zh.remember_me === '记住我');
test('EN: invalid_creds', TRANSLATIONS.en.invalid_creds === 'Invalid username or password');
test('ZH: invalid_creds', TRANSLATIONS.zh.invalid_creds === '用户名或密码错误');
test('EN: incorrect_code', TRANSLATIONS.en.incorrect_code === 'Invalid verification code');
test('ZH: incorrect_code', TRANSLATIONS.zh.incorrect_code === '验证码错误');
test('EN: attempts_left', TRANSLATIONS.en.attempts_left === 'attempts remaining');
test('ZH: attempts_left', TRANSLATIONS.zh.attempts_left === '次重试机会');
test('Key count match', Object.keys(TRANSLATIONS.en).length === Object.keys(TRANSLATIONS.zh).length);

test('Auto detect zh', getLang() === 'zh');
switchLang('en');
test('Switch en', getLang() === 'en');
test('getTrans en', getTrans('login_title') === 'Account Login');
switchLang('zh');
test('getTrans zh', getTrans('login_title') === '账号登录');

// ====== 登录验证 ======
console.log('\n--- Login Tests ---');
test('Users have 3 accounts', users.length === 3);
test('All users have username', users.every(u => !!u.username));
test('All users have password', users.every(u => !!u.password));

test('admin/admin123 → owner_1', verifyCredentials('admin', 'admin123')?.id === 'owner_1');
test('op_a/pass123 → op_a', verifyCredentials('op_a', 'pass123')?.id === 'op_a');
test('op_b/pass123 → op_b', verifyCredentials('op_b', 'pass123')?.id === 'op_b');
test('wrong password → null', verifyCredentials('admin', 'wrong') === null);
test('wrong username → null', verifyCredentials('nobody', '123') === null);
test('empty → null', verifyCredentials('', '') === null);

// ====== MFA ======
console.log('\n--- MFA Tests ---');
test('123456 → true', verifyMFA('123456') === true);
test('000000 → true', verifyMFA('000000') === true);
test('999999 → true', verifyMFA('999999') === true);
test('12345 → false (5 digits)', verifyMFA('12345') === false);
test('1234567 → false (7 digits)', verifyMFA('1234567') === false);
test('abcdef → false (letters)', verifyMFA('abcdef') === false);
test('empty → false', verifyMFA('') === false);

// ====== 权限 ======
console.log('\n--- Permission Tests ---');
storage.role = 'owner';
test('Owner sees 4', getStationsByRole().length === 4);
storage.role = 'op_a';
test('OpA sees 2', getStationsByRole().length === 2);
storage.role = 'op_b';
test('OpB sees 1', getStationsByRole().length === 1);

// ====== 划转 ======
console.log('\n--- Assignment Tests ---');
test('Assign st_04→op_a', assignStation('st_04', 'op_a'));
test('st_04=op_a', stations.find(s => s.id === 'st_04').operator_id === 'op_a');
storage.role = 'op_a';
test('OpA now 3', getStationsByRole().length === 3);
test('Persisted', !!storage.stations);

// ====== 工具 ======
console.log('\n--- Utility Tests ---');
test('Lease future>0', getLeaseRemaining('2028-12-31') > 0);
test('Lease past<0', getLeaseRemaining('2020-01-01') < 0);
test('Lease unset', getLeaseRemaining('-') === '-');
test('AUD format', formatAUD(850000).startsWith('A$'));
test('AUD zero', formatAUD(0) === '-');

// ====== Result ======
console.log('\n========================================');
console.log(`Total: ${pass + fail} | Pass: ${pass} | Fail: ${fail}`);
console.log(`Pass Rate: ${((pass / (pass + fail)) * 100).toFixed(1)}%`);
console.log(fail === 0 ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED');
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);
