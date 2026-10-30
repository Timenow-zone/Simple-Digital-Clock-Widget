/*!
 * Simple Digital Clock Widget
 * Simple Digital Clock Widget – a lightweight HTML/JS digital clock widget with flexible settings, embedded seamlessly for your website. Build ⚡ instantly-interactive web widget without effort.
 *
 * Repo:    https://github.com/Timenow-zone/Simple-Digital-Clock-Widget
 * Demo:    https://utctime.info/
 * Related: https://todaysdatenow.com/
 * WP plugin: https://wordpress.org/plugins/simple-digital-clock/
 *
 * Version: 0.8.0
 * License: MIT
 * Author: dejurin (https://github.com/Timenow-zone)
 */

import { Component, Fragment, h } from "preact";
import register from "preact-custom-element";
import clsx from "clsx";
import cssText from "bundle-text:./styles.css";
import contrastColor from "./contrastColor";
import darkenColor from "./darkenColor";
import data from "./data.yaml";
import isDark from "./isDark";

const v = "0.8.0";

const googleFontsMonospace: string[] = (data?.allowFonts ?? []) as string[];

type Align = "left" | "center" | "right";
type Prefers = "" | "auto" | "system" | "light" | "dark";
type Shadow = "shadow" | "shadow-lg" | "shadow-md" | "shadow-sm" | "shadow-2xl" | "shadow-xl";
type TimeZoneName =
  | ""
  | "short"
  | "long"
  | "shortOffset"
  | "longOffset"
  | "shortGeneric"
  | "longGeneric";

// Define the props type
/**
 * Props for the SimpleDigitalClockWidget component.
 */
interface SimpleDigitalClockWidgetProps {
  date?: boolean;
  border?: boolean;
  period?: boolean;
  second?: boolean;
  hundredths?: boolean;
  caption?: string;
  timeZone?: string;
  locale?: string;
  fontFamily?: string;
  backgroundColor?: string;
  background?: string;
  rounded?: number;
  width?: number;
  prefers: Prefers;
  align?: Align;
  timeZoneName?: TimeZoneName;
  shadow?: Shadow;
}

// Define the state type
interface SimpleDigitalClockWidgetState {
  isDay: boolean;
  isError: boolean;
  timeString: string;
  dateString: string;
  timeZoneName: string;
  backgroundColor: string;
  fontSize: number;
  fontSizeTitle: number;
}

class SimpleDigitalClockWidget extends Component<
  SimpleDigitalClockWidgetProps,
  SimpleDigitalClockWidgetState
