export interface FileTypeInfo {
  type: string;
  language: string;
  isConfiguration: boolean;
  isDocumentation: boolean;
  isTest: boolean;
  isBinary: boolean;
}

export class FileTypeDetector {
  private static readonly languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.mts': 'TypeScript',
    '.cts': 'TypeScript',

    // Python
    '.py': 'Python',
    '.pyw': 'Python',
    '.pyx': 'Python',
    '.pyi': 'Python',

    // Java
    '.java': 'Java',
    '.class': 'Java',
    '.jar': 'Java',

    // C/C++
    '.c': 'C',
    '.h': 'C',
    '.cpp': 'C++',
    '.cxx': 'C++',
    '.cc': 'C++',
    '.hpp': 'C++',
    '.hxx': 'C++',

    // C#
    '.cs': 'C#',
    '.csx': 'C#',

    // Go
    '.go': 'Go',

    // Rust
    '.rs': 'Rust',

    // Ruby
    '.rb': 'Ruby',
    '.rbw': 'Ruby',

    // PHP
    '.php': 'PHP',
    '.phtml': 'PHP',
    '.php3': 'PHP',
    '.php4': 'PHP',
    '.php5': 'PHP',

    // Swift
    '.swift': 'Swift',

    // Kotlin
    '.kt': 'Kotlin',
    '.kts': 'Kotlin',

    // Dart
    '.dart': 'Dart',

    // Scala
    '.scala': 'Scala',
    '.sc': 'Scala',

    // R
    '.r': 'R',
    '.R': 'R',

    // MATLAB
    '.m': 'MATLAB',

    // Shell
    '.sh': 'Shell',
    '.bash': 'Shell',
    '.zsh': 'Shell',
    '.fish': 'Shell',
    '.ps1': 'PowerShell',

    // Web Technologies
    '.html': 'HTML',
    '.htm': 'HTML',
    '.xhtml': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'Less',
    '.styl': 'Stylus',

    // Templates
    '.vue': 'Vue',
    '.svelte': 'Svelte',

    // Data formats
    '.json': 'JSON',
    '.xml': 'XML',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.toml': 'TOML',
    '.ini': 'INI',
    '.cfg': 'Config',
    '.conf': 'Config',

    // SQL
    '.sql': 'SQL',

    // Documentation
    '.md': 'Markdown',
    '.markdown': 'Markdown',
    '.rst': 'reStructuredText',
    '.txt': 'Text',
    '.rtf': 'RTF',

