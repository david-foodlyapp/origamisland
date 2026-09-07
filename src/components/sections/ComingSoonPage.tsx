import { useState, useEffect, FormEvent } from "react";
import { API_BASE_URL } from "../../config";

type CountdownValue = {
  hours: number;
  minutes: number;
  seconds: number;
};

type ContactField = "name" | "email" | "phone";
type ContactFieldErrors = Partial<Record<ContactField, string>>;

type ContactApiError = {
  message?: string;
  errors?: Partial<Record<ContactField, string[]>>;
};

// Official reveal: September 8, 2026 at 18:00 in Tbilisi (UTC+4).
const LAUNCH_DATE = new Date("2026-09-08T18:00:00+04:00");

function getCountdown(): CountdownValue {
  const now = new Date();
  const diff = Math.max(0, LAUNCH_DATE.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const pageCopy = {
  en: {
    title: "BE AMONG THE FIRST",
    description: "Leave your details to receive priority access to the exclusive offer before the official reveal.",
    hours: "Hours", minutes: "Minutes", seconds: "Seconds",
    formTitle: "Get Early Access & Exclusive Offers",
    name: "Your Name", email: "Email Address", phone: "Phone Number", countryCode: "Country code",
    submit: "Secure My Priority Access", sending: "Sending…",
    successTitle: "You're on the list!",
    successDescription: "We'll notify you the moment we launch. Prepare to experience something truly extraordinary.",
    error: "Unable to send your request. Please try again.",
    rights: "All rights reserved.", language: "Language",
  },
  ka: {
    title: "მიიღე წვდომა პირველმა",
    description: "დატოვე შენი საკონტაქტო ინფორმაცია და მიიღე პრიორიტეტული წვდომა ექსკლუზიურ შეთავაზებაზე მის ოფიციალურ წარდგენამდე.",
    hours: "საათი", minutes: "წუთი", seconds: "წამი",
    formTitle: "მიიღეთ ადრეული წვდომა",
    name: "თქვენი სახელი", email: "ელფოსტა", phone: "ტელეფონი", countryCode: "ქვეყნის კოდი",
    submit: "გაგზავნა", sending: "იგზავნება…",
    successTitle: "თქვენ სიაში ხართ!",
    successDescription: "გახსნისთანავე შეგატყობინებთ. მოემზადეთ განსაკუთრებული გამოცდილებისთვის.",
    error: "მოთხოვნის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.",
    rights: "ყველა უფლება დაცულია.", language: "ენა",
  },
};

type ComingSoonPageProps = {
  language: "en" | "ka";
  onLanguageChange: (language: "en" | "ka") => void;
  darkThemeLogoSrc: string;
  lightThemeLogoSrc: string;
  countryCodeOptions: Array<{ code: string; dialCode: string; label: string }>;
};

export function ComingSoonPage({ darkThemeLogoSrc, lightThemeLogoSrc, language, onLanguageChange, countryCodeOptions }: ComingSoonPageProps) {
  const copy = pageCopy[language];
  const [countdown, setCountdown] = useState<CountdownValue>(getCountdown);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+995");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    setFieldErrors({});
    const fullPhoneNumber = `${countryCode} ${phone}`.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/contact-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: fullPhoneNumber,
          subject: "consultation",
          message: "Origami Island consultation request",
          source_page: window.location.pathname,
        }),
      });

      const result = await response.json().catch(() => ({} as ContactApiError)) as ContactApiError;

      if (response.status === 422 && result.errors) {
        setFieldErrors({
          name: result.errors.name?.[0],
          email: result.errors.email?.[0],
          phone: result.errors.phone?.[0],
        });
        setSubmitError(result.message || copy.error);
        return;
      }

      if (response.status !== 201) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setCountryCode("+995");
      setPhone("");
    } catch {
      setSubmitError(copy.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section lang={language} dir="ltr" className="cs-page" aria-labelledby="coming-soon-title">
      <div className="container cs-logo-wrap">
        <a href="/" className="theme-aware-logo cs-logo-link" aria-label="Origami Island">
          <img src={darkThemeLogoSrc} alt="Origami Island" className="cs-logo logo-dark" />
          <img src={lightThemeLogoSrc} alt="Origami Island" className="cs-logo logo-light" />
        </a>
      </div>
      <div className="container cs-content">
        <div className="cs-intro">
        {/* Headline */}
        <h1 id="coming-soon-title" className="section-title cs-title">
          {copy.title}
        </h1>

        <p className="section-desc cs-desc">
          {copy.description}
        </p>

        {/* Countdown */}
        <div className="cs-countdown">
          {[
            { label: copy.hours, value: countdown.hours },
            { label: copy.minutes, value: countdown.minutes },
            { label: copy.seconds, value: countdown.seconds },
          ].map(({ label, value }, i) => (
            <div key={label} className="cs-countdown-unit">
              <div className="cs-countdown-card">
                <span className="cs-countdown-number">{pad(value)}</span>
                {i < 2 && <span className="cs-countdown-sep">:</span>}
              </div>
              <span className="cs-countdown-label">{label}</span>
            </div>
          ))}
        </div>

        </div>

        {/* Lead Form */}
        <div className="cs-form-wrap">
          {submitted ? (
            <div className="cs-success" role="status">
              <div className="cs-success-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="cs-success-title">{copy.successTitle}</h3>
              <p className="cs-success-desc">
                {copy.successDescription}
              </p>
            </div>
          ) : (
            <>
              <p className="cs-form-label">{copy.formTitle}</p>
              <form id="coming-soon-form" className="cs-form" onSubmit={handleSubmit}>
                <div className="cs-form-row">
                  <div className="cs-form-group">
                    <input
                      type="text"
                      id="cs-name"
                      aria-label={copy.name}
                      autoComplete="name"
                      className="cs-input"
                      placeholder={copy.name}
                      required
                      maxLength={255}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? "cs-name-error" : undefined}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setFieldErrors((current) => ({ ...current, name: undefined }));
                      }}
                    />
                    {fieldErrors.name && <p id="cs-name-error" className="cs-field-error">{fieldErrors.name}</p>}
                  </div>
                  <div className="cs-form-group">
                    <input
                      type="email"
                      id="cs-email"
                      aria-label={copy.email}
                      autoComplete="email"
                      className="cs-input"
                      placeholder={copy.email}
                      required
                      maxLength={255}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "cs-email-error" : undefined}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((current) => ({ ...current, email: undefined }));
                      }}
                    />
                    {fieldErrors.email && <p id="cs-email-error" className="cs-field-error">{fieldErrors.email}</p>}
                  </div>
                </div>
                <div className="cs-phone-row">
                  <select
                    id="cs-country-code"
                    className="cs-input cs-country-code"
                    aria-label={copy.countryCode}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    required
                  >
                    {countryCodeOptions.map((option) => (
                      <option key={`${option.code}-${option.dialCode}`} value={option.dialCode}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="cs-form-group">
                    <input
                      type="tel"
                      id="cs-phone"
                      aria-label={copy.phone}
                      autoComplete="tel-national"
                      className="cs-input"
                      placeholder={copy.phone}
                      required
                      maxLength={255}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? "cs-phone-error" : undefined}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFieldErrors((current) => ({ ...current, phone: undefined }));
                      }}
                    />
                    {fieldErrors.phone && <p id="cs-phone-error" className="cs-field-error">{fieldErrors.phone}</p>}
                  </div>
                </div>
                <button
                  type="submit"
                  id="cs-submit-btn"
                  className="cs-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><span className="cs-btn-spinner" aria-hidden="true" /><span>{copy.sending}</span></>
                  ) : (
                    <>
                      <span>{copy.submit}</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
                {submitError && (
                  <p className="cs-form-error" role="alert">{submitError}</p>
                )}
              </form>
            </>
          )}
        </div>

      </div>
      <footer className="container cs-footer">
        <div className="cs-language-switch" role="group" aria-label={copy.language}>
          <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => onLanguageChange("en")}>
            <span aria-hidden="true">🇺🇸</span>
            <span>English</span>
          </button>
          <button type="button" lang="ka" aria-pressed={language === "ka"} onClick={() => onLanguageChange("ka")}>
            <span aria-hidden="true">🇬🇪</span>
            <span>ქართული</span>
          </button>
        </div>
        <p>© {new Date().getFullYear()} Origami Holding. {copy.rights}</p>
      </footer>
    </section>
  );
}
