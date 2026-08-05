import fs from 'fs';
const path = 'src/pages/Index.tsx';
let content = fs.readFileSync(path, 'utf8');

// The text currently in the file is the long TASK description.
// We need to find where it starts and ends to replace it correctly.
// Based on previous turn, it was injected into the badge location.

const startMarker = '{"TASK: Mera pura SMM panel';
const endMarker = 'ok n"}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const oldText = content.substring(startIndex, endIndex + endMarker.length);
  const newText = '{"plss sahi kr ye prvierere me website or kyu aa rha hai jdi se"}';
  content = content.replace(oldText, newText);
  fs.writeFileSync(path, content);
  console.log('Success');
} else {
  console.log('Target text not found');
  process.exit(1);
}
