const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

const avatarsDir = path.join(__dirname, '../public/avatars');

// 确保头像目录存在
async function ensureAvatarsDir() {
  try {
    await mkdirAsync(avatarsDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// 下载图片
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// 头像配置
const avatars = [
  {
    filename: 'default.png',
    url: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
  },
  {
    filename: 'counselor1.jpg',
    url: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
  },
  {
    filename: 'counselor2.jpg',
    url: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
  },
  {
    filename: 'counselor3.jpg',
    url: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
  }
];

// 主函数
async function main() {
  try {
    await ensureAvatarsDir();

    for (const avatar of avatars) {
      const imageData = await downloadImage(avatar.url);
      const filePath = path.join(avatarsDir, avatar.filename);
      await writeFileAsync(filePath, imageData);
      console.log(`Downloaded ${avatar.filename}`);
    }

    console.log('All avatars downloaded successfully');
  } catch (error) {
    console.error('Error downloading avatars:', error);
    process.exit(1);
  }
}

main(); 