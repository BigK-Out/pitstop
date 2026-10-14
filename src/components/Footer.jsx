import { brand } from "../content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {brand.name} Cherries. This is a demo store: no real orders.
        </p>
        <ul className="footer-links">
          {brand.social.map((link) => (
            <li key={link.label}>
              <a href={link.href} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
