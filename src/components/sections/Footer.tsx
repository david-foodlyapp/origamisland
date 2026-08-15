import type { FooterSection, SectionGridCardItem, SocialNetworkItem, CompanyProjectApiItem } from "../../types";
import type { TranslationKey } from "../../i18n";
import { ChevronIcon, FacebookIcon, InstagramIcon, LinkedInIcon } from "../Icons";

type FooterProps = {
  darkThemeLogoSrc: string;
  lightThemeLogoSrc: string;
  socialNetworks: SocialNetworkItem[];
  primaryNavItems: Array<{ href: string; label: string; isModalAction?: boolean }>;
  companyProjectsData: { title: string; items: CompanyProjectApiItem[] } | null;
  legalItems: SectionGridCardItem[];
  contact: {
    address: string;
    email: string;
    phone: string;
    secondaryPhone?: string | null;
    mapLink?: string | null;
  };
  openFooterSection: FooterSection | null;
  toggleFooterSection: (section: FooterSection) => void;
  openModal: () => void;
  formatTelHref: (phone: string) => string;
  t: (key: TranslationKey) => string;
};

export function Footer({
  darkThemeLogoSrc,
  lightThemeLogoSrc,
  socialNetworks,
  primaryNavItems,
  companyProjectsData,
  legalItems,
  contact,
  openFooterSection,
  toggleFooterSection,
  openModal,
  formatTelHref,
  t
}: FooterProps) {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="logo-container" style={{ marginBottom: "1.5rem" }}>
              <img
                src={darkThemeLogoSrc}
                alt="ORIGAMI"
                className="logo-img logo-dark"
              />
              <img
                src={lightThemeLogoSrc}
                alt="ORIGAMI"
                className="logo-img logo-light"
              />
            </a>
            <p>{t("footer_desc")}</p>

            <div className="social-links">
              {socialNetworks.length > 0 ? (
                socialNetworks.map((network) => (
                  <a key={network.id} href={network.link} target="_blank" rel="noreferrer" aria-label={network.name}>
                    {network.image_url ? (
                      <img src={network.image_url} alt={network.name} width={18} height={18} />
                    ) : network.name.toLowerCase() === "facebook" ? (
                      <FacebookIcon />
                    ) : network.name.toLowerCase() === "instagram" ? (
                      <InstagramIcon />
                    ) : (
                      <LinkedInIcon />
                    )}
                  </a>
                ))
              ) : null}
            </div>
          </div>

          <div className={`footer-column ${openFooterSection === "links" ? "is-open" : ""}`}>
            <button
              className="footer-column-toggle"
              type="button"
              aria-expanded={openFooterSection === "links"}
              onClick={() => toggleFooterSection("links")}
            >
              <span className="footer-column-title">{t("footer_col_links")}</span>
              <ChevronIcon direction={openFooterSection === "links" ? "up" : "down"} />
            </button>
            <ul>
              {primaryNavItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.isModalAction ? "#" : item.href}
                    onClick={(event) => {
                      if (!item.isModalAction) {
                        return;
                      }

                      event.preventDefault();
                      openModal();
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`footer-column ${openFooterSection === "services" ? "is-open" : ""}`}>
            <button
              className="footer-column-toggle"
              type="button"
              aria-expanded={openFooterSection === "services"}
              onClick={() => toggleFooterSection("services")}
            >
              <span className="footer-column-title">{companyProjectsData?.title || ""}</span>
              <ChevronIcon direction={openFooterSection === "services" ? "up" : "down"} />
            </button>
            <ul>
              {companyProjectsData?.items.map((service) => (
                <li key={service.id}>
                  <a href={service.link || "#0"}>
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`footer-column ${openFooterSection === "legal" ? "is-open" : ""}`}>
            <button
              className="footer-column-toggle"
              type="button"
              aria-expanded={openFooterSection === "legal"}
              onClick={() => toggleFooterSection("legal")}
            >
              <span className="footer-column-title">{t("footer_col_contact")}</span>
              <ChevronIcon direction={openFooterSection === "legal" ? "up" : "down"} />
            </button>
            <ul className="footer-contact-list">
              {contact.address ? (
                <li>
                  {contact.mapLink ? (
                    <a href={contact.mapLink} target="_blank" rel="noreferrer">
                      {contact.address}
                    </a>
                  ) : (
                    contact.address
                  )}
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              ) : null}
              {contact.phone ? (
                <li>
                  <a href={formatTelHref(contact.phone)}>{contact.phone}</a>
                </li>
              ) : null}
              {contact.secondaryPhone ? (
                <li>
                  <a href={formatTelHref(contact.secondaryPhone)}>{contact.secondaryPhone}</a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t("footer_copyright")}</p>
          <div className="footer-legal">
            {legalItems.map((item) => (
              <a key={`${item.id}-${item.link || item.title}`} href={item.link || "#0"}>
                {item.title}
              </a>
            ))}
          </div>
          <p>
            {t("footer_author_label")} :{" "}
            <a href="https://github.com/david-gakhokia/" target="_blank" rel="noreferrer">
              {"<D/G>"}
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
