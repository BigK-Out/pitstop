import { brand } from "../content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <ul className="footer-links">
          {brand.social.map((link) => (
            <li key={link.label}>
              <a href={link.href} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p>This is a demo store: no real orders.</p>
        <p>
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>
      <p className="footer-wordmark" aria-hidden="true">
        {brand.name}
      </p>
    </footer>
  );
}
