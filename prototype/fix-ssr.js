const fs = require('fs');
const path = require('path');

const folders = ['./src/screens/auth', './src/screens/main'];

folders.forEach(dir => {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
      const p = path.join(dir, file);
      let c = fs.readFileSync(p, 'utf-8');
      if (c.includes("SafeAreaView")) {
        // Clean up from React Native
        c = c.replace(/,\s*SafeAreaView/g, '');
        c = c.replace(/SafeAreaView,\s*/g, '');
        // What if it's the only import? 
        c = c.replace(/import\s*{\s*SafeAreaView\s*}\s*from\s*'react-native';\n?/g, '');
        
        // Add the correct import at the top
        if (!c.includes("'react-native-safe-area-context'")) {
          c = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + c;
        }
        
        fs.writeFileSync(p, c);
        console.log(`Updated ${p}`);
      }
    }
  });
});
