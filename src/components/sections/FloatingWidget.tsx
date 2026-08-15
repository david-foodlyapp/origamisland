import type { TranslationKey } from "../../i18n";
import { ChatIcon, CloseIcon, HomeIcon } from "../Icons";

type FloatingWidgetProps = {
  visible: boolean;
  open: boolean;
  setOpen: (updater: (open: boolean) => boolean) => void;
  openModal: () => void;
  t: (key: TranslationKey) => string;
};

export function FloatingWidget({ visible, open, setOpen, openModal, t }: FloatingWidgetProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className={`floating-widget ${open ? "is-open" : "is-collapsed"}`}>
      {open ? (
        <div className="floating-widget-card" role="complementary" aria-label="Origami quick enquiry widget">
          <div className="floating-widget-brand">
            <div className="floating-widget-badge">
              <HomeIcon />
            </div>
            <div className="floating-widget-copy">
              <span className="floating-widget-kicker">{t("widget_badge")}</span>
              <h3>{t("widget_title")}</h3>
              <p>{t("widget_desc")}</p>
            </div>
          </div>

          <div className="floating-widget-body">
            <div className="floating-widget-actions">
              <button type="button" className="floating-widget-chip floating-widget-chip-accent" onClick={() => openModal()}>
                {t("widget_consult")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="floating-widget-toggle"
        aria-label={open ? t("widget_toggle_close") : t("widget_toggle_open")}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}
