// Runs in the cloud build after `npx cap add android`.
// - Turns off Android backup / phone-to-phone transfer of app data, so moving to a new
//   phone or restoring a backup always needs a fresh approval.
// - Adds release signing (key comes from GitHub secrets, never from this repo).
// - Sets version numbers and copies in the ₹ app icon and splash.
import fs from 'node:fs';
import path from 'node:path';

const A = 'android/app';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const buildNo = parseInt(process.env.BUILD_NUMBER || '1', 10);

// 1. Manifest
const mPath = `${A}/src/main/AndroidManifest.xml`;
let m = fs.readFileSync(mPath, 'utf8');
m = m.replace('android:allowBackup="true"', 'android:allowBackup="false"\n        android:fullBackupContent="false"\n        android:dataExtractionRules="@xml/data_extraction_rules"');
if (!m.includes('allowBackup="false"')) throw new Error('Could not patch allowBackup');
fs.writeFileSync(mPath, m);
fs.mkdirSync(`${A}/src/main/res/xml`, { recursive: true });
const domains = ['root', 'file', 'database', 'sharedpref', 'external'];
const ex = domains.map((d) => `        <exclude domain="${d}" path="." />`).join('\n');
fs.writeFileSync(`${A}/src/main/res/xml/data_extraction_rules.xml`,
`<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
${ex}
    </cloud-backup>
    <device-transfer>
${ex}
    </device-transfer>
</data-extraction-rules>
`);

// 2. Gradle: versions + signing
const gPath = `${A}/build.gradle`;
let g = fs.readFileSync(gPath, 'utf8');
g = g.replace(/versionCode \d+/, `versionCode ${buildNo}`).replace(/versionName "[^"]*"/, `versionName "${pkg.version}"`);
g = g.replace(/buildTypes \{/, `signingConfigs {
        release {
            storeFile file('release.jks')
            storePassword System.getenv('KS_PASS')
            keyAlias System.getenv('KS_ALIAS')
            keyPassword System.getenv('KS_PASS')
            // Sign with every scheme: some phone brands' installers reject APKs
            // that carry only the newer (v2) signature.
            enableV1Signing true
            enableV2Signing true
            enableV3Signing true
        }
    }
    buildTypes {`);
g = g.replace(/release \{\n(\s+)minifyEnabled false/, `release {\n$1signingConfig signingConfigs.release\n$1minifyEnabled false`);
if (!g.includes('signingConfig signingConfigs.release')) throw new Error('Could not patch signing');
fs.writeFileSync(gPath, g);

// 3. Icon + splash
function copyDir(src, dst) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d); } else fs.copyFileSync(s, d);
  }
}
copyDir('resources/android', `${A}/src/main/res`);
for (const d of fs.readdirSync(`${A}/src/main/res`)) {
  if (/^drawable-(land|port)-/.test(d)) fs.copyFileSync('resources/android/drawable/splash.png', `${A}/src/main/res/${d}/splash.png`);
}
fs.writeFileSync(`${A}/src/main/res/values/ic_launcher_background.xml`,
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0F6E4F</color>\n</resources>\n');

console.log(`Android project patched: version ${pkg.version} (${buildNo})`);
