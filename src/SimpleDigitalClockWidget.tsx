/*
 * Simple Digital Clock Widget
 * This is a simple digital clock widget that displays the current time and date in a specified time zone.
 * It is based on the Timenow.zone website.
 * https://timenow.zone/
 * Version: 0.4.2
 */

import { Component, Fragment, h } from "preact";
import register from "preact-custom-element";
import clsx from "clsx";
import cssText from "bundle-text:./styles.css";
import contrastColor from "./contrastColor";
import darkenColor from "./darkenColor";
import data from "./data.yaml";
import isDark from "./isDark";

const v = "0.4.2";
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

type Seconds = "2-digit" | "numeric" | "";
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
  seconds?: Seconds;
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
    console.log(this.props.prefers, "prefers");
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

  /**
   * Updates the time and date strings based on the current locale, timeZone, seconds, and period props.
   * Sets the state with the updated timeString, dateString, timeZoneName, and isError values.
   */
  updateTimeAndDateString = () => {
    const { locale, timeZone, seconds, period } = this.props;
    const date = new Date();
    let isDay = true;
    let timeString = "";
    let dateString = "";
    let timeZoneName = "";
    let isError = false;

    const second = seconds === "" ? "numeric" : seconds;
    const currentHour = date.getHours();
    isDay = currentHour >= 6 && currentHour < 18;

    try {
      timeString = date.toLocaleTimeString(locale, {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        ...((period === undefined && second !== undefined) && { second }),
        ...(period !== undefined && { hour12: true }),
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
    if (prevProps.prefers !== this.props.prefers) {
      this.handlePrefers();
    }
  }

  componentWillUnmount() {
    // console.log("componentWillUnmount");
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
      color: contrastColor(backgroundColor?.toLowerCase() || this.state.backgroundColor),
      ...(background
        ? { background: background?.toLowerCase() || this.state.backgroundColor }
        : { backgroundColor: backgroundColor?.toLowerCase() }),
      // ...(background && { background: background?.toLowerCase() || this.state.backgroundColor }),
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
              borderColor: darkenColor(
                backgroundColor?.toLowerCase() || this.state.backgroundColor,
                -0.25
              ),
              borderWidth: "1px",
            }),
            position: "relative",
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
            {this.state.isError && <div>Error, please check attributes of tag.</div>}
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
    "background-color",
    "time-zone-name",
    "font-family",
    "background",
    "time-zone",
    "rounded",
    "seconds",
    "caption",
    "prefers",
    "locale",
    "shadow",
    "border",
    "period",
    "date",
    "width",
  ],
  { shadow: true }
);
