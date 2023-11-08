interface FontConfig {
    allowFonts: string[];
}

declare module "*.yaml" {
    // Import the specific structure for the content
    const content: FontConfig;
    export default content;
}