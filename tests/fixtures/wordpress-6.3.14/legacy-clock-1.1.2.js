// Exact public 1.1.2 recovery/schema/save excerpts; wrapper excludes editor UI.
// GPLv2. See provenance.json and WORDPRESS-LICENSE.txt.
(function (blocks, editor, element, hooks) {
  const locale = "en_US";
  const el = element.createElement;
  // Recover omitted legacy defaults without changing the JSON storage format.
  hooks.addFilter(
    "blocks.getBlockAttributes",
    "simple-digital-clock/stored-attributes",
    function (attributes, blockType, innerHTML, commentAttributes) {
      if (blockType.name !== "simple-digital-clock-block/widget-block") {
        return attributes;
      }

      const savedAttributes = { ...attributes };
      if (!Object.prototype.hasOwnProperty.call(commentAttributes, "timeZone")) {
        const timeZone = blocks.parseWithAttributeSchema(innerHTML, {
          source: "attribute",
          selector: "timenow-zone-sdcw",
          attribute: "time-zone",
        });
        savedAttributes.timeZone = timeZone === undefined ? "" : timeZone;
      }
      if (!Object.prototype.hasOwnProperty.call(commentAttributes, "caption")) {
        const caption = blocks.parseWithAttributeSchema(innerHTML, {
          source: "attribute",
          selector: "timenow-zone-sdcw",
          attribute: "caption",
        });
        if (caption !== undefined) {
          savedAttributes.caption = caption;
        }
      }
      return savedAttributes;
    }
  );
  blocks.registerBlockType("simple-digital-clock-block/widget-block", {
    attributes: {
      width: {
        type: "number",
        default: 200,
      },
      timeZone: {
        type: "string",
      },
      fontFamily: {
        type: "string",
        default: "",
      },
      backgroundColor: {
        type: "string",
        default: "#1d4ed8",
      },
      background: {
        type: "string",
        default:
          "linear-gradient(135deg, rgb(106, 17, 203) 0%, rgb(37, 117, 252) 100%)",
      },
      locale: {
        type: "string",
        source: "attribute",
        selector: "timenow-zone-sdcw",
        attribute: "locale",
        default: (locale && locale.replace("_", "-")) || "en-US",
      },
      rounded: {
        type: "number",
        default: 0.5,
      },
      second: {
        type: "boolean",
        default: true,
      },
      hundredths: {
        type: "boolean",
        default: false,
      },
      period: { type: "boolean", default: false },
      date: { type: "boolean", default: false },
      border: { type: "boolean", default: false },
      shadow: {
        type: "string",
        default: "",
      },
      align: {
        type: "string",
        default: "left",
      },
      caption: {
        type: "string",
        default: "",
      },
    },
    save: function (props) {
      var align = props.attributes.align;
      var width = props.attributes.width;
      var period = props.attributes.period;
      var caption = props.attributes.caption;
      var date = props.attributes.date;
      var second = props.attributes.second;
      var hundredths = props.attributes.hundredths;
      var rounded = props.attributes.rounded;
      var timeZone = props.attributes.timeZone;
      var backgroundColor = props.attributes.backgroundColor;
      var background = props.attributes.background;
      var border = props.attributes.border;
      var locale = props.attributes.locale;
      var fontFamily = props.attributes.fontFamily;
      var shadow = props.attributes.shadow;

      return el("timenow-zone-sdcw", {
        ...editor.useBlockProps.save(),
        width,
        locale,
        rounded,
        align,
        ...(shadow && shadow !== "" ? { shadow } : {}),
        ...(date && { date: "true" }),
        ...(second && { second: "true" }),
        ...(hundredths && { hundredths: "true" }),
        ...(border && { border: "true" }),
        ...(period && { period: "false" }),
        ...(caption && caption !== "" ? { caption } : {}),
        ...(background && background !== "" ? { background } : {}),
        ...(timeZone && timeZone !== "" ? { "time-zone": timeZone } : {}),
        ...(fontFamily && fontFamily !== ""
          ? { "font-family": fontFamily }
          : {}),
        ...(backgroundColor && backgroundColor !== ""
          ? { "background-color": backgroundColor }
          : {}),
      });
    },
  });
})(window.wp.blocks, window.wp.blockEditor, window.wp.element, window.wp.hooks);
