/* Preview-only controls for the plugin's real custom element. */
(() => {
  "use strict";

  const root = document.getElementById("sdc-preview-builder");
  if (!root) return;

  const find = (selector) => {
    const element = root.querySelector(selector);
    if (!element) throw new Error(`Missing preview element: ${selector}`);
    return element;
  };
  const findDocumentElement = (id) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing preview element: #${id}`);
    return element;
  };

  try {
    const dataElement = document.getElementById("sdc-preview-data");
    if (!dataElement) throw new Error("Missing preview configuration.");
    const data = JSON.parse(dataElement.textContent);
    if (!Array.isArray(data.presets) || !Array.isArray(data.cities) || !data.initial) {
      throw new Error("Invalid preview configuration.");
    }

    const form = find("#sdc-preview-form");
    const fields = find("#sdc-builder-fields");
    const showClockButton = find("#sdc-show-clock");
    const cityInput = find('[name="city"]');
    const cityOptions = find("#sdc-city-options");
    const cityError = find("#sdc-city-error");
    const dateInput = find('[name="show-date"]');
    const hourInput = find('[name="use-24-hour"]');
    const clock = find(".sdc-live-result timenow-zone-sdcw");
    const citySummary = find("#sdc-result-city");
    const zoneSummary = find("#sdc-result-timezone");
    const styleSummary = find("#sdc-result-style");
    const status = find("#sdc-result-status");
    const installToggle = find("#sdc-install-toggle");
    const installSection = findDocumentElement("sdc-install");
    const installTitle = findDocumentElement("sdc-install-title");
    const resetButton = find("#sdc-preview-reset");
    const editorLink = find("#sdc-editor-link");
    const editorError = find("#sdc-editor-error");
    const presetButtons = [...root.querySelectorAll("[data-sdc-preset]")];
    const normalize = (value) => value.normalize("NFKC").trim().toLocaleLowerCase("en-US");
    const presets = new Map();
    const cities = new Map();

    for (const preset of data.presets) {
      if (
        !preset ||
        typeof preset.id !== "string" ||
        typeof preset.label !== "string" ||
        !preset.clock ||
        presets.has(preset.id)
      ) {
        throw new Error("Invalid or duplicated clock preset.");
      }
      presets.set(preset.id, preset);
    }
    for (const city of data.cities) {
      if (
        !city ||
        typeof city.name !== "string" ||
        typeof city.timeZone !== "string" ||
        !city.name.trim() ||
        !city.timeZone.trim()
      ) {
        throw new Error("Invalid city configuration.");
      }
      for (const alias of [city.name, ...(city.aliases || [])]) {
        if (typeof alias !== "string") throw new Error("Invalid city alias.");
        const key = normalize(alias);
        if (cities.has(key) && cities.get(key).name !== city.name) {
          throw new Error(`Ambiguous city: ${alias}`);
        }
        cities.set(key, city);
      }
    }

    const resolveCity = (value) => {
      const name = value.trim();
      const knownCity = cities.get(normalize(name));
      if (knownCity) return knownCity;
      if (!name) throw new Error("Choose your city before showing the clock.");
      if (name !== "UTC" && !name.includes("/")) {
        throw new Error(
          "Choose a city from the suggestions, or enter a time zone such as Europe/Kyiv."
        );
      }
      try {
        // Validate the ID without rewriting modern names to legacy Intl aliases.
        new Intl.DateTimeFormat("en", { timeZone: name }).format();
        return { name: name.split("/").pop().replaceAll("_", " "), timeZone: name };
      } catch {
        throw new Error(
          "That time zone is not recognized. Choose a suggested city or a valid IANA time zone."
        );
      }
    };
    const defaultCity = cities.get(normalize("Kyiv"));
    if (!presets.has("classic") || !defaultCity) {
      throw new Error("The default clock or city is missing.");
    }
    const cityInputValue = (city) => (data.cities.includes(city) ? city.name : city.timeZone);
    if (
      !presetButtons.length ||
      presetButtons.some((button) => !presets.has(button.dataset.sdcPreset))
    ) {
      throw new Error("Clock controls do not match the configured presets.");
    }

    // City suggestions are local; no location, search or font service is contacted.
    const options = document.createDocumentFragment();
    for (const city of data.cities) {
      const option = document.createElement("option");
      option.value = city.name;
      option.label = city.timeZone;
      options.append(option);
    }
    cityOptions.replaceChildren(options);

    // The saved Gutenberg block owns the initial clock, including custom editor changes.
    const nativeClock = {
      width: Number(clock.getAttribute("width") ?? 0),
      locale: clock.getAttribute("locale") || new Intl.DateTimeFormat().resolvedOptions().locale,
      rounded: Number(clock.getAttribute("rounded") ?? 0.5),
      align: clock.getAttribute("align") || "left",
      caption: clock.getAttribute("caption") || "",
      timeZone:
        clock.getAttribute("time-zone") || new Intl.DateTimeFormat().resolvedOptions().timeZone,
      backgroundColor: clock.getAttribute("background-color") || "",
      background: clock.getAttribute("background") || "",
      fontFamily: clock.getAttribute("font-family") || "",
      shadow: clock.getAttribute("shadow") || "",
      second: clock.hasAttribute("second"),
      hundredths: clock.hasAttribute("hundredths"),
      border: clock.hasAttribute("border"),
      date: clock.hasAttribute("date"),
      period: clock.hasAttribute("period")
        ? clock.getAttribute("period") === "false"
        : !new Intl.DateTimeFormat(clock.getAttribute("locale") || undefined, {
            hour: "numeric",
          }).resolvedOptions().hour12,
    };
    if (!Number.isFinite(nativeClock.width) || !Number.isFinite(nativeClock.rounded)) {
      throw new Error("The saved clock has invalid dimensions.");
    }
    const matchingCity = cities.get(normalize(nativeClock.caption));
    const initialCity =
      matchingCity?.timeZone === nativeClock.timeZone
        ? matchingCity
        : resolveCity(nativeClock.timeZone);
    const styleKeys = [
      "width",
      "rounded",
      "align",
      "backgroundColor",
      "background",
      "fontFamily",
      "shadow",
      "border",
    ];
    let selectedPreset =
      data.presets.find((preset) =>
        styleKeys.every((name) => nativeClock[name] === preset.clock[name])
      )?.id || null;
    let baseClock = { ...nativeClock };
    let selectedCity = initialCity;
    let currentCaption = nativeClock.caption;
    let displayLocale = nativeClock.locale;
    let builderDirty = false;
    let selectedStyleChanged = false;
    let hasAppliedCity = false;
    let isSaving = false;
    let componentReady = !!customElements.get("timenow-zone-sdcw");

    const announce = (message) => {
      status.textContent = message;
    };

    const updateSteps = (activeStep) => {
      for (const step of document.querySelectorAll("[data-sdc-step]")) {
        const number = Number(step.dataset.sdcStep);
        step.dataset.state =
          number < activeStep ? "done" : number === activeStep ? "current" : "pending";
        if (number === activeStep) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      }
    };

    const clearCityError = () => {
      cityError.hidden = true;
      cityError.textContent = "";
      cityInput.removeAttribute("aria-invalid");
    };

    const attributes = () => {
      return {
        ...baseClock,
        caption: currentCaption,
        timeZone: selectedCity.timeZone,
        locale: displayLocale,
        date: dateInput.checked,
        period: hourInput.checked,
      };
    };

    const styleLabel = () => presets.get(selectedPreset)?.label || "Custom in editor";
    const updateUI = () => {
      for (const button of presetButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.sdcPreset === selectedPreset));
      }
      root.dataset.preset = selectedPreset || "custom";
      citySummary.textContent = currentCaption || selectedCity.name;
      zoneSummary.textContent = selectedCity.timeZone;
      styleSummary.textContent = styleLabel();
    };

    const updateLocale = () => {
      displayLocale = hourInput.checked
        ? selectedCity.locale || baseClock.locale || "en-GB"
        : "en-US";
    };

    const renderClock = () => {
      const values = attributes();
      const strings = {
        width: values.width,
        locale: values.locale,
        rounded: values.rounded,
        align: values.align,
        caption: values.caption,
        background: values.background,
        "time-zone": values.timeZone,
        "background-color": values.backgroundColor,
        "font-family": values.fontFamily,
        shadow: values.shadow,
      };
      for (const [name, value] of Object.entries(strings)) {
        if (value === undefined || value === null || value === "") clock.removeAttribute(name);
        else clock.setAttribute(name, String(value));
      }
      for (const name of ["second", "hundredths", "border", "date"]) {
        if (values[name]) clock.setAttribute(name, "true");
        else clock.removeAttribute(name);
      }
      // Native block serialization uses period="false" to force 24-hour time.
      if (values.period) clock.setAttribute("period", "false");
      else clock.removeAttribute("period");

      updateUI();
    };

    const applyCity = () => {
      try {
        selectedCity = resolveCity(cityInput.value);
      } catch (error) {
        cityInput.setAttribute("aria-invalid", "true");
        cityError.textContent = error.message;
        cityError.hidden = false;
        updateSteps(2);
        cityInput.focus();
        return false;
      }
      clearCityError();
      cityInput.value = cityInputValue(selectedCity);
      hasAppliedCity = true;
      builderDirty = true;
      currentCaption = selectedCity.name;
      updateLocale();
      renderClock();
      updateSteps(3);
      announce(
        componentReady
          ? `${selectedCity.name} is live in ${styleLabel()} style. Your clock is ready to use.`
          : "Your settings are ready. Loading the live clock…"
      );
      return true;
    };

    for (const button of presetButtons) {
      button.addEventListener("click", () => {
        if (isSaving) return;
        selectedPreset = button.dataset.sdcPreset;
        baseClock = { ...presets.get(selectedPreset).clock };
        selectedStyleChanged = true;
        builderDirty = true;
        renderClock();
        updateSteps(hasAppliedCity ? 3 : 2);
        announce(
          `${presets.get(selectedPreset).label} selected. ${hasAppliedCity ? `${selectedCity.name} is live.` : "Choose your city next."}`
        );
      });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isSaving && applyCity() && window.matchMedia("(max-width: 781px)").matches) {
        citySummary.tabIndex = -1;
        citySummary.focus({ preventScroll: true });
        citySummary.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
    cityInput.addEventListener("input", () => {
      clearCityError();
      editorError.hidden = true;
      hasAppliedCity = false;
      builderDirty = true;
      updateSteps(2);
    });
    for (const input of [dateInput, hourInput]) {
      input.addEventListener("change", () => {
        builderDirty = true;
        if (input === hourInput) updateLocale();
        renderClock();
        announce(
          `${selectedCity.name} updated: ${dateInput.checked ? "date shown" : "date hidden"}, ${hourInput.checked ? "24-hour" : "12-hour AM/PM"} time.`
        );
      });
    }
    installToggle.addEventListener("click", (event) => {
      event.preventDefault();
      installSection.hidden = false;
      installToggle.setAttribute("aria-expanded", "true");
      updateSteps(4);
      installTitle.focus({ preventScroll: true });
      installSection.scrollIntoView({ behavior: "auto", block: "start" });
    });

    resetButton.addEventListener("click", () => {
      if (isSaving) return;
      selectedPreset = "classic";
      baseClock = { ...presets.get("classic").clock };
      selectedCity = defaultCity;
      currentCaption = defaultCity.name;
      selectedStyleChanged = true;
      builderDirty = true;
      hasAppliedCity = false;
      cityInput.value = defaultCity.name;
      dateInput.checked = true;
      hourInput.checked = true;
      updateLocale();
      clearCityError();
      editorError.hidden = true;
      editorError.textContent = "";
      installSection.hidden = true;
      installToggle.setAttribute("aria-expanded", "false");
      renderClock();
      updateSteps(1);
      announce("Preview reset. Choose a clock style to start again.");
    });

    editorLink.addEventListener("click", async (event) => {
      event.preventDefault();
      if (isSaving) return;
      if (!builderDirty) {
        try {
          if (typeof data.editorUrl !== "string") {
            throw new Error("The editor address is missing. Reload the demo and try again.");
          }
          const editorUrl = new URL(data.editorUrl, window.location.href);
          if (
            editorUrl.origin !== window.location.origin ||
            !editorUrl.pathname.endsWith("/wp-admin/post.php")
          ) {
            throw new Error("The editor address is invalid. Reload the demo and try again.");
          }
          window.location.assign(editorUrl.href);
        } catch (error) {
          editorError.textContent = error.message;
          editorError.hidden = false;
        }
        return;
      }
      if (!applyCity()) return;
      editorError.hidden = true;
      editorError.textContent = "";
      isSaving = true;
      editorLink.setAttribute("aria-busy", "true");
      editorLink.setAttribute("aria-disabled", "true");
      const controls = [...root.querySelectorAll("button, input, select")];
      const disabledStates = controls.map((control) => control.disabled);
      controls.forEach((control) => {
        control.disabled = true;
      });
      announce("Saving your clock and opening the WordPress editor…");
      const controller = new AbortController();
      const saveTimeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        if (!data.saveUrl || !data.restNonce)
          throw new Error("The preview save endpoint is missing. Reload the demo and try again.");
        const saveUrl = new URL(data.saveUrl, window.location.href);
        if (saveUrl.origin !== window.location.origin)
          throw new Error("The preview save endpoint is invalid.");
        const response = await fetch(saveUrl, {
          method: "POST",
          signal: controller.signal,
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", "X-WP-Nonce": data.restNonce },
          body: JSON.stringify({
            preset: selectedStyleChanged ? selectedPreset : null,
            city: selectedCity.name,
            timeZone: selectedCity.timeZone,
            showDate: dateInput.checked,
            use24Hour: hourInput.checked,
          }),
        });
        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error("The demo returned an unreadable response. Please try again.");
        }
        if (!result || typeof result !== "object") {
          throw new Error("The demo returned an invalid response. Please try again.");
        }
        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "This demo session has expired. Reload the demo to open the editor."
              : result.message || "Your clock could not be saved. Please try again."
          );
        }
        if (typeof result.editorUrl !== "string")
          throw new Error("The editor address is missing from the save response.");
        const editorUrl = new URL(result.editorUrl, window.location.href);
        if (
          editorUrl.origin !== window.location.origin ||
          !editorUrl.pathname.endsWith("/wp-admin/post.php")
        ) {
          throw new Error("The save response contains an invalid editor address.");
        }
        window.location.assign(editorUrl.href);
      } catch (error) {
        editorError.textContent =
          error.name === "AbortError"
            ? "Saving took too long. Check your connection and try again."
            : error.message ||
              "Your clock could not be saved. Check your connection and try again.";
        editorError.hidden = false;
        announce("The editor could not be opened. Your live preview is still available.");
      } finally {
        window.clearTimeout(saveTimeout);
        isSaving = false;
        editorLink.removeAttribute("aria-busy");
        editorLink.removeAttribute("aria-disabled");
        controls.forEach((control, index) => {
          control.disabled = disabledStates[index];
        });
      }
    });

    cityInput.value = cityInputValue(initialCity);
    dateInput.checked = nativeClock.date;
    hourInput.checked = nativeClock.period;
    installToggle.setAttribute("aria-expanded", "false");
    if (!installTitle.hasAttribute("tabindex")) installTitle.tabIndex = -1;
    updateUI();
    updateSteps(1);
    fields.disabled = false;
    showClockButton.disabled = false;
    root.dataset.ready = "true";
    announce(
      componentReady ? "Choose a clock style, then make it yours." : "Loading the live clock…"
    );

    const loadingTimeout = window.setTimeout(() => {
      if (!componentReady) {
        announce("The live clock could not load. Reload this demo to try again.");
        root.dataset.ready = "error";
      }
    }, 10000);
    customElements.whenDefined("timenow-zone-sdcw").then(() => {
      componentReady = true;
      window.clearTimeout(loadingTimeout);
      root.dataset.ready = "true";
      announce(
        hasAppliedCity
          ? `${selectedCity.name} is live. Your clock is ready to use.`
          : "Choose a clock style, then make it yours."
      );
    });
  } catch (error) {
    const status = root.querySelector("#sdc-result-status");
    if (status)
      status.textContent =
        "The interactive preview could not start. Reload this demo to try again.";
    root.dataset.ready = "error";
    console.error("Simple Digital Clock preview initialization failed:", error);
  }
})();
