// wtr.config.mjs
/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  nodeResolve: true,
  testsStartTimeout: 60000,
  plugins: [
    {
      name: "add-js-ext",
      resolveImport({ source }) {
        if (source && (source.startsWith("./") || source.startsWith("../")) && !/[.?][a-zA-Z0-9]+($|\?)/.test(source)) {
          return `${source}.js`;
        }
      },
    },
    {
      name: "rewrite-ts-ext",
      resolveImport({ source }) {
        if (/\.(ts|tsx)(\?.*)?$/.test(source)) {
          return source.replace(/\.(ts|tsx)(\?.*)?$/, ".js$2");
        }
      },
    },
    {
      name: "virtual-bundle-text",
      resolveImport({ source }) {
        if (source.startsWith("bundle-text:")) {
          const spec = source.slice("bundle-text:".length);
          return `/__virtual__/bundle-text/${encodeURIComponent(spec)}.js`;
        }
      },
      async serve(context) {
        if (context.path.startsWith("/__virtual__/bundle-text/")) {
          return { body: `export default "";`, type: "js" };
        }
      },
    },
    {
      name: "virtual-yaml",
      resolveImport({ source }) {
        if (source.endsWith(".yaml")) {
          return `/__virtual__/yaml/${encodeURIComponent(source)}.js`;
        }
      },
      async serve(context) {
        if (context.path.startsWith("/__virtual__/yaml/")) {
          return { body: `export default { allowFonts: [] };`, type: "js" };
        }
      },
    },
  ],
};
