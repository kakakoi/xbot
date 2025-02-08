/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        path: '^src',
        pathNot: ['^src/index.ts']
      },
      to: {
        path: '^src',
        reachable: false
      }
    }
  ],
  options: {
    doNotFollow: {
      dependencyTypes: [
        'npm',
        'npm-dev'
      ]
    },
    tsPreCompilationDeps: true,
    includeOnly: '^src',
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
};