> {
  interval?: number;
  animationFrame?: number;
  resizeObserver?: ResizeObserver;
  resizeFrame?: number;
  observedWidth?: number;
  fontLoadId = 0;
  fontStylesheet?: HTMLLinkElement;
  fontStylesheetReady = false;
  fontRequestedText = "";
  hundredthsMetadataAt = 0;
  hundredthsFormatter?: Intl.DateTimeFormat;
  hundredthsFormatterFailed = false;
  containerRef: HTMLDivElement | null = null;
  zoneContainerRef: HTMLDivElement | null = null;
  dateContainerRef: HTMLDivElement | null = null;
  constructor(props: SimpleDigitalClockWidgetProps) {
    super(props);
    this.interval;
    this.state = {
      isDay: true,
      isError: false,
      timeString: "",
      dateString: "",
      timeZoneName: "",
      fontSize: 16,
      fontSizeTitle: 16,
      backgroundColor: "#ffffff",
    };
  }

  static tagName = "timenow-zone-sdcw";

  // Observe attributes in kebab-case (HTML side)
  static observedAttributes = [
    "background-color",
    "time-zone-name",
    "font-family",
    "background",
    "time-zone",
    "rounded",
    "second",
    "hundredths",
    "caption",
    "prefers",
    "locale",
    "shadow",
    "border",
    "period",
    "date",
    "width",
    "align",
  ];

  /** Normalize boolean-like props coming from attributes. */
  private normalizeBool(value: unknown): boolean | undefined {
    // undefined/null => not provided
    if (value == null) return undefined;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      // HTML boolean attr present without value -> ""
      if (v === "" || v === "true" || v === "1" || v === "yes") return true;
      if (v === "false" || v === "0" || v === "no") return false;
    }
    return undefined; // unknown -> treat as "not provided"
  }

  private isHundredthsEnabled = (): boolean =>
    this.normalizeBool(this.props.hundredths) === true;

  private resetHundredthsFormatter = () => {
    this.hundredthsFormatter = undefined;
    this.hundredthsFormatterFailed = false;
  };

  private getHundredthsFormatter = (): Intl.DateTimeFormat | undefined => {
    if (this.hundredthsFormatter) return this.hundredthsFormatter;
    if (this.hundredthsFormatterFailed) return undefined;

    const { locale, timeZone } = this.props;
    const periodPref = this.normalizeBool(this.props.period);

    try {
      this.hundredthsFormatter = new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        fractionalSecondDigits: 2,
        ...(periodPref !== undefined
          ? { hour12: periodPref, hourCycle: periodPref ? "h12" : "h23" }
          : {}),
      });

      return this.hundredthsFormatter;
    } catch (e) {
      this.hundredthsFormatterFailed = true;

      if (!this.state.isError) {
        console.error("Error: ", e);
        this.setState({ isError: true });
      }

      return undefined;
    }
  };

  private stopClock = () => {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
  };

  private startClock = () => {
    this.stopClock();

    if (this.isHundredthsEnabled()) {
      this.hundredthsMetadataAt = Date.now();
      this.animationFrame = requestAnimationFrame(this.updateHundredthsFrame);
      return;
    }

    this.interval = setInterval(this.updateTimeAndDateString, 1000) as unknown as number;
  };

  private updateHundredthsTimeString = (date: Date) => {
    const formatter = this.getHundredthsFormatter();
    if (!formatter) return;

    try {
      const timeString = formatter.format(date);

      if (timeString !== this.state.timeString) {
        this.setState({ timeString });
      }
    } catch (e) {
      if (!this.state.isError) {
        console.error("Error: ", e);
        this.setState({ isError: true });
      }
    }
  };

  private updateHundredthsMetadata = (date: Date) => {
    const { locale, timeZone } = this.props;
    const isDay = date.getHours() >= 6 && date.getHours() < 18;

    try {
      const dateString = date.toLocaleDateString(locale, {
        timeZone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const timeZoneName = date.toLocaleDateString(locale, {
        timeZone,
        timeZoneName: this.props.timeZoneName === "" ? undefined : this.props.timeZoneName,
      });

      if (
        dateString !== this.state.dateString ||
        timeZoneName !== this.state.timeZoneName ||
        isDay !== this.state.isDay
      ) {
        this.setState({ dateString, timeZoneName, isDay });
      }
    } catch (e) {
      if (!this.state.isError) {
        console.error("Error: ", e);
        this.setState({ isError: true });
      }
    }
  };

  private updateHundredthsFrame = () => {
    if (!this.isHundredthsEnabled()) {
      this.animationFrame = undefined;
      return;
    }

    const date = new Date();
    this.updateHundredthsTimeString(date);

    const now = date.getTime();
    if (now < this.hundredthsMetadataAt || now - this.hundredthsMetadataAt >= 1000) {
      this.updateHundredthsMetadata(date);
      this.hundredthsMetadataAt = now;
    }

    this.animationFrame = requestAnimationFrame(this.updateHundredthsFrame);
  };

  clearFontLoadHandlers() {
    this.fontLoadId += 1;
    this.fontStylesheetReady = false;
    this.fontRequestedText = "";
    if (this.fontStylesheet) {
      this.fontStylesheet.onload = null;
      this.fontStylesheet.onerror = null;
      this.fontStylesheet = undefined;
    }
  }

  resizeAfterFontLoad = () => {
    const ownerDocument = this.containerRef?.ownerDocument;
    if (!this.fontStylesheetReady || !ownerDocument) return;
    if (!ownerDocument.fonts) {
      this.scheduleResize();
      return;
    }
    // Include actual localized glyphs; the default space only loads the Latin subset.
    const text = Array.from(new Set(`0123456789${this.fontRequestedText}${this.state.timeString}`)).join("");
    if (text === this.fontRequestedText) return;
    this.fontRequestedText = text;
    const requestId = this.fontLoadId;
    const fontFamily = this.props.fontFamily as string;
    const isCurrent = () => requestId === this.fontLoadId && this.containerRef?.isConnected;
    // WebKit may omit loadingdone; await this font, then measure in the next frame.
    void ownerDocument.fonts.load(`700 16px "${fontFamily}"`, text)
      .then(() => {
        if (isCurrent()) this.scheduleResize();
      }).catch((error: unknown) => {
        if (isCurrent()) console.error("Unable to load clock font:", fontFamily, error);
      });
  };

  loadGoogleFont = (fontFamily: string) => {
    this.clearFontLoadHandlers();
    const ownerDocument = this.containerRef?.ownerDocument;
    if (!ownerDocument || !googleFontsMonospace.includes(fontFamily)) return;
    const requestId = this.fontLoadId;
    const isCurrent = () => requestId === this.fontLoadId && this.containerRef?.isConnected;
    const link = ownerDocument.createElement("link");
    this.fontStylesheet = link;
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, "+")}:wght@700&display=swap`;
    link.rel = "stylesheet";
    link.onload = () => {
      if (!isCurrent()) return;
      this.fontStylesheetReady = true;
      this.resizeAfterFontLoad();
    };
    link.onerror = () => {
      if (isCurrent()) console.error("Unable to load clock font stylesheet:", fontFamily);
    };
    ownerDocument.head.appendChild(link);
  };

  scheduleResize = () => {
    if (this.resizeFrame === undefined) {
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = undefined;
        this.handleResize();
      });
    }
  };

  handlePrefers = () => {
    const backgroundColor =
      this.props.prefers === undefined ||
      this.props.prefers === null ||
      this.props.prefers === "" ||
      this.props.prefers === "system" ||
      this.props.prefers === "auto"
        ? isDark()
          ? "#000000"
          : "#ffffff"
        : this.props.prefers === "dark"
          ? "#000000"
          : "#ffffff";
    this.setState({ backgroundColor });
    // console.log(this.props.prefers, "prefers");
  };

  handleResize = () => {
    if (this.containerRef) {
      const localeList = ["bg", "ko"];
      const currentLocale = this.props.locale || "en"; // Replace this with your actual locale string
      const isLocaleMatch = localeList.some((prefix) => currentLocale.startsWith(prefix));
      const fontSizeByLocale = this.isHundredthsEnabled()
        ? isLocaleMatch
          ? 12
          : 11
        : isLocaleMatch
          ? 8
          : 7;
      const width = this.containerRef.offsetWidth;
      let fontSize = (width || 1) / fontSizeByLocale;
      const fontSizeTitle = (width || 1) / 15;
      const time = this.containerRef.querySelector("a");

      if (time) {
        const availableWidth = this.containerRef.clientWidth - 1;

        if (fontSize > 0 && availableWidth > 0) {
          const previousFontSize = time.style.getPropertyValue("font-size");
          const fontPriority = time.style.getPropertyPriority("font-size");
          const whiteSpace = time.style.getPropertyValue("white-space");
          const priority = time.style.getPropertyPriority("white-space");
          let naturalWidth = 0;

          try {
            time.style.setProperty("font-size", `${fontSize}px`, "important");
            time.style.setProperty("white-space", "nowrap", "important");
            // Match clientWidth's layout pixels even under ancestor transforms.
            naturalWidth = time.offsetWidth;
          } finally {
            if (previousFontSize) time.style.setProperty("font-size", previousFontSize, fontPriority);
            else time.style.removeProperty("font-size");
            if (whiteSpace) time.style.setProperty("white-space", whiteSpace, priority);
            else time.style.removeProperty("white-space");
          }

          if (Number.isFinite(naturalWidth) && naturalWidth > 0) {
            fontSize = Math.min(fontSize, (fontSize * availableWidth) / naturalWidth);
          }
        }
      }

      if (fontSize !== this.state.fontSize || fontSizeTitle !== this.state.fontSizeTitle) {
        this.setState({ fontSize, fontSizeTitle });
      }
    }
  };

  /**
   * Updates the time and date strings based on the current locale, timeZone, seconds, and period props.
   * Sets the state with the updated timeString, dateString, timeZoneName, and isError values.
   */
  updateTimeAndDateString = () => {
    const { locale, timeZone } = this.props;

    // Normalize boolean-like attributes
    const periodPref = this.normalizeBool(this.props.period);
    const showSeconds = this.normalizeBool(this.props.second);

    const date = new Date();
    let isDay = date.getHours() >= 6 && date.getHours() < 18;

    let timeString = "";
    let dateString = "";
    let timeZoneName = "";
    let isError = false;

    try {
      timeString = date.toLocaleTimeString(locale, {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        // show seconds only when explicitly true
        ...(showSeconds === true ? { second: "numeric" } : {}),
        // period overrides locale when explicitly provided
        ...(periodPref !== undefined
          ? { hour12: periodPref, hourCycle: periodPref ? "h12" : "h23" }
          : {}),
      });

      dateString = date.toLocaleDateString(locale, {
        timeZone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      timeZoneName = date.toLocaleDateString(locale, {
        timeZone,
        timeZoneName: this.props.timeZoneName === "" ? undefined : this.props.timeZoneName,
      });
    } catch (e) {
      isError = true;
      console.error("Error: ", e);
    }

    this.setState({ timeString, dateString, timeZoneName, isDay, isError });
  };

  // componentDidMount replaces useEffect for post-mount actions
  componentDidMount() {
    // console.log("componentDidMount");
    // Your CSS injection logic here

    this.handlePrefers();

    this.updateTimeAndDateString(); // Call it once immediately
    this.startClock();

    window.addEventListener("resize", this.handleResize);
    this.handleResize();

    if (this.containerRef && typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver((entries) => {
        // A layout read during delivery can re-enter iframe layout in WebKit.
        const entry = entries[0];
        if (entry?.target !== this.containerRef) return;
        const width = entry.contentRect.width;
        if (width === this.observedWidth) return;
        this.observedWidth = width;
        // Fit outside observer delivery so height changes cannot cause a resize loop.
        this.scheduleResize();
      });
      this.resizeObserver.observe(this.containerRef);
    }

    // Load the Google Font
    this.loadGoogleFont(this.props.fontFamily as string);
  }

  componentDidUpdate(
    prevProps: SimpleDigitalClockWidgetProps,
    prevState: SimpleDigitalClockWidgetState,
  ) {
    const hundredthsChanged = prevProps.hundredths !== this.props.hundredths;
    const formatChanged =
      prevProps.locale !== this.props.locale ||
      prevProps.timeZone !== this.props.timeZone ||
      prevProps.period !== this.props.period;

    if (formatChanged) {
      this.resetHundredthsFormatter();
    }

    if (prevProps.fontFamily !== this.props.fontFamily) {
      this.loadGoogleFont(this.props.fontFamily as string);
    }
    if (prevState.timeString !== this.state.timeString) {
      this.resizeAfterFontLoad();
    }
    if (
      prevProps.width !== this.props.width ||
      hundredthsChanged ||
      formatChanged ||
      prevProps.fontFamily !== this.props.fontFamily ||
      prevState.timeString.length !== this.state.timeString.length
    ) {
      this.scheduleResize();
    }
    if (prevProps.prefers !== this.props.prefers) {
      this.handlePrefers();
    }
    // Recalc time immediately when formatting-related props change
    if (
      prevProps.locale !== this.props.locale ||
      prevProps.timeZone !== this.props.timeZone ||
      prevProps.second !== this.props.second ||
      prevProps.hundredths !== this.props.hundredths ||
      prevProps.period !== this.props.period ||
      prevProps.timeZoneName !== this.props.timeZoneName
    ) {
      this.updateTimeAndDateString();
    }

    if (hundredthsChanged) {
      this.startClock();
    }
  }

  componentWillUnmount() {
    // console.log("componentWillUnmount");
    this.stopClock();
    this.clearFontLoadHandlers();
    window.removeEventListener("resize", this.handleResize);
    this.resizeObserver?.disconnect();
    if (this.resizeFrame !== undefined) cancelAnimationFrame(this.resizeFrame);
  }

  render() {
    const {
      backgroundColor,
      background,
      fontFamily,
      caption,
      rounded,
      shadow,
      border,
      width,
      align,
      date,
    } = this.props;

    const showDate = date !== undefined;
    const showCaption = caption || false;
    const parsedWidth = parseInt(width?.toString() || "80", 10) || undefined;

    const mainDivClasses = ["widget", "font-family"];
    if (shadow) {
      mainDivClasses.push(shadow);
    }

    const mainStyle = {
      color: contrastColor(backgroundColor?.toLowerCase() || this.state.backgroundColor),
      ...(background
        ? { background: background?.toLowerCase() || this.state.backgroundColor }
        : { backgroundColor: backgroundColor?.toLowerCase() }),
      // ...(background && { background: background?.toLowerCase() || this.state.backgroundColor }),
    };
    const fontStyles = {
      fontFamily: googleFontsMonospace.some((element: string) => element === fontFamily)
        ? this.props.fontFamily
        : "monospace",
    };

    return (
      <Fragment>
        <style>{cssText}</style>
        <div
          data-version={v}
          className={clsx(mainDivClasses)}
          ref={(el) => {
            this.containerRef = el;
          }}
          style={{
            ...mainStyle,
            ...(rounded !== undefined && { borderRadius: `${rounded}rem` }),
            ...(border !== undefined && {
              borderColor: darkenColor(
                backgroundColor?.toLowerCase() || this.state.backgroundColor,
                -0.25
              ),
              borderWidth: "1px",
            }),
            transition: "background 1s ease",
            position: "relative",
            minWidth: "80px",
            ...(width !== undefined && {
              width: parsedWidth === undefined ? undefined : `${parsedWidth}px`,
            }),
          }}
        >
          <div className={clsx(`text-${align || "center"}`)}>
            {this.state.timeString ? (
              <Fragment>
                {showCaption && <div style={{ fontSize: `${this.state.fontSizeTitle}px` }}>{caption}</div>}
                <a
                  title={this.state.timeZoneName}
                  style={{ fontSize: `${this.state.fontSize}px`, ...fontStyles }}
                  href="https://utctime.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {this.state.timeString}
                </a>
                {showDate && (
                  <Fragment>
                    <div
                      title={this.state.timeZoneName}
                      ref={(el) => {
                        this.dateContainerRef = el;
                      }}
                      onClick={() => {
                        this.zoneContainerRef?.style.setProperty("display", "block");
                        this.dateContainerRef?.style.setProperty("display", "none");
                      }}
                      style={{
                        fontSize: `${this.state.fontSizeTitle}px`,
                        cursor: "pointer",
                      }}
                    >
                      {this.state.dateString}
                    </div>
                    <div
                      title={this.state.dateString}
                      onClick={() => {
                        this.zoneContainerRef?.style.setProperty("display", "none");
                        this.dateContainerRef?.style.setProperty("display", "block");
                      }}
                      ref={(el) => {
                        this.zoneContainerRef = el;
                      }}
                      style={{
                        fontSize: `${this.state.fontSizeTitle}px`,
                        display: "none",
                        cursor: "pointer",
                      }}
                    >
                      {this.state.timeZoneName}
                    </div>
                  </Fragment>
                )}
              </Fragment>
            ) : (
              <>...</>
            )}
            {this.state.isError && <div>Error, please check attributes of tag.</div>}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimpleDigitalClockWidget;

register(SimpleDigitalClockWidget, undefined, undefined, { shadow: true });
