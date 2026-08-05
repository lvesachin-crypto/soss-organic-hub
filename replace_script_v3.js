import fs from 'fs';
const path = 'src/pages/Index.tsx';
let content = fs.readFileSync(path, 'utf8');

// The text currently in the file is either the long TASK description or the previous short message.
// Based on the history, it's inside a span with blueSoft background.

const startMarker = '{"plss sahi kr ye prvierere me website or kyu aa rha hai jdi se"}';
const alternativeMarker = '{"TASK: Mera pura SMM panel';

if (content.includes(startMarker)) {
  const newText = '{"plsss fix website bhit slow chl rha haiskr de mn"}';
  content = content.replace(startMarker, newText);
  fs.writeFileSync(path, content);
  console.log('Success (replaced short message)');
} else if (content.includes(alternativeMarker)) {
  // If for some reason the previous replace failed or we are starting fresh
  const startIndex = content.indexOf(alternativeMarker);
  const endMarker = 'ok n"}';
  const endIndex = content.indexOf(endMarker, startIndex);
  if (startIndex !== -1 && endIndex !== -1) {
    const oldText = content.substring(startIndex, endIndex + endMarker.length);
    const newText = '{"plsss fix website bhit slow chl rha haiskr de mn"}';
    content = content.replace(oldText, newText);
    fs.writeFileSync(path, content);
    console.log('Success (replaced long task)');
  } else {
    console.log('Markers not found');
    process.exit(1);
  }
} else {
    console.log('No known text found to replace');
    process.exit(1);
}
