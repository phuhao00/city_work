const { exec } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('     City Work 开发环境启动');
console.log('========================================\n');

async function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

async function startDev() {
  try {
    console.log('[1/2] 启动后端开发服务器...');
    const backendPath = path.join(__dirname, '..', 'backend');
    
    // 启动后端开发服务器
    const backendProcess = exec('nest start --watch', { cwd: backendPath });
    
    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data}`);
    });
    
    console.log('\n[2/2] 后端开发服务器已启动!');
    console.log('\n========================================');
    console.log('        开发环境启动完成！');
    console.log('========================================');
    console.log('后端服务: http://localhost:3000/api');
    console.log('API文档: http://localhost:3000/api/docs');
    
  } catch (error) {
    console.error('启动失败:', error.message);
    process.exit(1);
  }
}

startDev();