    // Binary/Media
    '.png': 'Image',
    '.jpg': 'Image',
    '.jpeg': 'Image',
    '.gif': 'Image',
    '.svg': 'SVG',
    '.ico': 'Image',
    '.pdf': 'PDF',
    '.zip': 'Archive',
    '.tar': 'Archive',
    '.gz': 'Archive',
    '.rar': 'Archive',
    '.7z': 'Archive'
  };

  private static readonly configurationFiles = new Set([
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.json',
    'composer.lock',
    'requirements.txt',
    'pipfile',
    'pipfile.lock',
    'pyproject.toml',
    'setup.py',
    'setup.cfg',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'gradle.properties',
    'go.mod',
    'go.sum',
    'cargo.toml',
    'cargo.lock',
    'gemfile',
    'gemfile.lock',
    'dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    'makefile',
    'cmake.txt',
    'webpack.config.js',
    'webpack.config.ts',
    'vite.config.js',
    'vite.config.ts',
    'rollup.config.js',
    'rollup.config.ts',
    'babel.config.js',
    'babel.config.json',
    '.babelrc',
    'tsconfig.json',
    'jsconfig.json',
    'eslint.config.js',
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    'prettier.config.js',
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.yml',
    'jest.config.js',
    'jest.config.ts',
    'jest.config.json',
    'vitest.config.js',
    'vitest.config.ts',
    'cypress.config.js',
    'cypress.config.ts',
    'playwright.config.js',
    'playwright.config.ts',
    '.gitignore',
    '.gitattributes',
    '.env',
    '.env.example',
    '.env.local',
    '.env.development',
    '.env.production',
    'next.config.js',
    'next.config.mjs',
    'nuxt.config.js',
    'nuxt.config.ts',
    'vue.config.js',
    'angular.json',
    'ionic.config.json',
    'capacitor.config.json',
    'tailwind.config.js',
    'tailwind.config.ts',
    'postcss.config.js',
    'svelte.config.js',
    'astro.config.mjs'
  ]);

  private static readonly documentationFiles = new Set([
    'readme.md',
    'readme.txt',
    'readme.rst',
    'readme',
    'changelog.md',
    'changelog.txt',
    'changelog',
    'license',
    'license.md',
    'license.txt',
    'contributing.md',
    'contributing.txt',
    'code_of_conduct.md',
    'security.md',
    'authors.md',
    'authors.txt',
    'contributors.md',
    'contributors.txt',
    'acknowledgments.md',
    'todo.md',
    'todo.txt',
    'notes.md',
    'notes.txt'
  ]);

  private static readonly testPatterns = [
    /\.test\./,
    /\.spec\./,
    /test_.*\.py$/,
    /.*_test\.go$/,
    /.*Test\.java$/,
    /.*Tests\.cs$/,
    /test\/.*$/,
    /tests\/.*$/,
    /spec\/.*$/,
    /__tests__\/.*$/,
    /cypress\/.*$/,
    /e2e\/.*$/
  ];

  private static readonly binaryExtensions = new Set([
    '.exe', '.dll', '.so', '.dylib', '.a', '.lib',
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.tiff',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2',
    '.class', '.jar', '.war', '.ear',
    '.woff', '.woff2', '.ttf', '.eot',
    '.db', '.sqlite', '.sqlite3'
  ]);

  static detectFileType(fileName: string): FileTypeInfo {
    const lowerFileName = fileName.toLowerCase();
    const extension = this.getFileExtension(fileName);
    
    const language = this.languageMap[extension] || 'Other';
    const isConfiguration = this.configurationFiles.has(lowerFileName) || 
                           lowerFileName.includes('config') ||
                           lowerFileName.startsWith('.env');
    const isDocumentation = this.documentationFiles.has(lowerFileName) ||
                           lowerFileName.includes('readme') ||
                           extension === '.md';
    const isTest = this.testPatterns.some(pattern => pattern.test(fileName));
    const isBinary = this.binaryExtensions.has(extension);

    let type = 'source';
    if (isConfiguration) type = 'configuration';
    else if (isDocumentation) type = 'documentation';
    else if (isTest) type = 'test';
    else if (isBinary) type = 'binary';
    else if (language === 'Other') type = 'other';

    return {
      type,
      language,
      isConfiguration,
      isDocumentation,
      isTest,
      isBinary
    };
  }

  static isConfigurationFile(fileName: string): boolean {
    const lowerFileName = fileName.toLowerCase();
    return this.configurationFiles.has(lowerFileName) || 
           lowerFileName.includes('config') ||
           lowerFileName.startsWith('.env');
  }

  static isDocumentationFile(fileName: string): boolean {
    const lowerFileName = fileName.toLowerCase();
    return this.documentationFiles.has(lowerFileName) ||
           lowerFileName.includes('readme') ||
           this.getFileExtension(fileName) === '.md';
  }

  static isTestFile(fileName: string): boolean {
    return this.testPatterns.some(pattern => pattern.test(fileName));
  }

  static isBinaryFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    return this.binaryExtensions.has(extension);
  }

  static getLanguageStats(fileNames: string[]): Map<string, number> {
    const stats = new Map<string, number>();

    for (const fileName of fileNames) {
      const fileType = this.detectFileType(fileName);
      if (fileType.language !== 'Other' && !fileType.isBinary) {
        stats.set(fileType.language, (stats.get(fileType.language) || 0) + 1);
      }
    }

    return stats;
  }

  static getFileTypeStats(fileNames: string[]): Map<string, number> {
    const stats = new Map<string, number>();

    for (const fileName of fileNames) {
      const fileType = this.detectFileType(fileName);
      stats.set(fileType.type, (stats.get(fileType.type) || 0) + 1);
    }

    return stats;
  }

  static categorizeFiles(fileNames: string[]): {
    source: string[];
    configuration: string[];
    documentation: string[];
    test: string[];
    binary: string[];
    other: string[];
  } {
    const categories = {
      source: [] as string[],
      configuration: [] as string[],
      documentation: [] as string[],
      test: [] as string[],
      binary: [] as string[],
      other: [] as string[]
    };

    for (const fileName of fileNames) {
      const fileType = this.detectFileType(fileName);
      
      switch (fileType.type) {
        case 'source':
          categories.source.push(fileName);
          break;
        case 'configuration':
          categories.configuration.push(fileName);
          break;
        case 'documentation':
          categories.documentation.push(fileName);
          break;
        case 'test':
          categories.test.push(fileName);
          break;
        case 'binary':
          categories.binary.push(fileName);
          break;
        default:
          categories.other.push(fileName);
      }
    }

    return categories;
  }

  static getSupportedLanguages(): string[] {
    const languages = new Set(Object.values(this.languageMap));
    languages.delete('Other');
    return Array.from(languages).sort();
  }

  static getLanguageExtensions(language: string): string[] {
    return Object.entries(this.languageMap)
      .filter(([, lang]) => lang === language)
      .map(([ext]) => ext);
  }

  private static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return '';
    }
    return fileName.substring(lastDotIndex).toLowerCase();
  }

  static isSourceFile(fileName: string): boolean {
    const fileType = this.detectFileType(fileName);
    return fileType.type === 'source' && !fileType.isBinary;
  }

  static shouldAnalyzeFile(fileName: string, options?: {
    includeTests?: boolean;
    includeBinary?: boolean;
    includeConfig?: boolean;
    maxFileSize?: number;
  }): boolean {
    const {
      includeTests = false,
      includeBinary = false,
      includeConfig = true
    } = options || {};

    const fileType = this.detectFileType(fileName);

    // Always exclude binary files unless explicitly included
    if (fileType.isBinary && !includeBinary) {
      return false;
    }

    // Exclude test files unless explicitly included
    if (fileType.isTest && !includeTests) {
      return false;
    }

    // Include source files and optionally config files
    return fileType.type === 'source' || 
           (fileType.isConfiguration && includeConfig) ||
           fileType.isDocumentation;
  }
}