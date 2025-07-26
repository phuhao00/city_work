const { spawn, exec } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('        City Work 项目一键启动');
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

async function startProject() {
  try {
    console.log('[1/4] 启动数据库服务 (Docker)...');
    await runCommand('docker-compose up -d mongodb elasticsearch redis');
    
    console.log('[2/4] 等待数据库服务启动完成...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('[3/4] 启动后端服务...');
    const backendPath = path.join(__dirname, '../backend');
    const backend = spawn('npm', ['run', 'start:dev'], { 
      cwd: backendPath,
      stdio: 'inherit',
      shell: true 
    });
    
    console.log('[4/4] 启动前端服务...');
    const frontendPath = path.join(__dirname, '../frontend');
    const frontend = spawn('npm', ['start'], { 
      cwd: frontendPath,
      stdio: 'inherit',
      shell: true 
    });
    
    console.log('\n========================================');
    console.log('           启动完成！');
    console.log('========================================');
    console.log('后端服务: http://localhost:3000');
    console.log('前端服务: 请查看Expo开发工具');
    console.log('数据库管理:');
    console.log('  - MongoDB: localhost:27017');
    console.log('  - Elasticsearch: http://localhost:9200');
    console.log('  - Redis Commander: http://localhost:8081');
    console.log('  - Kibana: http://localhost:5601');
    console.log('========================================\n');
    
    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n正在停止服务...');
      backend.kill();
      frontend.kill();
      exec('docker-compose down');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('启动失败:', error.message);
    process.exit(1);
  }
}

startProject();