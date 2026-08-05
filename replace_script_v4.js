import fs from 'fs';
const path = 'src/pages/Index.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetText = '{"plsss fix website bhit slow chl rha haiskr de mn"}';

if (content.includes(targetText)) {
  const newText = '{"ye kya h ?sahi kr siko"}';
  content = content.replace(targetText, newText);
  fs.writeFileSync(path, content);
  console.log('Success');
} else {
    console.log('Target text not found');
    process.exit(1);
}
