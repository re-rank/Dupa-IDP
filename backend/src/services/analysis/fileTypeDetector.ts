export enum FileType {
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Java = 'java',
  CSharp = 'csharp',
  Go = 'go',
  Ruby = 'ruby',
  PHP = 'php',
  Swift = 'swift',
  Kotlin = 'kotlin',
  Rust = 'rust',
  CPlusPlus = 'cplusplus',
  C = 'c',
  HTML = 'html',
  CSS = 'css',
  SCSS = 'scss',
  JSON = 'json',
  YAML = 'yaml',
  XML = 'xml',
  Markdown = 'markdown',
  Configuration = 'configuration',
  Docker = 'docker',
  SQL = 'sql',
  GraphQL = 'graphql',
  Other = 'other'
}

export interface FileTypeInfo {
  type: FileType;
  language: string;
  isCode: boolean;
  isConfiguration: boolean;
  isDocumentation: boolean;
}

export class FileTypeDetector {
  private static extensionMap: Map<string, FileTypeInfo> = new Map([
    ['.js', { type: FileType.JavaScript, language: 'JavaScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.jsx', { type: FileType.JavaScript, language: 'JavaScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.mjs', { type: FileType.JavaScript, language: 'JavaScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.cjs', { type: FileType.JavaScript, language: 'JavaScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.ts', { type: FileType.TypeScript, language: 'TypeScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.tsx', { type: FileType.TypeScript, language: 'TypeScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.mts', { type: FileType.TypeScript, language: 'TypeScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.cts', { type: FileType.TypeScript, language: 'TypeScript', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.py', { type: FileType.Python, language: 'Python', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.pyw', { type: FileType.Python, language: 'Python', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.java', { type: FileType.Java, language: 'Java', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.cs', { type: FileType.CSharp, language: 'C#', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.go', { type: FileType.Go, language: 'Go', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.rb', { type: FileType.Ruby, language: 'Ruby', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.php', { type: FileType.PHP, language: 'PHP', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.swift', { type: FileType.Swift, language: 'Swift', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.kt', { type: FileType.Kotlin, language: 'Kotlin', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.kts', { type: FileType.Kotlin, language: 'Kotlin', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.rs', { type: FileType.Rust, language: 'Rust', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.cpp', { type: FileType.CPlusPlus, language: 'C++', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.cc', { type: FileType.CPlusPlus, language: 'C++', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.cxx', { type: FileType.CPlusPlus, language: 'C++', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.c', { type: FileType.C, language: 'C', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.h', { type: FileType.C, language: 'C', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.hpp', { type: FileType.CPlusPlus, language: 'C++', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.html', { type: FileType.HTML, language: 'HTML', isCode: false, isConfiguration: false, isDocumentation: false }],
    ['.htm', { type: FileType.HTML, language: 'HTML', isCode: false, isConfiguration: false, isDocumentation: false }],
    ['.css', { type: FileType.CSS, language: 'CSS', isCode: false, isConfiguration: false, isDocumentation: false }],
    ['.scss', { type: FileType.SCSS, language: 'SCSS', isCode: false, isConfiguration: false, isDocumentation: false }],
    ['.sass', { type: FileType.SCSS, language: 'SCSS', isCode: false, isConfiguration: false, isDocumentation: false }],
    ['.json', { type: FileType.JSON, language: 'JSON', isCode: false, isConfiguration: true, isDocumentation: false }],
    ['.yaml', { type: FileType.YAML, language: 'YAML', isCode: false, isConfiguration: true, isDocumentation: false }],
    ['.yml', { type: FileType.YAML, language: 'YAML', isCode: false, isConfiguration: true, isDocumentation: false }],
    ['.xml', { type: FileType.XML, language: 'XML', isCode: false, isConfiguration: true, isDocumentation: false }],
    ['.md', { type: FileType.Markdown, language: 'Markdown', isCode: false, isConfiguration: false, isDocumentation: true }],
    ['.mdx', { type: FileType.Markdown, language: 'Markdown', isCode: false, isConfiguration: false, isDocumentation: true }],
    ['.sql', { type: FileType.SQL, language: 'SQL', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.graphql', { type: FileType.GraphQL, language: 'GraphQL', isCode: true, isConfiguration: false, isDocumentation: false }],
    ['.gql', { type: FileType.GraphQL, language: 'GraphQL', isCode: true, isConfiguration: false, isDocumentation: false }]
  ]);

  private static configurationFiles = new Set([
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.json',
    'composer.lock',
    'requirements.txt',
    'requirements.in',
    'Pipfile',
    'Pipfile.lock',
    'pyproject.toml',
    'setup.py',
    'setup.cfg',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'settings.gradle',
    'settings.gradle.kts',
    'Gemfile',
    'Gemfile.lock',
    'go.mod',
    'go.sum',
    'Cargo.toml',
    'Cargo.lock',
    'CMakeLists.txt',
    'Makefile',
    'webpack.config.js',
    'vite.config.js',
    'vite.config.ts',
    'rollup.config.js',
    'tsconfig.json',
    'jsconfig.json',
    '.eslintrc.js',
    '.eslintrc.json',
    '.prettierrc',
    '.babelrc',
    'jest.config.js',
    'karma.conf.js',
    '.env',
    '.env.example',
    '.env.local',
    '.env.production',
    '.env.development',
    'docker-compose.yml',
    'docker-compose.yaml',
    'Dockerfile',
    '.dockerignore',
    '.gitignore',
    '.gitattributes',
    'nginx.conf',
    'httpd.conf',
    '.htaccess'
  ]);

  public static detectFileType(fileName: string): FileTypeInfo {
    if (this.configurationFiles.has(fileName)) {
      if (fileName === 'Dockerfile' || fileName.startsWith('Dockerfile.')) {
        return { type: FileType.Docker, language: 'Docker', isCode: false, isConfiguration: true, isDocumentation: false };
      }
      return { type: FileType.Configuration, language: 'Configuration', isCode: false, isConfiguration: true, isDocumentation: false };
    }

    const extension = this.getExtension(fileName);
    const fileTypeInfo = this.extensionMap.get(extension);

    if (fileTypeInfo) {
      return fileTypeInfo;
    }

    return { type: FileType.Other, language: 'Other', isCode: false, isConfiguration: false, isDocumentation: false };
  }

  private static getExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot).toLowerCase() : '';
  }

  public static isCodeFile(fileName: string): boolean {
    return this.detectFileType(fileName).isCode;
  }

  public static isConfigurationFile(fileName: string): boolean {
    return this.detectFileType(fileName).isConfiguration;
  }

  public static isDocumentationFile(fileName: string): boolean {
    return this.detectFileType(fileName).isDocumentation;
  }

  public static getLanguageStats(fileNames: string[]): Map<string, number> {
    const stats = new Map<string, number>();

    for (const fileName of fileNames) {
      const fileType = this.detectFileType(fileName);
      if (fileType.type !== FileType.Other) {
        const count = stats.get(fileType.language) || 0;
        stats.set(fileType.language, count + 1);
      }
    }

    return stats;
  }
}