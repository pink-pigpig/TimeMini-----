import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsPath = path.join(__dirname, '..', 'wailsjs', 'go', 'models.ts');

try {
  let content = fs.readFileSync(modelsPath, 'utf-8');
  
  // Remove the broken namespace at the end
  const brokenPart = `\nexport namespace struct { Success bool; Message string } {\n\t\n\texport class  {\n\t    Success: boolean;\n\t    Message: string;\n\t\n\t    static createFrom(source: any = {}) {\n\t        return new (source);\n\t    }\n\t\n\t    constructor(source: any = {}) {\n\t        if ('string' === typeof source) source = JSON.parse(source);\n\t        this.Success = source["Success"];\n\t        this.Message = source["Message"];\n\t    }\n\t}\n\n}`;
  
  if (content.includes(brokenPart)) {
    content = content.replace(brokenPart, '');
    fs.writeFileSync(modelsPath, content, 'utf-8');
    console.log('Fixed models.ts successfully');
  }
} catch (e) {
  console.error('Error fixing models.ts:', e.message);
}