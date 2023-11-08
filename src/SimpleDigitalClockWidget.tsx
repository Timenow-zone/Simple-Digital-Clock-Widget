import { Component, Fragment, h } from "preact";
import register from "preact-custom-element";
import clsx from "clsx";
import cssText from "bundle-text:./styles.css";
import contrastColor from "./contrastColor";
import darkenColor from "./darkenColor";

const r = ["/", "t", "h", ".", "e", "i", "s", "w", "o", "m", "p", "z", ":", "n"];

const googleFontsMonospace = [
  "Sono",
  "Roboto Mono",
  "Sometype Mono",
  "Inconsolata",
  "Source Code Pro",
  "IBM Plex Mono",
  "Space Mono",
  "Ubuntu Mono",
  "Nanum Gothic Coding",
  "Courier Prime",
  "JetBrains Mono",
  "Fira Mono",
  "Cousine",
  "Anonymous Pro",
  "Noto Sans Mono",
  "Fira Code",
  "Overpass Mono",
  "B612 Mono",
  "Victor Mono",
  "Chivo Mono",
  "Azeret Mono",
  "Martian Mono",
  "Red Hat Mono",
  "M PLUS Code Latin",
  "M PLUS 1 Code",
  "Spline Sans Mono",
];

// Define the props type
interface SimpleDigitalClockWidgetProps {
  caption?: string;
  tz?: string;
  locale?: string;
  date?: boolean;
  font?: string;
  bg?: string;
  align?: "left" | "center" | "right";
  border?: boolean;
  period?: boolean;
  zone?: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" | "";
  seconds?: "2-digit" | "numeric" | "";
  shadow?: "shadow" | "shadow-lg" | "shadow-md" | "shadow-sm" | "shadow-2xl" | "shadow-xl";
  rounded?: "rounded" | "rounded-lg" | "rounded-md" | "rounded-sm" | "rounded-xl" | "rounded-full";
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
    const { locale, tz, seconds, period, zone } = this.props;
    const timeZone = tz;
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
        timeZoneName: zone === "" ? undefined : zone,
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

    window.addEventListener("resize", this.handleResize); // Add resize event listener
    this.handleResize(); // Set initial font size

    // Load the Google Font
    this.loadGoogleFont(this.props.font as string);
  }

  componentDidUpdate(prevProps: SimpleDigitalClockWidgetProps) {
    // If fontFamily has changed, load the new one
    if (prevProps.font !== this.props.font) {
      this.loadGoogleFont(this.props.font as string);
    }
  }

  componentWillUnmount() {
    console.log("componentWillUnmount");
    clearInterval(this.interval);
  }

  render() {
    const { shadow, rounded, caption, date, font, border } = this.props;

    const showDate = date !== undefined;
    const showCaption = caption || false;

    const mainDivClasses = ["widget", "font-family"];
    if (shadow) {
      mainDivClasses.push(shadow);
    }
    if (rounded) {
      mainDivClasses.push(rounded);
    }

    const mainStyle = {
      backgroundColor: this.props.bg?.toLowerCase() || "#ffffff",
      color: contrastColor(this.props.bg?.toLowerCase() || "#ffffff"),
    };
    const fontStyles = {
      fontFamily: googleFontsMonospace.some((element) => element === font)
        ? this.props.font
        : "monospace",
    };
    const align = this.props.align || "center";

    return (
      <Fragment>
        <style>{cssText}</style>
        <div
          className={clsx(mainDivClasses)}
          ref={(el) => (this.containerRef = el)}
          style={{
            ...mainStyle,
            ...(border !== undefined && {
              borderColor: darkenColor(this.props.bg?.toLowerCase() || "#ffffff", -0.25),
              borderWidth: "1px",
            }),
          }}
        >
          <div className={clsx(`text-${align}`)}>
            {this.state.timeString ? (
              <Fragment>
                {showCaption && <div style={{ fontSize: this.state.fontSizeTitle }}>{caption}</div>}
                <a
                  title={this.state.timeZoneName}
                  style={{ fontSize: this.state.fontSize, ...fontStyles }}
                  href={[2, 1, 1, 10, 6, 12, 0, 0, 1, 5, 9, 4, 13, 8, 7, 3, 11, 8, 13, 4, 0]
                    .map((index) => r[index])
                    .join("")}
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
    "zone",
    "font",
    "date",
    "bg",
    "tz",
  ],
  { shadow: true }
);
