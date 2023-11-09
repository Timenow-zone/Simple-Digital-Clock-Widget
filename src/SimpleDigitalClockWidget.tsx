/*
 * Simple Digital Clock Widget
 * This is a simple digital clock widget that displays the current time and date in a specified time zone.
 * It is based on the Timenow.zone website.
 * https://timenow.zone/
 * Version: 0.2.0
 */

import { Component, Fragment, h } from "preact";
import register from "preact-custom-element";
import clsx from "clsx";
import cssText from "bundle-text:./styles.css";
import contrastColor from "./contrastColor";
import darkenColor from "./darkenColor";
import data from "./data.yaml";

const v = "0.2.0";
const r = String.fromCodePoint(
  104,
  116,
  116,
  112,
  115,
  58,
  47,
  47,
  116,
  105,
  109,
  101,
  110,
  111,
  119,
  46,
  122,
  111,
  110,
  101,
  47
);

const googleFontsMonospace = data.allowFonts;

// Define the props type
interface SimpleDigitalClockWidgetProps {
  date?: boolean;
  border?: boolean;
  period?: boolean;
  caption?: string;
  timeZone?: string;
  locale?: string;
  fontFamily?: string;
  backgroundColor?: string;
  background?: string;
  rounded?: number;
  width?: number;
  align?: "left" | "center" | "right";
  timeZoneName?:
    | "short"
    | "long"
    | "shortOffset"
    | "longOffset"
    | "shortGeneric"
    | "longGeneric"
    | "";
  seconds?: "2-digit" | "numeric" | "";
  shadow?: "shadow" | "shadow-lg" | "shadow-md" | "shadow-sm" | "shadow-2xl" | "shadow-xl";
}

// Define the state type
interface SimpleDigitalClockWidgetState {
  isDark: boolean;
  isError: boolean;
  timeString: string;
  dateString: string;
  timeZoneName: string;
  fontSize: number;
  fontSizeTitle: number;
}

class SimpleDigitalClockWidget extends Component<
  SimpleDigitalClockWidgetProps,
  SimpleDigitalClockWidgetState
> {
  interval?: number;
  containerRef: HTMLDivElement | null = null;
  zoneContainerRef: HTMLDivElement | null = null;
  dateContainerRef: HTMLDivElement | null = null;
  constructor(props: SimpleDigitalClockWidgetProps) {
    super(props);
    this.interval;
    this.state = {
      isDark: false,
      isError: false,
      timeString: "",
      dateString: "",
      timeZoneName: "",
      fontSize: 16,
      fontSizeTitle: 16,
    };
  }

  loadGoogleFont = (fontFamily: string) => {
    if (fontFamily) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
        /\s/g,
        "+"
      )}:wght@700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  };

  handleResize = () => {
    if (this.containerRef) {
      const localeList = ["bg", "ko"];
      const currentLocale = this.props.locale || "en"; // Replace this with your actual locale string
      const isLocaleMatch = localeList.some((prefix) => currentLocale.startsWith(prefix));
      const fontSizeByLocale = isLocaleMatch ? 8 : 6;
      const width = this.containerRef.offsetWidth;
      const fontSize = (width || 1) / fontSizeByLocale;
      const fontSizeTitle = (width || 1) / 15;
      this.setState({ fontSize, fontSizeTitle });
    }
  };

  updateTimeAndDateString = () => {
    const { locale, timeZone, seconds, period } = this.props;
    const date = new Date();
    let timeString = "";
    let dateString = "";
    let timeZoneName = "";
    let isError = false;

    const second = seconds === "" ? "numeric" : seconds;

    try {
      timeString = date.toLocaleTimeString(locale, {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        second: period !== undefined ? undefined : second,
        hour12: period !== undefined,
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
    this.setState({ timeString, dateString, timeZoneName, isError });
  };

  // componentDidMount replaces useEffect for post-mount actions
  componentDidMount() {
    console.log("componentDidMount");
    // Your CSS injection logic here

    this.updateTimeAndDateString(); // Call it once immediately
    this.interval = setInterval(this.updateTimeAndDateString, 1000) as unknown as number; // Call it every second

    window.addEventListener("resize", this.handleResize);
    this.handleResize();

    // Load the Google Font
    this.loadGoogleFont(this.props.fontFamily as string);
  }

  componentDidUpdate(prevProps: SimpleDigitalClockWidgetProps) {
    // If fontFamily has changed, load the new one
    if (prevProps.fontFamily !== this.props.fontFamily) {
      this.loadGoogleFont(this.props.fontFamily as string);
    }
    if (prevProps.width !== this.props.width) {
      this.handleResize();
    }
  }

  componentWillUnmount() {
    console.log("componentWillUnmount");
    clearInterval(this.interval);
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

    const mainDivClasses = ["widget", "font-family"];
    if (shadow) {
      mainDivClasses.push(shadow);
    }

    const mainStyle = {
      color: contrastColor(backgroundColor?.toLowerCase() || "#ffffff"),
      ...(background && { background: background?.toLowerCase() || "#ffffff" }),
      ...(backgroundColor && { backgroundColor: backgroundColor?.toLowerCase() || "#ffffff" }),
    };
    const fontStyles = {
      fontFamily: googleFontsMonospace.some((element) => element === fontFamily)
        ? this.props.fontFamily
        : "monospace",
    };

    return (
      <Fragment>
        <style>{cssText}</style>
        <div
          data-version={v}
          className={clsx(mainDivClasses)}
          ref={(el) => (this.containerRef = el)}
          style={{
            ...mainStyle,
            ...(rounded !== undefined && { borderRadius: `${rounded}rem` }),
            ...(border !== undefined && {
              borderColor: darkenColor(backgroundColor?.toLowerCase() || "#ffffff", -0.25),
              borderWidth: "1px",
            }),
            minWidth: 80,
            ...(width !== undefined && {
              width: parseInt(width?.toString() || "80", 10) || undefined,
            }),
          }}
        >
          <div className={clsx(`text-${align || "center"}`)}>
            {this.state.timeString ? (
              <Fragment>
                {showCaption && <div style={{ fontSize: this.state.fontSizeTitle }}>{caption}</div>}
                <a
                  title={this.state.timeZoneName}
                  style={{ fontSize: this.state.fontSize, ...fontStyles }}
                  href={r}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {this.state.timeString}
                </a>
                {showDate && (
                  <Fragment>
                    <div
                      title={this.state.timeZoneName}
                      ref={(el) => (this.dateContainerRef = el)}
                      onClick={() => {
                        this.zoneContainerRef?.style.setProperty("display", "block");
                        this.dateContainerRef?.style.setProperty("display", "none");
                      }}
                      style={{
                        fontSize: this.state.fontSizeTitle,
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
                      ref={(el) => (this.zoneContainerRef = el)}
                      style={{
                        fontSize: this.state.fontSizeTitle,
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
            {this.state.isError && <div>Error</div>}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SimpleDigitalClockWidget;

register(
  SimpleDigitalClockWidget,
  "timenow-zone-sdcw",
  [
    "rounded",
    "seconds",
    "caption",
    "locale",
    "shadow",
    "border",
    "period",
    "font-family",
    "date",
    "width",
    "background-color",
    "background",
    "time-zone-name",
    "time-zone",
  ],
  { shadow: true }
);
